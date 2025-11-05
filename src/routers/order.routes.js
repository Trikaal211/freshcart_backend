// In your order router
import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
 updateProductOrderStatus // Make sure this is imported
} from "../controllers/order.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/", authMiddleware, createOrder);
orderRouter.get("/my-orders", authMiddleware, getUserOrders);
orderRouter.get("/", authMiddleware, getAllOrders);
orderRouter.patch("/:productId/:orderId/status", authMiddleware, updateProductOrderStatus);

export default orderRouter;