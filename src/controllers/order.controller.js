import Order from "../../schema/order.model.js";
import Product from "../../schema/productList.model.js";

// 🧩 CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    console.log("🟢 CREATE ORDER CALLED");
    const userId = req.user._id;
    const { items, totalAmount, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in the order" });
    }

    // 🔹 Step 1: Validate products & update quantity
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.title}`,
        });
      }

      // Decrease product quantity
      product.quantity -= item.quantity;
      await product.save();
    }

    // 🔹 Step 2: Create the order
    const order = new Order({
      user: userId,
      items,
      totalAmount,
      address,
      status: "pending",
      paymentStatus: "pending",
    });

    const savedOrder = await order.save();

    // 🔹 Step 3: Update each product's orders array — only once!
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $push: {
          orders: {
            user: userId,
            quantity: item.quantity,
            orderDate: new Date(),
            status: "pending",
            orderPrice: item.price,
            orderId: savedOrder._id, // 👈 helpful for reverse lookup
          },
        },
      });
    }

    console.log("✅ Order created successfully:", savedOrder._id);
    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });

  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Something went wrong while creating order" });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title images price")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (for admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "title images price uploadedBy")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order statu

// Add this to your order.controller.js
// controllers/order.controller.js

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // order ID
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // 1️⃣ Update in Order collection
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("items.product", "title images uploadedBy");

    if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

    // 2️⃣ Also update the product.orders array for each product in this order
    for (const item of updatedOrder.items) {
      await Product.updateMany(
        { _id: item.product, "orders.orderId": id },
        { $set: { "orders.$.status": status } }
      );
    }

    res.status(200).json({
      message: "Order status updated successfully in both collections",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("❌ updateOrderStatus Error:", err);
    res.status(500).json({ error: err.message });
  }
};


