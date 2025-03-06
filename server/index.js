const express = require("express");
const crypto = require('crypto');

// db imports
const connectDB = require("./db/db");
const User = require("./db/models/User")

// route imports
const userRoutes = require('./routes/users');

const PORT = process.env.PORT || 3001;
const app = express();
connectDB();

app.use(express.json());


// routes

app.use('/users', userRoutes);

app.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
