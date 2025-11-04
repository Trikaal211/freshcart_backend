import express from "express";
import { createOrder, getMyOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { authMiddleware} from "../../middlewares/user.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/", authMiddleware, createOrder);
orderRouter.get("/my-orders", authMiddleware, getMyOrders);
orderRouter.patch("/:orderId/status", authMiddleware, updateOrderStatus);

export default orderRouter;