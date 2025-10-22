// UserInfoPanel.tsx
import './UserManagement.css';

interface User {
  fullName: string;
  username: string;
  email: string;
  registrationDate: string;
  role: string;
}

interface UserInfoPanelProps {
  user: User | null;
}

export default function UserInfoPanel({ user }: UserInfoPanelProps) {
  if (!user) {
    return (
      <div className="user-management-info-panel">
        <div className="user-management-info-empty">
          Selecciona un usuario de la tabla para ver sus detalles
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-info-panel">
      <div className="user-management-info-header">
        <h3 className="user-management-info-title">Usuario</h3>
        <div 
          className={`user-management-info-avatar ${
            user.role === 'Recolector' 
              ? 'user-management-info-avatar-collector' 
              : 'user-management-info-avatar-recycler'
          }`}
        >
          {user.fullName.split(' ').map(n => n[0]).join('')}
        </div>
        <h2 className="user-management-info-name">{user.fullName}</h2>
        <p className="user-management-info-role">{user.role}</p>
      </div>

      <div className="user-management-info-form">
        <div className="user-management-info-field">
          <label className="user-management-info-label">Nombre de usuario:</label>
          <input 
            type="text" 
            value={user.username} 
            readOnly 
            className="user-management-info-input user-management-info-input-readonly"
          />
        </div>

        <div className="user-management-info-field">
          <label className="user-management-info-label">Correo electrónico:</label>
          <input 
            type="email" 
            value={user.email} 
            readOnly 
            className="user-management-info-input user-management-info-input-readonly"
          />
        </div>

        <div className="user-management-info-field">
          <label className="user-management-info-label">Fecha de registro:</label>
          <input 
            type="text" 
            value={user.registrationDate} 
            readOnly 
            className="user-management-info-input user-management-info-input-readonly"
          />
        </div>

        <div className="user-management-info-field">
          <label className="user-management-info-label">Rol:</label>
          <select value={user.role} className="user-management-info-select">
            <option>Reciclador</option>
            <option>Recolector</option>
            <option>Administrador</option>
          </select>
        </div>
      </div>

      <div className="user-management-info-actions">
        <button className="user-management-info-delete-btn">Borrar usuario</button>
        <button className="user-management-info-save-btn">Guardar Cambios</button>
      </div>
    </div>
  );
}