import express, { Router, Request, Response } from "express";
import { Document } from "mongodb";
import User from "../utils/models/User"
import Room from "../utils/models/Room";
import { limit, slow } from "../utils/limiters";
import * as auth from "../utils/auth";

require("dotenv").config();
const router: Router = express.Router();


const MAX_MEMBERS = 8
async function handleRoom(req: Request, res: Response, roomUpdate: object, userUpdate: object): Promise<any> {
    const room = await Room.findOne({ code: req.body.code });
    if (!room) return res.status(400).json({ error: "room-none" });
    if (room.uuids.length >= MAX_MEMBERS) return res.status(400).json({ error: "room-full" });

    const updatedRoom = await Room.findByIdAndUpdate(
        { _id: room._id },
        roomUpdate,
        { new: true }
    );
    const updatedUser = await User.findByIdAndUpdate(
        { _id: req.body.uuid },
        userUpdate,
        { new: true }
    );
    // const updatedRoom = await room.update(update);
    // TODO: test
    // also req.user exists, maybe use that?

    if (!updatedRoom) return res.status(400).json({ error: "room-none" });
    if (updatedRoom.uuids.length === room.uuids.length) return res.status(400).json({ error: "room-in"} );
    if (updatedRoom.uuids.length === 0) await updatedRoom.deleteOne();
    res.status(200).json({ room: updatedRoom, user: auth.stripAuth(updatedUser as Document) });
}


router.get("/room", slow, async (req, res): Promise<any> => {
    const room = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).json({ error: "room-none" });
    res.status(200).json(room);
});

router.get("/members", slow, async (req, res): Promise<any> => {
    const room: Document | null = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).send();
    const users = await User.find({ _id: { $in: room.uuids } });
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

router.post("/create", limit, auth.auth, async (req, res) => {
    const room = new Room( {
        code: auth.generateRandom(16),
        uuids: [req.body.uuid]
    });
    const savedRoom = await room.save();
    const updatedUser = await User.findByIdAndUpdate(
        { _id: req.body.uuid },
        { $addToSet: { rooms: req.body.code } },
        { new: true }
    );
    res.status(201).json({ room: savedRoom, user: updatedUser });
});

router.put("/join", slow, auth.auth, async (req, res) => handleRoom(req, res, 
    { $addToSet: { uuids: req.body.uuid } },
    { $addToSet: { rooms: req.body.code } }
));
router.put("/leave", slow, auth.auth, async (req, res) => handleRoom(req, res, 
    { $pull: { uuids: req.body.uuid } },
    { $pull: { rooms: req.body.code } }
));

export default router;
