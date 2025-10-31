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

const app = express();
dotenv.config();

// ✅ CORS setup (frontend URL)
app.use(cors({
  origin: "https://freshcartfrontend.netlify.app",
  credentials: true,
}));

// ✅ JSON middleware
app.use(express.json());

// ❌ Ye line ab optional hai, Cloudinary use karte ho to local uploads serve nahi karni
// app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ✅ Routers
app.use("/recipes", reciperouter);
app.use("/books", bookrouter);
app.use("/orders", orderRouter);
app.use("/cart", cartrouter);
app.use("/wishlist", wishlistRouter);
app.use("/", router);

// ✅ Server start
app.listen(PORT || 3000, () => {
  console.log(`✅ Server running on port ${PORT || 3000}`);
});
