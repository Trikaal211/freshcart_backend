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
    console.log("=== UPLOAD DEBUG INFO ===");
    console.log("Request User:", req.user);
    console.log("Request Files:", req.files);
    console.log("Request Body:", req.body);

    let imageUrls = [];

    // ✅ Check if files were uploaded properly
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
      console.log("✅ Cloudinary URLs:", imageUrls);
    } else {
      console.log("⚠️ No files received in req.files");
    }

    // ✅ Improved JSON parsing helper
    const parseField = (field) => {
      if (!field) return field;
      
      try {
        // If it's already an object, return as is
        if (typeof field === 'object') return field;
        
        // If it's a string, try to parse it
        const parsed = JSON.parse(field);
        return parsed;
      } catch (error) {
        // If parsing fails, return the original value
        return field;
      }
    };

    // ✅ Parse fields safely
    const parsedBody = {
      title: req.body.title,
      slug: req.body.slug,
      brand: req.body.brand,
      subtitle: req.body.subtitle,
      description: req.body.description,
      price: parseFloat(req.body.price) || 0,
      discountPrice: parseFloat(req.body.discountPrice) || 0,
      quantity: parseInt(req.body.quantity) || 1,
      weight: req.body.weight,
      category: req.body.category, // This should be category ID string
      lifestyle: parseField(req.body.lifestyle) || [],
      deliveryInfo: req.body.deliveryInfo,
      availability: req.body.availability || "In Stock",
      features: parseField(req.body.features),
      ingredients: req.body.ingredients,
      nutritionalInfo: parseField(req.body.nutritionalInfo) || {},
      tags: parseField(req.body.tags) || [],
      shipping: parseField(req.body.shipping) || { freeShipping: false, shippingTime: "" },
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    };

    console.log("✅ Parsed Body:", parsedBody);

    // ✅ Create product
    const newProduct = new Product({
      ...parsedBody,
      images: imageUrls,
      uploadedBy: req.user?._id || null,
    });

    const savedProduct = await newProduct.save();
    console.log("✅ Product saved successfully:", savedProduct._id);

    res.status(201).json({
      message: "✅ Product created successfully",
      product: savedProduct,
    });

  } catch (error) {
    console.error("❌ Error creating product:", error);
    
    // More detailed error logging
    if (error.name === 'ValidationError') {
      console.log("Validation Error Details:", error.errors);
    }
    
    res.status(500).json({ 
      message: "Error creating product", 
      error: error.message,
      details: error.errors || error
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
