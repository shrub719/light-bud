import { Server, Socket } from "socket.io";
import * as db from "../utils/db";
import * as auth from "../utils/auth";
import * as valid from "../utils/validation";

function toRoom(code: string) {
    return "room-" + code;
}

function toSession(code: string, id: string) {
    return "session-" + code + "-" + id;
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
            if (err) return socket.emit("error", err);
            socket.emit("edit-ack", auth.stripAuth(user));   // TODO: don't transfer data with acks?
            socket.to(toRoom(user.room)).emit("other-edit", auth.stripAuth(user, true));
        });

        socket.on("get", async () => {
            socket.emit("user", auth.stripAuth(user))
        });

        // room
        if (user.room) {
            socket.join(toRoom(user.room));
            socket.emit("room-data", await db.getRoomData(user, user.room));
            socket.to(toRoom(user.room)).emit("resend-sessions", socket.id);
        }

        socket.on("create-room", async () => {
            leaveCurrentRoom(socket);
            const code = auth.generateRandom(16);
            user = await db.joinRoom(user, code);
            socket.join(toRoom(code));
            socket.emit("created-room", code);
        })

        socket.on("join-room", async code => {
            if (!valid.roomCode(code)) return socket.emit("error", "room-invalidCode");
            leaveCurrentRoom(socket);

            user = await db.joinRoom(user, code);
            socket.join(toRoom(code));
            socket.emit("room-data", await db.getRoomData(user, code));
            socket.to(toRoom(code)).emit("resend-sessions", socket.id);  // signal to resend active sessions
        });

        socket.on("leave-room", async code => {
            if (!valid.roomCode(code)) return socket.emit("error", "room-invalidCode");
            user = await db.leaveRoom(user, code);
            socket.leave(toRoom(code));
            socket.emit("leave-room-ack", code);
        });


        socket.on("disconnect", () => {
            console.log(socket.id + ": user disconnected");
        });

        // session
        socket.on("resent-session", msg => {
            if (!user.room) return;
            const socketId = msg.id;
            const session = msg.session;
            socket.to(socketId).emit("session", session);
        });

        socket.on("start-session", session => {
            if (!user.room) return;
            const id = auth.generateRandom(8);
            socket.join(toSession(user.room, id));
            session.id = id;
            socket.to(toRoom(user.room)).emit("session", session);
        })

        socket.on("send-session", session => {
            if (!user.room) return;
            socket.to(toRoom(user.room)).emit("session", session);
        });

        socket.on("join-session", id => {
            if (!user.room) return;
            socket.join(toSession(user.room, id));
            socket.to(toSession(user.room, id)) 
            // TODO: set up same stuff as rooms
            //       including leaveCurrentSession()
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