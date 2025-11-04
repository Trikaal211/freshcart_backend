import Order from "../../schema/order.model.js";
import Product from "../../schema/productList.model.js";

export const createOrder = async (req, res) => {
  try {
    const { address, items } = req.body;
    const userId = req.user._id;

    if (!items || !items.length) {
      return res.status(400).json({ error: "No items provided" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 1️⃣ Calculate total & validate stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.title}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      // Decrease stock
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.availability = "Out of Stock";
        product.inStock = false;
      }
      await product.save();
    }

    // 2️⃣ Create the order document
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      address,
      status: "pending",
      paymentStatus: "pending",
    });

    const savedOrder = await newOrder.save();

    // 3️⃣ Link this order to each seller’s product.orders
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $push: {
          orders: {
            user: userId,
            orderId: savedOrder._id, // consistent link
            quantity: item.quantity,
            status: "pending",
            orderDate: new Date(),
            orderPrice: item.price,
          },
        },
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ error: err.message });
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
