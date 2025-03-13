import express, { Router, Request, Response } from "express";
import Room from "../utils/models/Room";
import * as auth from "../utils/auth";

require("dotenv").config();
const router: Router = express.Router();


// TODO: extract strings so you can change them more easily
const MAX_MEMBERS = 8
async function handleRoom(req: Request, res: Response, update: object): Promise<any> {
    const room = await Room.findOne({ code: req.body.code });
    if (!room) return res.status(400).json({ error: "A room with that code does not exist!" });
    if (room.uuids.length >= MAX_MEMBERS) return res.status(400).json({ error: "Sorry, that room is full!" });

    const updatedRoom = await Room.findByIdAndUpdate(
        { _id: room._id },
        update,
        { new: true }
    );

    if (!updatedRoom) return res.status(400).json({ error: "A room with that code does not exist!" });
    if (updatedRoom.uuids.length === 0) await updatedRoom.deleteOne();
    res.status(200).json(updatedRoom);
}


router.get("/room", async (req, res): Promise<any> => {
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

router.use(auth.authenticate);

router.post("/create", async (req, res) => {
    const room = new Room( {
        code: auth.generateRandom(),
        members: [req.body.uuid]
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
});

router.put("/join", async (req, res) => handleRoom(req, res, { $addToSet: { members: req.body.uuid } }));
router.put("/leave", async (req, res) => handleRoom(req, res, { $pull: { members: req.body.uuid } }));

export default router;
