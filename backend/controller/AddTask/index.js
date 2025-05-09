const Task = require("../../model/AddTask");
const notificationService = require("../../services/notificationService");
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, labels } = req.body;
    const userId = req.user.id;  // Assuming userId is from the authenticated user
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Create the task with the userId
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      labels,
      userId // Add the creator as the userId (or assignee)
    });

    // Notify relevant users. If you don’t have an assignee, notify the creator or a set of users.
    const usersToNotify = [userId];  // Notify the task creator as an example

    // Send notification to users
    await notificationService.createAndBroadcastToUsers(
      usersToNotify,
      'TASK_CREATED',
      { taskId: task._id, taskTitle: task.title },
      userId
    );

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};




 const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { completed, priority, label, sortBy } = req.query;
    
    const query = { userId };
    
    if (completed) query.completed = completed === 'true';
    if (priority) query.priority = priority;
    if (label) query.labels = label;
    
    let sortOptions = {};
    if (sortBy === 'dueDate') sortOptions = { dueDate: 1 };
    if (sortBy === 'priority') sortOptions = { priority: -1 };
    if (sortBy === 'createdAt') sortOptions = { createdAt: -1 };
    
    const tasks = await Task.find(query).sort(sortOptions);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


 const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, labels, completed } = req.body;
    const userId = req.user.id;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      { title, description, dueDate, priority, labels, completed },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Send notification to the task creator (user)
    await notificationService.createAndBroadcastToUsers(
      [userId],
      'TASK_UPDATED',
      { taskId: task._id, taskTitle: task.title },
      userId
    );

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Send notification to the task owner
    await notificationService.createAndBroadcastToUsers(
      [req.user.id],
      'TASK_DELETED',
      {
        taskId: task._id,
        taskTitle: task.title
      },
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const completeTask = async (req, res) => {
  try {
   
    const task = await Task.findByIdAndUpdate(
    {  _id: req.params.id,
      userId: req.user.id},
      { completed: true },
      { new: true, runValidators: true }
      
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete task' });
  }
};

module.exports={
    createTask,getTasks,getTask,updateTask,deleteTask,completeTask
}