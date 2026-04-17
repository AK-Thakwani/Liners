const express = require('express');
require('dotenv').config();
const connecttomongo = require('./db');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io with proper CORS headers
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://liners.vercel.app",
      "https://liners.onrender.com",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["auth-token", "Content-Type"]
  }
});

// Connect MongoDB
connecttomongo();

// Middleware - CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://liners.vercel.app",
  "https://liners.onrender.com",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "auth-token"],
  exposedHeaders: ["X-Total-Count"],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

app.use(express.json());

// Additional CORS headers middleware (backup)
app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count');
  next();
});

// Debug middleware - log requests with auth header
app.use((req, res, next) => {
  const authToken = req.header('auth-token');
  if (authToken) {
    console.log(`[${req.method}] ${req.path}`);
  }
  next();
});

// Routes
console.log('Registering API routes...');
app.use('/api/users', require('./routes/user'));
console.log('✅ /api/users routes registered');

app.use('/api/liner', require('./routes/liner'));
console.log('✅ /api/liner routes registered');

app.use('/api/auth', require('./routes/auth'));
console.log('✅ /api/auth routes registered');

app.use('/api/messages', require('./routes/message'));
console.log('✅ /api/messages routes registered');

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Liners API!');
});

// 404 Handler - for debugging API calls
app.use('/api', (req, res) => {
  console.error(`❌ 404 - ${req.method} ${req.path} not found`);
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.path}`,
    availableEndpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'POST /api/auth/getuser', 'PATCH /api/auth/update'],
      users: ['GET /api/users/:id/profile', 'PUT /api/users/toggle-privacy', 'PUT /api/users/:userId/follow', 'PUT /api/users/:userId/unfollow'],
      liner: ['GET /api/liner/allposts', 'GET /api/liner/my', 'POST /api/liner/create', 'DELETE /api/liner/:id'],
      messages: ['GET /api/messages', 'POST /api/messages/send']
    }
  });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ⚡ Socket.io - real-time messages
const Message = require('./models/message');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Store user socket connections
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Authenticate user and store their socket. Also deliver unread messages.
  socket.on("authenticate", async (token) => {
    try {
      const secret = process.env.JWT_SECRET || 'AkshayWill!';
      const decoded = jwt.verify(token, secret);
      const userId = decoded?.user?.id || decoded?.user?._id;
      if (!userId) {
        throw new Error('Invalid token payload');
      }

      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} authenticated with socket ${socket.id}`);

      // Fetch unread messages for this user (sent while they were offline)
      try {
        const unread = await Message.find({ receiver: userId, isRead: false })
          .populate('sender', 'name profilePicture')
          .populate('receiver', 'name profilePicture')
          .sort({ timestamp: 1 });

        if (Array.isArray(unread) && unread.length > 0) {
          // Emit unread messages as a batch so client can show them
          socket.emit('unread-messages', unread);
        }
      } catch (err) {
        console.error('Error fetching unread messages for user', userId, err);
      }
    } catch (error) {
      console.log("Authentication failed:", error.message);
      socket.disconnect();
    }
  });

  socket.on("send-message", async (data) => {
    try {
      const { receiverId, text, mediaUrl, mediaType } = data;
      const senderId = socket.userId;

      if (!senderId) {
        socket.emit("error", { message: "User not authenticated" });
        return;
      }
      // Validate receiver and follow relationship
      const senderUser = await User.findById(senderId).select('following');
      const receiverUser = await User.findById(receiverId).select('isPrivate followers');

      if (!receiverUser) {
        socket.emit("error", { message: "Receiver not found" });
        return;
      }

      // Prevent sending messages to oneself
      if (senderId === receiverId) {
        socket.emit("error", { message: "You cannot send messages to yourself" });
        return;
      }

      // Sender must follow the receiver to message them
      // Consider users 'connected' if either follows the other (present in followers or following)
      const senderFollowing = Array.isArray(senderUser?.following) ? senderUser.following.map(id => id.toString()) : [];
      const senderFollowers = Array.isArray(senderUser?.followers) ? senderUser.followers.map(id => id.toString()) : [];
      const isConnected = senderFollowing.includes(receiverId.toString()) || senderFollowers.includes(receiverId.toString());
      if (!isConnected) {
        socket.emit("error", { message: "You can only message users who are connected to you (in followers or following)" });
        return;
      }

      // If receiver is private, ensure sender is in receiver's followers (i.e., follow request accepted)
      if (receiverUser.isPrivate) {
        const isAccepted = Array.isArray(receiverUser.followers) && receiverUser.followers.some(id => id.toString() === senderId.toString());
        if (!isAccepted) {
          socket.emit("error", { message: "You cannot message private users who haven't accepted your follow request" });
          return;
        }
      }

      // Save to MongoDB then populate sender/receiver (Mongoose 6+)
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        text: text ? text.trim() : '',
        mediaUrl: mediaUrl || '',
        mediaType: mediaType || 'text'
      });

      // Persist the message first
      const savedMessage = await newMessage.save();

      // Populate fields — in Mongoose 6 populate returns a promise
      await savedMessage.populate([{ path: 'sender', select: 'name profilePicture' }, { path: 'receiver', select: 'name profilePicture' }]);

      // Emit to sender
      socket.emit("message-sent", savedMessage);

      // Emit to receiver if online
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", savedMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("mark-as-read", async (data) => {
    try {
      const { messageId } = data;
      await Message.findByIdAndUpdate(messageId, { isRead: true });
      socket.emit("message-read", { messageId });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

