import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    slug: { type: String, required: true },
    brand: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0, validate: { validator(value) { return value <= this.price; } } },
    discountPercentage: { type: Number, min: 0, max: 100 },
    quantity: { type: Number, default: 0, min: 0 },
    weight: { type: String, default: "N/A", trim: true },
    images: [{ type: String, trim: true }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    lifestyle: { type: [String] },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    deliveryInfo: { type: String, trim: true, maxlength: 500 },
    availability: { type: String, enum: ["In Stock", "Out of Stock", "Pre-order"], default: "In Stock" },
    features: [{ type: String, trim: true }],
    ingredients: { type: String, trim: true, maxlength: 1000 },
    nutritionalInfo: {
      calories: { type: String, trim: true },
      protein: { type: String, trim: true },
      carbs: { type: String, trim: true },
      fat: { type: String, trim: true },
    },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    tags: [{ type: String, trim: true }],
    inStock: { type: Boolean, default: true },
    shipping: { freeShipping: { type: Boolean, default: false }, shippingTime: { type: String, trim: true } },
    ratings: { average: { type: Number, default: 0, min: 0, max: 5 }, count: { type: Number, default: 0 } },
    clicks: { type: Number, default: 0, min: 0 },
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },

    // product-level orders (link to main Order by orderId)
    orders: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // reference to Order._id
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // buyer
        quantity: { type: Number, default: 1 },
        orderDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
          default: "pending",
        },
        orderPrice: { type: Number }, // price per item or snapshot
        // optional buyer snapshot fields (if you want)
        buyerName: { type: String },
        buyerEmail: { type: String },
        addressSnapshot: { type: String }
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
