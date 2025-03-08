const express = require("express");
const User = require("../db/models/User")
const Room = require("../db/models/Room");
const auth = require("../db/auth");

require("dotenv").config();
const router = express.Router();


router.post("/create", async (req, res) => {
    const user = await User.findOne({ uuid: req.body.uuid });
    if (!user) return res.status(400).send();
    if (auth.authenticate(req, user)) {
        const room = new Room( {
            code: auth.generateRandom(),
            members: [req.body.uuid]
        });
        const savedRoom = await room.save();
        res.status(201).json(savedRoom);
    } else {
        res.status(403).send();
    }
});

// TODO: join and leave are practically the same function?
router.put("/join", async (req, res) => {
    const user = await User.findOne({ uuid: req.body.uuid });
    if (!user) return res.status(400).send();
    if (auth.authenticate(req, user)) {
        const updatedRoom = await Room.findOneAndUpdate(
            { code: req.body.code },
            { $addToSet: { members: req.body.uuid } },
            { new: true }
        );
        if (!updatedRoom) return res.status(400).json({ error: "A room with that code does not exist!" });
        res.status(200).json(updatedRoom);
    } else {
        res.status(403).send();
    }
});

router.put("/leave", async (req, res) => {
    const user = await User.findOne({ uuid: req.body.uuid });
    if (!user) return res.status(400).send();
    if (auth.authenticate(req, user)) {
        const updatedRoom = await Room.findOneAndUpdate(
            { code: req.body.code },
            { $pull: { members: req.body.uuid } },
            { new: true }
        );
        if (!updatedRoom) return res.status(400).json({ error: "A room with that code does not exist!" });
        res.status(200).json(updatedRoom);
    } else {
        res.status(403).send();
    }
});

router.get("/room", async (req, res) => {
    const room = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).json({ error: "A room with that code does not exist!" });
    res.status(200).json(room);
});

router.get("/", async (req, res) => {
    if (auth.getKey(req) === process.env.PASSWORD) {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } else {
        res.status(403).send();
    }
});

module.exports = router; 
