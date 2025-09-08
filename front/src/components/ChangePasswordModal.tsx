import React, { useState } from "react";
import "./ChangePasswordModal.css";

const ChangePasswordModal: React.FC = () => {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  return (
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
            className="form-control custom-input"
          />
        </div>

        <div className="text-start mb-4">
          <label className="form-label">Confirma la contraseña:</label>
          <input
            type="password"
            placeholder="***********1"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="form-control custom-input"
          />
        </div>

        <div className="d-flex justify-content-center">
          <button className="btn custom-btn">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
