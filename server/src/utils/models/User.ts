import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
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
    shop: {
        unlocked: { type: [String], default: [] }
    }
});

const User = mongoose.model("User", userSchema);

export default User;
