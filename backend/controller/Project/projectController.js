const Project = require('../../model/project');
const Member = require('../../model/Members');
const Task = require('../../model/Task');
const User = require('../../model/users');


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
    
    const project = await Project.create({ 
      title, 
      description,
      createdBy: userId
    });
    
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
    })
    .populate('members tasks createdBy');
    
    if (!project) {
      throw new NotFoundError('Project not found or not authorized');
    }
    
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
    
    // Check ownership first
    await checkProjectOwnership(req.params.id, req.user.id);
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    ).populate('members tasks createdBy');
    
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
    // Check ownership first
    await checkProjectOwnership(req.params.id, req.user.id);
    
    const project = await Project.findByIdAndDelete(req.params.id);
    
    // Remove project reference from members
    await Member.updateMany(
      { projects: req.params.id },
      { $pull: { projects: req.params.id } }
    );
    
    // Delete all tasks associated with this project
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
    const { email } = req.body; // Changed from userId to email
    const projectId = req.params.id;
    const currentUserId = req.user.id;

    // 1. Verify project exists and current user is the creator
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

    // 2. Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    // 3. Check if user is already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project"
      });
    }

    // 4. Add user to project members
    project.members.push(userToAdd._id);
    await project.save();

    // 5. Add project to user's projects list
    if (!userToAdd.projects.includes(projectId)) {
      userToAdd.projects.push(projectId);
      await userToAdd.save();
    }

    // 6. Return populated project data
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

    // 1. Verify project exists and current user is the creator
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

    // 2. Verify user to remove exists
    const userToRemove = await User.findById(memberId);
    if (!userToRemove) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 3. Can't remove yourself as creator
    if (memberId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Project creator cannot remove themselves"
      });
    }

    // 4. Remove user from project
    project.members = project.members.filter(
      member => member.toString() !== memberId
    );
    await project.save();

    // 5. Remove project from user's projects list
    userToRemove.projects = userToRemove.projects.filter(
      projId => projId.toString() !== projectId
    );
    await userToRemove.save();

    // 6. Return updated project data
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