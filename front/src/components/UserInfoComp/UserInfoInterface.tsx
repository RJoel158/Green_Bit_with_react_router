import { useEffect, useState } from "react";
import "./UserInfo.css";
import HeaderUserInfo from "./HeaderUserInfo";
import { useNavigate } from "react-router-dom";

//Estructura del usuario
interface User {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  registerDate: string;
  avatar?: string;
  totalPoints?: number;
}

const UserInfo: React.FC = () => {
  //Guardar información de usuario y rol
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const navigate=useNavigate();

  useEffect(() => {
    
    const userStr = localStorage.getItem("user");
    //Revisa si hay un usuario con la sesión iniciada
    if(!userStr){
      navigate("/login", { replace: true });
      return;
    }
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setRole(parsedUser.role);
      const userId = parsedUser.id;
      // Fetch para obtener los datos completos del usuario desde la API
      fetch(`http://localhost:3000/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUser(data.user);
        })
        .catch((err) => console.error(err));
    }
  }, []);

  const handleBack = () => {
    window.history.back();
  };
  const handleLogout = () => {
    localStorage.removeItem("user"); // borra la sesión
    window.location.replace("/login");// reemplaza la URL y evita volver atrás
  };

  return (
    <div className="user-info-container">
      <HeaderUserInfo />

      <div className="user-info-wrapper">
        <div className="user-info-card">
          <h2 className="user-title">
            {user ? `${user.firstname} ${user.lastname}` : "Nombre completo"}
          </h2>

          <div className="user-avatar-large mx-auto">
            <img
              src={user?.avatar || "https://i.pravatar.cc/150?img=5"}
              alt="Avatar del usuario"
            />
          </div>

          <div className="user-role mt-3 mb-4">
            <span className="role-badge">{role || "Rol"}</span>
          </div>

          <div className="user-form">
            <div className="form-group">
              <label>Número de Referencia:</label>
              <input
                type="text"
                className="form-control form-input"
                value={user?.phone || ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico:</label>
              <input
                type="email"
                className="form-control form-input"
                value={user?.email || ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Inicio como {role || ""}:</label>
              <input
                type="text"
                className="form-control form-input"
                value={user ? new Date(user.registerDate).toLocaleDateString() : ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Total de Puntos:</label>
              <div className="points-input d-flex align-items-center">
                <input
                  type="text"
                  className="form-control form-input"
                  value={user?.totalPoints || "600"}
                  readOnly
                />
                <span className="star-icon ms-2">⭐</span>
              </div>
            </div>
          </div>

          <div className="action-buttons text-center mt-4">
            <button className="btn btn-close-session" onClick={handleLogout }>Cerrar sesión</button>
          </div>
        </div>
      </div>


      <button className="btn-back btn btn-outline-success" onClick={handleBack}>
        ← Volver
      </button>
    </div>
  );
};

export default UserInfo;
