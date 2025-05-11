import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import ToastNotification from "./ToastNotification";

import "./Librarian.css";

const API = "http://localhost:5209/admin";

function ManageLibrarians() {
  const [librarians, setLibrarians] = useState([]);
  const [pendingLibrarians, setPendingLibrarians] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLibrarianId, setSelectedLibrarianId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
const [updateForm, setUpdateForm] = useState({ FullName: "", email: "" });
const [selectedUpdateId, setSelectedUpdateId] = useState(null);
const [errors, setErrors] = useState({ name: "", email: "", password: "" });
const [updateErrors, setUpdateErrors] = useState({ FullName: "", email: "" });

//   useEffect(() => {
//     fetchLibrarians();
//     fetchPendingLibrarians();
//   }, []);

useEffect(() => {
    setLoading(true);
    Promise.all([fetchLibrarians(), fetchPendingLibrarians()])
      .finally(() => setLoading(false));
  }, []);
  

  const fetchLibrarians = async () => {
    try {
      const res = await axios.get(`${API}/librarians`);
      const approvedOnly = res.data.filter(lib => lib.isApproved === true);
      setLibrarians(approvedOnly);
    } catch {
      setLibrarians([]);
    }
  };

  const fetchPendingLibrarians = async () => {
    try {
      const res = await axios.get(`${API}/pending-librarians`);
      setPendingLibrarians(res.data);
    } catch {
      setPendingLibrarians([]);
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/add-librarian`, form);
      setAlert({ show: true, message: "Librarian added successfully!", variant: "success" });
      setShowAddModal(false);
      fetchLibrarians();
      fetchPendingLibrarians();
      setForm({ name: "", email: "", password: "" });
      setErrors({ name: "", email: "", password: "" });
    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || "Failed to add librarian", variant: "danger" });
      setShowAddModal(false);
      setForm({ name: "", email: "", password: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API}/approve-librarian/${id}`);
      fetchLibrarians();
      fetchPendingLibrarians();
      setAlert({ show: true, message: "Librarian approved", variant: "success" });
      setShowPendingModal(false);

    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || "Failed to approve", variant: "danger" });
      setShowPendingModal(false);

    }
  };

  const handleReject = async () => {
    try {
      await axios.delete(`${API}/reject-librarian/${selectedLibrarianId}`, {
        data: rejectionReason,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setAlert({ show: true, message: "Librarian rejected", variant: "success" });
      fetchPendingLibrarians();
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedLibrarianId(null);
      setShowPendingModal(false);
    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || "Failed to reject", variant: "danger" });
      setShowRejectModal(false);
      setShowPendingModal(false);
    }
  };
  
  const handleUpdate = async () => {
    if (!selectedUpdateId) return;
    if (!validateUpdateForm()) return;
    try {
      const updateData = { 
        FullName: updateForm.FullName,
        email: updateForm.email
        // isApproved: true
      };
      const response = await axios.put(`${API}/update-librarian/${selectedUpdateId}`, updateData);
      setAlert({ show: true, message: response.data.message, variant: "success" });

      setShowUpdateModal(false);
      fetchLibrarians(); 
  
    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || "Failed to update librarian", variant: "danger" });
      setShowUpdateModal(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/remove-librarian/${deleteId}`);
      setAlert({ show: true, message: "Librarian removed", variant: "success" });
      fetchLibrarians();
    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || "Error", variant: "danger" });
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const validateForm = () => {
    let newErrors = { name: "", email: "", password: "" };
    let isValid = true;
  
    if (!form.name.trim()) {
      newErrors.name = "Full name is required.";
      isValid = false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format.";
      isValid = false;
    }
  
    if (!form.password.trim()) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  const validateUpdateForm = () => {
    let newErrors = { FullName: "", email: "" };
    let isValid = true;
  
    if (!updateForm.FullName.trim()) {
      newErrors.FullName = "Full name is required.";
      isValid = false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!updateForm.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(updateForm.email)) {
      newErrors.email = "Invalid email format.";
      isValid = false;
    }
  
    setUpdateErrors(newErrors);
    return isValid;
  };
  

  return (
    <div className="container mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h2>Manage Librarians</h2>
        <div className="d-flex gap-3">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><i className="fas fa-plus me-2"></i> Add Librarian</button>
          <button className="btn btn-secondary" onClick={() => {fetchPendingLibrarians();setShowPendingModal(true)}}><i className="fas fa-user-clock"></i></button>
        </div>
      </div>

      <ToastNotification alert={alert} setAlert={setAlert} />
      
      {loading ? (
  <div className="text-center p-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
) : (
  <>
      {librarians.length === 0 ? (
    <div className="text-center text-muted fs-5 p-5">No librarians</div>
  ) : (
    <div className="table-responsive"><table className=" table-hover librarians-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {librarians.map((lib) => (
        <tr key={lib.id}>
          <td>{lib.name}</td>
          <td>{lib.email}</td>
          <td>
          <Button size="sm" variant="warning" onClick={() => { 
setSelectedUpdateId(lib.id); 
setUpdateForm({ FullName: lib.name, email: lib.email }); 
setShowUpdateModal(true); 
}}><i className="fas fa-edit"></i></Button>
{" "}

            <Button variant="danger" size="sm" onClick={() => { setDeleteId(lib.id); setShowDeleteModal(true); }}>
            <i className="fas fa-trash-alt"></i>
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table></div>
      
 )}
 </>
 )}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to remove this librarian?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Yes, Remove</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton><Modal.Title>Reject Librarian</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group controlId="rejectionReason">
  <Form.Label>Reason for rejection</Form.Label>
  <Form.Control
    as="textarea"
    value={rejectionReason}
    onChange={(e) => setRejectionReason(e.target.value)}
    rows={3}
  />
</Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleReject}>Reject</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add Librarian</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
  <Form.Group controlId="addFullName">
    <Form.Label>Full Name</Form.Label>
    <Form.Control
      type="text"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      isInvalid={!!errors.name}
    />
    <Form.Control.Feedback type="invalid">
      {errors.name}
    </Form.Control.Feedback>
  </Form.Group>
  <Form.Group className="mt-2" controlId="addEmail">
    <Form.Label>Email</Form.Label>
    <Form.Control
      type="email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      isInvalid={!!errors.email}
    />
    <Form.Control.Feedback type="invalid">
      {errors.email}
    </Form.Control.Feedback>
  </Form.Group>
  <Form.Group className="mt-2" controlId="addPassword">
    <Form.Label>Password</Form.Label>
    <Form.Control
      type="password"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      isInvalid={!!errors.password}
    />
    <Form.Control.Feedback type="invalid">
      {errors.password}
    </Form.Control.Feedback>
  </Form.Group>
</Form>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAdd} disabled={loading}>{loading ? "Adding..." : "Add Librarian"}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPendingModal} onHide={() => setShowPendingModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Pending Librarians</Modal.Title></Modal.Header>
        <Modal.Body>
        {pendingLibrarians.length === 0 ? (
    <div className="text-center text-muted fs-5">No pending librarians</div>
  ) : (
          <table className=" table-hover librarians-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLibrarians.map((lib) => (
                <tr key={lib.id}>
                  <td>{lib.name}</td>
                  <td>{lib.email}</td>
                  <td>
                    <Button size="sm" variant="success" onClick={() => handleApprove(lib.id)}>Approve</Button>{" "}
                    <Button size="sm" variant="danger" onClick={() => { setSelectedLibrarianId(lib.id); setShowRejectModal(true); }}>Reject</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           )}
        </Modal.Body>
      </Modal>

      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Update Librarian</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
  <Form.Group controlId="updateFullName">
    <Form.Label>Full Name</Form.Label>
    <Form.Control
      type="text"
      value={updateForm.FullName}
      onChange={(e) => setUpdateForm({ ...updateForm, FullName: e.target.value })}
      isInvalid={!!updateErrors.FullName}
    />
    <Form.Control.Feedback type="invalid">
      {updateErrors.FullName}
    </Form.Control.Feedback>
  </Form.Group>
  <Form.Group className="mt-2" controlId="updateEmail">
    <Form.Label>Email</Form.Label>
    <Form.Control
      type="email"
      value={updateForm.email}
      onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
      isInvalid={!!updateErrors.email}
    />
    <Form.Control.Feedback type="invalid">
      {updateErrors.email}
    </Form.Control.Feedback>
  </Form.Group>
</Form>

  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Close</Button>
    <Button variant="primary" onClick={handleUpdate} disabled={loading}>
      {loading ? "Updating..." : "Update Librarian"}
    </Button>
  </Modal.Footer>
</Modal>


    </div>
  );
}

export default ManageLibrarians;