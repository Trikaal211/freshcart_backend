import express from "express";
import { 
  addToCart, 
  getCart, 
  removeFromCart, 
  updateCartItem, 
  clearCart,
  getCartSummary 
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";

const cartrouter = express.Router();

cartrouter.post("/add", authMiddleware, addToCart);
cartrouter.get("/", authMiddleware, getCart);
cartrouter.get("/summary", authMiddleware, getCartSummary); // New route for checkout summary
cartrouter.delete("/:cartItemId", authMiddleware, removeFromCart);
cartrouter.put("/:cartItemId", authMiddleware, updateCartItem);
cartrouter.delete("/clear/all", authMiddleware, clearCart); // Clear entire cart

export default cartrouter;