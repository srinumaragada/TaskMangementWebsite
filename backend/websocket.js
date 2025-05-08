const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class NotificationServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // userId -> WebSocket

    this.setupConnection();
  }

  setupConnection() {
    this.wss.on('connection', (ws, req) => {
      // Extract token from query parameters
      const token = req.url.split('token=')[1];
      
      if (!token) {
        ws.close(1008, 'Authentication token missing');
        return;
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Store the connection
        this.clients.set(userId, ws);

        // Remove the connection when closed
        ws.on('close', () => {
          this.clients.delete(userId);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.clients.delete(userId);
        });

      } catch (error) {
        ws.close(1008, 'Invalid authentication token');
      }
    });
  }

  sendNotification(userId, message) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcastToProjectMembers(project, message) {
    // Send to project creator
    this.sendNotification(project.createdBy.toString(), message);
    
    // Send to all members
    project.members.forEach(memberId => {
      this.sendNotification(memberId.toString(), message);
    });
  }
}

module.exports = NotificationServer;