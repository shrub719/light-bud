declare module "express" {
    interface Request {
        user?: Document
    }
}

import express from "express";
import { Document } from "mongodb";
import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./utils/db";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import setupWebSocket from "./routes/ws";
import httpRouter from "./routes/http";

const PORT = process.env.PORT || "3002";
const app = express();
const config = {
    origin: "*",  // FIXME !!!
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
connectDB();

app.use(cors(config));
app.use(express.json());

app.use("/api", httpRouter);

const server = http.createServer(app);
const io = new Server(server, { cors: config });
setupWebSocket(io);

app.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
