const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  focusHours: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
