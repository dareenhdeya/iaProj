import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import "./ToastNotification.css";

function ToastNotification({ alert, setAlert }) {
  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        show={alert.show}
        bg={alert.variant}
        delay={3000}
        autohide
      >
        <Toast.Body className={alert.variant === "danger" ? "text-white" : ""}>
          {alert.message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default ToastNotification;
