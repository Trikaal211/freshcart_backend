import Product from "../../schema/productList.model.js";

// Update product order status - FIXED VERSION
export const updateProductOrderStatus = async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    const { status } = req.body;

    console.log("🔄 Updating product order status:", { productId, orderId, status });

    // Validate status
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 🟢 FIXED: Find order using subdocument _id
    const order = product.orders.id(orderId);
    if (!order) {
      console.log("Available orders:", product.orders.map(o => ({
        _id: o._id,
        orderId: o.orderId,
        status: o.status
      })));
      return res.status(404).json({ error: "Order not found in this product" });
    }

    // Update order status
    order.status = status;
    await product.save();

    console.log("✅ Product order status updated successfully");

    res.status(200).json({
      message: "Order status updated successfully",
      order: order,
      product: {
        _id: product._id,
        title: product.title
      }
    });
  } catch (err) {
    console.error("❌ updateProductOrderStatus Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add product order - FIXED VERSION
export const addProductOrder = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      orderId, 
      quantity = 1, 
      orderPrice, 
      buyerName, 
      buyerEmail, 
      address, 
      phone 
    } = req.body;

    console.log("📦 Adding product order:", {
      productId,
      orderId,
      quantity,
      orderPrice,
      buyerName,
      buyerEmail,
      address
    });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 🟢 FIXED: Add order to product with all required fields
    product.orders.push({
      user: req.user._id,
      quantity: quantity,
      orderPrice: orderPrice,
      orderId: orderId, // 🟢 This is the main Order _id
      buyerName: buyerName,
      buyerEmail: buyerEmail,
      address: address,
      phone: phone || "Not provided",
      status: "pending",
      orderDate: new Date()
    });

    await product.save();

    res.status(200).json({
      message: "Order added to product successfully",
      product: product,
    });
  } catch (err) {
    console.error("❌ addProductOrder Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Other product functions...
export const getProducts = async (req, res) => {
  try {
    let query = Product.find().populate("category", "name");

    if (req.query.sort === "popular") {
      query = query.sort({ clicks: -1 });
    }

    const products = await query;
    res.status(200).json(products);
  } catch (err) {
    console.error(" getProducts Error:", err);
    res.status(500).json({ error: err.message });
  }
};

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
    console.error(" getProductById Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    console.log("CREATE PRODUCT API CALLED");
    console.log(" User:", req.user);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => {
        return file.path || file.secure_url || "";
      }).filter(url => url !== "");
    }

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

    const productData = {
      title: req.body.title?.trim() || "Untitled Product",
      slug: req.body.slug?.trim() || 
        (req.body.title ? req.body.title.trim().toLowerCase().replace(/\s+/g, "-") : ""),
      brand: req.body.brand || "Unknown",
      description: req.body.description || "",
      price: Number(req.body.price) || 0,
      discountPrice: Number(req.body.discountPrice) || 0,
      quantity: Number(req.body.quantity) || 1,
      category: req.body.category || null,
      availability: req.body.availability || "In Stock",
      images: imageUrls, 
      uploadedBy: req.user._id,
      subtitle: req.body.subtitle || "",
      weight: req.body.weight || "N/A",
      lifestyle: lifestyleArray,
      tags: req.body.tags ? [req.body.tags] : [],
    };

    if (!productData.category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    console.log(" Product Saved:", savedProduct._id);
    res.status(201).json({
      message: "Product uploaded successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error(" PRODUCT CREATION ERROR:", error);

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

export const getMyProducts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    const products = await Product.find({ uploadedBy: req.user._id });
    res.status(200).json(products);
  } catch (err) {
    console.error(" getMyProducts Error:", err);
    res.status(500).json({ error: err.message });
  }
};

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