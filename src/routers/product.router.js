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


// ✅ Cloudinary Config

// ✅ Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "freshcart-products" },
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
