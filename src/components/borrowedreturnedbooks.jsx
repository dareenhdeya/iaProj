import React, { useEffect, useState } from "react";
import { Tabs, Tab, Alert, Card } from "react-bootstrap";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import "./borrowedreturnedbooks.css";

const NextArrow = ({ onClick }) => (
  <div className="slick-next" onClick={onClick}>
    &#9654;
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div className="slick-prev" onClick={onClick}>
    &#9664;
  </div>
);

const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  draggable: true,
  swipe: true,
  arrows: true,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  responsive: [
    {
      breakpoint: 992,
      settings: { slidesToShow: 2 },
    },
    {
      breakpoint: 768,
      settings: { slidesToShow: 1 },
    },
  ],
};

const API_ADMIN = "http://localhost:5209/admin";

const BorrowedReturnedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("borrowed");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [usersRes, booksRes] = await Promise.all([
          axios.get(`${API_ADMIN}/users`),
          axios.get(`${API_ADMIN}/all-books`),
        ]);

        setUsers(usersRes.data);
        setBooks(booksRes.data);

        if (activeTab === "borrowed") {
          const borrowedRes = await axios.get(`${API_ADMIN}/BorrowedBooks`);
          setBorrowedBooks(borrowedRes.data);
        } else if (activeTab === "returned") {
          const returnedRes = await axios.get(`${API_ADMIN}/Returned-Books`);
          setReturnedBooks(returnedRes.data);
        }
      } catch (err) {
        setError("Error fetching data.");
      }

      setLoading(false);
    };

    fetchData();
  }, [activeTab]);

  const groupByUser = (borrowList) => {
    const grouped = {};
    borrowList.forEach((borrow) => {
      const user = users.find((u) => u.id === borrow.userId);
      const book = books.find((b) => b.id === borrow.bookId);
      if (!user || !book) return;

      if (!grouped[user.id]) {
        grouped[user.id] = {
          user,
          books: [],
        };
      }

      grouped[user.id].books.push({ ...book, borrow });
    });
    return grouped;
  };

  const renderBooks = (grouped) => {
    return Object.entries(grouped).map(([userId, data]) => (
      <div key={userId} className="mb-5">
        <div className="mb-2">
          <h5>
            <strong>Name: </strong>
            {data.user.name}
          </h5>
          <p>
            <strong>Email:</strong> {data.user.email}
          </p>
        </div>
        <Slider {...settings}>
          {data.books.map((bookObj, index) => (
            <div key={index} className="p-4">
              <Card className="h-100 book-card">
                <Card.Img
                  variant="top"
                  src={bookObj.image}
                  className="card-img-top object-fit-cover"
                />
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <Card.Title className="text-center text-white fs-4 fw-bold">
                      {bookObj.name}
                    </Card.Title>
                    <Card.Text>
                      <strong>Author:</strong> {bookObj.author}
                      <br />
                      <strong>Category:</strong> {bookObj.category}
                      <br />
                      <strong>Quantity:</strong> {bookObj.quantity}
                    </Card.Text>
                  </div>
                  <div className="text-end small mt-2">
                    <div>
                      <strong>Borrowed Date:</strong>{" "}
                      {bookObj.borrow.borrowedDate
                        ? new Date(bookObj.borrow.borrowedDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <strong>Borrow Date:</strong>{" "}
                      {bookObj.borrow.borrowDate
                        ? new Date(bookObj.borrow.borrowDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <strong>Return Date:</strong>{" "}
                      {bookObj.borrow.returnDate
                        ? new Date(bookObj.borrow.returnDate).toLocaleDateString()
                        : "Not returned yet"}
                    </div>
                    <div>
                      <strong>Due Date:</strong>{" "}
                      {bookObj.borrow.dueDate
                        ? new Date(bookObj.borrow.dueDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </Slider>
      </div>
    ));
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status"></div>
          <span className="visually-hidden">Loading...</span>
        </div>
      );
    }

    if (error) return <Alert variant="danger">{error}</Alert>;

    const dataToRender =
      activeTab === "borrowed" ? borrowedBooks : returnedBooks;

    if (!dataToRender.length) {
      return (
        <Alert variant="warning">
          No {activeTab === "borrowed" ? "borrowed" : "returned"} books.
        </Alert>
      );
    }

    const grouped = groupByUser(dataToRender);
    return renderBooks(grouped);
  };

  return (
    <div className="container mt-5">
      <h3>Borrowed & Returned Books</h3>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        justify
      >
        <Tab eventKey="borrowed" title="Borrowed Books">
          {renderTabContent()}
        </Tab>
        <Tab eventKey="returned" title="Returned Books">
          {renderTabContent()}
        </Tab>
      </Tabs>
    </div>
  );
};

export default BorrowedReturnedBooks;
