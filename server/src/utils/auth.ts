import crypto from "crypto";
const User = require("./models/User");
import { Document } from "mongodb";
import { Request, Response } from "express";

function generateRandom() {
    return crypto.randomBytes(32).toString('hex');
}

function hashKey(key: string) {
    const salt: string = crypto.randomBytes(16).toString('hex');
    const hash: string = crypto.pbkdf2Sync(key, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyKey(sentKey: string | undefined, storedKey: string, salt: string) {
    const hash = crypto.pbkdf2Sync((sentKey as string), salt, 100000, 64, 'sha512').toString('hex');
    return hash === storedKey;
}

function stripAuth(user: Document, isPublic: boolean = false) {
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

function getKey(req: Request) {
    return req.headers.authorization?.split(" ")[1];
}

function checkKey(req: Request, user: Document) {
    try {
        return verifyKey(getKey(req), user.auth.key, user.auth.salt);
    } catch (err) {
        return false
    }
}

async function authenticate(req: Request, res: Response, next: () => void) {
    const user = await User.findOne({ uuid: req.body.uuid });
    if (!user) return res.status(400).send();
    if (checkKey(req, user)) {
        req.user = user;
        next();
    } else {
        res.status(403).send();
    }
}

function validateUsername(username: string) {
    // allow only alphanumeric characters and underscores
    const regex = /^[a-zA-Z0-9_ ]+$/;
    return regex.test(username);
}

module.exports = {
    generateRandom,
    hashKey,
    verifyKey,
    stripAuth,
    getKey,
    checkKey,
    authenticate,
    validateUsername
};
