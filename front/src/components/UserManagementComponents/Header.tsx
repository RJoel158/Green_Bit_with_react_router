// Header.tsx
import './UserManagement.css';

interface HeaderProps {
  userType: 'Persona' | 'Empresa';
  onUserTypeChange: (type: 'Persona' | 'Empresa') => void;
  onCreateUser: () => void;
}

export default function Header({ userType, onUserTypeChange, onCreateUser }: HeaderProps) {
  return (
    <div className="user-management-header">
      <h1 className="user-management-header-title">Administrar usuarios</h1>
      <div className="user-management-header-actions">
        <div className="user-management-header-search-box">
          <span className="user-management-header-search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar" 
            className="user-management-header-search-input"
          />
        </div>
        <select 
          className="user-management-header-type-select"
          value={userType}
          onChange={(e) => onUserTypeChange(e.target.value as 'Persona' | 'Empresa')}
        >
          <option value="Persona">Persona</option>
          <option value="Empresa">Empresa</option>
        </select>
        <button 
          className="user-management-header-create-btn"
          onClick={onCreateUser}
        >
          + Crear usuario
        </button>
        <div className="user-management-header-user">
          <div className="user-management-header-user-avatar">JS</div>
          <span className="user-management-header-user-name">Joel Saavedra</span>
          <span style={{ color: '#9ca3af', cursor: 'pointer' }}>▼</span>
        </div>
        <button className="user-management-header-notif-btn">
          🔔
          <span className="user-management-header-notif-badge"></span>
        </button>
      </div>
    </div>
  );
}