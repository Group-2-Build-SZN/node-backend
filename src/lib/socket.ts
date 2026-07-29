import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { env } from "@/config/env.config";
import { logger } from "@/config/logger.config";

let io: SocketIOServer | null = null;

// Every authenticated socket auto-joins a room named after its user id, so
// pushing a message/read-receipt to a user is just `io.to(userRoom(userId))`
// regardless of how many tabs/devices they have open.
export function userRoom(userId: string) {
  return `user:${userId}`;
}

export function initSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.ALLOWED_ORIGINS.split(","), credentials: true },
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) return next(new Error("Authentication required"));

    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.id;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(userRoom(userId));

    // Lightweight typing-indicator relay — purely ephemeral, no DB write.
    socket.on(
      "conversation:typing",
      (payload: { conversationId: string; recipientId: string }) => {
        io?.to(userRoom(payload.recipientId)).emit("conversation:typing", {
          conversationId: payload.conversationId,
          userId,
        });
      },
    );

    socket.on("disconnect", () => {
      logger.debug({ userId }, "socket disconnected");
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
