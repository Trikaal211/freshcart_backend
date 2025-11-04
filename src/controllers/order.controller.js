import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    const {
      address,
      items,
      phone,
      deliveryTime,
      paymentMethod,
      totalAmount,
      orderNote,
      packaging
    } = req.body;

    // Get user info
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      address,
      phone,
      buyerName: `${user.firstName} ${user.lastName}`,
      buyerEmail: user.email,
      deliveryTime,
      paymentMethod,
      orderNote,
      packaging,
      status: "pending"
    });

    const savedOrder = await order.save();

    // Update each product with order information
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $push: {
            orders: {
              orderId: savedOrder._id,
              quantity: item.quantity,
              orderPrice: item.price,
              buyerName: `${user.firstName} ${user.lastName}`,
              buyerEmail: user.email,
              address: address,
              phone: phone,
              status: "pending"
            }
          }
        },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ 
      error: "Failed to create order",
      details: error.message 
    });
  }
};

// Get user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'title images price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Update order status
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

    // Also update status in product's orders array
    await Product.updateMany(
      { "orders.orderId": orderId },
      { $set: { "orders.$.status": status } }
    );

    res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};