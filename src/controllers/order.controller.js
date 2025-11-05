import Order from "../../schema/order.model.js";
import Product from "../../schema/productList.model.js";

// Create new order
// Create new order - UPDATED VERSION
export const createOrder = async (req, res) => {
  try {
    const { address, items } = req.body;
    const userId = req.user._id;

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient quantity for product: ${product.title}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.availability = "Out of Stock";
        product.inStock = false;
      }
      await product.save();
    }

    // Create main order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      address,
      status: "pending",
      paymentStatus: "pending"
    });

    const savedOrder = await order.save();

    // ✅ CORRECTED: Add orders to products with orderId
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Add order to product's orders array with orderId
        product.orders.push({
          user: userId,
          quantity: item.quantity,
          orderDate: new Date(),
          status: "pending",
          orderPrice: product.price,
          orderId: savedOrder._id, // 🟢 यहाँ orderId add करें
          // Add buyer information
          buyerName: req.user.firstName + " " + req.user.lastName,
          buyerEmail: req.user.email,
          address: address,
          phone: req.user.phone || "Not provided"
        });
        await product.save();
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: error.message });
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
// Add this to your product.controller.js
export const updateProductOrderStatus = async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    const { status } = req.body;

    console.log("🔄 Updating product order:", { productId, orderId, status });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the specific order in the product's orders array
    const order = product.orders.id(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found in product" });
    }

    // Update order status
    order.status = status;
    order.updatedAt = new Date();
    
    await product.save();

    console.log("✅ Product order status updated successfully");

    res.status(200).json({
      message: "Order status updated successfully",
      order: order,
      product: {
        _id: product._id,
        title: product.title
      }
    });
  } catch (err) {
    console.error("❌ updateProductOrderStatus Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// order.controller.js में add करें
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
};