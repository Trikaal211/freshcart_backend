import Cart from "../../schema/shopping.model.js";

// Add or update product in cart
export const addToCart = async (req, res) => {
  const { productId, quantity = 1, price } = req.body;
  const userId = req.user._id;

  if (!productId) return res.status(400).json({ error: "productId is required" });

   try {
    let cart = await Cart.findOne({ userId });
    let updatedQuantity;
    let updatedPrice;

    if (!cart) {
      cart = await Cart.create({ userId, products: [] });
    }

    const existing = cart.products.find(p => p.productId.toString() === productId);


  if (existing) {
  existing.quantity += quantity; 
  updatedQuantity = existing.quantity;
  updatedPrice = existing.price * existing.quantity; // ✅ total calculate
} else {
  cart.products.push({ 
    productId, 
    quantity,
    price // ✅ only per item price store
  });
  updatedQuantity = quantity;
  updatedPrice = price * quantity;
}

    await cart.save();
    const populatedCart = await Cart.findOne({ userId }).populate("products.productId");

 res.status(200).json({
  ...populatedCart.toObject(),
  updatedQuantity,
  updatedPrice, // ✅ ab hamesha sahi hoga
  message: existing ? "Cart item updated" : "Item added to cart"
});
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
export const getSpecialProducts = async (req, res) => {
  try {
    const products = await Product.find({ tags: "special" });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return res.status(200).json({ userId, products: [], message: "Cart is empty" });
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;
  const userId = req.user._id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { _id: cartItemId } } }, // 🔴 productId nahi, subdoc _id
      { new: true }
    ).populate("products.productId");

    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


// Update item quantity
export const updateCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "products._id": cartItemId },  // subdoc id se find karo
      { $set: { "products.$.quantity": quantity } }, // direct update
      { new: true }
    ).populate("products.productId");

    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

