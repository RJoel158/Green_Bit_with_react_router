import React from "react";
import "./ConfirmModal.css";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDangerous = false,
}) => {
  return (
    <div className="confirm-modal-overlay d-flex justify-content-center align-items-center">
      <div className="confirm-modal-box p-4 text-center">
        <AlertCircle 
          className="confirm-modal-icon mb-3" 
          size={48}
          color={isDangerous ? "#dc2626" : "#149D52"}
        />
        <h2 className="mb-2">{title}</h2>
        <h3 className="mb-4">{message}</h3>
        <div className="confirm-modal-buttons d-flex justify-content-center gap-2">
          <button
            className="btn confirm-modal-cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${isDangerous ? "confirm-modal-danger-btn" : "confirm-modal-confirm-btn"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
