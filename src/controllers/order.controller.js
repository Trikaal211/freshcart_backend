import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// ✅ Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items in order" });

    // ✅ Create order
    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      address,
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    // ✅ Add this order reference in each product
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $push: { orders: { orderId: savedOrder._id, quantity: item.quantity } } },
        { new: true }
      );
    }

    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// ✅ Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// ✅ Get logged-in user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders", error: error.message });
  }
};

// ✅ Update product order status (nested order array)
export const updateProductOrderStatus = async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const order = product.orders.id(orderId);
    if (!order) return res.status(404).json({ error: "Order not found in product" });

    order.status = status;
    await product.save();

    res.status(200).json({
      message: "Order status updated successfully",
      productId,
      orderId,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
