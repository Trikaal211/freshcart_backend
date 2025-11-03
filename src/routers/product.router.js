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

// Now uploads go to Cloudinary instead of local folder
productRouter.post

productRouter.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    console.log("🟡 Before multer");
    next();
  },
  upload.array("images", 5),
  (req, res, next) => {
    console.log("🟢 After multer, before createProduct");
    next();
  },
  createProduct
);
productRouter.post("/:productId/order", authMiddleware, addProductOrder);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
