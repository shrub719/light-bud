const express = require("express");
const Room = require("../db/models/Room");
const auth = require("../db/auth");

const router = express.Router();


router.get("/create", async (req, res) => {
    const room = new Room( {
        code: auth.generateRandom(),
        members: [req.query.uuid]
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
});

router.get("/join", async (req, res) => {
    const updatedRoom = await Room.findOneAndUpdate(
        { code: req.query.code },
        { $push: { members: req.query.uuid } },
        { new: true }
    );
    res.status(200).json(updatedRoom);
});

router.get("/room", async (req, res) => {
    const room = await Room.findOne({ code: req.query.code });
    res.status(200).json(room);
});

router.get("/rooms", async (req, res) => {
    const rooms = await Room.find();
    res.status(200).json(rooms);
});

module.exports = router; 
