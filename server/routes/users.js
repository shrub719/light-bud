const express = require("express");
const User = require("../db/models/User");
const Room = require("../db/models/Room");
const auth = require("../db/auth");
const {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} = require('obscenity');

require("dotenv").config();
const router = express.Router();
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});


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

router.get("/user", async (req, res) => {
    const user = await User.findOne({ uuid: req.query.uuid });
    if (!user) return res.status(400).send();
    res.status(200).json(auth.stripAuth(user));
});

router.get("/members", async (req, res) => {
    const room = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).send();
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

router.use(auth.authenticate);

router.put("/edit", async (req, res) => {
    const user = req.user;
    // TODO: maybe change this so i don't have to update it every time the user model updates
    if (req.body.stats) user.stats = req.body.stats;
    if (req.body.profile) {
        if (matcher.hasMatch(req.body.profile.username)) {
            return res.status(400).json({ error: "Username can't have any bad language in it!" });
        }
        user.profile = req.body.profile;
    }

    const savedUser = await user.save();
    res.status(200).json(auth.stripAuth(savedUser));
});

module.exports = router; 
