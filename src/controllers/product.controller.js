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

// Get products uploaded by current user - FIXED VERSION
export const getMyProducts = async (req, res) => {
  try {
    console.log("🔍 Fetching products for user:", req.user._id);
    
    const products = await Product.find({ uploadedBy: req.user._id })
      .populate("category", "name")
      .populate({
        path: "orders.user",
        select: "name email", // Only get name and email of the user who ordered
        model: "User" // Explicitly specify the model
      })
      .sort({ createdAt: -1 }); // Sort by latest first

    console.log(`✅ Found ${products.length} products for user ${req.user._id}`);

    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error in getMyProducts:", err);
    res.status(500).json({ 
      error: "Failed to fetch your products",
      details: err.message 
    });
  }
};

// Add order to product - IMPROVED VERSION
export const addProductOrder = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1, orderPrice, orderId } = req.body;

    console.log(`🛒 Adding order to product ${productId} by user ${req.user._id}`);

    const orderData = {
      user: req.user._id,
      quantity: quantity,
      orderPrice: orderPrice,
      orderId: orderId,
      status: "pending",
      orderDate: new Date()
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: { orders: orderData },
        $inc: { quantity: -quantity } // Reduce stock
      },
      { new: true }
    )
    .populate("category", "name")
    .populate({
      path: "orders.user",
      select: "name email",
      model: "User"
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`✅ Order added to product ${productId}`);

    res.status(200).json({
      message: "Order added to product successfully",
      product: updatedProduct
    });
  } catch (err) {
    console.error("❌ Error in addProductOrder:", err);
    res.status(500).json({ 
      error: "Failed to add order to product",
      details: err.message 
    });
  }
};

// Rest of your existing product controller functions remain the same...
// export const getProducts = async (req, res) => {
//   try {
//     let query = Product.find().populate("category", "name");

//     if (req.query.sort === "popular") {
//       query = query.sort({ clicks: -1 });
//     }

//     const products = await query;
//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// ... keep all your other existing functions





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