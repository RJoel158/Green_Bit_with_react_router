// Header.tsx
import { useState, useEffect } from 'react';
import './CollectorRequests.css';
import NotificationBell from '../CommonComp/NotificationBell';

interface HeaderProps {
  requestType: 'Persona' | 'Empresa';
  onRequestTypeChange: (type: 'Persona' | 'Empresa') => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

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

export default function Header({ 
  requestType, 
  onRequestTypeChange, 
  searchQuery,
  onSearch 
}: HeaderProps) {
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
    <div className="collector-requests-header">
      <div className="collector-requests-header-top">
        <div className="collector-requests-header-search-box">
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo" 
            className="collector-requests-header-search-input"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="collector-requests-header-actions">
          <select 
            className="collector-requests-header-type-select"
            value={requestType}
            onChange={(e) => onRequestTypeChange(e.target.value as 'Persona' | 'Empresa')}
          >
            <option value="Persona">Persona</option>
            <option value="Empresa">Empresa</option>
          </select>
          
          {/* User dropdown */}
          <div className="collector-requests-header-user-wrapper">
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="collector-requests-header-user-trigger"
            >
              <div className="collector-requests-header-user-avatar">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="collector-requests-header-user-name">
                {user?.email || 'Usuario'}
              </span>
              <span className="collector-requests-header-user-arrow">▼</span>
            </div>
            
            {showDropdown && (
              <div className="collector-requests-header-dropdown">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleProfileClick();
                  }}
                  className="collector-requests-header-dropdown-item"
                >
                  Perfil
                </button>
                <hr className="collector-requests-header-dropdown-divider" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="collector-requests-header-dropdown-item"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="collector-requests-header-notification-wrapper">
            {user?.id ? (
              <NotificationBell userId={user.id} />
            ) : (
              <button className="collector-requests-header-notif-btn">
                🔔
              </button>
            )}
          </div>
        </div>
      </div>
      <h1 className="collector-requests-header-title">Solicitudes de Recolectores</h1>
    </div>
  );
}
