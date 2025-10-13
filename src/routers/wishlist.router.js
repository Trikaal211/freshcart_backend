import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  checkInWishlist
} from "../controllers/wishlist.controller.js";
import {authMiddleware} from "../../middlewares/user.middleware.js"

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// GET /wishlist - Get user's wishlist
router.get("/", getWishlist);

// POST /wishlist - Add product to wishlist
router.post("/", addToWishlist);

// DELETE /wishlist/:productId - Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

// DELETE /wishlist - Clear entire wishlist
router.delete("/", clearWishlist);

// GET /wishlist/check/:productId - Check if product is in wishlist
router.get("/check/:productId", checkInWishlist);

export default router;