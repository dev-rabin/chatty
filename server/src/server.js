import express from "express";
import dotenv from "dotenv"
import { connectDB } from "./lib/db_connection.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js";
import cors from "cors"
import { app, server } from "./lib/socket.js"
import path from "path"

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

dotenv.config()

const __dirname = path.resolve();

const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get('/*splat', (req, res) => {
        res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
    });
}

server.listen(port, () => {
    console.log(`Server is running on ${port}`);
    connectDB();
})

