import './AdminDashboard.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TopRecyclers({ setActiveMenu }: { setActiveMenu?: (menu: string) => void }) {
  const [recyclers, setRecyclers] = useState([]);
  const [periodLabel, setPeriodLabel] = useState('');

  useEffect(() => {
    async function fetchRanking() {
      try {
        const periodsRes = await axios.get('http://localhost:3000/api/ranking/periods');
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
          rankingRes = await axios.get(`http://localhost:3000/api/ranking/live/${period.id}`);
          setRecyclers(rankingRes.data.recicladores || []);
        } else {
          rankingRes = await axios.get(`http://localhost:3000/api/ranking/tops/${period.id}`);
          setRecyclers((rankingRes.data.tops || []).filter((r: any) => r.rol === 'reciclador'));
        }
      } catch (err) {
        setRecyclers([]);
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
      <h2 className="card-title">Top Recicladores</h2>
      <p className="card-subtitle">{periodLabel}</p>
      <div className="list-container">
        {recyclers.slice(0, 3).map((recycler: any, idx) => (
          <div key={idx} className="list-item">
            <div className="list-item-content">
              <div className="list-item-info">
                <div className="list-item-avatar avatar-dark">
                  <span>{recycler.email?.slice(0,2).toUpperCase() || '?'}</span>
                </div>
                <span className="list-item-name">{recycler.email}</span>
              </div>
              <span className="list-item-amount">{recycler.puntaje_final}</span>
            </div>
          </div>
        ))}
      </div>
      {recyclers.length > 3 && (
        <button className="view-more-btn" onClick={goToPeriods}>
          Ver más
        </button>
      )}
    </div>
  );
}