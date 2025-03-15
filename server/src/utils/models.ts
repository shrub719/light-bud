import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    auth: {
        key: { type: String, required: true },
        salt: { type: String, required: true },
    },
    stats: {
        focusHours: { type: Number, default: 0 },
    },
    profile: {
        username: { type: String, default: "Light Bud User" },
        icon: { type: [String], default: ["cat-happy", "blue"] } 
    },
    room: { type: String, default: "" },
    shop: {
        unlocked: { type: [String], default: [] }
    }
});

const roomSchema = new mongoose.Schema({
    uuids: { type: [String], default: [] }
});


export const User = mongoose.model("User", userSchema);
export const Room = mongoose.model("Room", roomSchema);
