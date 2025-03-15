import mongoose from "mongoose";
import { User, Room } from "../utils/models"
import { Document, ObjectId } from "mongodb";
import { Request } from "express";
import * as auth from "../utils/auth";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

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
export async function editUser(user: Document, edits: any) {
    if (edits.stats) user.stats = edits.stats;
    if (edits.profile) {
        if (edits.profile.username) {
            const username = edits.profile.username;
            if (matcher.hasMatch(username)) {
                return { error: "user-badlanguage" };
            }
            if (!(1 <= username.length && username.length <= 20)) {
                return { error: "user-length" };
            }
            if (!auth.validateUsername(username)) {
                return { error: "user-special" };
            }
        }
        user.profile = edits.profile;
    }

    await user.save();
    return user;
}


export async function getRoom(code: string) {
    const room = Room.findById(code);
    if (!room) return { error: "room-none" };
    return room;
}

export async function createRoom() {
    const room = new Room();
    await room.save();
    return room;
}

export async function joinRoom(user: Document, code: ObjectId) {
    user.room = code.toString();
    await user.save();

    const room = await Room.findByIdAndUpdate(code, 
        { $addToSet: { uuids: user.uuid } },
        { new: true }
    );
    console.log(room);

    return user;
}

export async function leaveRoom(user: Document, code: ObjectId) {
    user.room = "";
    await user.save();

    const room = await Room.findByIdAndUpdate(code, 
        { $pull: { uuids: user.uuid } },
        { new: true }
    );

    return user;
}
