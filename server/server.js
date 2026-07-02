import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import http from "http";
import jwt from "jsonwebtoken";
import { connectDb } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import { Server } from "socket.io";
import messageRouter from "./routes/messageRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import gifRouter from "./routes/gifRoutes.js";
import linkPreviewRouter from "./routes/linkPreviewRoutes.js";
import Conversation from "./models/conversation.model.js";
import User from "./models/user.model.js";

// Create Express App using HTTP Server

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");

// initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// store online users: userId -> Set of socketIds (supports multiple tabs/devices)
export const userSocketMap = {};

const emitOnlineUsers = () => io.emit("getOnlineUsers", Object.keys(userSocketMap));

// authenticate every socket connection with the same JWT used for REST calls
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.userId;
  console.log("User connected", userId);

  if (!userSocketMap[userId]) userSocketMap[userId] = new Set();
  userSocketMap[userId].add(socket.id);
  emitOnlineUsers();

  // join a room per conversation so group/1:1 sends can broadcast with io.to(conversationId)
  try {
    const conversations = await Conversation.find({ participants: userId }).select("_id");
    conversations.forEach((c) => socket.join(String(c._id)));
  } catch (error) {
    console.log("Failed joining conversation rooms:", error.message);
  }

  socket.on("joinConversation", (conversationId) => {
    if (conversationId) socket.join(String(conversationId));
  });

  socket.on("typing", ({ conversationId }) => {
    socket.to(String(conversationId)).emit("typing", { conversationId, userId });
  });

  socket.on("stopTyping", ({ conversationId }) => {
    socket.to(String(conversationId)).emit("stopTyping", { conversationId, userId });
  });

  // --- WebRTC call signaling (pure relay, no media touches the server) ---
  const relayToUser = (targetUserId, event, payload) => {
    const sockets = userSocketMap[targetUserId];
    if (sockets) sockets.forEach((socketId) => io.to(socketId).emit(event, payload));
  };

  const forwardCallEvent = (event) => (payload = {}) => {
    const { toUserId, ...rest } = payload;
    relayToUser(toUserId, event, { ...rest, fromUserId: userId });
  };
  socket.on("call:invite", forwardCallEvent("call:invite"));
  socket.on("call:answer", forwardCallEvent("call:answer"));
  socket.on("call:ice-candidate", forwardCallEvent("call:ice-candidate"));
  socket.on("call:reject", forwardCallEvent("call:reject"));
  socket.on("call:end", forwardCallEvent("call:end"));

  socket.on("disconnect", async () => {
    console.log("User disconnected", userId);
    userSocketMap[userId]?.delete(socket.id);
    if (!userSocketMap[userId]?.size) {
      delete userSocketMap[userId];
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (error) {
        console.log("Failed updating lastSeen:", error.message);
      }
    }
    emitOnlineUsers();
  });
});

// Middleware Setup
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Routes Setup
app.use("/api/status", (req, res) => {
  res.send("Server is live");
});
app.use("/api/auth", userRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/messages", messageRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/gif", gifRouter);
app.use("/api/link-preview", linkPreviewRouter);

// connect to Database
await connectDb();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => console.log("server is running on PORT: ", PORT));
}

// Export server for vercel
export default server;
