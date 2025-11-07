import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import RecyclingChart from './RecyclingCharts';
import MostRecycled from './MostRecycled';
import PendingApprovals from './PendingApprovals';
import TopRecyclers from './TopRecyclers';
import TopCollectors from './TopCollectors';
import MaterialesAdmin from './MaterialesAdmin';
import AnnouncementsAdmin from './AnnouncementsAdmin';
import ReportesAdmin from './ReportesAdmin';
import UserManagement from '../UserManagementComp/UserManagement';
import CollectorRequests from '../CollectorRequestsComp/CollectorRequests';
import RankingPeriodsAdmin from './RankingPeriodsAdmin';
import ChangePasswordModal from '../PasswordComp/ChangePasswordModal';
import './AdminDashboard.css';

// Definición de la interfaz User
interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  state: number;
  avatar?: string;
}

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('control');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Verificar usuario y estado al cargar
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login", { replace: true });
      return;
    }
    const u = JSON.parse(userStr);
    u.state = Number(u.state);
    if (!u.email) {
      u.email = "";
    }
    setUser(u as User);
    // Si state === 1, mostrar modal de cambio de contraseña
    if (u.state === 1) {
      setShowModal(true);
    }
  }, [navigate]);

  // Leer el parámetro ?menu de la URL
  useEffect(() => {
    const menuFromQuery = searchParams.get('menu');
    // Si no viene un valor válido en la URL usar 'control'
    const validMenus = ['control', 'reportes', 'usuarios', 'materiales', 'anuncios', 'accesos', 'ranking'];
    if (menuFromQuery && validMenus.includes(menuFromQuery)) {
      setActiveMenu(menuFromQuery);
    } else {
      setActiveMenu('control');
    }
  }, [searchParams]);

  // Navegar a reportes desde otros componentes
  useEffect(() => {
    const handleNavigateToReports = () => {
      setActiveMenu('reportes');
    };

    window.addEventListener('navigate-to-reports', handleNavigateToReports);
    
    return () => {
      window.removeEventListener('navigate-to-reports', handleNavigateToReports);
    };
  }, []);

  // Prevenir scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'control':
        return (
          <div className="dashboard-content">
            <div className="dashboard-grid">
              {/* Fila 1: Gráficos */}
              <div className="charts-row">
                <RecyclingChart />
                <MostRecycled />
              </div>
              
              {/* Fila 2: Listas */}
              <div className="lists-row">
                <PendingApprovals setActiveMenu={setActiveMenu} />
                <TopRecyclers setActiveMenu={setActiveMenu} />
                <TopCollectors setActiveMenu={setActiveMenu} />
              </div>
            </div>
          </div>
        );
      case 'reportes':
        return <ReportesAdmin />;
      case 'materiales':
        return <MaterialesAdmin />;
      case 'anuncios':
        return <AnnouncementsAdmin />;
      case 'usuarios':
        return <UserManagement />;
      case 'accesos':
        return <CollectorRequests />;
      case 'ranking':
        return <RankingPeriodsAdmin />;
      default:
        return (
          <div className="dashboard-content">
            <div className="dashboard-grid">
              <div className="charts-row">
                <RecyclingChart />
                <MostRecycled />
              </div>
              <div className="lists-row">
                <PendingApprovals />
                <TopRecyclers />
                <TopCollectors />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      {/* Modal de cambio de contraseña */}
      {showModal && user && (
        <ChangePasswordModal
          userId={user.id}
          role={user.role}
        />
      )}

      {/* Botón hamburguesa global para móvil - posicionado para no tapar usuario */}
      <button 
        className={`hamburger-button hamburger-global ${sidebarOpen ? 'hidden-hamburger' : ''}`} 
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Sidebar */}
      <Sidebar 
        onMenuSelect={setActiveMenu} 
        activeMenu={activeMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header - Solo se muestra en Panel de Control */}
        {activeMenu === 'control' && <Header />}
        
        {/* Contenido dinámico */}
        {renderContent()}
      </div>
    </div>
  );
}