const express = require("express");
const connectDB = require("./db/db");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");

require("dotenv").config();
const PORT = process.env.PORT || 3001;
const app = express();
connectDB();

app.use(express.json());


// routes
// TODO: use post/put requests. not everything is get
// TODO: => switch from res.query

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
