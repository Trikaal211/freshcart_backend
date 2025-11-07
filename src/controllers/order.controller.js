import Order from "../../schema/order.model.js";
import Product from "../../schema/productList.model.js";

// CREATE ORDER - FIXED VERSION
export const createOrder = async (req, res) => {
  try {
    console.log(" CREATE ORDER CALLED");
    const userId = req.user._id;
    const { items, totalAmount, address, phone, deliveryTime, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in the order" });
    }

    // Step 1: Validate products & update quantity
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

    // Step 2: Create the order
    const order = new Order({
      user: userId,
      items: items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      address,
      phone: phone || "Not provided",
      deliveryTime: deliveryTime || "Not specified",
      paymentMethod: paymentMethod || "cod",
      status: "pending",
      paymentStatus: "pending",
    });

    const savedOrder = await order.save();

    // Step 3: Update each product's orders array with proper data
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Get user info for order details
        const userInfo = req.user; // From auth middleware

        product.orders.push({
          user: userId,
          quantity: item.quantity,
          orderDate: new Date(),
          status: "pending",
          orderPrice: item.price,
          orderId: savedOrder._id, //  Main order ID
          buyerName: `${userInfo.firstName} ${userInfo.lastName}`,
          buyerEmail: userInfo.email,
          address: address,
          phone: phone || "Not provided"
        });

        await product.save();
      }
    }

    console.log(" Order created successfully:", savedOrder._id);
    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });

  } catch (error) {
    console.error(" Error creating order:", error);
    res.status(500).json({ error: "Something went wrong while creating order" });
  }
};

// Update order status - FIXED VERSION
// Update order status - COMPLETE FIXED VERSION
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("🔄 Updating order status everywhere:", { orderId, status });

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // 1. Update in main Order collection
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("items.product", "title images uploadedBy");

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Update in all products' orders arrays for this order
    for (const item of updatedOrder.items) {
      await Product.updateOne(
        { 
          _id: item.product._id, 
          "orders.orderId": orderId 
        },
        { 
          $set: { "orders.$.status": status } 
        }
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

// Other order functions...
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
