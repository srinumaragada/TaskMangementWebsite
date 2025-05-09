const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const http = require('http');
const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const NotificationService = require('./services/notificationService');

const authRouter = require("./routes/index");
const taskRouter = require("./routes/taskRoutes");
const projectsRouter = require("./routes/projectsRoute");
const membersRouter = require("./routes/ProjectTaskRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io"
});


const userSocketMap = new Map();

io.use((socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const token = cookies.token;

  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'User:', socket.userId);

  userSocketMap.set(socket.userId, socket.id);
  socket.join(socket.userId); 

  socket.on('register', (userId) => {
    userSocketMap.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, id] of userSocketMap.entries()) {
      if (id === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

NotificationService.setSocketServer(io);


app.set('io', io);
app.set('userSocketMap', userSocketMap);

mongoose.connect(process.env.CONN_STR)
  .then(() => console.log("DB connected"))
  .catch(err => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/members", membersRouter);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
