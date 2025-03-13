declare module "express" {
    interface Request {
        user?: Document;
    }
}

import express, { Express, Request, Response } from "express";
import { Document } from "mongodb";
import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./utils/db";
import userRoutes from "./routes/users";
import roomRoutes from "./routes/rooms";

const PORT = process.env.PORT || 3001;
const app: Express = express();
connectDB();

app.use(express.json());

// routes
// TODO: should user data and user auth stuff be stored in separate collections?
// TODO: express-validator
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
