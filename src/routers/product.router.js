import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
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
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "freshcart-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  }),
});


const upload = multer({ storage });

// ✅ Router
const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.get("/popular", getPopularProducts);
productRouter.get("/lifestyle/:type", getProductsByLifestyle);
productRouter.get("/tag/:tag", getProductsByTag);
productRouter.get("/my-products", authMiddleware, getMyProducts);
productRouter.get("/:id", getProductById);

// ✅ Now uploads go to Cloudinary instead of local folder
productRouter.post("/", authMiddleware, upload.array("images", 5), createProduct);

productRouter.post("/:productId/order", authMiddleware, addProductOrder);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
