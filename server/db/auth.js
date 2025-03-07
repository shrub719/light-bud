const crypto = require("crypto");

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

function stripAuth(user) {
    return {
        uuid: user.uuid,
        data: user.data
    };
}

function getKey(req) {
    return req.headers.authorisation.split(" ")[1];
}

function authenticate(req, user) {
    try {
        return verifyKey(getKey(req), user.auth.key, user.auth.salt);
    } catch (err) {
        return false
    }
}

module.exports = {
    generateRandom,
    hashKey,
    verifyKey,
    stripAuth,
    getKey,
    authenticate
};
