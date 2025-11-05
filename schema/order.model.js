import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: "Not provided"
    },
    deliveryTime: {
      type: String,
      default: "Not specified"
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "paypal", "gpay"],
      default: "cod"
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    }
  },
  { 
    timestamps: true,
    versionKey: false 
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;