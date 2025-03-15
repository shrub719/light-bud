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

export async function getUser(uuid: string): Promise<Document | Object> {
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


// TODO: leave room if joining another one
async function handleRoom(user: Document, update: object) {
    const updatedUser = await user.update(update, { new: true });
    return updatedUser;
}

export const joinRoom = async (user: Document, code: string) => handleRoom(
    user, 
    { $addToSet: { rooms: code } }
);
export const leaveRoom = async (user: Document, code: string) => handleRoom(
    user, 
    { $pull: { rooms: code } }
);