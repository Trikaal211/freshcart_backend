import Product from "../models/product.model.js";
import cloudinary from "cloudinary";

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// ✅ Get products by lifestyle
export const getProductsByLifestyle = async (req, res) => {
  try {
    const { lifestyle } = req.params;
    const products = await Product.find({ lifestyle });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lifestyle products", error: error.message });
  }
};

// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// ✅ Create a new product
export const createProduct = async (req, res) => {
  try {
    const uploadedBy = req.user?._id;
    if (!uploadedBy) return res.status(401).json({ message: "User not authenticated" });

    const images = req.files.map((file) => file.path);

    const product = new Product({
      ...req.body,
      images,
      uploadedBy,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// ✅ Get products uploaded by current user
export const getMyProducts = async (req, res) => {
  try {
    const myProducts = await Product.find({ uploadedBy: req.user._id });
    res.status(200).json(myProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your products", error: error.message });
  }
};

// ✅ Add product order (used internally)
export const addProductOrder = async (req, res) => {
  try {
    const { productId, orderId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.orders.push({ orderId, quantity });
    await product.save();

    res.status(200).json({ message: "Order added to product successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding product order", error: error.message });
  }
};

// ✅ Update a product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// ✅ Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// ✅ Get products by tag
export const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const products = await Product.find({ tags: tag });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tag products", error: error.message });
  }
};

// ✅ Get popular products (top 5)
export const getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ orders: -1 }).limit(5);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching popular products", error: error.message });
  }
};
