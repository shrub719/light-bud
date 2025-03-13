import express, { Router, Request } from "express";
import { Document } from "mongodb";
import User from "../utils/models/User";
import { limit, slow } from "../utils/limiters";
import * as auth from "../utils/auth";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

require("dotenv").config();
const router: Router = express.Router();
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});



// TODO: what if a uuid ever clashes?
router.post("/register", limit, async (req, res) => {
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
    res.status(201).json({ user: auth.stripAuth(savedUser), unhashedKey: key }).status(201);
});

router.get("/users", slow, async (req, res) => {
    if (auth.getKey(req) === process.env.PASSWORD) {
        const users = await User.find() as Document;
        const strippedUsers = users.map(auth.stripAuth);
        res.status(200).json(strippedUsers);
    } else {
        res.status(403).send();
    }
});

router.use(auth.authenticate);

router.get("/user", slow, async (req: Request, res) => {
    const user = req.user as Document;
    res.status(200).json(auth.stripAuth(user));
});

router.put("/user", slow, async (req: Request, res): Promise<any> => {
    const user: any = req.user;
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

router.post("/buy", slow, async (req: Request, res): Promise<any> => {
    // NOTE: req.body.item is the item to unlock
    //       remember to change result logic
    const user: any = req.user;
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
        ) as Document;
        res.status(200).json({ result: result, user: auth.stripAuth(updatedUser) });
    } else {
        res.status(500).json({ result: result });
    }
});

export default router;
