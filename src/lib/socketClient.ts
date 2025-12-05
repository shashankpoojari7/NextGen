import { io } from "socket.io-client";
import type { ClientSocket } from "@/types/CustomSocket";

export const socket: ClientSocket = io(process.env.NEXT_PUBLIC_API_URL, {
  path: "/api/socket/io",
  autoConnect: false,
}) as ClientSocket;
