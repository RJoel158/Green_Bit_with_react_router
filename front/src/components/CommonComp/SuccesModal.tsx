import React from "react";
import "./SuccessModal.css"
import emailLogo from "../../assets/icons/email-logo.svg";

interface SuccessModalProps {
  title: string;
  message: string;
  redirectUrl: string; //Revisar para el cambio entre ventanas
}

const SuccessModal: React.FC<SuccessModalProps> = ({ title, message, redirectUrl }) => {
  return (
    <div className="modal-overlay d-flex justify-content-center align-items-center">
      <div className="modal-box p-4 text-center">
        <img src={emailLogo} alt="Email" className="modal-icon mb-3" />
        <h2 className="mb-2">{title}</h2>
        <h3 className="mb-3">{message}</h3>
        <div className="d-flex justify-content-end">
          <button
            className="btn modal-button"
            onClick={() => (window.location.href = redirectUrl)}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
