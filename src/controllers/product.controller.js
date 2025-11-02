import Product from "../../schema/productList.model.js";

// 🟢 Get all products
export const getProducts = async (req, res) => {
  try {
    let query = Product.find().populate("category", "name");

    if (req.query.sort === "popular") {
      query = query.sort({ clicks: -1 });
    }

    const products = await query;
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ getProducts Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get products by lifestyle
export const getProductsByLifestyle = async (req, res) => {
  try {
    const { type } = req.params;
    const products = await Product.find({ lifestyle: type }).populate("category", "name");

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found for this lifestyle" });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("❌ getProductsByLifestyle Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get product by ID (auto increment clicks)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    ).populate("category", "name");

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    console.error("❌ getProductById Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Create new product

export const createProduct = async (req, res) => {
  try {
    console.log("🖼 File details full:", JSON.stringify(req.files, null, 2));

    console.log("🟢 CREATE PRODUCT API CALLED");
    console.log("📩 User:", req.user);
    console.log("📦 Body:", req.body);
    console.log("📸 Files:", req.files);

    // 🔒 Authentication Check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }

    // 🖼 Handle Images (Cloudinary)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => {
        console.log("🖼 File details:", file);
        // ✅ Cloudinary always provides 'path' and 'secure_url'
        return file.path || file.secure_url || "";
      }).filter(url => url !== "");
    } else {
      console.log("⚠️ No images uploaded");
    }

    // 🧩 Parse Lifestyle Array Safely
    let lifestyleArray = [];
    if (req.body.lifestyle) {
      try {
        lifestyleArray = JSON.parse(req.body.lifestyle);
      } catch {
        lifestyleArray = Array.isArray(req.body.lifestyle)
          ? req.body.lifestyle
          : [req.body.lifestyle];
      }
    }

    // 🧮 Product Data
    const productData = {
      title: req.body.title?.trim() || "Untitled Product",
      slug: req.body.slug?.trim() || req.body.title?.trim().toLowerCase().replace(/\s+/g, "-"),
      brand: req.body.brand || "Unknown",
      description: req.body.description || "",
      price: Number(req.body.price) || 0,
      discountPrice: Number(req.body.discountPrice) || 0,
      quantity: Number(req.body.quantity) || 1,
      category: req.body.category || null,
      availability: req.body.availability || "In Stock",
      images: imageUrls, // ✅ now Cloudinary URLs stored
      uploadedBy: req.user._id,
      subtitle: req.body.subtitle || "",
      weight: req.body.weight || "N/A",
      lifestyle: lifestyleArray,
      tags: req.body.tags ? [req.body.tags] : [],
    };

    console.log("✅ Final Product Data:", productData);

    // 🧾 Validation
    if (!productData.category) {
      return res.status(400).json({ error: "Category is required" });
    }

    // 💾 Save Product
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    console.log("✅ Product Saved:", savedProduct._id);
    res.status(201).json({
      message: "Product uploaded successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("❌ PRODUCT CREATION ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// 🟢 Get products uploaded by current user
export const getMyProducts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    const products = await Product.find({ uploadedBy: req.user._id });
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ getMyProducts Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Add product order
export const addProductOrder = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          orders: {
            user: req.user._id,
            quantity: quantity,
            status: "pending",
          },
        },
      },
      { new: true }
    ).populate("orders.user", "name email");

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Order added successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("❌ addProductOrder Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Update product
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
    console.error("❌ updateProduct Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ deleteProduct Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get products by tag
export const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const products = await Product.find({ tags: tag }).populate("category", "name");

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found for this tag" });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("❌ getProductsByTag Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get popular products
export const getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ clicks: -1 })
      .limit(8)
      .populate({ path: "category", select: "name", strictPopulate: false })
      .lean();

    res.status(200).json(products);
  } catch (err) {
    console.error("❌ getPopularProducts Error:", err);
    res.status(500).json({ error: "Server failed. Check DB and category references." });
  }
};
