const express = require("express");
const crypto = require("crypto");
const Room = require("../db/models/Room");

const router = express.Router();


// TODO: maybe this shouldn't be duplicated
function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}


router.get("/create", async (req, res) => {
    const room = new Room( {
        code: generateKey(),
        userKeys: [req.query.key]
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
});

router.get("/join", async (req, res) => {
    const updatedRoom = await Room.findOneAndUpdate(
        { code: req.query.code },
        { $push: { userKeys: req.query.key } },
        { new: true }
    );
    res.status(200).json(updatedRoom);
});

router.get("/rooms", async (req, res) => {
    const rooms = await Room.find();
    res.json(rooms);
});

module.exports = router; 
