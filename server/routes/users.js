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
    // TODO: strip shop from public user data?
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

router.get("/user", async (req, res) => {
    const user = req.user;
    res.status(200).json(auth.stripAuth(user));
});

router.put("/user", async (req, res) => {
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

router.post("/buy", async (req, res) => {
    // NOTE: req.item is the item to unlock
    //       remember to change result logic
    const user = req.user;
    if (user.shop.unlocked.includes(req.body.item)) {
        return res.status(400).json({ error: "You already have that item!" });   // obviously shouldn't happen but just in case
    }
    // TODO: payment gateway or whatever
    const result = { success: true };
    if (result.success) {
        const updatedUser = await User.findByIdAndUpdate(
            { _id: user._id },
            { $addToSet: { "shop.unlocked": req.body.item } },
            { new: true }
        );
        res.status(200).json({ result: result, user: auth.stripAuth(updatedUser) });
    } else {
        res.status(500).json({ result: result });
    }
});

module.exports = router; 
