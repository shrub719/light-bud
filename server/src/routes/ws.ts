import { Server } from "socket.io";
import * as db from "../utils/db";
import * as auth from "../utils/auth";

export default function setupWebSocket(ioInstance: Server) {
    ioInstance.on("connection", async (socket) => {
        console.log("user connected");

        const { sentUuid, key } = socket.handshake.auth;
        const uuid = await auth.wsAuth(sentUuid, key) as string;
        if (uuid == null) return socket.disconnect(true);
    
        let user = await db.getUser(uuid);

        socket.on("edit", async edits => {
            user = await db.editUser(user, edits);
            socket.emit("edit-response", auth.stripAuth(user));
        });

        socket.on("get", async () => {
            socket.emit("get-response", auth.stripAuth(user))
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}