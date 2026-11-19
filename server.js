const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: parse JSON request bodies and serve frontend files.
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory data store. Data resets whenever the server restarts.
let books = [
  {
    id: 1,
    title: "The Alchemist",
    author: "R. K. Narayan",
    price: 350
  },
  {
    id: 2,
    title: "Wings of Fire",
    author: "Chetan Bhagat",
    price: 450
  }
];

let nextId = 3;

// GET /books - retrieve all books
app.get("/books", (req, res) => {
  res.status(200).json({ success: true, data: books });
});

// GET /books/:id - retrieve one book by ID
app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((item) => item.id === id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid book ID." });
  }
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found." });
  }

  res.status(200).json({ success: true, data: book });
});

// POST /books - add a new book
app.post("/books", (req, res) => {
  const { title, author, price } = req.body;

  if (!title || !author || price === undefined || price === "") {
    return res.status(400).json({
      success: false,
      message: "Title, author and price are required."
    });
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid non-negative number."
    });
  }

  const newBook = {
    id: nextId++,
    title: String(title).trim(),
    author: String(author).trim(),
    price: numericPrice
  };

  if (!newBook.title || !newBook.author) {
    return res.status(400).json({
      success: false,
      message: "Title and author cannot be empty."
    });
  }

  books.push(newBook);
  res.status(201).json({
    success: true,
    message: "Book added successfully.",
    data: newBook
  });
});

// PUT /books/:id - update an existing book
app.put("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((item) => item.id === id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid book ID." });
  }
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found." });
  }

  const { title, author, price } = req.body;
  if (!title || !author || price === undefined || price === "") {
    return res.status(400).json({
      success: false,
      message: "Title, author and price are required."
    });
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid non-negative number."
    });
  }

  const cleanTitle = String(title).trim();
  const cleanAuthor = String(author).trim();
  if (!cleanTitle || !cleanAuthor) {
    return res.status(400).json({
      success: false,
      message: "Title and author cannot be empty."
    });
  }

  book.title = cleanTitle;
  book.author = cleanAuthor;
  book.price = numericPrice;

  res.status(200).json({
    success: true,
    message: "Book updated successfully.",
    data: book
  });
});

// DELETE /book/:id - delete a book (singular /book as specified)
app.delete("/book/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((item) => item.id === id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid book ID." });
  }
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Book not found." });
  }

  const deletedBook = books.splice(index, 1)[0];
  res.status(200).json({
    success: true,
    message: "Book deleted successfully.",
    data: deletedBook
  });
});

// Handle malformed JSON and unexpected server errors.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON request body." });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Book Management System running at http://localhost:${PORT}`);
});