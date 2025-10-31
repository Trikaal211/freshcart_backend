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
  console.log("REQ BODY:", JSON.stringify(req.body, null, 2));
console.log("REQ FILES:", req.files);
    let imageUrls = [];
        console.log("FILES RECEIVED:", req.files); // 🔍 Debugging


    // ✅ 1. Upload files from multer (req.files)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        imageUrls.push(file.path); // multer-storage-cloudinary already uploads & gives file.path = cloud URL
      }
    }

    // ✅ 2. Helper for nested JSON parsing
    const parseIfJson = (data) => {
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed && typeof parsed === "object" && parsed.$oid) return parsed.$oid;
        if (Array.isArray(parsed)) return parsed.map(item => parseIfJson(item));
        if (parsed && typeof parsed === "object") {
          const newObj = {};
          for (const key in parsed) newObj[key] = parseIfJson(parsed[key]);
          return newObj;
        }
        return parsed;
      } catch {
        return data;
      }
    };

    // ✅ 3. Parse other fields
    const parsedBody = {
      ...req.body,
      category: parseIfJson(req.body.category),
      nutritionalInfo: parseIfJson(req.body.nutritionalInfo),
      shipping: parseIfJson(req.body.shipping),
      lifestyle: parseIfJson(req.body.lifestyle),
      features: parseIfJson(req.body.features),
      tags: parseIfJson(req.body.tags),
    };

    // ✅ 4. Create product
    const newProduct = new Product({
      ...parsedBody,
      images: imageUrls,
      uploadedBy: req.user?._id || null,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "✅ Product uploaded successfully to Cloudinary",
      product: savedProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
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
