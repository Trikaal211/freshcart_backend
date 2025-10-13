import express from "express";
import categoryRouter from "./catagory.router.js";
import productRouter from "./product.router.js";
import userrouter from "./user.routes.js";
const router = express.Router();

// Mount individual routers
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/users", userrouter);


// Future: router.use("/products", productRouter);

export default router;
