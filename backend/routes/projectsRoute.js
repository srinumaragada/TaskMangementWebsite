const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject
} = require('../controller/Project/projectController');
const { authMiddleware } = require('../controller/auth');

// Project routes
router.use(authMiddleware)
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project member routes
router.post('/:id/members', addMemberToProject);
router.delete('/:projectId/members/:memberId', removeMemberFromProject);

// Project task routes
router.use('/:projectId/tasks', (req, res, next) => {
    req.projectId = req.params.projectId; 
    next();
  }, require('../routes/ProjectTaskRoutes'));

module.exports = router;