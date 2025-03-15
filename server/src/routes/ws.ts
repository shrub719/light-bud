import { Server, Socket } from "socket.io";
import * as db from "../utils/db";
import * as auth from "../utils/auth";

function room(code: string) {
    return "room-" + code;
}

function session(roomCode: string, sessionCode: string) {
    return "session-" + roomCode + "-" + sessionCode;
}

function leaveCurrentRoom(socket: Socket) {
    const socketRooms = Array.from(socket.rooms);
    const rooms = socketRooms.filter(room => room.split("-")[0] === "room");
    if (rooms.length >= 1) {
        socket.leave(rooms[0]);
    }
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
            let err: string;
            [user, err] = await db.editUser(user, edits);
            if (err) {
               return socket.emit("edit-response", { error: err });
            }
            socket.emit("edit-response", auth.stripAuth(user));
        });

        socket.on("get", async () => {
            socket.emit("get-response", auth.stripAuth(user))
        });

        // room
        if (user.room) {
            socket.join(room(user.room));
            socket.emit("join-room-response", await db.getRoomData(user, user.room));
            socket.to(room(user.room)).emit("resend-sessions", socket.id);
        }

        socket.on("create-room", async () => {
            leaveCurrentRoom(socket);
            const code = auth.generateRandom(16);
            user = await db.joinRoom(user, code);
            socket.join(room(code));
            socket.emit("create-room-response", code);
        })

        socket.on("join-room", async code => {
            if (!auth.validateRoomCode(code)) {
                return socket.emit("join-room-response", { error: "room-invalid" });
            }
            leaveCurrentRoom(socket);

            user = await db.joinRoom(user, code);
            socket.join(room(code));
            socket.emit("join-room-response", await db.getRoomData(user, code));
            socket.to(room(code)).emit("resend-sessions");  // signal to resend active sessions
        });

        socket.on("leave-room", async code => {
            if (!auth.validateRoomCode(code)) return;
            user = await db.leaveRoom(user, code);
            socket.leave(room(code));
            socket.emit("leave-room-response", code);
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