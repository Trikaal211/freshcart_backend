import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/", authenticate, createOrder);
orderRouter.get("/my-orders", authenticate, getUserOrders);
orderRouter.get("/", authenticate, getAllOrders); // Admin only
orderRouter.put("/:orderId/status", authenticate, updateOrderStatus);

export default orderRouter;