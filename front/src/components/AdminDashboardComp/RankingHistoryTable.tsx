import { useEffect, useState } from 'react';
interface Period {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}
import CommonHeader from '../CommonComp/CommonHeader';
import axios from 'axios';
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000' });

interface RankingHistoryTableProps {
  periodoId: number;
}

export default function RankingHistoryTable({ periodoId }: RankingHistoryTableProps) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number>(periodoId);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  // const [selectedRol, setSelectedRol] = useState<'todos' | 1 | 2>('todos');
  const [, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<Record<number, {name: string, email: string}>>({});

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodId) {
      fetchRanking(selectedPeriodId);
    } else {
      setRanking([]);
    }
  }, [selectedPeriodId]);

  const fetchRanking = async (periodId: number) => {
    setLoadingRanking(true);
    try {
      const res = await api.get(`/api/ranking/history/${periodId}`);
      const rankingData = res.data.ranking ? res.data.ranking.slice(0, 10) : [];
      setRanking(rankingData);
      // Obtener info de usuario para cada user_id
  const ids: number[] = Array.from(new Set(rankingData.map((r: {user_id: number}) => r.user_id)));
      const info: Record<number, {name: string, email: string}> = {};
      await Promise.all(ids.map(async (id: number) => {
        try {
          const userRes = await api.get(`/api/users/${id}`);
          info[Number(id)] = {
            name: userRes.data.user?.name || '',
            email: userRes.data.user?.email || ''
          };
        } catch {
          info[Number(id)] = {name: '', email: ''};
        }
      }));
      setUserInfo(info);
    } catch (err) {
      setRanking([]);
      setError('Error al cargar el ranking histórico');
    } finally {
      setLoadingRanking(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const res = await api.get('/api/ranking/periods');
      setPeriods(res.data.periods || []);
    } catch (err) {
      setPeriods([]);
    }
  };

  // Filtrar ranking por rol
  // const filteredRanking = selectedRol === 'todos' ? ranking : ranking.filter(r => r.rol === selectedRol);

  return (
  <div className="ranking-history-dashboard" style={{paddingLeft: '2.5rem', paddingRight: '2.5rem'}}>
      <div className="ranking-history-main">
        <CommonHeader title="Ranking Histórico" searchPlaceholder="Buscar..." searchQuery="" onSearch={() => {}} />
        <div className="ranking-history-content">
          <div className="ranking-history-panel">
            <div className="ranking-history-header">
              <label style={{ fontWeight: 600, marginRight: 8 }}>Periodo:</label>
              <select
                value={selectedPeriodId ?? ''}
                onChange={e => setSelectedPeriodId(Number(e.target.value))}
                className="form-select"
                style={{ maxWidth: 220 }}
              >
                <option value="">Selecciona un periodo</option>
                {periods.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.estado === 'activo' ? `Actual (${p.id})` : `Cerrado (${p.id})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="ranking-history-tables">
              <div className="ranking-table-panel">
                <h5 style={{ fontWeight: 700, color: '#149D52' }}>Top 10 Recicladores</h5>
                {loadingRanking && <div className="ranking-loading">Cargando ranking...</div>}
                {!loadingRanking && selectedPeriodId && (
                  ranking.filter(r => r.rol === 'reciclador').length > 0 ? (
                    <table className="table table-bordered table-hover ranking-table">
                      <thead className="table-light">
                        <tr>
                          <th>Posición</th>
                          <th>User ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Puntaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.filter(r => r.rol === 'reciclador').slice(0, 10).map(r => (
                          <tr key={r.user_id}>
                            <td><span className="badge bg-success">{r.posicion}</span></td>
                            <td>{r.user_id}</td>
                            <td>{userInfo[r.user_id]?.name || ''}</td>
                            <td>{userInfo[r.user_id]?.email || ''}</td>
                            <td><span className="badge bg-primary">{r.puntaje_final}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div className="ranking-empty">No hay recicladores en este periodo.</div>
                )}
              </div>
              <div className="ranking-table-panel">
                <h5 style={{ fontWeight: 700, color: '#149D52' }}>Top 10 Recolectores</h5>
                {loadingRanking && <div className="ranking-loading">Cargando ranking...</div>}
                {!loadingRanking && selectedPeriodId && (
                  ranking.filter(r => r.rol === 'recolector').length > 0 ? (
                    <table className="table table-bordered table-hover ranking-table">
                      <thead className="table-light">
                        <tr>
                          <th>Posición</th>
                          <th>User ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Puntaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.filter(r => r.rol === 'recolector').slice(0, 10).map(r => (
                          <tr key={r.user_id}>
                            <td><span className="badge bg-warning text-dark">{r.posicion}</span></td>
                            <td>{r.user_id}</td>
                            <td>{userInfo[r.user_id]?.name || ''}</td>
                            <td>{userInfo[r.user_id]?.email || ''}</td>
                            <td><span className="badge bg-primary">{r.puntaje_final}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div className="ranking-empty">No hay recolectores en este periodo.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
