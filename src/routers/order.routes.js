import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { authMiddleware } from "../../middlewares/user.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/", authMiddleware, createOrder);
orderRouter.get("/my-orders", authMiddleware, getUserOrders);
orderRouter.get("/", authMiddleware, getAllOrders); // Admin only
orderRouter.patch("/update-status/:orderId", authMiddleware, updateOrderStatus);

export default orderRouter;