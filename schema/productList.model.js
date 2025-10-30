import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    brand: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    discountPercentage: { type: Number, min: 0, max: 100 },
    quantity: { type: Number, default: 0, min: 0 },
    weight: { type: String, default: "N/A", trim: true },

    images: [{ type: String, trim: true }],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    lifestyle: [String],
    deliveryInfo: { type: String, trim: true },
    availability: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Pre-order"],
      default: "In Stock",
    },
    features: [String],
    ingredients: { type: String, trim: true },

    nutritionalInfo: {
      calories: String,
      protein: String,
      carbs: String,
      fat: String,
    },

    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    tags: [String],

    shipping: {
      freeShipping: { type: Boolean, default: false },
      shippingTime: { type: String, trim: true },
    },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    clicks: { type: Number, default: 0 },

    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },

    // 👇 Added: Uploaded by user
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
