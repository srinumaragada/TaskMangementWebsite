const mongoose = require('mongoose');
const Notification = require("../model/Notification");
const Project = require("../model/project");

class NotificationService {
  constructor() {
    this.notificationServer = null;
  }

  setSocketServer(io) {
    this.notificationServer = io;
  }

  async createAndBroadcastToProject(projectId, type, data, creatorId, excludeUserId = null) {
    try {
      console.log(`Broadcasting notification to project ${projectId}...`);

      // Add small delay to ensure DB commit
      await new Promise(resolve => setTimeout(resolve, 100));

      let project;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          project = await Project.findById(projectId)
            .populate('members', '_id')
            .populate('createdBy', '_id')
            .lean();

          if (project) break;

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200 * attempts));
          }
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) throw err;
          await new Promise(resolve => setTimeout(resolve, 200 * attempts));
        }
      }

      if (!project) {
        throw new Error(`Project not found after ${maxAttempts} attempts`);
      }

      // Construct notification message
      const message = this.createMessage(type, data);
      const recipients = new Set();

      if (project.createdBy && project.createdBy._id) {
        recipients.add(project.createdBy._id.toString());
      }

      if (project.members && Array.isArray(project.members)) {
        project.members.forEach(member => {
          if (member && member._id) {
            recipients.add(member._id.toString());
          }
        });
      }

      let filteredRecipients = Array.from(recipients);
      if (excludeUserId) {
        filteredRecipients = filteredRecipients.filter(id => id !== excludeUserId.toString());
      }

      if (filteredRecipients.length === 0 && project.createdBy && project.createdBy._id) {
        filteredRecipients.push(project.createdBy._id.toString());
      }

      // Send notification to recipients
      const notificationPromises = filteredRecipients.map(recipientId => {
        return Notification.create({
          recipient: recipientId,
          type,
          message: message.message,
          data: message.data
        });
      });

      const notifications = await Promise.all(notificationPromises);

      // Broadcasting to WebSocket clients
      if (this.notificationServer) {
        filteredRecipients.forEach(userId => {
          this.notificationServer.to(userId).emit('notification', {
            type,
            message: message.message,
            data: message.data,
            timestamp: new Date()
          });
        });
      }

      return notifications;
    } catch (error) {
      console.error('Notification error details:', {
        error: error.message,
        stack: error.stack,
        projectId,
        type,
        creatorId
      });
      throw error;
    }
  }

  async createAndBroadcastToUsers(userIds, type, data, creatorId) {
    try {
      const message = this.createMessage(type, data);
      const uniqueRecipients = Array.from(new Set(userIds.map(id => id.toString())));
  
      const notifications = await Promise.all(
        uniqueRecipients.map(recipientId =>
          Notification.create({
            recipient: recipientId,
            type,
            message: message.message,
            data: message.data
          })
        )
      );
  
      // Emit via socket
      if (this.notificationServer) {
        uniqueRecipients.forEach(userId => {
          this.notificationServer.to(userId).emit('notification', {
            type,
            message: message.message,
            data: message.data,
            timestamp: new Date()
          });
        });
      }
  
      return notifications;
    } catch (error) {
      console.error('Direct user notification error:', {
        error: error.message,
        stack: error.stack,
        userIds,
        type,
        creatorId
      });
      throw error;
    }
  }
  

  createMessage(type, data) {
    const isProjectTask = !!data.projectId;
  
    if (isProjectTask) {
      switch (type) {
        case 'PROJECT_CREATED':
          return {
            message: `New project created: ${data.projectTitle}`,
            data: { projectId: data.projectId, projectTitle: data.projectTitle }
          };
        case 'MEMBER_ADDED':
          return {
            message: `You were added to project: ${data.projectTitle}`,
            data: { projectId: data.projectId, projectTitle: data.projectTitle }
          };
        case 'TASK_ASSIGNED':
          return {
            message: `Task "${data.taskTitle}" has been assigned to you in project "${data.projectTitle}".`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle, projectId: data.projectId }
          };
        case 'TASK_UPDATED':
          return {
            message: `Task "${data.taskTitle}" in project "${data.projectTitle}" has been updated.`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle, projectId: data.projectId }
          };
        case 'TASK_COMPLETED':
          return {
            message: `Task "${data.taskTitle}" in project "${data.projectTitle}" has been marked as completed.`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle, projectId: data.projectId }
          };
        case 'TASK_DELETED':
          return {
            message: `Task "${data.taskTitle}" in project "${data.projectTitle}" has been deleted.`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle, projectId: data.projectId }
          };
        default:
          return {
            message: `Activity in project "${data.projectTitle}".`,
            data: { projectId: data.projectId, projectTitle: data.projectTitle }
          };
      }
    } else {
      // Individual (non-project) task notifications
      switch (type) {
        case 'TASK_CREATED':
          return {
            message: `A new task "${data.taskTitle}" has been created.`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle }
          };
        case 'TASK_UPDATED':
          return {
            message: `Your task "${data.taskTitle}" has been updated.`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle }
          };
        case 'TASK_COMPLETED':
          return {
            message: `Your task "${data.taskTitle}" has been marked as completed.`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle }
          };
        case 'TASK_DELETED':
          return {
            message: `Your task "${data.taskTitle}" has been deleted.`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle }
          };
        default:
          return {
            message: `Update on your task "${data.taskTitle}".`,
            data: { taskId: data.taskId, taskTitle: data.taskTitle }
          };
      }
    }
  }
  
}

module.exports = new NotificationService();
