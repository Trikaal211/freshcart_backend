import Catagory from "../../schema/catagory.model.js";

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await  Catagory.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  const newCategory = new  Catagory(req.body);
  try {
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
