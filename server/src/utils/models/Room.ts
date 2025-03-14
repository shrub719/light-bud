import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    host: { type: String, required: true },
    uuids: { type: [String], required: true },
    startTime: { type: Number, required: true },
    countdown: { type: Number, required: false }
});

const roomSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    uuids: { type: [String], required: true },
    sessions: [sessionSchema]
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
