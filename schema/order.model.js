import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { // buyer
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // seller is optional here; the order items contain references to product -> we can deduce seller from product if needed
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: String,
        image: String,
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String }, // optional: store buyer phone
    buyerName: { type: String }, // store snapshot
    buyerEmail: { type: String },
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
