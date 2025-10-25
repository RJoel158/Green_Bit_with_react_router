// CommonHeader.tsx - Componente de header reutilizable para todos los módulos de administración
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import '../UserManagementComp/UserManagement.css';

interface CommonHeaderProps {
  title: string;
  searchPlaceholder: string;
  searchQuery: string;
  onSearch: (query: string) => void;
  onCreateNew?: () => void;
  createButtonText?: string;
  additionalFilters?: ReactNode; // Para filtros personalizados como rol, tipo de usuario, etc.
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

export default function CommonHeader({ 
  title,
  searchPlaceholder,
  searchQuery,
  onSearch,
  onCreateNew,
  createButtonText = "+ Crear nuevo",
  additionalFilters
}: CommonHeaderProps) {
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
        <div className="user-management-header-search-box">
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            className="user-management-header-search-input"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="user-management-header-actions">
          {/* Filtros adicionales personalizables */}
          {additionalFilters}
          
          {/* Botón de crear (opcional) */}
          {onCreateNew && (
            <button 
              className="user-management-header-create-btn"
              onClick={onCreateNew}
            >
              {createButtonText}
            </button>
          )}
          
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
      <h1 className="user-management-header-title">{title}</h1>
    </div>
  );
}
