import React from "react";
import "./RecyclingInterface.css";
import logoText from "../../assets/logoText.svg";
import bellIcon from "../../assets/icons/bell.svg";

//Definicion de usuario
interface User {
  id: number;
  username: string;
  role: string;
  state: number;
  avatar?: string;
}

interface HeaderProps {
  user: User | null;
}

const handleLogout = () => {
  localStorage.removeItem("user"); // borra la sesión
  window.location.replace("/login"); // reemplaza la URL y evita volver atrás
};
//Paso el usuario como prop
const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="header d-flex justify-content-between align-items-center px-3">
      <div 
        className="logo-container d-flex align-items-center"
        style={{
          width: '350px',
          height: '100px',
          minWidth: '350px' // Asegura que no se comprima
        }}
      >
        <img 
          src={logoText} 
          alt="Logo GreenBit" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left center',
            maxWidth: 'none',
            maxHeight: 'none'
          }}
        />
      </div>

      <div className="user-profile d-flex align-items-center gap-2">
        <div className="user-avatar">
          <img
            src={user?.avatar || "https://i.pravatar.cc/40?img=5"}
            alt="avatar"
            className="rounded-circle"
          />
        </div>

        <div className="dropdown">
          <button
            className="btn btn-link p-0 text-dark d-flex align-items-center user-dropdown-btn"
            type="button"
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="me-1 user-name">{user ? user.username : "Invitado"}</span>
            <span className="ms-1 dropdown-arrow">↴</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a className="dropdown-item" href="/UserInfo">Perfil</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>

        <div className="notification-bell ms-2">
          <img src={bellIcon} alt="Notificaciones" />
        </div>
      </div>
    </header>
  );
};

export default Header;