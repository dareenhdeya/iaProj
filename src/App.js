import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Sidebar from './components/sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Books from './components/Books';
import Librarian from './components/Librarian';
import Profile from './components/Profile';
import BorrowedReturnedBooks from './components/borrowedreturnedbooks';


function App() {
  return (
    <Router>
      <CssBaseline />
      <Sidebar />
      <main className="main-content">
        <Routes>
        <Route path="/" element={<Navigate to="/admin" />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/books" element={<Books />} />
          <Route path="/admin/librarians" element={<Librarian />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/BorrowedReturnedBooks" element={<BorrowedReturnedBooks />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
