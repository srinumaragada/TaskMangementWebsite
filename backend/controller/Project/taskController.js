const Task = require('../../model/Task');
const Project = require('../../model/project');
const User = require('../../model/users');

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
    const isMember = project.createdBy.equals(userId) || project.members.includes(userId);
    if (!isMember) {
      const error = new Error("You don't have permission to access this task");
      error.status = 403;
      throw error;
    }
  
    return { task, project };
  };
  
// controllers/projectController.js

// controllers/taskController.js
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, status, deadline } = req.body;
    const projectId = req.projectId;
    const createdBy = req.user.id;

    // Validate required fields
    if (!title || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and deadline are required",
      });
    }

    // Verify project access
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ createdBy }, { members: createdBy }],
    }).populate('members');

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    // Resolve assigned user
    let assignedUserId = createdBy;
    if (assignedTo) {
      const assignedUser = await User.findOne({ email: assignedTo });

      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: "Assigned user not found",
        });
      }

      const isMember =
        project.members.some(member => member._id.toString() === assignedUser._id.toString()) ||
        project.createdBy.toString() === assignedUser._id.toString();

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "Assigned user must be a project member",
        });
      }

      assignedUserId = assignedUser._id;
    }

    // Create and save the task
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedUserId,
      createdBy,
      deadline: new Date(deadline),
      status: status || 'todo',
    });

    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        task: populatedTask
      });
  } catch (error) {
    next(error);
  }
};


exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, deadline, status } = req.body;
    const { id, projectId: paramProjectId, taskId } = req.params;
    const projectId = paramProjectId || id;
    const userId = req.user.id;

    // Check permissions
    const { task, project } = await checkTaskPermissions(taskId, userId, projectId);

    let updatedFields = { title, description, deadline, status };

    // If assignedTo is provided, verify the user exists and is part of the project
    if (assignedTo) {
      const assignedUser = await User.findOne({ email: assignedTo });

      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: "Assigned user not found",
        });
      }

      const isMember = project.members.some(member => 
        member.toString() === assignedUser._id.toString()
      );

      if (!isMember && assignedUser._id.toString() !== project.createdBy.toString()) {
        return res.status(403).json({
          success: false,
          message: "Assigned user must be a project member",
        });
      }

      updatedFields.assignedTo = assignedUser._id;
    }

    // Regular members can only update their own tasks
    if (
      req.user.role === 'member' &&
      task.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      updatedFields,
      { new: true, runValidators: true }
    ).populate(['assignedTo', 'createdBy']);

    res.status(200).json({
      success: true,
      task: updatedTask,
    });

  } catch (error) {
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
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    });

    if (!project) {
        return res.status(404).json({
            success:false,
            message:"Not authorized to view tasks in this project"
        })
   
    }

    const query = { project: projectId };
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    // If regular member, only show their assigned tasks
    if (req.user.role === 'member' && !assignedTo) {
      query.assignedTo = userId;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo createdBy')
      .sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
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
      task: await task.populate(['assignedTo', 'createdBy'])
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteTask = async (req, res, next) => {
  try {
    const { id, projectId: paramProjectId, taskId } = req.params;
    const projectId = paramProjectId || id;
    
    console.log('Resolved projectId:', projectId); // Should now be visible
    const userId = req.user.id;

    // Check permissions - only admin, project creator or task creator can delete
    const { task, project } = await checkTaskPermissions(taskId, userId, projectId);
    
    const isAdmin = req.user.role === 'admin';
    const isProjectCreator = project.createdBy.toString() === userId.toString();
    const isTaskCreator = task.createdBy?.toString() === userId.toString();
    
    if (!isAdmin && !isProjectCreator && !isTaskCreator) {
        return res.status(404).json({
            success:false,
            message:"Not authorized to delete this task"
        })
   
    }

    // Remove task from project's task array
    await Project.findByIdAndUpdate(
      projectId,
      { $pull: { tasks: taskId } }
    );

    await Task.findOneAndDelete({
      _id: taskId,
      project: projectId
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
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

    if (!['not-started', 'in-progress', 'completed'].includes(status)) {
        return res.status(404).json({
            success:false,
            message:"Invalid status value"
        })
    }

    // Check permissions - only assigned user or higher roles can change status
    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const isAdmin = req.user.role === 'admin';
    const isProjectCreator = (await Project.findById(projectId))?.createdBy.toString() === userId.toString();
    const isAssignedToTask = task.assignedTo.toString() === userId.toString();

    if (!isAdmin && !isProjectCreator && !isAssignedToTask) {
      throw new ForbiddenError('Not authorized to change this task status');
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { status },
      { new: true, runValidators: true }
    ).populate(['assignedTo', 'createdBy']);

    res.status(200).json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};