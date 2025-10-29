import './AdminDashboard.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../../assets/logo.png'

interface SidebarProps {
  onMenuSelect: (menuId: string) => void;
  activeMenu: string;
}

export default function Sidebar({ onMenuSelect, activeMenu }: SidebarProps) {
  const menuItems = [
    { id: 'control', label: 'Panel de Control', icon: 'bi-grid-fill' },
    { id: 'reportes', label: 'Reportes', icon: 'bi-graph-up' },
    { id: 'usuarios', label: 'Administrar Usuarios', icon: 'bi-people-fill' },
    { id: 'materiales', label: 'Materiales', icon: 'bi-recycle' },
    { id: 'anuncios', label: 'Anuncios', icon: 'bi-megaphone-fill' },
    { id: 'accesos', label: 'Accesos', icon: 'bi-person-check-fill' },
    { id: 'ranking', label: 'Ranking', icon: 'bi-trophy-fill' }
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-container">
           <img src={logo} alt="EcoApp logo" className="sidebar-logo-img" />
        </div>
      </div>

      {/* Menú */}
      <div className="sidebar-menu">
        <h3 className="sidebar-section-title">MENÚ</h3>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onMenuSelect(item.id)}
              className={`sidebar-button ${activeMenu === item.id ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon} sidebar-button-icon`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Otros */}
      <div className="sidebar-otros">
        <h3 className="sidebar-section-title">OTROS</h3>
        <nav className="sidebar-nav">
          <button className="sidebar-button">
            <i className="bi bi-gear-fill sidebar-button-icon"></i>
            <span>Configuraciones</span>
          </button>
          <button className="sidebar-button">
            <i className="bi bi-question-circle-fill sidebar-button-icon"></i>
            <span>Ayuda</span>
          </button>
        </nav>
      </div>
    </div>
  );
}