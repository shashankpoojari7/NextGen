import { io } from "socket.io-client";
import type { ClientSocket } from "@/types/CustomSocket";

export const socket: ClientSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  autoConnect: false,
}) as ClientSocket;
