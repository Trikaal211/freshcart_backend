import mongoose from "mongoose";


const promotionSchema = new mongoose.Schema({

   title: String,     
  slug: String,      
  image: String,      
  link: String,      
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const promotion = mongoose.model("promotion", promotionSchema);
export default promotion;