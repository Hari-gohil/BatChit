const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes')
const adminRouts = require("./src/routes/adminRoutes");
const chatRouts = require("./src/routes/chatRouts");
const groupRouts = require("./src/routes/groupRouts");
const messageRouts = require("./src/routes/messageRouts");
const notificationRouts = require("./src/routes/notificationRoutes");
const userRouts = require("./src/routes/userRoute");
const Message = require("./src/models/Message");

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat API Running...",
  });
});

// Create HTTP Server
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: [ process.env.CLIENT_URL, process.env.CLIENT_URL2 ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store Online Users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  // User Online
socket.on("user_online", (userId) => {
  console.log("ONLINE USER:", userId);

  onlineUsers.set(userId, socket.id);

  console.log(
  "ALL USERS:",
  [...onlineUsers.entries()]
);

  io.emit("online_users", [...onlineUsers.keys()]);
  io.emit("online-users-count", onlineUsers.size);
});

socket.on("send_message", async (data) => {
  const receiverSocketId =
    onlineUsers.get(data.receiverId);

  if (receiverSocketId) {

    await Message.findByIdAndUpdate(
      data.messageId,
      { status: "delivered" }
    );

    io.to(socket.id).emit(
      "message_delivered",
      data.messageId
    );
  }
});

socket.on("new_message", (message) => {
  const receiverSocketId = onlineUsers.get(
    message.receiver?._id || message.receiver
  );

  if (receiverSocketId) {
    io.to(receiverSocketId).emit(
      "receive_message",
      message
    );
  }
});

  // Typing
  socket.on("typing", ({ receiverId, senderName }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", senderName);
    }
  });


  // Stop Typing
  socket.on("stop_typing", ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop_typing");
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online_users", [...onlineUsers.keys()]);
    io.emit("online-users-count", onlineUsers.size);
  });
});

// Middleware
app.use(
  cors({
    origin: [ process.env.CLIENT_URL, process.env.CLIENT_URL2 ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.options("*", cors());


app.use(express.json());


// all Api's

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRouts);
app.use("/api/chats", chatRouts);
app.use("/api/groups", groupRouts);
app.use("/api/messages", messageRouts);
app.use("/api/notifications", notificationRouts);
app.use("/api/users", userRouts);

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
