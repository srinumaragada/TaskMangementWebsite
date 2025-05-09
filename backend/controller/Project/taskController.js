const Task = require("../../model/Task");
const Project = require("../../model/project");
const User = require("../../model/users");
const notificationService = require("../../services/notificationService");

const checkTaskPermissions = async (taskId, userId, projectId) => {
  const task = await Task.findOne({ _id: taskId, project: projectId });

  if (!task) {
    const error = new Error("Task not found");
    error.status = 404;
    throw error;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error("Project not found");
    error.status = 404;
    throw error;
  }

  // Optional: check if user is part of the project
  const isMember =
    project.createdBy.equals(userId) || project.members.includes(userId);
  if (!isMember) {
    const error = new Error("You don't have permission to access this task");
    error.status = 403;
    throw error;
  }

  return { task, project };
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, status, deadline } = req.body;
    const projectId = req.projectId;
    const createdBy = req.user.id;

    if (!title || !description || !assignedTo || !deadline) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const assignedUser = await User.findOne({ email: assignedTo });
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: "Assigned user does not exist",
      });
    }

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy }, { members: createdBy }],
    }).populate("members");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you don't have access",
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedUser._id,
      createdBy,
      deadline: new Date(deadline),
      status,
    });

    // Update project's tasks array
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });

    // Populate and return the task
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    // Send notification to project members
    await notificationService.createAndBroadcastToProject(
      projectId,
      "TASK_CREATED",
      {
        taskId: task._id,
        taskTitle: task.title,
        projectId: projectId,
      },
      createdBy,
      assignedUser._id
    );

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    console.error("Error in createTask:", error);
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.query;
    const projectId = req.projectId || req.params.projectId;
    const userId = req.user.id;

    // Verify user has access to the project
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy: userId }, { members: userId }],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Not authorized to view tasks in this project",
      });
    }

    const query = { project: projectId };
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    // If regular member, only show their assigned tasks
    if (req.user.role === "member" && !assignedTo) {
      query.assignedTo = userId;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo createdBy")
      .sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const { id, projectId: paramProjectId, taskId } = req.params;
    const projectId = paramProjectId || id;

    const userId = req.user.id;

    // Check permissions
    const { task } = await checkTaskPermissions(taskId, userId, projectId);

    res.status(200).json({
      success: true,
      task: await task.populate(["assignedTo", "createdBy"]),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, deadline, status } = req.body;
    const { taskId, projectId: paramProjectId } = req.params;
    const projectId = paramProjectId || req.params.id;
    const userId = req.user.id;

    // Check task permissions
    const { task, project } = await checkTaskPermissions(
      taskId,
      userId,
      projectId
    );

    // Prepare update data
    const updateData = { title, description, deadline, status };
    let assignmentChanged = false;

    // Handle assignment if provided
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      // Verify new assignee is part of the project
      const isMember =
        project.members.some(
          (member) => member._id.toString() === assignedTo.toString()
        ) || project.createdBy.toString() === assignedTo.toString();

      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: "Assigned member is not part of this project",
        });
      }

      updateData.assignedTo = assignedTo;
      assignmentChanged = true;
    }

    // Regular members can only update their own tasks
    if (
      req.user.role === "member" &&
      task.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Update task
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      updateData,
      { new: true, runValidators: true }
    ).populate(["assignedTo", "createdBy"]);

    // 🔔 Send notifications for task update
    try {
      if (assignmentChanged) {
        // Specific notification for new assignee
        await notificationService.createAndBroadcastToProject(
          projectId,
          "TASK_ASSIGNED",
          {
            taskId: updatedTask._id,
            taskTitle: updatedTask.title,
            projectId: projectId,
            projectTitle: project.title
          },
          userId,
          userId // Exclude updater
        );
      } else {
        // General update notification
        await notificationService.createAndBroadcastToProject(
          projectId,
          "TASK_UPDATED",
          {
            taskId: updatedTask._id,
            taskTitle: updatedTask.title,
            projectId: projectId,
            projectTitle: project.title
          },
          userId,
          userId // Exclude updater
        );
      }
    } catch (notifError) {
      console.error("Notification failed:", notifError);
      // Don't fail the whole operation if notification fails
    }

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};



exports.deleteTask = async (req, res, next) => {
  try {
    const { id, projectId: paramProjectId, taskId } = req.params;
    const projectId = paramProjectId || id;
    const userId = req.user.id;

    const { task, project } = await checkTaskPermissions(taskId, userId, projectId);

    const isAdmin = req.user.role === "admin";
    const isProjectCreator = project.createdBy.toString() === userId.toString();
    const isTaskCreator = task.createdBy?.toString() === userId.toString();

    if (!isAdmin && !isProjectCreator && !isTaskCreator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await Project.findByIdAndUpdate(projectId, { $pull: { tasks: taskId } });
    await Task.findOneAndDelete({ _id: taskId, project: projectId });

    // 🔔 Send deletion notification
    try {
      await notificationService.createAndBroadcastToProject(
        projectId,
        "TASK_DELETED",
        {
          taskId,
          taskTitle: task.title,
          projectId,
          projectTitle: project.title,
        },
        userId,
        userId
      );
    } catch (notifError) {
      console.error("Failed to send task deleted notification:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};



exports.changeTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id: projectId, taskId } = req.params;
    const userId = req.user.id;

    if (!["not-started", "in-progress", "completed"].includes(status)) {
      return res.status(404).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Check permissions - only assigned user or higher roles can change status
    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
    });

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const isAdmin = req.user.role === "admin";
    const isProjectCreator =
      (await Project.findById(projectId))?.createdBy.toString() ===
      userId.toString();
    const isAssignedToTask = task.assignedTo.toString() === userId.toString();

    if (!isAdmin && !isProjectCreator && !isAssignedToTask) {
      throw new ForbiddenError("Not authorized to change this task status");
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { status },
      { new: true, runValidators: true }
    ).populate(["assignedTo", "createdBy"]);

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};
