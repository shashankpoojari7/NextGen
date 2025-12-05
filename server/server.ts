import next from "next";
import http from "http";
import { Server } from "socket.io";
import dbConnect from "../src/database/dbConnection";
import User from "../src/models/user.model";
import Post from "../src/models/post.model";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = http.createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    path: "/api/socket/io",
    cors: { origin: "*" },
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (!userId) return socket.disconnect();

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);
    io.emit("presence:online", { userId });

    socket.emit("presence:list", {
      online: Array.from(onlineUsers.keys()),
    });

    socket.join(`user:${userId}`);

    socket.on("chat:send", (payload) => {
      io.to(`user:${payload.to}`).emit("chat:message", payload);
    });

    socket.on("notification", async (payload) => {
      try {
        await dbConnect();

        const sender = await User.findById(payload.from)
          .select("username profile_image");

        let postPreview = null;

        if (payload.type === "LIKE" || payload.type === "COMMENT") {
          const post = await Post.findById(payload.entityId).select("imageUrl");
          postPreview = post?.imageUrl || null;
        }

        io.to(`user:${payload.to}`).emit("notification", {
          ...payload,
          senderUsername: sender?.username,
          senderImage: sender?.profile_image,
          postPreview,
        });

      } catch (err) {
        console.error("❌ Error resolving notification", err);
      }
    });

    socket.on("typing", (payload) => {
      io.to(`user:${payload.to}`).emit("typing", payload);
    })

    socket.on("stop:typing", (payload) => {
      io.to(`user:${payload.to}`).emit("stop:typing", payload);
    })

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence:offline", { userId });
        }
      }
    });
  });

  httpServer.listen(3000, "0.0.0.0", () => {      // for hosting add "0.0.0.0"
    console.log(`🚀 Server running on ${process.env.NEXT_PUBLIC_API_URL}`);
  });
});
