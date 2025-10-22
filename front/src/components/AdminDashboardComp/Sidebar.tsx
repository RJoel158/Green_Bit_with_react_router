import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import logo from '../../assets/logo.png'

export default function Sidebar() {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'control', label: 'Panel de Control', icon: '📊', path: '/adminDashboard' },
    { id: 'reportes', label: 'Reportes', icon: '📈', path: '/reportes' },
    { id: 'usuarios', label: 'Administrar Usuarios', icon: '👥', path: '/adminUserManagement' },
    { id: 'anuncios', label: 'Anuncios', icon: '📢', path: '/anuncios' },
    { id: 'acciones', label: 'Accesos', icon: '⚡', path: '/adminCollectorRequests' }
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
              onClick={() => navigate(item.path)}
              className="sidebar-button"
            >
              <span className="sidebar-button-icon">{item.icon}</span>
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
            <span className="sidebar-button-icon">⚙️</span>
            <span>Configuraciones</span>
          </button>
          <button className="sidebar-button">
            <span className="sidebar-button-icon">❓</span>
            <span>Ayuda</span>
          </button>
        </nav>
      </div>
    </div>
  );
}