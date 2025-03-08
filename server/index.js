const express = require("express");
require("express-async-errors");
const path = require("path");
const connectDB = require("./db/db");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");

require("dotenv").config();
const PORT = process.env.PORT || 3001;
const app = express();
connectDB();

app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/dist')));


// routes
// TODO: should user data and user auth stuff be stored in separate collections?
// TODO: express-validator
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
