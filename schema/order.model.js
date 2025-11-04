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
      required: true
    },
    buyerName: {
      type: String,
      required: true
    },
    buyerEmail: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "gpay", "cod"],
      default: "cod"
    },
    deliveryTime: String,
    orderNote: String,
    packaging: String
  },
  { 
    timestamps: true,
    versionKey: false 
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;