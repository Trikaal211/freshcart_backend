import express from "express";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../controllers/cart.controller.js";
import {authMiddleware} from "../../middlewares/user.middleware.js"
const cartrouter = express.Router();

cartrouter.post("/add",authMiddleware, addToCart);
cartrouter.get("/", authMiddleware, getCart);
cartrouter.delete("/:cartItemId",authMiddleware, removeFromCart);
cartrouter.put("/:cartItemId", authMiddleware, updateCartItem); // ✅ PUT route for quantity update
export default cartrouter;
