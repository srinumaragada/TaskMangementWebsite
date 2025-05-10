const Project = require('../../model/project');
const Member = require('../../model/Members');
const Task = require('../../model/Task');
const User = require('../../model/users');
const NotificationService = require('../../services/notificationService');
const { default: mongoose } = require('mongoose');

const checkProjectOwnership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError('Project not found');
  if (project.createdBy.toString() !== userId.toString()) {
    throw new ForbiddenError('Not authorized to modify this project');
  }
  return project;
};

exports.createProject = async (req, res, next) => {  
  try {
  const { title, description } = req.body;
  const userId = req.user.id;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }

  const project = new Project({
    title, 
    description,
    createdBy: userId
  });

  await project.save();

  try {
    await NotificationService.createAndBroadcastToProject(
      project._id,
      'PROJECT_CREATED',
      {
        projectId: project._id,
        projectTitle: project.title,
        userName: req.user.userName,
        userId: req.user.id
      },
      req.user.id
    );
  } catch (notifyErr) {
    console.error("Notification failed after project creation:", notifyErr);
  }

  res.status(201).json({
    success: true,
    project
  });
} catch (error) {
  next(error);
}

};

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    }).populate('members tasks createdBy');

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    }).populate('members tasks createdBy');

    if (!project) throw new NotFoundError('Project not found or not authorized');

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;

    // Verify ownership
    await checkProjectOwnership(projectId, userId);

    // Update project
    const project = await Project.findByIdAndUpdate(
      projectId,
      { title, description },
      { new: true, runValidators: true }
    ).populate('members createdBy');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Send notification to all project members except the updater
    await NotificationService.createAndBroadcastToProject(
      projectId,
      'PROJECT_UPDATED',
      {
        projectId: project._id,
        projectTitle: project.title,
        changes: { title, description },
        updatedBy: userId,
        userName: req.user.userName
      },
      userId // Exclude current user from notification
    );

    res.status(200).json({
      success: true,
      project
    });

  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    await checkProjectOwnership(req.params.id, req.user.id);

    await Project.findByIdAndDelete(req.params.id);

    await Member.updateMany(
      { projects: req.params.id },
      { $pull: { projects: req.params.id } }
    );

    await Task.deleteMany({ project: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// controllers/projectController.js

exports.addMemberToProject = async (req, res, next) => {
  try {
    const { email } = req.body; // User's email to be added
    const projectId = req.params.id;
    const currentUserId = req.user.id;

    // Verify that the current user is the project creator
    const project = await Project.findOne({
      _id: projectId,
      createdBy: currentUserId
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can add members"
      });
    }

    // Find the user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    // Ensure the user is not already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project"
      });
    }

    // Add the user to the project and save
    project.members.push(userToAdd._id);
    await project.save();

    // Add project to the user's list of projects
    if (!userToAdd.projects.includes(projectId)) {
      userToAdd.projects.push(projectId);
      await userToAdd.save();
    }

    // After adding the member, notify the project members
    try {
      await NotificationService.createAndBroadcastToProject(
        project._id,
        'MEMBER_ADDED',
        {
          projectId: project._id,
          projectTitle: project.title,
          userName: req.user.userName,
          userId: req.user.id
        },
        req.user.id
      );
    } catch (notifyErr) {
      console.error("Notification failed after adding member:", notifyErr);
    }

    const populatedProject = await Project.findById(projectId)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      project: populatedProject,
      message: "Member added successfully"
    });

  } catch (error) {
    next(error);
  }
};


exports.removeMemberFromProject = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const projectId = req.params.projectId;
    const currentUserId = req.user.id;

    // Verify that the current user is the project creator
    const project = await Project.findOne({
      _id: projectId,
      createdBy: currentUserId
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Only project creator can remove members"
      });
    }

    // Verify user to remove exists
    const userToRemove = await User.findById(memberId);
    if (!userToRemove) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Can't remove the project creator
    if (memberId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Project creator cannot remove themselves"
      });
    }

    // Remove the user from the project
    project.members = project.members.filter(
      member => member.toString() !== memberId
    );
    await project.save();

    // Remove the project from the user's list
    userToRemove.projects = userToRemove.projects.filter(
      projId => projId.toString() !== projectId
    );
    await userToRemove.save();

    // After removing the member, notify the remaining project members
    try {
      await NotificationService.createAndBroadcastToProject(
        project._id,
        'MEMBER_REMOVED',
        {
          projectId: project._id,
          projectTitle: project.title,
          userName: req.user.userName,
          userId: req.user.id
        },
        req.user.id
      );
    } catch (notifyErr) {
      console.error("Notification failed after removing member:", notifyErr);
    }

    const populatedProject = await Project.findById(projectId)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      project: populatedProject,
      message: "Member removed successfully"
    });

  } catch (error) {
    next(error);
  }
};