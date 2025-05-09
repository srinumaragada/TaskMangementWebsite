const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Project title cannot exceed 100 characters'],
    index: true
  },
  description: { 
    type: String, 
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [500, 'Project description cannot exceed 500 characters']
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Creator reference is required'],
    index: true
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  }],
  tasks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProjectSchema.index({ createdBy: 1, status: 1 });
ProjectSchema.index({ members: 1, status: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });

// Virtual for member count
ProjectSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Virtual for task count
ProjectSchema.virtual('taskCount').get(function() {
  return this.tasks ? this.tasks.length : 0;
});

// Middleware to update timestamps
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method for finding active projects
ProjectSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Instance method for adding members
ProjectSchema.methods.addMember = function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
  }
  return this.save();
};

// Instance method for removing members
ProjectSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => !member.equals(userId));
  return this.save();
};

module.exports = mongoose.model('Project', ProjectSchema);