const { Server } = require("socket.io");

const userSocketMap = new Map();

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["*",process.env.FRONTEND_URL],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("register", (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`Registered socket ${socket.id} for user ${userId}`);
    });

    socket.on("disconnect", () => {
      for (let [userId, id] of userSocketMap.entries()) {
        if (id === socket.id) {
          userSocketMap.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return { io, userSocketMap };
}

module.exports = { initSocket, userSocketMap };
