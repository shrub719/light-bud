import express, { Express, Request, Response } from "express";
require("express-async-errors");

const connectDB = require("./utils/db");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");

require("dotenv").config();
const PORT = process.env.PORT || 3001;
const app: Express = express();
connectDB();

app.use(express.json());

// routes
// TODO: should user data and user auth stuff be stored in separate collections?
// TODO: express-validator
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/test", (req: Request, res: Response) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
