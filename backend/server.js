require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

// Routes
const authRouter = require('./routes/index');
const taskRouter = require('./routes/taskRoutes');
const projectsRouter = require('./routes/projectsRoute');
const membersRouter = require('./routes/ProjectTaskRoutes');

const app = express();
const server = http.createServer(app);

// Configure allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://task-mangement-website.vercel.app' // No trailing slash
];

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Handle preflight requests
app.options('*', cors());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io'
});

const userSocketMap = new Map();

// Socket.IO authentication middleware
io.use((socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CLIENT_SECRET_KEY');
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
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

// Database connection
mongoose.connect(process.env.CONN_STR, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('DB connected'))
.catch(err => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Set socket.io instance in app
app.set('io', io);
app.set('userSocketMap', userSocketMap);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/members', membersRouter);

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    websocketConnections: io.engine.clientsCount
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});