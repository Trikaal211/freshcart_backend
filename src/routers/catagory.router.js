import express from "express";
import { getCategories, createCategory } from "../../src/controllers/catagory.controller.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", createCategory);

export default categoryRouter;