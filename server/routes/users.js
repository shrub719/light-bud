const express = require("express");
const crypto = require("crypto");
const User = require("../db/models/User");
const Room = require("../db/models/Room");

const router = express.Router();


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


// TODO: what if a uuid ever clashes?
router.get("/create", async (req, res) => {
    const uuid = generateRandom();
    const key = generateRandom();
    const { salt, hash } = hashKey(key);
    const user = new User({ 
        uuid: uuid,
        key: hash,
        salt: salt
    });
    const savedUser = await user.save();
    res.status(201).json({ user: savedUser, unhashedKey: key });
});

router.get("/focus", async (req, res) => {
    const user = await User.findOne({ uuid: req.query.uuid });
    if (verifyKey(req.query.key, user.key, user.salt)) {
        user.focusHours = req.query.focusHours;
        const savedUser = await user.save();
        res.status(200).json(savedUser);
    } else {
        res.status(403);
    }
});

router.get("/user", async (req, res) => {
    const user = await User.findOne({ uuid: req.query.uuid });
    res.status(200).json(user);
});

router.get("/members", async (req, res) => {
    const room = await Room.findOne({ code: req.query.code });
    const users = await User.find({ uuid: { $in: room.members } });
    res.status(200).json(users);
})

router.get("/users", async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

module.exports = router; 
