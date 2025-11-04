import express from "express";
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
  updateProductOrderStatus
} from "../controllers/product.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";
import { upload } from "../../config/multer.js";

const productRouter = express.Router();

// Public routes
productRouter.get("/", getProducts);
productRouter.get("/popular", getPopularProducts);
productRouter.get("/lifestyle/:type", getProductsByLifestyle);
productRouter.get("/tag/:tag", getProductsByTag);
productRouter.get("/:id", getProductById);

// Protected routes
productRouter.get("/my/products", authMiddleware, getMyProducts);
productRouter.post("/", authMiddleware, upload.array("images", 5), createProduct);
productRouter.put("/:id", authMiddleware, updateProduct);
productRouter.delete("/:id", authMiddleware, deleteProduct);
productRouter.patch("/:productId/orders/:orderId/status", authMiddleware, updateProductOrderStatus);

export default productRouter;