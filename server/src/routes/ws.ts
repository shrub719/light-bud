import { Server } from "socket.io";
import * as db from "../utils/db";
import * as auth from "../utils/auth";

export default function setupWebSocket(ioInstance: Server) {
    ioInstance.on("connection", async (socket) => {
        console.log("user connected");
        let user = await db.getUser("67d470dce624798dce93d5c9");

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