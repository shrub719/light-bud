import crypto from "crypto";
import User from "./models/User";
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

export async function authenticate(req: Request, res: Response, next: () => void): Promise<any> {
    let uuid = req.body.uuid;
    if (!uuid) uuid = req.query.uuid;
    const user = await User.findById({ _id: uuid });
    if (!user) return res.status(400).send();
    if (checkKey(req, user)) {
        req.user = user;
        next();
    } else {
        res.status(403).send();
    }
}

export function validateUsername(username: string) {
    // allow only alphanumeric characters and underscores
    const regex = /^[a-zA-Z0-9_ ]+$/;
    return regex.test(username);
}
