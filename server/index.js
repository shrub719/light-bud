const express = require("express");
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
// TODO: use post/put requests. not everything is get
// TODO: => switch from res.query
// TODO: should user data and user auth stuff be stored in separate collections?
// TODO: for now, users/users => users/* and rooms/rooms => rooms/*
// TODO: error handling so it doesn't crash when no params are passed
// TODO: some admin authentication for viewing the list of users/rooms
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
