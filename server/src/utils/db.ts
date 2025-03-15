import mongoose from "mongoose";
import { User, Room } from "../utils/models"
import { Document } from "mongodb";
import { Request, Response } from "express";
import * as auth from "../utils/auth";

export default async function connectDB() {
    try {
        await mongoose.connect((process.env.MONGO_URI as string), {});
        console.log("mongodb connected!");
    } catch (error) {
        console.error("mongodb failed:\n", error);
        process.exit(1);
    }
};


// === USER LOGIC ===

//


// === ROOM LOGIC ===

const MAX_MEMBERS = 8
export async function handleRoom(req: Request, res: Response, roomUpdate: object, userUpdate: object): Promise<any> {
    const room = await Room.findOne({ code: req.body.code });
    if (!room) return res.status(400).json({ error: "room-none" });
    if (room.uuids.length >= MAX_MEMBERS) return res.status(400).json({ error: "room-full" });

    const updatedRoom = await Room.findByIdAndUpdate(
        { _id: room._id },
        roomUpdate,
        { new: true }
    );
    const updatedUser = await User.findByIdAndUpdate(
        { _id: req.body.uuid },
        userUpdate,
        { new: true }
    );
    // const updatedRoom = await room.update(update);
    // TODO: test
    // also req.user exists, maybe use that?

    if (!updatedRoom) return res.status(400).json({ error: "room-none" });
    if (updatedRoom.uuids.length === room.uuids.length) return res.status(400).json({ error: "room-in"} );
    if (updatedRoom.uuids.length === 0) await updatedRoom.deleteOne();
    res.status(200).json({ room: updatedRoom, user: auth.stripAuth(updatedUser as Document) });
}