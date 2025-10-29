import express from "express";
import { getBooks, getBookById, addBook } from "../controllers/book.controller.js";

const bookrouter = express.Router();

bookrouter.get("/", getBooks);            // Get all books              
bookrouter.get("/:id", getBookById);      // Get single book
bookrouter.post("/", addBook);            // Add new book

export default bookrouter;
