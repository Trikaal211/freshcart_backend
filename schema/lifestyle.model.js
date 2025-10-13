import mongoose from "mongoose";

const lifestyleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String, 
    trim: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Lifestyle = mongoose.model("Lifestyle", lifestyleSchema);
export default Lifestyle;