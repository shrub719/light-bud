import mongoose from "mongoose";
import { User, Room } from "../utils/models"
import { Document, ObjectId } from "mongodb";
import { Request, Response } from "express";
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

// TODO: require credentials for websocket
export async function getUser(uuid: string, isUser=false): Promise<[Document, Object]> {
    const user = await User.findById({ _id: uuid });
    return [user as Document, auth.stripAuth(user as Document, !isUser)];
}

// TODO: keep user document as a variable in a websocket?
export async function editUser(uuid: string, edits: any) {
    const [user, strippedUser] = await getUser(uuid, true);

    if (edits.stats) user.stats = edits.stats;
    if (edits.profile) {
        const username = edits.profile.username;
        if (matcher.hasMatch(username)) {
            return res.status(400).json({ error: "user-badlanguage" });
        }
        if (!(1 <= username.length && username.length <= 20)) {
            return res.status(400).json({ error: "user-length" });
        }
        if (!auth.validateUsername(username)) {
            return res.status(400).json({ error: "user-special" });
        }
        user.profile = edits.profile;
    }

    const savedUser = await user.save();
    return auth.stripAuth(savedUser);
}


async function handleRoom(uuid: string, update: object) {
    const updatedUser = await User.findByIdAndUpdate(
        { _id: uuid },
        update,
        { new: true }
    );
    return updatedUser;
}

export const joinRoom = async (uuid: string, code: string) => handleRoom(
    uuid, 
    { $addToSet: { rooms: code } }
);
export const leaveRoom = async (uuid: string, code: string) => handleRoom(
    uuid, 
    { $pull: { rooms: code } }
);