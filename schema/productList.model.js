import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    slug: { type: String, required: true },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, "Subtitle cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message:
          "Discount price ({VALUE}) cannot be greater than the original price",
      },
    },

    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100%"],
    },

    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },

    weight: {
      type: String,
      default: "N/A",
      trim: true,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    lifestyle: {
      type: [String],
    },

    deliveryInfo: {
      type: String,
      trim: true,
      maxlength: [500, "Delivery info cannot exceed 500 characters"],
    },

    availability: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Pre-order"],
      default: "In Stock",
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    ingredients: {
      type: String,
      trim: true,
      maxlength: [1000, "Ingredients cannot exceed 1000 characters"],
    },

    nutritionalInfo: {
      calories: { type: String, trim: true },
      protein: { type: String, trim: true },
      carbs: { type: String, trim: true },
      fat: { type: String, trim: true },
    },

    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    inStock: {
      type: Boolean,
      default: true,
    },

    shipping: {
      freeShipping: { type: Boolean, default: false },
      shippingTime: { type: String, trim: true },
    },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    clicks: {
      type: Number,
      default: 0,
      min: [0, "Clicks cannot be negative"],
    },

    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },

    // 🟢 NEW FIELD — store orders for each product
    orders: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        orderDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
          default: "pending",
        },
        orderPrice: {
          type: Number,
        },
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
