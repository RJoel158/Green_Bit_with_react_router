import Sidebar from './Sidebar';
import Header from './Header';
import RecyclingChart from './RecyclingChart';
import MostRecycled from './MostRecycled';
import PendingApprovals from './PendingApprovals';
import TopRecyclers from './TopRecyclers';
import TopCollectors from './TopCollectors';
import './AdminDashboard1.css';

export default function Home() {
  return (
    <div className="dashboard">
      {/* Sidebar - Siempre visible */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="main-content">
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