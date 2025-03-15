import { Server } from "socket.io";
import * as db from "../utils/db";
import * as auth from "../utils/auth";

export default function setupWebSocket(ioInstance: Server) {
    ioInstance.on("connection", async (socket) => {
        // authentication
        console.log("user connected");
        const { uuid: sentUuid, key } = socket.handshake.auth;
        const uuid = await auth.wsAuth(sentUuid, key) as string;
        if (uuid == null) {
            console.log("user disconnected: bad auth");
            socket.disconnect(true);
            return;
        }
        console.log("uuid:", uuid);
        let user = await db.getUser(uuid);

        // user
        socket.on("edit", async edits => {
            user = await db.editUser(user, edits);
            socket.emit("edit-response", auth.stripAuth(user));
        });

        socket.on("get", async () => {
            socket.emit("get-response", auth.stripAuth(user))
        });

        // room
        socket.on("room-join", async code => {
            socket.join(code);
        });


        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}