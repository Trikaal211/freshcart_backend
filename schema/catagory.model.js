import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // ek naam se sirf ek category
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true, // SEO friendly url jaisa
      lowercase: true,
    },
    image: {
      type: String,
      required: true, // har category ke liye image zaroori
    },
    products: {
      type: Number,
      default: 0, // count of products
    },
  },
  { timestamps: true } // createdAt, updatedAt auto add honge
);


// Pre-save hook: generate slug from name
categorySchema.pre("save", function (next) {
  this.slug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // spaces & special chars → hyphens
    .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
  next();
});

// Export the model
const Category = mongoose.model("Category", categorySchema);
export default Category;
