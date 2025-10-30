// controllers/order.controller.js
import Order from "../models/Order.js";
import Product from "../models/productList.model.js"; // adjust path
import Notification from "../models/Notification.js"; // optional, only if you created model

// Create an order and notify sellers
export const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { cartItems, address, phone, total, note, deliveryType } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Normalize items: ensure seller is present. If not provided by frontend, derive from product.
    const itemsWithSeller = [];
    for (const ci of cartItems) {
      const productId = ci.productId || ci.product; // be flexible
      const quantity = ci.quantity || ci.qty || 1;

      const product = await Product.findById(productId).select("uploadedBy title price");
      if (!product) continue;

      itemsWithSeller.push({
        product: product._id,
        quantity,
        seller: product.uploadedBy, // uploader
      });
    }

    // Save order
    const order = await Order.create({
      buyer: buyerId,
      items: itemsWithSeller,
      address,
      phone,
      total,
      note,
      deliveryType,
    });

    // Create notifications per seller (avoid duplicate notifications if same seller multiple items)
    const sellersNotified = new Set();
    for (const it of itemsWithSeller) {
      if (!it.seller) continue;
      const sellerId = String(it.seller);
      if (sellersNotified.has(sellerId)) continue;
      sellersNotified.add(sellerId);

      const message = `New order received for your product(s). Order ID: ${order._id}`;
      if (Notification) {
        await Notification.create({
          user: sellerId,
          message,
          order: order._id,
        });
      }
    }

    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await Order.find({ "items.seller": sellerId })
      .populate("buyer", "name email")
      .populate("items.product", "title images price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("getSellerOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ error: err.message });
  }
};
