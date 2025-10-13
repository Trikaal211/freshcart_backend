// models/Recipe.js
import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: [String],
  steps: [String],
  image: String,
  time: String,
  difficulty: String,
  servings: Number
});

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
