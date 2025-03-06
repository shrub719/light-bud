const express = require("express");
const crypto = require("crypto");
const User = require("../db/models/User")

const router = express.Router();


function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}


router.post("/create", async (req, res) => {
    const user = new User( { key: generateKey() });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
});

router.get("/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

module.exports = router; 
