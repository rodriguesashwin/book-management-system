const API_URL = "/books";

const bookForm = document.getElementById("bookForm");
const bookIdInput = document.getElementById("bookId");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const priceInput = document.getElementById("price");
const tableBody = document.getElementById("booksTableBody");
const messageBox = document.getElementById("message");
const bookCount = document.getElementById("bookCount");
const formHeading = document.getElementById("formHeading");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

function showMessage(message, type = "success") {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message";
}

// A common helper that parses JSON and converts HTTP errors into JavaScript errors.
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

// GET /books: retrieve and display all books.
async function loadBooks() {
  tableBody.innerHTML = '<tr><td colspan="5" class="empty">Loading books...</td></tr>';

  try {
    const result = await request(API_URL);
    renderBooks(result.data);
    bookCount.textContent = result.data.length;
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="5" class="empty">Could not load books.</td></tr>';
    showMessage(error.message, "error");
  }
}

function renderBooks(books) {
  tableBody.replaceChildren();

  if (books.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="empty">No books found. Add your first book above.</td></tr>';
    return;
  }

  books.forEach((book) => {
    const row = document.createElement("tr");

    // textContent prevents book data from being interpreted as HTML.
    const values = [book.id, book.title, book.author, `₹${Number(book.price).toFixed(2)}`];
    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => startEdit(book.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteBook(book.id));

    actions.append(editButton, deleteButton);
    actionsCell.appendChild(actions);
    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });
}

// GET /books/:id: retrieve one book before placing its values in the form.
async function startEdit(id) {
  clearMessage();

  try {
    const result = await request(`${API_URL}/${id}`);
    const book = result.data;

    bookIdInput.value = book.id;
    titleInput.value = book.title;
    authorInput.value = book.author;
    priceInput.value = book.price;

    formHeading.textContent = `Update book #${book.id}`;
    submitButton.textContent = "Save Changes";
    cancelButton.classList.remove("hidden");
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function resetForm() {
  bookForm.reset();
  bookIdInput.value = "";
  formHeading.textContent = "Add a book";
  submitButton.textContent = "Add Book";
  cancelButton.classList.add("hidden");
}

bookForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const book = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    price: Number(priceInput.value)
  };

  if (!book.title || !book.author || priceInput.value === "" || !Number.isFinite(book.price) || book.price < 0) {
    showMessage("Enter a valid title, author and non-negative price.", "error");
    return;
  }

  const id = bookIdInput.value;
  const isEditing = Boolean(id);

  try {
    // POST /books adds; PUT /books/:id updates.
    const result = await request(isEditing ? `${API_URL}/${id}` : API_URL, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(book)
    });

    showMessage(result.message, "success");
    resetForm();
    await loadBooks();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// DELETE /book/:id: remove a book after confirmation.
async function deleteBook(id) {
  const confirmed = window.confirm(`Are you sure you want to delete book #${id}?`);
  if (!confirmed) return;

  clearMessage();

  try {
    const result = await request(`/book/${id}`, { method: "DELETE" });
    if (bookIdInput.value === String(id)) resetForm();
    showMessage(result.message, "success");
    await loadBooks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

cancelButton.addEventListener("click", resetForm);
document.getElementById("refreshButton").addEventListener("click", loadBooks);

// Load the initial list when the page opens.
loadBooks();