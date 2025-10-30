import Product from "../../schema/productList.model.js";
import jwt from "jsonwebtoken";

// 🔒 Middleware to verify token and attach user
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // user._id
  } catch {
    return null;
  }
};

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    let query = Product.find().populate("category", "name").populate("uploadedBy", "name email");
    if (req.query.sort === "popular") query = query.sort({ clicks: -1 });
    const products = await query;
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get by lifestyle
export const getProductsByLifestyle = async (req, res) => {
  try {
    const { type } = req.params;
    const products = await Product.find({ lifestyle: type })
      .populate("category", "name")
      .populate("uploadedBy", "name email");
    if (!products.length) return res.status(404).json({ error: "No products found" });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get by ID + increment clicks
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    )
      .populate("category", "name")
      .populate("uploadedBy", "name email");
    if (!product) return res.status(404).json({ error: "Not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new product (with user info)
export const createProduct = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file) => `https://freshcart-backend-4wrc.onrender.com/uploads/${file.filename}`
      );
    } else if (req.body.images) {
      imageUrls =
        typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
    }

    const parseIfJson = (data) => {
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed && typeof parsed === "object" && parsed.$oid) return parsed.$oid;
        if (Array.isArray(parsed)) return parsed.map(parseIfJson);
        if (parsed && typeof parsed === "object") {
          const obj = {};
          for (const key in parsed) obj[key] = parseIfJson(parsed[key]);
          return obj;
        }
        return parsed;
      } catch {
        return data;
      }
    };

    const parsedBody = {
      ...req.body,
      category: parseIfJson(req.body.category),
      nutritionalInfo: parseIfJson(req.body.nutritionalInfo),
      shipping: parseIfJson(req.body.shipping),
      lifestyle: parseIfJson(req.body.lifestyle),
      features: parseIfJson(req.body.features),
      tags: parseIfJson(req.body.tags),
    };

    const newProduct = new Product({
      ...parsedBody,
      images: imageUrls,
      uploadedBy: userId, // ✅ user saved here
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product uploaded successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
  }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get by tag
export const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const products = await Product.find({ tags: tag })
      .populate("category", "name")
      .populate("uploadedBy", "name email");
    if (!products.length) return res.status(404).json({ error: "No products found" });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Popular products
export const getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ clicks: -1 })
      .limit(8)
      .populate("category", "name")
      .populate("uploadedBy", "name email")
      .lean();

    res.status(200).json(products);
  } catch (err) {
    console.error("Popular Products Error:", err);
    res.status(500).json({ error: "Server failed." });
  }
};
