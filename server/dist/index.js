"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const connectDB = require("./db/db");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const app = (0, express_1.default)();
connectDB();
app.use(express_1.default.json());
// routes jrfgkh
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
