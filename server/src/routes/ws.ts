import { Server } from "socket.io";
import * as db from "../utils/db";
import * as auth from "../utils/auth";

function toRoom(code: string) {
    return "room-" + code;
}

function toSession(roomCode: string, sessionCode: string) {
    return "session-" + roomCode + "-" + sessionCode;
}

export default function setupWebSocket(ioInstance: Server) {
    ioInstance.on("connection", async (socket) => {
        // authentication
        console.log(socket.id + ": user connected");
        const { uuid: sentUuid, key } = socket.handshake.auth;
        const uuid = await auth.wsAuth(sentUuid, key) as string;
        if (uuid == null) {
            console.log(socket.id + ": user disconnected (bad auth)");
            socket.disconnect(true);
            return;
        }
        console.log(socket.id + ": uuid", uuid);
        let user = await db.getUser(uuid);

        // user
        socket.on("edit", async edits => {
            const result = await db.editUser(user, edits);
            if (!result.error) user = result;
        });

        socket.on("get", async () => {
            socket.emit("get-response", auth.stripAuth(user))
        });

        // room
        if (user.room) {
            socket.join(toRoom(user.room));
            socket.to(toRoom(user.room)).emit("join-room");
        }

        socket.on("create-room", async () => {
            const room = await db.createRoom();
            user = await db.joinRoom(user, room._id);
            socket.join(toRoom(room._id.toString()));
        })

        socket.on("join-room", async code => {
            if (!auth.validateRoomCode(code)) {
                socket.emit("join-room-response", { error: "room-invalid" });
                return;
            }
            const socketRooms = Array.from(socket.rooms);
            const rooms = socketRooms.filter(room => room.split("-")[0] === "room");
            if (rooms.length >= 1) {
                socket.leave(rooms[0]);
            }

            user = await db.joinRoom(user, code);
            socket.join(toRoom(code));
            socket.to(toRoom(code)).emit("resend-sessions");  // signal to resend active sessions
        });

        socket.on("leave-room", async code => {
            if (!auth.validateRoomCode(code)) return;
            user = await db.leaveRoom(user, code);
            socket.leave(toRoom(code));
        });


        socket.on("disconnect", () => {
            console.log(socket.id + ": user disconnected");
        });
    });

    ioInstance.of("/").adapter.on("join-room", (room, id) => {
        if (room !== id) {
            console.log(room + ": socket", id, "joined");
        }
    });

    ioInstance.of("/").adapter.on("leave-room", (room, id) => {
        console.log(room + ": socket", id, "left");
    });
}