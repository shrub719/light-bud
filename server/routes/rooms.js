const express = require("express");
const crypto = require("crypto");
const Room = require("../db/models/Room");

const router = express.Router();


// TODO: maybe this shouldn't be duplicated
function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}


router.post("/create", async (req, res) => {
    const room = new Room( {
        code: generateKey(),
        userKeys: [req.key]
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
});

router.get("/rooms", async (req, res) => {
    const rooms = await Room.find();
    res.json(rooms);
});

module.exports = router; 
