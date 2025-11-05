// In your order router
import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
 updateProductOrderStatus, // Make sure this is imported
 updateOrderStatus
} from "../controllers/order.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/", authMiddleware, createOrder);
orderRouter.get("/my-orders", authMiddleware, getUserOrders);
orderRouter.get("/", authMiddleware, getAllOrders);
orderRouter.patch("/:id/status", authMiddleware,updateProductOrderStatus); // Fixed route
orderRouter.patch("/:orderId/status", authMiddleware, updateOrderStatus);


export default orderRouter;