import Sidebar from './Sidebar';
import Header from './Header';
import RecyclingChart from './RecyclingCharts';
import MostRecycled from './MostRecycled';
import PendingApprovals from './PendingApprovals';
import TopRecyclers from './TopRecyclers';
import TopCollectors from './TopCollectors';
import './AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <div className="dashboard">
      {/* Sidebar - Siempre visible */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <Header />
        
        {/* Dashboard Content */}
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
      </div>
    </div>
  );
}