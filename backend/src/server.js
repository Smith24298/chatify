import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

// Required for secure cookies on Render
app.set("trust proxy", 1);

// CORS for Vercel + local dev
const allowedOrigins = [
  "https://chatify-sigma-nine.vercel.app",
  "http://localhost:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Optional frontend hosting (not used on Render but harmless)
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
  );
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
