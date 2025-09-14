import { useEffect, useState } from "react";
import "./UserInfo.css";
import HeaderUserInfo from "./HeaderUserInfo";

interface User {
  id: number;
  username: string;
  role: string;
  state: number;
  avatar?: string;
  referenceNumber?: string;
  email?: string;
  startDate?: string;
  totalPoints?: number;
}

const UserInfo: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="user-info-container">
      {/* Header con logo y título */}
      <HeaderUserInfo />

      {/* Contenido principal */}
      <div className="container-fluid py-4 py-md-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="user-info-card">
              <h2 className="user-title text-center mb-3 mb-md-4">{user ? user.username : "Toby Fox Williams"}</h2>
              
              {/* Avatar del usuario */}
              <div className="user-avatar-large mx-auto mb-3 mb-md-4">
                <img
                  src={user?.avatar || "https://i.pravatar.cc/150?img=5"}
                  alt="Avatar del usuario"
                  className="img-fluid"
                />
              </div>
              
              {/* Rol del usuario */}
              <div className="user-role text-center mb-4">
                <span className="role-badge">Reciclador</span>
              </div>

              {/* Formulario de información */}
              <div className="user-form">
                <div className="form-group mb-3">
                  <label className="form-label">Número de Referencia:</label>
                  <input
                    type="text"
                    className="form-control form-input"
                    value="591 XXXXXXXX"
                    readOnly
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Correo electrónico:</label>
                  <input
                    type="email"
                    className="form-control form-input"
                    value={user?.email || "wawawa@gmail.com"}
                    readOnly
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Inicio como Recolector:</label>
                  <input
                    type="text"
                    className="form-control form-input"
                    value="2023-08-21"
                    readOnly
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Total de Puntos:</label>
                  <div className="points-input d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control form-input me-2"
                      value="600"
                      readOnly
                    />
                    <span className="star-icon">⭐</span>
                  </div>
                </div>
              </div>

              {/* Botón Cerrar sesión */}
              <div className="action-buttons text-center">
                <button className="btn btn-close-session px-4 py-2">Cerrar sesión</button>
              </div>
            </div>
          </div>
        </div>

        {/* Botón volver */}
        <div className="row justify-content-center mt-4">
          <div className="col-auto">
            <button className="btn btn-back d-flex align-items-center" onClick={handleBack}>
              ←Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;