import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  autoConnect: false,
  reconnection: false,
});

export default socket;
