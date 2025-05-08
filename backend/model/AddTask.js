const { default: mongoose } = require("mongoose");
const momgoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dueDate: {
    type: Date,
    default: () => new Date(),
    validate: {
      validator: function (value) {
        return (
          !value ||
          value >= new Date().setHours(0, 0, 0, 0)
        );
      },
      message: 'Due date must be today or in the future',
    },
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  labels: {
    type: [String],
    default: [],
    validate: {
      validator: function(value) {
        return value.length <= 5;
      },
      message: 'Cannot have more than 5 labels'
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Tasks=mongoose.model("Tasks",taskSchema)
module.exports = Tasks;