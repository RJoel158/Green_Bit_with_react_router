import React, { useState } from "react";
import "./ForgotPasswordModal.css";
import { Validator } from "../../common/Validator";
import SuccessModal from "../CommonComp/SuccesModal";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  initialEmail = "" 
}) => {
  const [recoveryEmail, setRecoveryEmail] = useState(initialEmail);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = Validator.validateEmail(recoveryEmail);
    if (emailError) {
      setRecoveryMessage("❌ " + emailError);
      return;
    }

    setRecoveryLoading(true);
    setRecoveryMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/users/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      const data = await res.json();

     
      if (res.ok || res.status === 200) {
        // Cerrar el modal actual y mostrar el SuccessModal
        setIsSuccessModalOpen(true);
      } else {
        setRecoveryMessage("❌ " + (data.error || "Error al procesar la solicitud"));
      }
    } catch (err) {
      console.error("Error de recuperación:", err);
      setRecoveryMessage("❌ No se pudo conectar al servidor.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleClose = () => {
    setRecoveryEmail("");
    setRecoveryMessage("");
    onClose();
  };

  if (!isOpen && !isSuccessModalOpen) return null;

  return (
    <>
      {isOpen && !isSuccessModalOpen && (
        <div className="forgot-modal-overlay" onClick={handleClose}>
          <div className="forgot-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="forgot-modal-header">
              <h2 className="forgot-modal-title">¡Recupera tu contraseña!</h2>
              <p className="forgot-modal-subtitle">
                Ingresa tu correo electrónico
              </p>
            </div>

            <form onSubmit={handleRecoverySubmit} className="forgot-modal-form">
              <div className="forgot-form-group">
                <label className="forgot-label">Correo electrónico:</label>
                <input
                  type="email"
                  className="forgot-input"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {recoveryMessage && (
                <div
                  className={`forgot-alert ${
                    recoveryMessage.includes("✅") ? "forgot-alert-success" : "forgot-alert-danger"
                  }`}
                >
                  {recoveryMessage}
                </div>
              )}

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={recoveryLoading}
              >
                {recoveryLoading ? "Enviando..." : "Confirmar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <SuccessModal
          title="Recuperación de contraseña"
          message="Si el correo está registrado, recibirás una contraseña temporal en tu bandeja de entrada."
          redirectUrl="/login"
        />
      )}
    </>
  );
};

export default ForgotPasswordModal;