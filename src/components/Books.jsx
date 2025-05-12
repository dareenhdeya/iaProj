import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import "./Books.css";
import ToastNotification from "./ToastNotification";

const Book = () => {
  const API_URL = "http://localhost:5209/admin";

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Thriller",
    "Biography",
    "History",
    "Science",
    "Technology",
    "Philosophy",
    "Poetry",
    "Drama",
    "Comics",
    "Children's Books",
    "Educational",
    "Self-Help",
    "Business",
    "Art",
    "Cookbooks"
  ];

  const [allBooks, setAllBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModalType, setShowModalType] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({ type: "name", keyword: "" });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const [bookErrors, setBookErrors] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [newBook, setNewBook] = useState({
    name: "",
    author: "",
    quantity: 1,
    availabilityStatus: true,
    description: "",
    image: "",
    category: "",
  });

  useEffect(() => {
    fetchAllBooks();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const keyword = debouncedKeyword.toLowerCase();

      if (keyword.trim() === "") {
        setBooks(allBooks);
        return;
      }

      const filtered = allBooks.filter((book) => {
        const field = book[filters.type]?.toLowerCase() || "";
        return field.startsWith(keyword);
      });

      setBooks(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [debouncedKeyword, filters.type, allBooks]);

  const fetchAllBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/all-books`);
      setBooks(response.data);
      setAllBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = async () => {
    const errors = validateBook(newBook);
    if (Object.keys(errors).length > 0) {
      setBookErrors(errors);
      return;
    }

    try {
      newBook.availabilityStatus = newBook.quantity > 0;

      const response = await axios.post(`${API_URL}/add-book`, newBook);
      if (response.data?.message === "Book already exists") {
        setAlert({
          show: true,
          message: "Book already exists",
          variant: "danger",
        });
        return;
      }
      fetchAllBooks();
      setAlert({
        show: true,
        message: "Book added successfully",
        variant: "success",
      });
      setShowModal(false);
      setNewBook({
        name: "",
        author: "",
        quantity: 1,
        availabilityStatus: true,
        description: "",
        image: "",
        category: "",
      });
      setBookErrors({});
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || "Add book failed",
        variant: "danger",
      });
    }
  };

  const handleUpdateBook = async () => {
    const errors = validateBook(selectedBook);
    if (Object.keys(errors).length > 0) {
      setBookErrors(errors);
      return;
    }

    try {
      selectedBook.availabilityStatus = selectedBook.quantity > 0;

      await axios.put(
        `${API_URL}/update-book/${selectedBook.id}`,
        selectedBook
      );
      fetchAllBooks();
      setAlert({
        show: true,
        message: "Book updated successfully",
        variant: "success",
      });
      setShowModal(false);
      setBookErrors({});
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || "Update failed",
        variant: "danger",
      });
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    try {
      await axios.delete(`${API_URL}/remove-book/${bookToDelete.id}`);
      fetchAllBooks();
      setAlert({
        show: true,
        message: "Book deleted successfully",
        variant: "success",
      });
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || "Delete failed",
        variant: "danger",
      });
    } finally {
      setShowDeleteConfirm(false);
      setBookToDelete(null);
    }
  };

  const handleShowModal = (type, book = null) => {
    setShowModalType(type);
    if (type === "update" || type === "show") {
      setSelectedBook(book);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBook(null);
    setShowModalType("");
  };
  
  const validateBook = (book) => {
    const errors = {};
  
    if (!book.name.trim()) errors.name = "Name is required";
    if (!book.author.trim()) errors.author = "Author is required";
    if (!book.category.trim()) errors.category = "Category is required";
    if (book.quantity <= 0 || isNaN(book.quantity)) errors.quantity = "Quantity must be a positive number";
    if (!book.image.trim()) {
      errors.image = "Image URL is required";
    } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp)$/.test(book.image.trim())) {
      errors.image = "Enter a valid image URL";
    }
  
    return errors;
  };  

  return (
    <div className="container mt-4 p-3 px-md-5">
      <div className="row my-4">
        <div className="col-3">
        <label htmlFor="filterType" className="form-label visually-hidden">Filter By</label>
          <select
            id="filterType" name="filterType"
            className="form-select"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="name">Name</option>
            <option value="author">Author</option>
            <option value="category">Category</option>
          </select>
        </div>
        <div className="col-9">
        <label htmlFor="searchKeyword" className="form-label visually-hidden">Keyword</label>
          <input
            id="searchKeyword" name="searchKeyword"
            className="form-control ms-2"
            placeholder={`Search by ${filters.type}`}
            value={filters.keyword}
            onChange={(e) => {
              setFilters({ ...filters, keyword: e.target.value });
              setDebouncedKeyword(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="mb-3 text-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowModalType("add");
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus me-1"></i> Add Book
        </button>
      </div>

      <div className="mb-3">
        <button
          className="btn btn-available m-2"
          onClick={() => {
            const availableOnly = allBooks.filter(
              (book) => book.availabilityStatus
            );
            setBooks(availableOnly);
          }}
        >
          <i className="fas fa-book-open m-1"></i> Show Available Books
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => setBooks(allBooks)}
        >
          <i className="fas fa-sync-alt me-1"></i> Show All Books
        </button>
      </div>

      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status"></div>
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : books.length === 0 ? (
        <p className="text-center text-muted fs-4">No books available</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {books.map((book, i) => (
            <div className="col" key={i}>
              <div className="card h-100 shadow rounded-4 border-0 overflow-hidden">
                <div className="card-img-top">
                  <img
                    src={book.image}
                    className="card-img-top object-fit-cover"
                    alt={book.name}
                  />
                </div>
                <div className="card-body p-3">
                  <h5 className="card-title fw-bold fs-5 text-center text-white pb-2">
                    {book.name}
                  </h5>
                  <p className="card-text mb-1">
                    <strong>Author:</strong> {book.author}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Category:</strong> {book.category}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Quantity:</strong> {book.quantity}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        book.availabilityStatus ? "text-success" : "text-danger"
                      }
                    >
                      {book.availabilityStatus ? "Available" : "Unavailable"}
                    </span>
                  </p>
                </div>
                <div className="card-footer border-0 d-flex justify-content-center gap-3 flex-wrap px-3 pb-3">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleShowModal("show", book)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleShowModal("update", book)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setBookToDelete(book);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {showModalType === "show" && (
              <>
                <i className="fas fa-book-open me-2"></i> Book Details
              </>
            )}
            {showModalType === "update" && (
              <>
                <i className="fas fa-pen me-2"></i> Update Book
              </>
            )}
            {showModalType === "add" && (
              <>
                <i className="fas fa-plus me-2"></i> Add New Book
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(showModalType === "show" || showModalType === "update") &&
            selectedBook && (
              <>
                {showModalType === "show" ? (
                  <>
                    <p>
                      <strong>Name:</strong> {selectedBook.name}
                    </p>
                    <p>
                      <strong>Author:</strong> {selectedBook.author}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedBook.category}
                    </p>
                    <p>
                      <strong>Description:</strong> {selectedBook.description}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {selectedBook.quantity}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedBook.availabilityStatus
                        ? "Available"
                        : "Unavailable"}
                    </p>
                  </>
                ) : (
                  <Form>
                    <Form.Group className="mb-2">
                      <Form.Label htmlFor="updateBookName">Name</Form.Label>
                      <Form.Control
                        id="updateBookName"
                        value={selectedBook.name}
                        isInvalid={!!bookErrors.name}
                        onChange={(e) =>
                          setSelectedBook({
                            ...selectedBook,
                            name: e.target.value,
                          })
                        }
                      />
                      <Form.Control.Feedback type="invalid">{bookErrors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label htmlFor="updateBookAuthor">Author</Form.Label>
                      <Form.Control
                        id="updateBookAuthor"
                        value={selectedBook.author}
                        isInvalid={!!bookErrors.author}
                        onChange={(e) =>
                          setSelectedBook({
                            ...selectedBook,
                            author: e.target.value,
                          })
                        }
                      />
                      <Form.Control.Feedback type="invalid">{bookErrors.author}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label htmlFor="updateBookCategory">Category</Form.Label>
                      <Form.Select
                        id="updateBookCategory"
                        value={selectedBook.category}
                        isInvalid={!!bookErrors.category}
                        onChange={(e) =>
                          setSelectedBook({
                            ...selectedBook,
                            category: e.target.value,
                          })
                        }
                        className="form-select custom-select"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{bookErrors.category}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label htmlFor="updateBookDescription">Description</Form.Label>
                      <Form.Control
                        id="updateBookDescription"
                        as="textarea"
                        value={selectedBook.description}
                        isInvalid={!!bookErrors.description}
                        onChange={(e) =>
                          setSelectedBook({
                            ...selectedBook,
                            description: e.target.value,
                          })
                        }
                      />
                      <Form.Control.Feedback type="invalid">{bookErrors.description}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label htmlFor="updateBookQuantity">Quantity</Form.Label>
                      <Form.Control
                        id="updateBookQuantity"
                        type="number"
                        min="0"
                        value={selectedBook.quantity}
                        isInvalid={!!bookErrors.quantity}
                        onChange={(e) =>
                          setSelectedBook({
                            ...selectedBook,
                            quantity: parseInt(e.target.value),
                          })
                        }
                      />
                      <Form.Control.Feedback type="invalid">{bookErrors.quantity}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-2 mt-2">
                      <Form.Label htmlFor="updateBookImage">Image URL</Form.Label>
                      <Form.Control
                        id="updateBookImage"
                        value={selectedBook.image}
                        isInvalid={!!bookErrors.image}
                        onChange={(e) =>
                          setSelectedBook({
                            ...selectedBook,
                            image: e.target.value,
                          })
                        }
                      />
                      <Form.Control.Feedback type="invalid">{bookErrors.image}</Form.Control.Feedback>
                    </Form.Group>
                  </Form>
                )}
              </>
            )}

          {showModalType === "add" && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label htmlFor="newBookName">Name</Form.Label>
                <Form.Control
                  id="newBookName"
                  value={newBook.name}
                  isInvalid={!!bookErrors.name}
                  onChange={(e) =>
                    setNewBook({ ...newBook, name: e.target.value })
                  }
                />
                 <Form.Control.Feedback type="invalid">{bookErrors.name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label htmlFor="newBookAuthor">Author</Form.Label>
                <Form.Control
                  id="newBookAuthor"
                  value={newBook.author}
                  isInvalid={!!bookErrors.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
                <Form.Control.Feedback type="invalid">{bookErrors.author}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label htmlFor="newBookCategory">Category</Form.Label>
                <Form.Select
                  id="newBookCategory"
                  value={newBook.category}
                  isInvalid={!!bookErrors.category}
                  onChange={(e) =>
                    setNewBook({ ...newBook, category: e.target.value })
                  }
                  className="form-select custom-select"
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{bookErrors.category}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label htmlFor="newBookDescription">Description</Form.Label>
                <Form.Control
                  id="newBookDescription"
                  as="textarea"
                  value={newBook.description}
                  isInvalid={!!bookErrors.description}
                  onChange={(e) =>
                    setNewBook({ ...newBook, description: e.target.value })
                  }
                />
                <Form.Control.Feedback type="invalid">{bookErrors.description}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label htmlFor="newBookQuantity">Quantity</Form.Label>
                <Form.Control
                  id="newBookQuantity"
                  type="number"
                  min="0"
                  value={newBook.quantity}
                  isInvalid={!!bookErrors.quantity}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
                <Form.Control.Feedback type="invalid">{bookErrors.quantity}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-2 mt-2">
                <Form.Label htmlFor="newBookImage">Image URL</Form.Label>
                <Form.Control
                  id="newBookImage"
                  value={newBook.image}
                  isInvalid={!!bookErrors.image}
                  onChange={(e) =>
                    setNewBook({ ...newBook, image: e.target.value })
                  }
                />
                <Form.Control.Feedback type="invalid">{bookErrors.image}</Form.Control.Feedback>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          {showModalType === "update" && (
            <Button variant="warning" onClick={handleUpdateBook}>
              Save Changes
            </Button>
          )}
          {showModalType === "add" && (
            <Button variant="primary" onClick={handleAddBook}>
              Add Book
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-danger me-2"></i>{" "}
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{bookToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastNotification alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Book;
