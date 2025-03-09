const crypto = require("crypto");
const User = require("./models/User");

function generateRandom() {
    return crypto.randomBytes(32).toString('hex');
}

function hashKey(key) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(key, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyKey(sentKey, storedKey, salt) {
    const hash = crypto.pbkdf2Sync(sentKey, salt, 100000, 64, 'sha512').toString('hex');
    return hash === storedKey;
}

function stripAuth(user, public=false) {
    // public: true if data is available to any user
    const userObject = user.toObject();
    let strippedUser = {};
    if (public) {
        const { auth, shop, ...strippedUserObject } = userObject;
        strippedUser = strippedUserObject;
    } else {
        const { auth, ...strippedUserObject } = userObject;
        strippedUser = strippedUserObject;
    }
    return strippedUser;
}

function getKey(req) {
    return req.headers.authorisation.split(" ")[1];
}

function checkKey(req, user) {
    try {
        return verifyKey(getKey(req), user.auth.key, user.auth.salt);
    } catch (err) {
        return false
    }
}

async function authenticate(req, res, next) {
    const user = await User.findOne({ uuid: req.body.uuid });
    if (!user) return res.status(400).send();
    if (checkKey(req, user)) {
        req.user = user;
        next();
    } else {
        res.status(403).send();
    }
}

module.exports = {
    generateRandom,
    hashKey,
    verifyKey,
    stripAuth,
    getKey,
    checkKey,
    authenticate
};
