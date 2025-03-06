const express = require("express");
const crypto = require('crypto');

// db imports
const connectDB = require("./db/db");
const User = require("./db/models/User")


const PORT = process.env.PORT || 3001;
const app = express();
connectDB();


// functions

function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}


// routes

app.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

app.get("/key", (req, res) => {
    const key = generateKey();
    res.json({ key: key });
});


app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
