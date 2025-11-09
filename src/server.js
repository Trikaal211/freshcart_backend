import express from "express";
import cors from "cors";
import "../config/db.js";
import dotenv from "dotenv";
import { PORT } from "../constants/env.constants.js";
import reciperouter from "./routers/recipe.router.js";
import { fileURLToPath } from "url";
import path from "path";

import router from "./routers/index.router.js";
import cartrouter from "./routers/cart.router.js";
import bookrouter from "./routers/book.router.js";
import wishlistRouter from "./routers/wishlist.router.js";
import orderRouter from "./routers/order.routes.js";


const app = express();
dotenv.config();
console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);


// ✅ CORS setup
app.use(cors({
  origin: "https://freshcartfrontend.netlify.app",
  credentials: true,
}));

app.use(express.json());

// ✅ (1) ye part ab optional hai, kyunki uploads local nahi rahe
// ❌ Cloudinary use kar rahe ho, to ye line remove ya comment kar do
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ✅ (2) Routes
app.use("/recipes", reciperouter);
app.use("/books", bookrouter);
app.use("/orders", (req, res, next) => {
  console.log("🟢 /orders route hit:", req.method, req.url);
  next();
}, orderRouter);
app.use("/cart", cartrouter);
app.use("/wishlist", wishlistRouter);
app.use("/", router);

// ✅ (3) Server start
app.listen(PORT || 3000, () => {
  console.log(`🚀 Server running on port ${PORT || 3000}`);
});
