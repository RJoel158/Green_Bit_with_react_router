import './AdminDashboard.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../../assets/logo.png'

interface SidebarProps {
  onMenuSelect: (menuId: string) => void;
  activeMenu: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ onMenuSelect, activeMenu, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'control', label: 'Panel de Control', icon: 'bi-grid-fill' },
    { id: 'reportes', label: 'Reportes', icon: 'bi-graph-up' },
    { id: 'usuarios', label: 'Administrar Usuarios', icon: 'bi-people-fill' },
    { id: 'materiales', label: 'Materiales', icon: 'bi-recycle' },
    { id: 'anuncios', label: 'Anuncios', icon: 'bi-megaphone-fill' },
    { id: 'accesos', label: 'Accesos', icon: 'bi-person-check-fill' },
    { id: 'ranking', label: 'Ranking', icon: 'bi-trophy-fill' }
  ];

  const handleMenuClick = (menuId: string) => {
    onMenuSelect(menuId);
    // Cerrar el sidebar en móvil después de seleccionar
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para cerrar el sidebar en móvil */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}
      
      
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Botón de cerrar para móvil */}
      <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
        <i className="bi bi-x-lg"></i>
      </button>

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
              onClick={() => handleMenuClick(item.id)}
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
    </>
  );
}