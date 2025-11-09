import Cart from "../../schema/shopping.model.js";
import Product from "../../schema/productList.model.js";
import { io } from "../server.js"; // Socket import

// Helper function: emit cart update to user
const emitCartUpdate = async (userId) => {
  const updatedCart = await Cart.findOne({ userId })
    .populate("products.productId", "title images price weight availability discountPrice");
  io.to(userId.toString()).emit("cartUpdated", updatedCart || { products: [] });
};

// Add or update product in cart
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, products: [] });

    const existing = cart.products.find(p => p.productId.toString() === productId);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity, price: product.price });
    }

    await cart.save();
    await emitCartUpdate(userId);

    res.status(200).json(await Cart.findOne({ userId }).populate("products.productId", "title images price weight availability"));
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId })
      .populate("products.productId", "title images price weight availability discountPrice");
    res.status(200).json(cart || { products: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;
  const userId = req.user._id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { _id: cartItemId } } },
      { new: true }
    ).populate("products.productId", "title images price weight availability");

    await emitCartUpdate(userId);

    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "products._id": cartItemId },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    ).populate("products.productId", "title images price weight availability");

    await emitCartUpdate(userId);

    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { products: [] } },
      { new: true }
    );

    await emitCartUpdate(userId);

    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json({ message: "Cart cleared successfully", cart: updatedCart });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get cart summary for checkout
export const getCartSummary = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId })
      .populate("products.productId", "title price availability uploadedBy");

    if (!cart || cart.products.length === 0) {
      return res.status(200).json({ items: [], subtotal: 0, totalItems: 0, message: "Cart is empty" });
    }

    let subtotal = 0;
    let totalItems = 0;
    const items = [];

    for (const item of cart.products) {
      const product = item.productId;
      if (product && product.availability !== "Out of Stock") {
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;

        items.push({
          productId: product._id,
          product: product,
          quantity: item.quantity,
          price: product.price,
          itemTotal: itemTotal,
          uploadedBy: product.uploadedBy
        });
      }
    }

    res.status(200).json({
      items,
      subtotal,
      totalItems,
      shipping: subtotal > 500 ? 0 : 40,
      total: subtotal + (subtotal > 500 ? 0 : 40)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
