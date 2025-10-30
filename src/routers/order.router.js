// routes/orders.js
import express from "express";
import {authMiddleware} from "../../middlewares/user.middleware.js"
import { createOrder, getSellerOrders, getNotifications } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder); // place order
router.get("/seller", authMiddleware, getSellerOrders); // seller view of orders
router.get("/notifications", authMiddleware, getNotifications); // optional

export default router;
