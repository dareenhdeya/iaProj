import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Modal } from "react-bootstrap";
import ToastNotification from "./ToastNotification";
import './Profile.css';

const API_BASE_URL = "http://localhost:5209/admin";

const ProfilePage = () => {
  const [admin, setAdmin] = useState(null);
  const [updateForm, setUpdateForm] = useState({ Name: "", Email: "" });
  const [newAdminForm, setNewAdminForm] = useState({ Name: "", Email: "", Password: "" });
  const [showModal, setShowModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [updateErrors, setUpdateErrors] = useState({ FullName: "", email: "" });  

  
  const adminId = 55;
  // const adminId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/viewProfile/${adminId}`)
      .then((response) => {
        setAdmin(response.data);
        setUpdateForm({
          Name: response.data.name,
          Email: response.data.email,
        });
      })
      .catch(() => {
        setAlert({ show: true, message: "Error fetching profile", variant: "danger" });
      });
  }, [adminId]);

  const handleUpdateProfile = async () => {
    if (!validateUpdateForm()) return;
    try {
      const response = await axios.put(`${API_BASE_URL}/update-profile/${adminId}`, updateForm);
      setAlert({ show: true, message: response.data.message, variant: "success" });
      setAdmin({ ...admin, name: updateForm.Name, email: updateForm.Email });
      setShowModal(false);
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || "Failed to update profile",
        variant: "danger",
      });
    }
  };

  const handleAddAdmin = async () => {
    if (!validateForm()) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/add-admin`, newAdminForm);
      setAlert({ show: true, message: response.data.message, variant: "success" });
      setNewAdminForm({ Name: "", Email: "", Password: "" });
      setErrors({ name: "", email: "", password: "" });
      setShowAddAdminModal(false);
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || "Failed to add admin",
        variant: "danger",
      });
      setShowAddAdminModal(false);
    }
  };
 
  const validateForm = () => {
    let newErrors = { name: "", email: "", password: "" };
    let isValid = true;
  
    if (!newAdminForm.Name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newAdminForm.Email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(newAdminForm.Email)) {
      newErrors.email = "Invalid email format.";
      isValid = false;
    }
  
    if (!newAdminForm.Password.trim()) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (newAdminForm.Password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  const validateUpdateForm = () => {
    let newErrors = { name: "", email: "" };
    let isValid = true;
  
    if (!updateForm.Name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!updateForm.Email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(updateForm.Email)) {
      newErrors.email = "Invalid email format.";
      isValid = false;
    }
  
    setUpdateErrors(newErrors);
    return isValid;
  };
  

  return (
    <div className="container mt-5">
     
      {admin ? (
        <div>
          <div className="row align-items-center mb-3">
          <div className="col-12 col-md-6 text-center text-md-start">
            <h2>Profile Page</h2>
            </div>
            <div className="col-12 col-md-6 text-center text-md-end mt-3 mt-md-0">
            <Button variant="primary" onClick={() => setShowAddAdminModal(true)}>
              Add Admin
            </Button>
            </div>
          </div>
          <p><strong>Name:</strong> {admin.name}</p>
          <p><strong>Email:</strong> {admin.email}</p>
          <Button variant="primary" onClick={() => setShowModal(true)} className="me-2 mt-3">
            Update Profile
          </Button>
        </div>
      ) : (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status"></div>
          <span className="visually-hidden">Loading...</span>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={updateForm.Name}
                isInvalid={!!updateErrors.name}
                onChange={(e) => setUpdateForm({ ...updateForm, Name: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">{updateErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={updateForm.Email}
                isInvalid={!!updateErrors.email}
                onChange={(e) => setUpdateForm({ ...updateForm, Email: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">{updateErrors.email}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUpdateProfile}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddAdminModal} onHide={() => setShowAddAdminModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="newAdminName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={newAdminForm.Name}
                isInvalid={!!errors.name}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, Name: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="newAdminEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={newAdminForm.Email}
                isInvalid={!!errors.email}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, Email: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="newAdminPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={newAdminForm.Password}
                isInvalid={!!errors.password}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, Password: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddAdminModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddAdmin}>Add Admin</Button>
        </Modal.Footer>
      </Modal>

      <ToastNotification alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default ProfilePage;
