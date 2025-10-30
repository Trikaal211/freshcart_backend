import express from "express";
import cors from "cors";
import "../config/db.js"
import dotenv from "dotenv";
import { PORT } from "../constants/env.constants.js";
import reciperouter from "./routers/recipe.router.js";
import {fileURLToPath} from "url";
import path from "path";

import router from "./routers/index.router.js";
import cartrouter from "./routers/cart.router.js";
import bookrouter from "./routers/book.router.js";
import wishlistRouter from "./routers/wishlist.router.js"; // Add this line
import orderRouter from "./routers/order.routes.js";

const app = express();
dotenv.config();

app.use(cors({
  origin: "https://freshcartfrontend.netlify.app",
  credentials: true
}));

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/recipes", reciperouter);
app.use("/books", bookrouter);
app.use("orders", orderRouter)
app.use("/cart", cartrouter);
app.use("/wishlist", wishlistRouter); // Add this line
app.use("/", router);

app.listen(PORT||3000, () => {
  console.log("hey, server running on port 3000");
});