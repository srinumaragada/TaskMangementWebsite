const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  changeTaskStatus
} = require('../controller/Project/taskController');
const { authMiddleware } = require('../controller/auth');

// Task routes
router.use(authMiddleware)
router.post('/', createTask);
router.get('/', getTasks);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

// Task status route
router.put('/:taskId/status', changeTaskStatus);

module.exports = router;