import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./sidebar.css";
import {
  FaChartBar,
  FaUsers,
  FaBook,
  FaUserTie,
  FaUserCircle,
  FaSignOutAlt,
  FaBookReader,
  FaClipboardList,
  FaHistory,


} from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaChartBar className="sidebar-icon" />
        <h3>Admin Panel</h3>
      </div>

      <ul className="sidebar-links">
        <li>
          <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
            <FaChartBar className="link-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/admin/users"
            className={isActive("/admin/users") ? "active" : ""}
          >
            <FaUsers className="link-icon" /> Users
          </Link>
        </li>
        <li>
          <Link
            to="/admin/librarians"
            className={isActive("/admin/librarians") ? "active" : ""}
          >
            <FaUserTie className="link-icon" /> Librarians
          </Link>
        </li>
        <li>
          <Link
            to="/admin/books"
            className={isActive("/admin/books") ? "active" : ""}
          >
            <FaBook className="link-icon" /> Books
          </Link>
        </li>
        <li>
          <Link
            to="/admin/BorrowedReturnedBooks"
            className={isActive("/admin/BorrowedReturnedBooks") ? "active" : ""}
          >
            <FaClipboardList className="link-icon" /> Books Activity
          </Link>
        </li>
        <li>
          <Link
            to="/admin/profile"
            className={isActive("/admin/profile") ? "active" : ""}
          >
            <FaUserCircle className="link-icon" /> Profile
          </Link>
        </li>
      </ul>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt className="logout-icon" />
          Logout
        </button>
      </div>
    </div>
  );
}
