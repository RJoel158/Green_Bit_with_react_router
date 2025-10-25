import React from "react";
import "./SuccessModal.css"
import emailLogo from "../../assets/icons/email-logo.svg";

interface SuccessModalProps {
  title: string;
  message: string;
  redirectUrl?: string; // Ahora opcional
  onClose?: () => void; // Callback opcional para cerrar sin redireccionar
}

const SuccessModal: React.FC<SuccessModalProps> = ({ title, message, redirectUrl, onClose }) => {
  const handleClick = () => {
    if (onClose) {
      onClose(); // Si hay callback, usarlo
    } else if (redirectUrl) {
      window.location.href = redirectUrl; // Si no, usar redirect
    }
  };

  return (
    <div className="modal-overlay d-flex justify-content-center align-items-center">
      <div className="modal-box p-4 text-center">
        <img src={emailLogo} alt="Email" className="modal-icon mb-3" />
        <h2 className="mb-2">{title}</h2>
        <h3 className="mb-3">{message}</h3>
        <div className="d-flex justify-content-end">
          <button
            className="btn modal-button"
            onClick={handleClick}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

