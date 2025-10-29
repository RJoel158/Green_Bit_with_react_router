import { useEffect, useState } from 'react';
import './AdminDashboard.css';

interface Period {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

interface UserRanking {
  user_id: number;
  rol: string;
  puntaje_final: number;
}

export default function LiveRankingAdmin() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [recicladores, setRecicladores] = useState<UserRanking[]>([]);
  const [recolectores, setRecolectores] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/ranking/periods')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPeriods(data.periods);
      });
  }, []);

  useEffect(() => {
    if (!selectedPeriod) return;
    setLoading(true);
    fetch(`/api/ranking/live/${selectedPeriod}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setRecicladores(data.recicladores);
          setRecolectores(data.recolectores);
        } else {
          setRecicladores([]);
          setRecolectores([]);
        }
      });
  }, [selectedPeriod]);

  return (
    <div className="card">
      <h2 className="card-title">Ranking en Tiempo Real</h2>
      <p className="card-subtitle">Selecciona un periodo para ver el ranking</p>
      <select
        className="form-control mb-3"
        value={selectedPeriod ?? ''}
        onChange={e => setSelectedPeriod(Number(e.target.value))}
      >
        <option value="" disabled>Selecciona periodo</option>
        {periods.map(period => (
          <option key={period.id} value={period.id}>
            {period.fecha_inicio.slice(0,10)} a {period.fecha_fin.slice(0,10)} ({period.estado})
          </option>
        ))}
      </select>
      {loading ? <div>Cargando ranking...</div> : (
        <>
          <div className="list-container">
            <h3 className="card-title">Top Recicladores</h3>
            {recicladores.length === 0 && <div>No hay datos.</div>}
            {recicladores.map((user) => (
              <div key={user.user_id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-info">
                    <div className="list-item-avatar avatar-dark">
                      <span>{user.user_id}</span>
                    </div>
                    <span className="list-item-name">{user.rol}</span>
                  </div>
                  <span className="list-item-amount">{user.puntaje_final}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="list-container mt-4">
            <h3 className="card-title">Top Recolectores</h3>
            {recolectores.length === 0 && <div>No hay datos.</div>}
            {recolectores.map((user) => (
              <div key={user.user_id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-info">
                    <div className="list-item-avatar avatar-blue">
                      <span>{user.user_id}</span>
                    </div>
                    <span className="list-item-name">{user.rol}</span>
                  </div>
                  <span className="list-item-amount">{user.puntaje_final}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
