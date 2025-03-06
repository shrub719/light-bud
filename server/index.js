const express = require("express");
const crypto = require('crypto');


const PORT = process.env.PORT || 3001;
const app = express();


// functions

function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}


// app methods

app.get("/api", (req, res) => {
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