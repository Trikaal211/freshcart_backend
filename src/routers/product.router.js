import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Routes
productRouter.get("/", getProducts);
productRouter.get("/popular", getPopularProducts);
productRouter.get("/lifestyle/:type", getProductsByLifestyle);
productRouter.get("/tag/:tag", getProductsByTag);
productRouter.get("/my-products", authMiddleware, getMyProducts); // Add this route
productRouter.get("/:id", getProductById);
productRouter.post("/", authMiddleware, upload.array("images", 5), createProduct);
productRouter.post("/:productId/order", authMiddleware, addProductOrder); // Add order route
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;