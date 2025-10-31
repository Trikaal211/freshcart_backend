import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";  
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByLifestyle,
  getProductsByTag,
  getPopularProducts,
  getMyProducts,
  addProductOrder
} from "../controllers/product.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";

const productRouter = express.Router();

// ✅ Improved Multer storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ✅ Routes
productRouter.get("/", getProducts);
productRouter.get("/popular", getPopularProducts);
productRouter.get("/lifestyle/:type", getProductsByLifestyle);
productRouter.get("/tag/:tag", getProductsByTag);
productRouter.get("/my-products", authMiddleware, getMyProducts);
productRouter.get("/:id", getProductById);

// ✅ FIXED: Product creation route with proper middleware order
productRouter.post("/", authMiddleware, upload.array("images", 5), async (req, res, next) => {
  try {
    console.log("📁 Files received:", req.files ? req.files.length : 0);
    console.log("📝 Body fields:", Object.keys(req.body));
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No files uploaded",
        error: "Please select at least one image"
      });
    }

    // Manually upload to Cloudinary
    let imageUrls = [];
    for (const file of req.files) {
      try {
        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "freshcart_products",
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        });
        
        imageUrls.push(result.secure_url);
        console.log("✅ Image uploaded to Cloudinary:", result.secure_url);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        return res.status(500).json({
          message: "Failed to upload image to Cloudinary",
          error: uploadError.message
        });
      }
    }

    // Attach image URLs to request for the controller
    req.uploadedImageUrls = imageUrls;
    next(); // Proceed to createProduct controller
    
  } catch (error) {
    console.error("❌ Upload middleware error:", error);
    res.status(500).json({
      message: "File upload failed",
      error: error.message
    });
  }
}, createProduct);
productRouter.post("/:productId/order", authMiddleware, addProductOrder);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;