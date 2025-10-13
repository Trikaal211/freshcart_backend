// routes/recipeRoutes.js
import express from "express";
import { getRecipes, getRecipeById , addRecipe} from "../controllers/recipe.controller.js";

const reciperouter = express.Router();


 reciperouter.post("/", addRecipe);

 reciperouter.get("/", getRecipes);         // GET /api/recipes -> all recipes
 reciperouter.get("/:id", getRecipeById);   // GET /api/recipes/:id -> single recipe

export default  reciperouter;
