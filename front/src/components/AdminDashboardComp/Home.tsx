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
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('control');

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
      {/* Sidebar - Siempre visible */}
      <Sidebar onMenuSelect={setActiveMenu} activeMenu={activeMenu} />
      
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