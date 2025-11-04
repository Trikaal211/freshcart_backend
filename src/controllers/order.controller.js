import Order from "../../schema/order.model.js";
import Product from "../../schema/productList.model.js";

// Create new order - COMPLETELY FIXED VERSION
export const createOrder = async (req, res) => {
  try {
    const { address, items, phone, deliveryTime, paymentMethod, orderNote } = req.body;
    const userId = req.user._id;

    console.log("🚀 Starting order creation...");
    console.log("📦 Items:", items);
    console.log("👤 User:", req.user);

    let totalAmount = 0;
    const orderItems = [];

    // Validate and prepare items
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
      phone: phone || "",
      deliveryTime: deliveryTime || "",
      paymentMethod: paymentMethod || "cod",
      orderNote: orderNote || "",
      status: "pending",
      paymentStatus: "pending"
    });

    const savedOrder = await order.save();
    console.log("✅ Main order created with ID:", savedOrder._id);

    // ✅ FIXED: Add order to each product's orders array
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const orderData = {
          user: userId,
          quantity: item.quantity,
          orderDate: new Date(),
          status: "pending",
          orderPrice: item.price || product.price,
          orderId: savedOrder._id,
          buyerName: `${req.user.firstName} ${req.user.lastName}`,
          buyerEmail: req.user.email,
          address: address,
          phone: phone || "",
          deliveryTime: deliveryTime || "",
          updatedAt: new Date()
        };

        console.log("🟢 Adding order to product:", {
          productId: item.productId,
          productTitle: product.title,
          orderId: savedOrder._id,
          status: "pending"
        });

        // Add order to product
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $push: { 
              orders: orderData 
            }
          },
          { 
            new: true
          }
        );

        console.log("✅ Order added to product successfully");
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

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
};