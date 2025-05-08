const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRouter = require("./routes/index");
const taskRouter = require("./routes/taskRoutes");
const projectsRouter= require("./routes/projectsRoute");
const membersRouter=require("./routes/ProjectTaskRoutes");
const cookieParser = require("cookie-parser");
const http = require('http');
const NotificationServer = require('./websocket');
const app = express();
const server = http.createServer(app);

const notificationServer = new NotificationServer(server);
app.set('notificationServer', notificationServer);
mongoose
.connect(process.env.CONN_STR, {})
.then(() => console.log("DB connected successfully", mongoose.connection.name))
.catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
});
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    exposedHeaders: ["set-cookie"],
    credentials: true,
  })
);

const PORT = 4000;
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.use("/api/auth", authRouter);
app.use("/api/tasks",taskRouter)
app.use("/api/projects",projectsRouter)
app.use("/api/menebers",membersRouter)

server.listen(PORT, () => {
  console.log('Server and WebSocket running on port 4000');
});
