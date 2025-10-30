// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // uploader
});

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  address: { type: String },
  phone: { type: String },
  total: { type: Number },
  note: { type: String },
  deliveryType: { type: String },
  status: { type: String, default: "pending" }, // pending, accepted, shipped, delivered
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
