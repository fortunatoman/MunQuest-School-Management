import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routers/";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 1000;

app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: "*"}));
app.use(morgan('dev'));
app.use(express.json());

app.use("/api/v1", router);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  console.log('Total connected users:', io.engine.clientsCount);
  // Join user to their personal room for targeted notifications
  socket.on('join_user_room', (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} joined their personal room: user_${userId}`);
    console.log(`📡 Socket ${socket.id} is now in room: user_${userId}`);
  });
  
  // Leave user room
  socket.on('leave_user_room', (userId: string) => {
    socket.leave(`user_${userId}`);
    console.log(`❌ User ${userId} left their personal room: user_${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    console.log('Total connected users:', io.engine.clientsCount);
  });
});

// Make io available globally for use in controllers
(global as any).io = io;

// Helper function to broadcast notifications to all users
(global as any).broadcastNotification = (eventName: string, data: any) => {
  console.log(`Broadcasting ${eventName} to ${io.engine.clientsCount} connected users:`, data);
  io.emit(eventName, data);
};

// Helper function to send targeted notifications to specific users
(global as any).sendUserNotification = (userId: string, eventName: string, data: any) => {
  const roomName = `user_${userId}`;
  console.log(`📤 Sending ${eventName} to user ${userId} in room: ${roomName}`);
  console.log(`📋 Notification data:`, data);
  
  // Check how many sockets are in the room
  const room = io.sockets.adapter.rooms.get(roomName);
  const roomSize = room ? room.size : 0;
  console.log(`👥 Room ${roomName} has ${roomSize} connected users`);
  
  // Send the targeted notification
  io.to(roomName).emit(eventName, data);
  console.log(`✅ Notification sent to room ${roomName}`);
};

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});