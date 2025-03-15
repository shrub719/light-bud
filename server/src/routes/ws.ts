import { Server } from "socket.io";

export default function setupWebSocket(ioInstance: Server) {
    ioInstance.on("connection", (socket) => {
        console.log("user connected");
    });
}