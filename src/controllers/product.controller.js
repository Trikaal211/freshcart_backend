import Product from "../../schema/productList.model.js";

//  Get all products
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


// Get products by lifestyle
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

//  Get product by ID (also increment clicks counter)
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

//Create new product

// Create new product - Add uploadedBy field
export const createProduct = async (req, res) => {
  try {
    console.log("🔄 CREATE PRODUCT STARTED...");
    console.log("📧 User:", req.user);
    console.log("📦 Request Body:", req.body);
    console.log("📸 Files:", req.files);
    
    // Check authentication
    if (!req.user || !req.user._id) {
      console.log("❌ No user found");
      return res.status(401).json({ error: "User not authenticated" });
    }

    let imageUrls = [];

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      console.log("✅ Files received:", req.files.length);
      imageUrls = req.files.map(file => {
        console.log("File details:", {
          path: file.path,
          secure_url: file.secure_url,
          url: file.url
        });
        return file.path || file.secure_url || file.url;
      });
    } else {
      console.log("⚠️ No files uploaded");
    }

    // Simple parsing - avoid complex JSON parsing for now
    const productData = {
      title: req.body.title,
      slug: req.body.slug,
      brand: req.body.brand,
      description: req.body.description,
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : 0,
      quantity: parseInt(req.body.quantity) || 1,
      category: req.body.category,
      availability: req.body.availability || "In Stock",
      images: imageUrls,
      uploadedBy: req.user._id,
      
      // Optional fields with simple handling
      subtitle: req.body.subtitle || "",
      weight: req.body.weight || "N/A",
      lifestyle: req.body.lifestyle ? JSON.parse(req.body.lifestyle) : [],
      tags: req.body.tags ? [req.body.tags] : [],
    };

    console.log("🎯 Final product data to save:", productData);

    // Create and save product
    const newProduct = new Product(productData);
    console.log("📝 New product instance created");
    
    const savedProduct = await newProduct.save();
    console.log("✅ Product saved successfully:", savedProduct._id);

    res.status(201).json({
      message: "Product uploaded successfully",
      product: savedProduct,
    });

  } catch (error) {
    console.error("❌ PRODUCT CREATION ERROR:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    
    if (error.name === 'ValidationError') {
      console.log("🔍 Validation errors:", error.errors);
      return res.status(400).json({ 
        error: "Validation Error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};

// Get products uploaded by current user
export const getMyProducts = async (req, res) => {
  try {
    console.log("User from token:", req.user); // 🧩 check this
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    const products = await Product.find({ uploadedBy: req.user._id });
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ My Products fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add order to product (this will be called when someone orders a product)
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
            status: "pending"
          }
        }
      },
      { new: true }
    ).populate("orders.user", "name email");

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Order added to product",
      product: updatedProduct
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





//  Update product
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

//  Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get products by tag
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