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

function leaveCurrentSession(socket: Socket) {
    const socketRooms = Array.from(socket.rooms);
    const sessions = socketRooms.filter(room => room.split("-")[0] === "session");
    if (sessions.length >= 1) {
        socket.leave(sessions[0]);
    }
}

// TODO: rate limit
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
            if (user.room) {
                socket.to(toRoom(user.room)).emit("user-data", auth.stripAuth(user, true));
            }
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

            if (user.room) await db.leaveRoom(user, user.room);
            user = await db.joinRoom(user, code);
            socket.join(toRoom(code));
            socket.emit("room-data", await db.getRoomData(user, code));
            socket.to(toRoom(code)).emit("user-data", auth.stripAuth(user, true));
            socket.to(toRoom(code)).emit("resend-sessions", socket.id);  // signal to resend active sessions
        });

        socket.on("leave-room", async code => {
            if (!valid.roomCode(code)) return socket.emit("error", "room-invalidCode");
            user = await db.leaveRoom(user, code);
            socket.leave(toRoom(code));
            socket.emit("leave-room-ack", code);
        });


        // session
        socket.on("resent-session", msg => {
            if (!user.room) return;
            const err = valid.sessionData(msg.session);
            if (err) return socket.emit("error", err);
            const socketId = msg.socketId;
            const session = msg.session;
            socket.to(socketId).emit("session", session);
        });

        socket.on("start-session", session => {
            if (!user.room) return;
            const err = valid.sessionData(session, false);
            if (err) return socket.emit("error", err);
            const id = auth.generateRandom(8);
            leaveCurrentSession(socket);
            socket.join(toSession(user.room, id));
            session.id = id;
            socket.to(toRoom(user.room)).emit("session", session);
            socket.emit("start-session-ack", id);
        });

        socket.on("join-session", id => {
            if (!user.room) return;
            const err = valid.sessionName(toSession(user.room, id), ioInstance);
            if (err) return socket.emit("error", err);
            leaveCurrentSession(socket);
            socket.join(toSession(user.room, id));
            socket.to(toSession(user.room, id)).emit("session-user-joined", user._id);
        });


        socket.on("disconnect", () => {
            leaveCurrentSession(socket);
            console.log(socket.id + ": user disconnected");
        });
    });

    ioInstance.of("/").adapter.on("join-room", (room, id) => {
        if (room !== id) {
            console.log(room + ": socket", id, "joined");
        }
    });

    ioInstance.of("/").adapter.on("leave-room", (room, id) => {
        if (room !== id) {
            console.log(room + ": socket", id, "left");
        }
    });
}