declare module "express" {
    interface Request {
        user?: Document
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

app.use("/api/u", userRoutes);
app.use("/api/r", roomRoutes);

app.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
