import Wishlist from "../../schema/wishlist.model.js";
import User from "../../schema/user.model.js";
import Product from "../../schema/productList.model.js";

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find user's wishlist or create one
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [{ productId }]
      });
    } else {
      // Check if product already in wishlist
      const existingProduct = wishlist.products.find(
        item => item.productId.toString() === productId
      );

      if (existingProduct) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      // Add product to wishlist
      wishlist.products.push({ productId });
    }

    await wishlist.save();

    // Populate the product details for response
    await wishlist.populate('products.productId');

    res.status(200).json({
      message: "Product added to wishlist successfully",
      wishlist
    });

  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      item => item.productId.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate('products.productId');

    res.status(200).json({
      message: "Product removed from wishlist successfully",
      wishlist
    });

  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId })
      .populate('products.productId');

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist is empty",
        wishlist: { products: [] }
      });
    }

    // ✅ Filter out null productIds (product deleted or invalid)
    wishlist.products = wishlist.products.filter(p => p.productId !== null);

    res.status(200).json({ wishlist });

  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Clear entire wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      message: "Wishlist cleared successfully",
      wishlist
    });

  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if product is in wishlist
export const checkInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(200).json({ isInWishlist: false });
    }

    const isInWishlist = wishlist.products.some(
      item => item.productId.toString() === productId
    );

    res.status(200).json({ isInWishlist });

  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};