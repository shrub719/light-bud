const crypto = require("crypto");

function generateRandom() {
    return crypto.randomBytes(32).toString('hex');
}

function hashKey(key) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(key, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyKey(key, hashedKey, salt) {
    const hash = crypto.pbkdf2Sync(key, salt, 100000, 64, 'sha512').toString('hex');
    return hash === hashedKey;
}

module.exports = {
    generateRandom,
    hashKey,
    verifyKey
};
