import Product from "../../schema/productList.model.js";
import cloudinary from "../../config/cloudinary.js"; // ✅ add this import

// ---------------------- Get All Products ----------------------
export const getProducts = async (req, res) => {
  try {
    let query = Product.find().populate("category", "name");

    if (req.query.sort === "popular") {
      query = query.sort({ clicks: -1 });
    }

    const products = await query;
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- Get by Lifestyle ----------------------
export const getProductsByLifestyle = async (req, res) => {
  try {
    const { type } = req.params;
    const products = await Product.find({ lifestyle: type }).populate("category", "name");

    if (!products.length) {
      return res.status(404).json({ error: "No products found for this lifestyle" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- Get by ID (and increase clicks) ----------------------
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
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- Create Product (Cloudinary Upload) ----------------------


export const createProduct = async (req, res) => {
  try {
    console.log("=== PRODUCT CREATION STARTED ===");
    console.log("User:", req.user ? req.user._id : "No user");
    console.log("Files received:", req.files ? req.files.length : 0);
    console.log("Body keys:", Object.keys(req.body));

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: "Unauthorized: Please login first" 
      });
    }

    let imageUrls = [];

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      console.log("Processing files...");
      imageUrls = req.files.map(file => {
        console.log("File info:", {
          originalname: file.originalname,
          path: file.path,
          size: file.size
        });
        return file.path; // Cloudinary URL
      });
      console.log("Image URLs:", imageUrls);
    } else {
      console.log("No files uploaded, using empty images array");
    }

    // Parse request body safely
    const parseField = (field) => {
      if (!field || typeof field !== 'string') return field;
      try {
        return JSON.parse(field);
      } catch (error) {
        return field;
      }
    };

    // Build product data
    const productData = {
      title: req.body.title,
      slug: req.body.slug,
      brand: req.body.brand || "",
      description: req.body.description || "",
      price: parseFloat(req.body.price) || 0,
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : undefined,
      quantity: parseInt(req.body.quantity) || 1,
      weight: req.body.weight || "",
      category: req.body.category, // This should be a valid category ID
      lifestyle: parseField(req.body.lifestyle) || [],
      deliveryInfo: req.body.deliveryInfo || "",
      availability: req.body.availability || "In Stock",
      features: parseField(req.body.features) || [],
      ingredients: req.body.ingredients || "",
      nutritionalInfo: parseField(req.body.nutritionalInfo) || {},
      tags: parseField(req.body.tags) || [],
      shipping: parseField(req.body.shipping) || { freeShipping: false },
      metaTitle: req.body.metaTitle || "",
      metaDescription: req.body.metaDescription || "",
      images: imageUrls,
      uploadedBy: req.user._id
    };

    console.log("Product data prepared:", {
      title: productData.title,
      price: productData.price,
      category: productData.category,
      imagesCount: productData.images.length
    });

    // Validate required fields
    if (!productData.title || !productData.price || !productData.category) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["title", "price", "category"]
      });
    }

    // Create and save product
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    console.log("✅ Product saved successfully:", savedProduct._id);

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct
    });

  } catch (error) {
    console.error("❌ PRODUCT CREATION ERROR:", error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation Error",
        errors: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate entry",
        error: "A product with this slug or title already exists"
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};


// ---------------------- Get Products Uploaded by Logged-in User ----------------------
export const getMyProducts = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    const products = await Product.find({ uploadedBy: req.user._id });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- Add Product Order ----------------------
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
            quantity,
            status: "pending",
          },
        },
      },
      { new: true }
    ).populate("orders.user", "name email");

    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({
      message: "Order added to product",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- Update Product ----------------------
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

// ---------------------- Delete Product ----------------------
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- Get Products by Tag ----------------------
export const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const products = await Product.find({ tags: tag }).populate("category", "name");

    if (!products.length) {
      return res.status(404).json({ error: "No products found for this tag" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- Get Popular Products ----------------------
export const getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ clicks: -1 })
      .limit(8)
      .populate({ path: "category", select: "name", strictPopulate: false })
      .lean();

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Server failed. Check DB and category references." });
  }
};
