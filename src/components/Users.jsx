import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';

const Users = () => {
  const API_URL = 'http://localhost:5209/admin/users';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(API_URL);
        setUsers(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setUsers([]);
        } else {
          setError('Failed to fetch users');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-white">Users List</h3>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary"  role="status"></div>
      <span className="visually-hidden">Loading...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : users.length === 0 ? (
        <div className="alert alert-info text-center">No users found</div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;
