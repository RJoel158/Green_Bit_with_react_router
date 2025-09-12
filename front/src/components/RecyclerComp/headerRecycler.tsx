import React from "react";
import "./RecyclingInterface.css";

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

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <span className="leaf">🌿</span>
          <span className="bottle">🗂️</span>
        </div>
        <span className="logo-text">GreenBit</span>
      </div>
      <div className="user-profile">
        <span className="user-name">{user ? user.username : "Invitado"}</span>
        <div className="user-avatar">
          <img
            src={user?.avatar || "https://i.pravatar.cc/40?img=5"}
            alt="avatar"
          />
        </div>
        <div className="notification-dot"></div>
      </div>
    </header>
  );
};

export default Header;
