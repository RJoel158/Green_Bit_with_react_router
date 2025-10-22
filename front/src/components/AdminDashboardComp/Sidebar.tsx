import './AdminDashboard.css';
import logo from '../../assets/logo.png'

interface SidebarProps {
  onMenuSelect: (menuId: string) => void;
  activeMenu: string;
}

export default function Sidebar({ onMenuSelect, activeMenu }: SidebarProps) {
  const menuItems = [
    { id: 'control', label: 'Panel de Control', icon: '📊' },
    { id: 'reportes', label: 'Reportes', icon: '📈' },
    { id: 'usuarios', label: 'Administrar Usuarios', icon: '👥' },
    { id: 'materiales', label: 'Materiales', icon: '♻️' },
    { id: 'anuncios', label: 'Anuncios', icon: '📢' },
    { id: 'acciones', label: 'Accesos', icon: '⚡' }
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