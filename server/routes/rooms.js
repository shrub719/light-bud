const express = require("express");
const User = require("../db/models/User")
const Room = require("../db/models/Room");
const auth = require("../db/auth");

require("dotenv").config();
const router = express.Router();


async function handleRoom(req, res, update) {
    const user = await User.findOne({ uuid: req.body.uuid });
    if (!user) return res.status(400).send();
    if (auth.authenticate(req, user)) {
        const updatedRoom = await Room.findOneAndUpdate(
            { code: req.body.code },
            update,
            { new: true }
        );
        if (!updatedRoom) return res.status(400).json({ error: "A room with that code does not exist!" });
        if (updatedRoom.members.length === 0) await updatedRoom.deleteOne();
        res.status(200).json(updatedRoom);
    } else {
        res.status(403).send();
    }
}


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

router.put("/join", async (req, res) => handleRoom(req, res, { $addToSet: { members: req.body.uuid } }));
router.put("/leave", async (req, res) => handleRoom(req, res, { $pull: { members: req.body.uuid } }));

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
