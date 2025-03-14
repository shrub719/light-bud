import crypto from "crypto";
import User from "./models/User";
import Room from "./models/Room";
import { Document } from "mongodb";
import { Request, Response } from "express";

export function generateRandom(length: number = 32) {
    return crypto.randomBytes(length).toString('hex');
}

export function hashKey(key: string) {
    const salt: string = crypto.randomBytes(16).toString('hex');
    const hash: string = crypto.pbkdf2Sync(key, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyKey(sentKey: string | undefined, storedKey: string, salt: string) {
    const hash = crypto.pbkdf2Sync((sentKey as string), salt, 100000, 64, 'sha512').toString('hex');
    return hash === storedKey;
}

export function stripAuth(user: Document, isPublic: boolean = false) {
    // public: true if data is available to any user
    const userObject = user.toObject();
    let strippedUser: object = {};
    if (isPublic) {
        const { auth, shop, ...strippedUserObject } = userObject;
        strippedUser = strippedUserObject;
    } else {
        const { auth, ...strippedUserObject } = userObject;
        strippedUser = strippedUserObject;
    }
    return strippedUser;
}

export function getKey(req: Request) {
    return (req.headers.authorization as string).split(" ")[1];
}

export function checkKey(req: Request, user: Document) {
    try {
        return verifyKey(getKey(req), user.auth.key, user.auth.salt);
    } catch (err) {
        return false
    }
}

export async function auth(req: Request, res: Response, next: () => void): Promise<any> {
    console.log("auth triggered")
    let uuid = req.body.uuid;
    if (!uuid) uuid = req.query.uuid;
    if (!uuid) return res.status(400).send();
    const user = await User.findById({ _id: uuid });
    if (!user) return res.status(400).send();
    if (checkKey(req, user)) {
        req.user = user;
        next();
    } else {
        res.status(403).send();
    }
}

export async function accessRoom(req: Request, res: Response): Promise<any> {
    const room = await Room.findOne({ code: req.body.code });
    if (!room) return res.status(400).json();
    if (!room.uuids.includes(req?.user?._id)) return res.status(403).json();
    return room;
}

export function validateUsername(username: string) {
    // allow only alphanumeric characters and underscores
    const regex = /^[a-zA-Z0-9_ ]+$/;
    return regex.test(username);
}