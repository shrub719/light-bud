const express = require("express");
const User = require("../db/models/User");
const Room = require("../db/models/Room");
const auth = require("../db/auth");

const router = express.Router();


// TODO: what if a uuid ever clashes?
router.get("/create", async (req, res) => {
    const uuid = auth.generateRandom();
    const key = auth.generateRandom();
    const { salt, hash } = auth.hashKey(key);
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
    if (auth.verifyKey(req.query.key, user.key, user.salt)) {
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
