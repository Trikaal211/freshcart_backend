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
  }
});

// ✅ Improved Cloudinary upload function
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "freshcart_products",
        public_id: filename.split('.')[0], // Remove file extension
        resource_type: "image",
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    // Convert buffer to stream and upload
    const { Readable } = require('stream');
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

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
    console.log("📁 Upload middleware started");
    console.log("Files received:", req.files ? req.files.length : 0);

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      console.log("No files uploaded, proceeding without images");
      req.uploadedImageUrls = [];
      return next();
    }

    let imageUrls = [];
    let uploadErrors = [];

    // Upload each file to Cloudinary
    for (const [index, file] of req.files.entries()) {
      try {
        console.log(`📤 Uploading file ${index + 1}/${req.files.length}:`, file.originalname);
        
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        
        console.log(`✅ File ${index + 1} uploaded:`, result.secure_url);
        imageUrls.push(result.secure_url);
        
      } catch (uploadError) {
        console.error(`❌ Failed to upload file ${index + 1}:`, uploadError);
        uploadErrors.push({
          file: file.originalname,
          error: uploadError.message
        });
      }
    }

    // Check if any uploads failed
    if (uploadErrors.length > 0 && imageUrls.length === 0) {
      // All uploads failed
      return res.status(500).json({
        message: "All image uploads failed",
        errors: uploadErrors
      });
    }

    if (uploadErrors.length > 0) {
      console.warn("Some uploads failed, but continuing with successful ones:", uploadErrors);
    }

    console.log(`✅ Successfully uploaded ${imageUrls.length}/${req.files.length} images`);
    req.uploadedImageUrls = imageUrls;
    next();
    
  } catch (error) {
    console.error("❌ Upload middleware error:", error);
    res.status(500).json({
      message: "File upload processing failed",
      error: error.message
    });
  }
}, createProduct);
productRouter.post("/:productId/order", authMiddleware, addProductOrder);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;