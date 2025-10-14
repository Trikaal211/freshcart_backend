import Product from "../../schema/productList.model.js";

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    let query = Product.find().populate("category", "name");

    // Agar ?sort=popular query aaye to clicks ke hisab se sort karo
    if (req.query.sort === "popular") {
      query = query.sort({ clicks: -1 });
    }

    const products = await query;
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get products by lifestyle
export const getProductsByLifestyle = async (req, res) => {
  try {
    const { type } = req.params;
    const products = await Product.find({ lifestyle: type }).populate("category", "name");

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found for this lifestyle" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get product by ID (also increment clicks counter)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },   // clicks +1 every time product is viewed
      { new: true }
    ).populate("category", "name");

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new product

export const createProduct = async (req, res) => {
  try {
    let imageUrls = [];

  if (req.files && req.files.length > 0) {
  imageUrls = req.files.map(
    file => `http://localhost:3000/uploads/${file.filename}`
  );
}

    const parseIfJson = (data) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        return data;
      }
    };

    const parsedBody = {
      ...req.body,
      nutritionalInfo: parseIfJson(req.body.nutritionalInfo),
      shipping: parseIfJson(req.body.shipping),
      lifestyle: parseIfJson(req.body.lifestyle),
      features: parseIfJson(req.body.features),
      tags: parseIfJson(req.body.tags),
    };

    const newProduct = new Product({
      ...parsedBody,
      images: imageUrls,
    });

    const savedProduct = await newProduct.save();
  
    res.status(201).json({
      message: "✅ Product uploaded successfully",
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
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get products by tag
export const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const products = await Product.find({ tags: tag }).populate("category", "name");

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found for this tag" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get most popular products (based on clicks)
export const getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ clicks: -1 })
      .limit(8)
      .populate({ path: "category", select: "name", strictPopulate: false })
      .lean();

    res.status(200).json(products);
  } catch (err) {
    console.error("Popular Products Error:", err);
    res.status(500).json({ error: "Server failed. Check DB and category references." });
  }
};