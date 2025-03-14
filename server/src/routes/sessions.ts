import express, { Router, Request, Response } from "express";
import { Document } from "mongodb";
import User from "../utils/models/User"
import Room from "../utils/models/Room";
import { slow } from "../utils/limiters";
import * as auth from "../utils/auth";

require("dotenv").config();
const router: Router = express.Router();


// TODO: add validation, like can't be in/hosting a room at the same time
router.post("/start", slow, auth.auth, async (req: Request, res): Promise<any> => {
    const room = await auth.accessRoom(req, res);
    const uuid: string = req.body.uuid;
    room.sessions.push({
        host: uuid,
        uuids: [uuid],
        startTime: 3,  // TODO: use datetime or something
        duration: req.body.duration
    });
    const savedRoom = await room.save();
    res.status(200).json(savedRoom);
}); 

router.get("/session", slow, auth.auth, async (req, res): Promise<any> => {
    const room = await Room.findOne({ code: req.query.code });
    if (!room) return res.status(400).json({ error: "room-none" });
    res.status(200).json(room);
});

// router.get("/members", slow, async (req, res): Promise<any> => {
//     const room: Document | null = await Room.findOne({ code: req.query.code });
//     if (!room) return res.status(400).send();
//     const users = await User.find({ _id: { $in: room.uuids } });
//     const strippedUsers = users.map((user: Document) => auth.stripAuth(user, true));
//     res.status(200).json(strippedUsers);
// })

// router.get("/", slow, async (req, res) => {
//     if (auth.getKey(req) === process.env.PASSWORD) {
//         const rooms = await Room.find();
//         res.status(200).json(rooms);
//     } else {
//         res.status(403).send();
//     }
// });

// router.post("/create", slow, auth.auth, async (req, res) => {
//     const room = new Room( {
//         code: auth.generateRandom(16),
//         uuids: [req.body.uuid]
//     });
//     const savedRoom = await room.save();
//     const updatedUser = await User.findByIdAndUpdate(
//         { _id: req.body.uuid },
//         { $addToSet: { rooms: req.body.code } },
//         { new: true }
//     );
//     res.status(201).json({ room: savedRoom, user: updatedUser });
// });

// router.put("/join", auth.auth, slow, async (req, res) => handleRoom(req, res, 
//     { $addToSet: { uuids: req.body.uuid } },
//     { $addToSet: { rooms: req.body.code } }
// ));
// router.put("/leave", auth.auth, slow, async (req, res) => handleRoom(req, res, 
//     { $pull: { uuids: req.body.uuid } },
//     { $pull: { rooms: req.body.code } }
// ));

export default router;
