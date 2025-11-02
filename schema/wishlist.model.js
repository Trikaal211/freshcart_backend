import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true   // yahan pe index lagana chaho to yahi kaafi hai
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });



const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
