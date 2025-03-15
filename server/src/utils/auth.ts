import crypto from "crypto";
import { ObjectId, Document } from "mongodb";
import { Request, Response } from "express";
import { User } from "./models";

export function generateRandom(length: number = 32) {
    return crypto.randomBytes(length).toString('hex');
}

// generate a random salt, and return the salt and the key hashed with the salt
export function hashKey(key: string) {
    const salt: string = crypto.randomBytes(16).toString('hex');
    const hash: string = crypto.pbkdf2Sync(key, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

// check an unhashed sent key against a hashed stored key
function verifyKey(sentKey: string | undefined, storedKey: string, salt: string) {
    const hash = crypto.pbkdf2Sync((sentKey as string), salt, 100000, 64, 'sha512').toString('hex');
    return hash === storedKey;
}

// remove data that doesn't need to be sent over the connection, like auth and shop data
export function stripAuth(user: Document, isPublic: boolean = false) {
    // iSPublic: true if data is available to any user
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

// used as part of httpAuth, or when accessing admin endpoints
export function getKey(req: Request) {
    return (req.headers.authorization as string).split(" ")[1];
}

// used as part of httpAuth
function isAuthorised(req: Request, user: Document) {
    try {
        return verifyKey(getKey(req), user.auth.key, user.auth.salt);
    } catch (err) {
        return false
    }
}

// auth function to get the authorised uuid of a new websocket connection
export async function wsAuth(uuid: string | undefined, key: string) {
    if (uuid == null) return;
    if (!ObjectId.isValid(uuid)) return;
    const user = await User.findById({ _id: uuid }) as Document;
    if (!user) return;
    if (verifyKey(key, user.auth.key, user.auth.salt)) {
        return uuid;
    } else {
        return;
    }
}

// auth function for verifying the identity of http requesters
export async function httpAuth(req: Request, res: Response, next: () => void): Promise<any> {
    let uuid = req.body.uuid;
    if (!uuid) uuid = req.query.uuid;
    if (!uuid) return res.status(400).send();
    if (!ObjectId.isValid(uuid)) return res.status(400).send();
    const user = await User.findById({ _id: uuid });
    if (!user) return res.status(400).send();
    if (isAuthorised(req, user)) {
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