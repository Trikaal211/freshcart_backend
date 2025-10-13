// controllers/recipeController.js
import Recipe from "../../schema/recipe.model.js";

// Get all recipes
export const addRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, image, time, difficulty, servings } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newRecipe = new Recipe({
      title,
      description,
      ingredients: ingredients || [],
      steps: steps || [],
      image: image || "",
      time: time || "",
      difficulty: difficulty || "Easy",
      servings: servings || 1,
    });

    await newRecipe.save();

    res.status(201).json({
      message: "Recipe added successfully",
      recipe: newRecipe,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const getRecipes = async (req, res) => {
  const recipes = await Recipe.find({});
  res.json(recipes);
};

// Get single recipe by ID
export const getRecipeById = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ message: "Recipe not found" });
  }
};
