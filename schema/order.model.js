import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { // buyer
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    seller: { // product owner
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      title: String,
      image: String,
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    orderDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
