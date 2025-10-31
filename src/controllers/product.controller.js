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
    let imageUrls = [];

    // Agar files upload hui ho
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        file => `https://freshcart-backend-4wrc.onrender.com/uploads/${file.filename}`
      );
    } 
    // Agar body me images array ho aur files na ho
    else if (req.body.images) {
      try {
        imageUrls = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
      } catch {
        imageUrls = [req.body.images];
      }
    }

    // Function to parse JSON and handle $oid
    const parseIfJson = (data) => {
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;

        // Agar ObjectId format ho { $oid: "..." }
        if (parsed && typeof parsed === "object" && parsed.$oid) return parsed.$oid;

        // Agar array ho to recursively parse
        if (Array.isArray(parsed)) return parsed.map(item => parseIfJson(item));

        // Agar object ho to recursively parse each key
        if (parsed && typeof parsed === "object") {
          const newObj = {};
          for (const key in parsed) {
            newObj[key] = parseIfJson(parsed[key]);
          }
          return newObj;
        }

        return parsed;
      } catch {
        return data;
      }
    };

    // Parse all nested JSON fields
    const parsedBody = {
      ...req.body,
      category: parseIfJson(req.body.category),
      nutritionalInfo: parseIfJson(req.body.nutritionalInfo),
      shipping: parseIfJson(req.body.shipping),
      lifestyle: parseIfJson(req.body.lifestyle),
      features: parseIfJson(req.body.features),
      tags: parseIfJson(req.body.tags),
    };

    // Create new product with uploadedBy field
    const newProduct = new Product({
      ...parsedBody,
      images: imageUrls,
      uploadedBy: req.user._id // Add the user who uploaded the product
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product uploaded successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("❌ Error creating products:", error);
    res.status(500).json({ message: "Error creating products", error });
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