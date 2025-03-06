const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    members: { type: [String], required: true }
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
