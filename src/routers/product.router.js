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
  addProductOrder
} from "../controllers/product.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";  
import {upload} from "../../config/multer.js";



// Router
const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.get("/popular", getPopularProducts);
productRouter.get("/lifestyle/:type", getProductsByLifestyle);
productRouter.get("/tag/:tag", getProductsByTag);
productRouter.get("/my-products", authMiddleware, getMyProducts);
productRouter.get("/:id", getProductById);
console.log("hlw");
// Now uploads go to Cloudinary instead of local folder
productRouter.post

("/", authMiddleware, upload.array("images", 5), (req, res, next) => {
  console.log("📸 Uploaded filsjcjjes:");
  console.log("📦 Request body:", req.body);
  next();
}, createProduct);
productRouter.post("/:productId/order", authMiddleware, addProductOrder);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
