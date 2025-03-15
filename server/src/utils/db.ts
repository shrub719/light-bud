import mongoose from "mongoose";
import { User, Room } from "../utils/models"
import { Document, ObjectId } from "mongodb";
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
export async function getUser(uuid: string, isUser=false) {
    const user = await User.findById({ _id: uuid });
    return [user, auth.stripAuth(user as Document, !isUser)];
}

export async function editUser(uuid: string, edits: object) {
    const [user, strippedUser] = await getUser(uuid, true);
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