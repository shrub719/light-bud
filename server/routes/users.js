const express = require("express");
const User = require("../db/models/User");
const Room = require("../db/models/Room");
const auth = require("../db/auth");

require("dotenv").config();
const router = express.Router();


// TODO: what if a uuid ever clashes?
router.post("/create", async (req, res) => {
    const uuid = auth.generateRandom();
    const key = auth.generateRandom();
    const { salt, hash } = auth.hashKey(key);
    const user = new User({ 
        uuid: uuid,
        auth: {
            key: hash,
            salt: salt
        }
    });
    const savedUser = await user.save();
    res.status(201).json({ user: auth.stripAuth(savedUser), unhashedKey: key });
});

router.post("/edit", async (req, res) => {
    const user = await User.findOne({ uuid: req.body.uuid });
    if (auth.authenticate(req, user)) {
        user.data = req.body.data;
        const savedUser = await user.save();
        res.status(200).json(auth.stripAuth(savedUser));
    } else {
        res.status(403).send();
    }
});

router.post("/user", async (req, res) => {
    const user = await User.findOne({ uuid: req.body.uuid });
    res.status(200).json(auth.stripAuth(user));
});

router.post("/members", async (req, res) => {
    const room = await Room.findOne({ code: req.body.code });
    const users = await User.find({ uuid: { $in: room.members } });
    const strippedUsers = users.map(auth.stripAuth);
    res.status(200).json(strippedUsers);
})

router.get("/", async (req, res) => {
    if (auth.getKey(req) === process.env.PASSWORD) {
        const users = await User.find();
        const strippedUsers = users.map(auth.stripAuth);
        res.status(200).json(strippedUsers);
    } else {
        res.status(403).send();
    }
});

module.exports = router; 
