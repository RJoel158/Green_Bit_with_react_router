import { useState, useEffect } from 'react';
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
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('control');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                <PendingApprovals />
                <TopRecyclers />
                <TopCollectors />
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
      {/* Botón para móvil */}
      <button 
        className="hamburger-button" 
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