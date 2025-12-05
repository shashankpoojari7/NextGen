import { Socket } from "socket.io-client";

export interface ClientSocket extends Socket {
  auth: {
    userId?: string;
    token?: string;
  };
}
