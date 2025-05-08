const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  deadline: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        const deadlineTime = new Date(value).getTime();
        const todayStartTime = new Date();
        todayStartTime.setHours(0, 0, 0, 0);
        return deadlineTime >= todayStartTime.getTime();
      },
      message: 'Deadline must be today or in the future'
    }
  }
  ,
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo'
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);