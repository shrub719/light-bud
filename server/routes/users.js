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

router.get("/members", async (req, res) => {
    const room = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).send();
    const users = await User.find({ uuid: { $in: room.members } });
    const strippedUsers = users.map(user => auth.stripAuth(user, public=true));
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

router.get("/user", async (req, res) => {
    const user = req.user;
    res.status(200).json(auth.stripAuth(user));
});

router.put("/user", async (req, res) => {
    const user = req.user;
    if (req.body.stats) user.stats = req.body.stats;
    if (req.body.profile) {
        const username = req.body.profile.username;
        if (matcher.hasMatch(username)) {
            return res.status(400).json({ error: "Username can't have any bad language in it!" });
        }
        if (!(1 <= username.length && username.length <= 20)) {
            return res.status(400).json({ error: "Username has to be between 1 and 20 characters." });
        }
        if (!auth.validateUsername(username)) {
            return res.status(400).json({ error: "Username can't contain any special characters." });
        }
        user.profile = req.body.profile;
    }

    const savedUser = await user.save();
    res.status(200).json(auth.stripAuth(savedUser));
});

module.exports = router; 
