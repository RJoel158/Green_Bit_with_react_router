import React, { useState } from "react";
import "./ChangePasswordModal.css";
import { Validator } from "../common/Validator";
import SuccessModal from "./SuccesModal";

const ChangePasswordModal: React.FC = () => {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; repeatPassword?: string }>({});
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleConfirm = () => {
    const passwordError = Validator.validatePassword(password);
    const repeatPasswordError =
      password !== repeatPassword ? "Las contraseñas no coinciden" : "";

    const validationErrors = { password: passwordError, repeatPassword: repeatPasswordError };
    setErrors(validationErrors);

    if (Validator.isValid(validationErrors)) {
      // ✅ Contraseña válida
      setIsChangePasswordOpen(false); 
      setIsSuccessModalOpen(true);   
    }
  };

  return (
    <>
      {isChangePasswordOpen && (
        <div className="modal-overlay d-flex justify-content-center align-items-center">
          <div className="modal-box text-center shadow">
            <h2 className="mb-2">¡Bienvenid@!</h2>
            <h4 className="mb-4">Como último paso, personaliza tu contraseña.</h4>

            <div className="text-start mb-3">
              <label className="form-label">Establece una contraseña:</label>
              <input
                type="password"
                placeholder="***********1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-control custom-input ${errors.password ? "is-invalid" : ""}`}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="text-start mb-4">
              <label className="form-label">Confirma la contraseña:</label>
              <input
                type="password"
                placeholder="***********1"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className={`form-control custom-input ${errors.repeatPassword ? "is-invalid" : ""}`}
              />
              {errors.repeatPassword && <div className="invalid-feedback">{errors.repeatPassword}</div>}
            </div>

            <div className="d-flex justify-content-center">
              <button className="btn custom-btn" onClick={handleConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <SuccessModal
          title="¡Contraseña actualizada!"
          message="Tu contraseña ha sido cambiada exitosamente."
          redirectUrl="https://www.google.com/" // puedes cambiar a donde quieras redirigir
        />
      )}
    </>
  );
};

export default ChangePasswordModal;
