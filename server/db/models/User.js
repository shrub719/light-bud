const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
    auth: {
        key: { type: String, required: true },
        salt: { type: String, required: true }
    },
    data: {
        focusHours: { type: Number, default: 0 },
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
