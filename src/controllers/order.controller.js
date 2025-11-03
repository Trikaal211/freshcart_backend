import Order from "../../schema/order.model.js";
import Product from "../../schema/productList.model.js";

// Create new order
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

      // Add order to product's orders array for the uploader to see
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $push: {
            orders: {
              user: userId,
              quantity: item.quantity,
              orderDate: new Date(),
              status: "pending",
              orderPrice: product.price
            }
          }
        }
      );
    }

    // Create order
 // Create order
const order = new Order({
  user: userId,
  items: orderItems,
  totalAmount,
  address,
  status: "pending",
  paymentStatus: "pending"
});

const savedOrder = await order.save();

// ✅ यह नया हिस्सा जोड़ो (हर product.orders में orderId भी डालेंगे)
for (const item of items) {
  await Product.findByIdAndUpdate(
    item.productId,
    {
      $push: {
        orders: {
          user: userId,
          quantity: item.quantity,
          orderDate: new Date(),
          status: "pending",
          orderPrice: item.price,
          orderId: savedOrder._id   // 🟢 यह नई लाइन डालो
        }
      }
    }
  );
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

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // 🔹 Validate status
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 🔹 Find order and populate product uploader
    const order = await Order.findById(orderId).populate("items.product", "uploadedBy title");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔹 Check if logged-in user is seller of any product in this order
    const isSeller = order.items.some(
      (item) => item.product?.uploadedBy?.toString() === req.user._id.toString()
    );

    if (!isSeller) {
      return res.status(403).json({ message: "You are not authorized to update this order" });
    }

    // 🔹 Update main order status
    order.status = status;
    await order.save();

    // 🔹 Update embedded order status in product(s) for this buyer
    await Product.updateMany(
      {
        uploadedBy: req.user._id,       // Only seller’s products
        "orders.user": order.user,      // For the same buyer
      },
      {
        $set: { "orders.$[elem].status": status },
      },
      {
        arrayFilters: [{ "elem.user": order.user }],
      }
    );

    return res.status(200).json({
      message: `Order status updated to '${status}' successfully`,
      order,
    });

  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: err.message });
  }
};

