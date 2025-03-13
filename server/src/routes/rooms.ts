import express, { Router, Request, Response } from "express";
import { Document } from "mongodb";
import User from "../utils/models/User"
import Room from "../utils/models/Room";
import { slow } from "../utils/limiters";
import * as auth from "../utils/auth";

require("dotenv").config();
const router: Router = express.Router();


// TODO: extract strings so you can change them more easily
const MAX_MEMBERS = 8
async function handleRoom(req: Request, res: Response, update: object): Promise<any> {
    const room = await Room.findOne({ code: req.body.code });
    if (!room) return res.status(400).json({ error: "room-none" });
    if (room.uuids.length >= MAX_MEMBERS) return res.status(400).json({ error: "room-full" });

    const updatedRoom = await Room.findByIdAndUpdate(
        { _id: room._id },
        update,
        { new: true }
    );

    if (!updatedRoom) return res.status(400).json({ error: "room-none" });
    if (updatedRoom.uuids.length === 0) await updatedRoom.deleteOne();
    res.status(200).json(updatedRoom);
}


router.get("/room", slow, async (req, res): Promise<any> => {
    const room = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).json({ error: "room-none" });
    res.status(200).json(room);
});

router.get("/room_members", slow, async (req, res): Promise<any> => {
    const room = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).send();
    const users = await User.find({ uuid: { $in: room.uuids } });
    const strippedUsers = users.map((user: Document) => auth.stripAuth(user, true));
    res.status(200).json(strippedUsers);
})

router.get("/", slow, async (req, res) => {
    if (auth.getKey(req) === process.env.PASSWORD) {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } else {
        res.status(403).send();
    }
});

router.use(auth.authenticate);

router.post("/room", slow, async (req, res) => {
    const room = new Room( {
        code: auth.generateRandom(),
        members: [req.body.uuid]
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
});

router.put("/join", slow, async (req, res) => handleRoom(req, res, { $addToSet: { members: req.body.uuid } }));
router.put("/leave", slow, async (req, res) => handleRoom(req, res, { $pull: { members: req.body.uuid } }));

export default router;
