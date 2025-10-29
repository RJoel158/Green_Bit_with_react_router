import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import '../UserManagementComp/UserManagement.css';
import NotificationBell from '../CommonComp/NotificationBell';

interface User {
  id: number;
  email: string;
  role: string;
  state: number;
}

const handleLogout = () => {
  localStorage.removeItem("user");
  window.location.replace("/login");
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleProfileClick = () => {
    window.location.href = "/UserInfo";
  };

  return (
    <div className="user-management-header">
      <div className="user-management-header-top">
        <h1 className="user-management-header-title" style={{ fontSize: '2rem', margin: 0 }}>Panel de control</h1>
        <div className="user-management-header-actions">
          {/* User dropdown */}
          <div className="user-management-header-user-wrapper">
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="user-management-header-user-trigger"
            >
              <div className="user-management-header-user-avatar">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-management-header-user-name">
                {user?.email || 'Usuario'}
              </span>
              <span className="user-management-header-user-arrow">▼</span>
            </div>
            
            {showDropdown && (
              <div className="user-management-header-dropdown">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleProfileClick();
                  }}
                  className="user-management-header-dropdown-item"
                >
                  Perfil
                </button>
                <hr className="user-management-header-dropdown-divider" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="user-management-header-dropdown-item"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="user-management-header-notification-wrapper">
            {user?.id ? (
              <NotificationBell userId={user.id} />
            ) : (
              <button className="user-management-header-notif-btn">
                🔔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
