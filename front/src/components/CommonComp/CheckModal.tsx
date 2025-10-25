import React from "react";
import "./CheckModal.css";

interface CheckModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CheckModal: React.FC<CheckModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="check-modal-overlay d-flex justify-content-center align-items-center">
      <div className="check-modal-box p-4 text-center">
        <h2 className="mb-2">{title}</h2>
        <h3 className="mb-3">{message}</h3>
        <div className="check-modal-actions d-flex justify-content-end gap-2">
          <button
            className="btn check-modal-button-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="btn check-modal-button-confirm"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckModal;
