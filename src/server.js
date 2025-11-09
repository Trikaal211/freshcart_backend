import express from "express";
import cors from "cors";
import "../config/db.js";
import dotenv from "dotenv";
import { PORT } from "../constants/env.constants.js";
import reciperouter from "./routers/recipe.router.js";
import router from "./routers/index.router.js";
import cartrouter from "./routers/cart.router.js";
import bookrouter from "./routers/book.router.js";
import wishlistRouter from "./routers/wishlist.router.js";
import orderRouter from "./routers/order.routes.js";

import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

// ✅ CORS setup
app.use(cors({
  origin: "https://freshcartfrontend.netlify.app",
  credentials: true,
}));

app.use(express.json());

// ✅ Routes
app.use("/recipes", reciperouter);
app.use("/books", bookrouter);
app.use("/orders", (req, res, next) => {
  console.log("🟢 /orders route hit:", req.method, req.url);
  next();
}, orderRouter);
app.use("/cart", cartrouter);
app.use("/wishlist", wishlistRouter);
app.use("/", router);

// ✅ HTTP server create (Socket.io ke liye)
const httpServer = createServer(app);

// ✅ Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: "https://freshcartfrontend.netlify.app",
    methods: ["GET", "POST"]
  }
});

// ✅ Socket connection
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ✅ Server start
httpServer.listen(PORT || 3000, () => {
  console.log(`🚀 Server running on port ${PORT || 3000}`);
});
