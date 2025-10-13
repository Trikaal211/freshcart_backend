import Book from "../../schema/book.model.js";

// GET all books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// GET single book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// POST new book
export const addBook = async (req, res) => {
  try {
    const { tag, title, author, description, price, image } = req.body;
    const newBook = new Book({ tag, title, author, description, price, image });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
