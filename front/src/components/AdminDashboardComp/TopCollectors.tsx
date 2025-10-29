import './AdminDashboard.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TopCollectors({ setActiveMenu }: { setActiveMenu?: (menu: string) => void }) {
  const [collectors, setCollectors] = useState([]);
  const [periodLabel, setPeriodLabel] = useState('');

  useEffect(() => {
    async function fetchRanking() {
      try {
  const periodsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/ranking/periods`);
        const periods = periodsRes.data.periods || [];
  let period = periods.find((p: any) => p.estado === 'activo');
        if (!period) {
          const closedPeriods = periods.filter((p: any) => p.estado === 'cerrado');
          period = closedPeriods[closedPeriods.length - 1];
        }
        if (!period) return;
        setPeriodLabel(period.estado === 'activo' ? 'Periodo activo' : `Temporada ${period.id}`);
        let rankingRes;
        if (period.estado === 'activo') {
          rankingRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/ranking/live/${period.id}`);
          setCollectors(rankingRes.data.recolectores || []);
        } else {
          rankingRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/ranking/tops/${period.id}`);
          setCollectors((rankingRes.data.tops || []).filter((r: any) => r.rol === 'recolector'));
        }
      } catch (err) {
        setCollectors([]);
      }
    }
    fetchRanking();
  }, []);

  const goToPeriods = () => {
    if (setActiveMenu) setActiveMenu('ranking');
    else window.dispatchEvent(new CustomEvent('navigate-to-ranking'));
  };

  return (
    <div className="card">
      <h2 className="card-title">Top Colectores</h2>
      <p className="card-subtitle">{periodLabel}</p>
      <div className="list-container">
        {collectors.slice(0, 3).map((collector: any, idx) => (
          <div key={idx} className="list-item">
            <div className="list-item-content">
              <div className="list-item-info">
                <div className="list-item-avatar avatar-blue">
                  <span>{collector.email?.slice(0,2).toUpperCase() || '?'}</span>
                </div>
                <span className="list-item-name">{collector.email}</span>
              </div>
              <span className="list-item-amount">{collector.puntaje_final}</span>
            </div>
          </div>
        ))}
      </div>
      {collectors.length > 3 && (
        <button className="view-more-btn" onClick={goToPeriods}>
          Ver más
        </button>
      )}
    </div>
  );
}