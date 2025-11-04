import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  discountPrice: Number,
  category: String,
  images: [String],
  quantity: { type: Number, default: 1 },
  tags: [String],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Orders array to track orders for this product
  orders: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    orderPrice: {
      type: Number,
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
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    orderedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true,
  versionKey: false 
});

const Product = mongoose.model("Product", productSchema);
export default Product;