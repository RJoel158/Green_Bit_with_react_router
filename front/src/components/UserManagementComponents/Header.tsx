// Header.tsx
import './UserManagement.css';

interface HeaderProps {
  userType: 'Persona' | 'Empresa';
  onUserTypeChange: (type: 'Persona' | 'Empresa') => void;
  onCreateUser: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

export default function Header({ 
  userType, 
  onUserTypeChange, 
  onCreateUser,
  searchQuery,
  onSearch 
}: HeaderProps) {
  return (
    <div className="user-management-header">
      <div className="user-management-header-top">
        <div className="user-management-header-search-box">

          <input 
            type="text" 
            placeholder="Buscar por nombre o correo" 
            className="user-management-header-search-input"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="user-management-header-actions">
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
      <h1 className="user-management-header-title">Administrar usuarios</h1>
    </div>
  );
}