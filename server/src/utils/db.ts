import mongoose from "mongoose";
import { User, Room } from "../utils/models"
import { Document } from "mongodb";
import { Request } from "express";
import * as auth from "../utils/auth";
import * as valid from "../utils/validation";


export default async function connectDB() {
    try {
        await mongoose.connect((process.env.MONGO_URI as string), {});
        console.log("mongodb connected!");
    } catch (error) {
        console.error("mongodb failed:\n", error);
        process.exit(1);
    }
};


export async function registerUser(req: Request) {
    const key = auth.generateRandom();
    const { salt, hash } = auth.hashKey(key);
    const user = new User({
        auth: {
            key: hash,
            salt: salt
        }
    });
    const savedUser = await user.save();
    return [auth.stripAuth(savedUser), key];
}

export async function getUser(uuid: string): Promise<Document> {
    const user = await User.findById({ _id: uuid });
    return user as Document;
}

// TODO: don't let invalid data come in
export async function editUser(user: Document, edits: any): Promise<[Document, string]> {
    const err = valid.edits(edits);
    if (err) return [user, err];
    if (edits.stats) user.stats = edits.stats;
    if (edits.profile) user.profile = edits.profile;

    await user.save();
    return [user, ""];
}


export async function joinRoom(user: Document, code: string) {
    user.room = code;
    await user.save();

    await Room.findOneAndUpdate(
        { code: code },
        { $addToSet: { uuids: user._id } },
        { upsert: true }
    );

    return user;
}

export async function leaveRoom(user: Document, code: string) {
    user.room = "";
    await user.save();

    await Room.findOneAndUpdate(
        { code: code },
        { $pull: { uuids: user._id } }
    );

    return user;
}

export async function getRoomData(requestingUser: Document, code: string) {
    const room: Document = await Room.findOne({ code: code }) as Document;
    const requestingUuid = requestingUser._id.toString();
    const uuids = room.uuids.filter((uuid: string) => (uuid != requestingUuid));
    const users = await User.find({ _id: { $in: uuids } });
    const strippedUsers = users.map((user: Document) => auth.stripAuth(user, true));
    return strippedUsers
}