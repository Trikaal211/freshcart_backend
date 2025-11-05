import Order from "../../schema/order.model.js";
import Product from "../../schema/productList.model.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  try {
    const { address, items, phone, buyerName, buyerEmail } = req.body;
    const userId = req.user._id;

    if (!address) return res.status(400).json({ error: "Address is required" });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Items are required" });

    let totalAmount = 0;
    const orderItems = [];

    // Validate & reduce stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `Product not found: ${item.productId}` });

      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient quantity for product: ${product.title}` });
      }

      const itemTotal = (product.discountPrice || product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        image: product.images?.[0] || "",
        quantity: item.quantity,
        price: product.discountPrice || product.price
      });

      // reduce product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.availability = "Out of Stock";
        product.inStock = false;
      }
      await product.save();
    }

    // Save main order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      address,
      phone: phone || "",
      buyerName: buyerName || `${req.user.firstName || ""} ${req.user.lastName || ""}`,
      buyerEmail: buyerEmail || req.user.email || "",
      status: "pending",
      paymentStatus: "pending"
    });

    const savedOrder = await order.save();

    // Push order reference into each product.orders array with snapshot data
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $push: {
          orders: {
            orderId: savedOrder._id,
            user: userId,
            quantity: item.quantity,
            orderDate: new Date(),
            status: "pending",
            orderPrice: item.price || null,
            buyerName: buyerName || req.user.firstName || "Customer",
            buyerEmail: buyerEmail || req.user.email || "",
            addressSnapshot: address
          }
        }
      });
    }

    res.status(201).json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get orders for user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title images price")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "title images price uploadedBy")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update order status centrally.
 * - Updates Order.status
 * - Also updates any Product.orders entries that match orderId
 *
 * Called by:
 *  PATCH /orders/:orderId/status
 *  PATCH /products/:productId/orders/:orderId/status  (we'll wire both routes to this)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid orderId" });
    }

    // Update Order doc
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    // Update Product.orders entries:
    // If productId provided, update only that product's orders entry.
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const prodOrder = product.orders.find(o => o.orderId?.toString() === orderId || o._id?.toString() === orderId);
      if (!prodOrder) return res.status(404).json({ error: "Order not found in product" });

      prodOrder.status = status;
      await product.save();
    } else {
      // If no productId, update across all products that reference this orderId
      await Product.updateMany(
        { "orders.orderId": order._id },
        { $set: { "orders.$[elem].status": status } },
        { arrayFilters: [{ "elem.orderId": order._id }] }
      );
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ error: err.message });
  }
};
