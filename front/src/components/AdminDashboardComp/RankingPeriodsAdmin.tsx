import React, { useEffect, useState } from 'react';
import CommonHeader from '../CommonComp/CommonHeader';
import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

interface Period {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  creado_por?: number;
}

interface RankingItem {
  user_id: number;
  email: string;
  rol: string;
  puntaje_final: number;
}

interface RankingData {
  recicladores: RankingItem[];
  recolectores: RankingItem[];
}

// Utilidad para mostrar fecha legible
function formatDateDisplay(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace(' ', 'T'));
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const RankingPeriodsAdmin: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [ranking, setRanking] = useState<RankingData>({ recicladores: [], recolectores: [] });
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodId) {
      const period = periods.find(p => p.id === selectedPeriodId);
      if (period) {
        if (period.estado === 'cerrado') {
          fetchHistoricalRanking(selectedPeriodId);
        } else {
          fetchLiveRanking(selectedPeriodId);
        }
      }
    } else {
      setRanking({ recicladores: [], recolectores: [] });
    }
  }, [selectedPeriodId, periods]);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/ranking/periods');
      setPeriods(res.data.periods || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los periodos');
    } finally {
      setLoading(false);
    }
  };

  // Ranking en tiempo real (periodo activo)
  const fetchLiveRanking = async (periodId: number) => {
    setLoadingRanking(true);
    try {
      const res = await api.get(`/api/ranking/live/${periodId}`);
      setRanking({
        recicladores: res.data.recicladores || [],
        recolectores: res.data.recolectores || []
      });
    } catch (err) {
      setRanking({ recicladores: [], recolectores: [] });
    } finally {
      setLoadingRanking(false);
    }
  };

  // Ranking histórico (periodo cerrado)
  const fetchHistoricalRanking = async (periodId: number) => {
    setLoadingRanking(true);
    try {
      const res = await api.get(`/api/ranking/tops/${periodId}`);
      // Agrupa por rol
      const recicladores = res.data.tops.filter((r: any) => r.rol === 'reciclador');
      const recolectores = res.data.tops.filter((r: any) => r.rol === 'recolector');
      setRanking({ recicladores, recolectores });
    } catch (err) {
      setRanking({ recicladores: [], recolectores: [] });
    } finally {
      setLoadingRanking(false);
    }
  };

  const handleStartPeriod = async () => {
    setMensaje('');
    try {
      await api.post('/api/ranking/periods', {
        fecha_inicio: new Date().toISOString().slice(0, 19).replace('T', ' '),
        estado: 'activo'
      });
      fetchPeriods();
      setMensaje('✅ Periodo iniciado correctamente');
    } catch (err) {
      setMensaje('❌ Error al iniciar periodo');
    }
  };

  const handleClose = async (id: number) => {
    if (!window.confirm('¿Cerrar este periodo? Se guardará el ranking histórico.')) return;
    setMensaje('');
    setLoadingRanking(true);
    try {
      await api.post('/api/ranking/periods/close', { periodo_id: id });
      await fetchPeriods();
      setMensaje('Periodo cerrado y ranking guardado');
    } catch (err) {
      setMensaje('Error al cerrar periodo');
    } finally {
      setLoadingRanking(false);
    }
  };

  // Filtrar periodos eliminados (solo mostrar 'activo' y 'cerrado')
  const visiblePeriods = periods.filter(p => p.estado === 'activo' || p.estado === 'cerrado');

  return (
    <div
      className="ranking-periods-dashboard"
      style={{
        paddingLeft: '2.5rem',
        paddingRight: '2.5rem',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}
    >
      <CommonHeader
        title="Gestión de Periodos de Ranking"
        searchPlaceholder="Buscar periodo..."
        searchQuery=""
        onSearch={() => {}}
      />
      <div className="card mb-4 p-4">
        <button
          className="btn btn-success mb-3"
          disabled={periods.some(p => p.estado === 'activo')}
          onClick={handleStartPeriod}
        >
          Empezar nueva temporada
        </button>
        {mensaje && (
          <div className={`alert mt-2 ${mensaje.startsWith('❌') ? 'alert-danger' : 'alert-success'}`}>{mensaje}</div>
        )}
        <div className="d-flex align-items-center gap-3 mb-3">
          <label style={{ fontWeight: 600 }}>Selecciona periodo:</label>
          <select
            className="form-select"
            style={{ maxWidth: 220 }}
            value={selectedPeriodId ?? ''}
            onChange={e => setSelectedPeriodId(Number(e.target.value))}
          >
            <option value="">-- Selecciona --</option>
            {periods.map(p => (
              <option key={p.id} value={p.id}>
                {`Temporada ${p.id}`}
              </option>
            ))}
          </select>
        </div>
        {selectedPeriodId && (
          <div className="mb-3">
            {(() => {
              const period = periods.find(p => p.id === selectedPeriodId);
              if (!period) return null;
              return (
                <div>
                  <strong>Fecha inicio:</strong> {formatDateDisplay(period.fecha_inicio)}<br />
                  <strong>Fecha fin:</strong> {period.estado === 'cerrado' ? formatDateDisplay(period.fecha_fin) : <span className="badge bg-warning">En curso</span>}
                  {period.estado === 'activo' && (
                    <button className="btn btn-warning ms-3" onClick={() => handleClose(period.id)}>Cerrar periodo</button>
                  )}
                </div>
              );
            })()}
          </div>
        )}
        {/* Ranking por periodo */}
        {selectedPeriodId && (
          <div className="row">
            <div className="col-md-6">
              <div className="card mb-4" style={{ minHeight: 350, overflowX: 'auto' }}>
                <div className="card-body">
                  <h5 className="card-title">Top 10 Recicladores</h5>
                  <div className="table-responsive" style={{ maxHeight: 300, overflowY: 'auto', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {loadingRanking ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <span className="spinner-border spinner-border-sm" /> Procesando ranking...
                      </div>
                    ) : (
                      <table className="table table-bordered table-hover ranking-table user-management-table" style={{ minWidth: 350, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <thead className="table-light" style={{ background: 'linear-gradient(90deg, #b2f7ef 0%, #e3f6ed 100%)', color: '#1b6d4b', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                          <tr>
                            <th style={{ width: 80, textAlign: 'center', borderTopLeftRadius: 16, background: 'inherit', color: 'inherit' }}>Posición</th>
                            <th style={{ minWidth: 220, background: 'inherit', color: 'inherit' }}>Correo</th>
                            <th style={{ width: 100, textAlign: 'center', borderTopRightRadius: 16, background: 'inherit', color: 'inherit' }}>Puntaje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranking.recicladores && ranking.recicladores.length > 0 ? (
                            ranking.recicladores.map((r, idx) => (
                              <tr key={r.user_id}>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="badge bg-success">{idx + 1}</span>
                                </td>
                                <td style={{ wordBreak: 'break-all' }}>{r.email}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="badge bg-primary">{r.puntaje_final}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center">No hay recicladores en este periodo.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card mb-4" style={{ minHeight: 350, overflowX: 'auto' }}>
                <div className="card-body">
                  <h5 className="card-title">Top 10 Recolectores</h5>
                  <div className="table-responsive" style={{ maxHeight: 300, overflowY: 'auto', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {loadingRanking ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <span className="spinner-border spinner-border-sm" /> Procesando ranking...
                      </div>
                    ) : (
                      <table className="table table-bordered table-hover ranking-table user-management-table" style={{ minWidth: 350, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <thead className="table-light" style={{ background: 'linear-gradient(90deg, #b2f7ef 0%, #e3f6ed 100%)', color: '#1b6d4b', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                          <tr>
                            <th style={{ width: 80, textAlign: 'center', borderTopLeftRadius: 16, background: 'inherit', color: 'inherit' }}>Posición</th>
                            <th style={{ minWidth: 220, background: 'inherit', color: 'inherit' }}>Correo</th>
                            <th style={{ width: 100, textAlign: 'center', borderTopRightRadius: 16, background: 'inherit', color: 'inherit' }}>Puntaje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranking.recolectores && ranking.recolectores.length > 0 ? (
                            ranking.recolectores.map((r, idx) => (
                              <tr key={r.user_id}>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="badge bg-warning text-dark">{idx + 1}</span>
                                </td>
                                <td style={{ wordBreak: 'break-all' }}>{r.email}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="badge bg-primary">{r.puntaje_final}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center">No hay recolectores en este periodo.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Tabla de periodos (gestión) */}
      <div className="ranking-periods-panel mt-4">
        {loading ? <div className="ranking-loading">Cargando...</div> : error ? <div className="alert alert-danger">{error}</div> : (
          <table className="table table-bordered table-hover ranking-table user-management-table" style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <thead className="table-light" style={{ background: 'linear-gradient(90deg, #b2f7ef 0%, #e3f6ed 100%)', color: '#1b6d4b', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <tr>
                <th style={{ background: 'inherit', color: 'inherit', borderTopLeftRadius: 16 }}>Inicio</th>
                <th style={{ background: 'inherit', color: 'inherit' }}>Fin</th>
                <th style={{ background: 'inherit', color: 'inherit' }}>Estado</th>
                <th style={{ background: 'inherit', color: 'inherit', borderTopRightRadius: 16 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visiblePeriods.map(period => (
                <tr key={period.id}>
                  <td>{formatDateDisplay(period.fecha_inicio)}</td>
                  <td>{period.estado === 'cerrado' ? formatDateDisplay(period.fecha_fin) : <span className="badge bg-warning">En curso</span>}</td>
                  <td>
                    <span className={`badge ${period.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>{period.estado}</span>
                  </td>
                  <td>
                    {period.estado === 'activo' && (
                      <button className="btn btn-warning btn-sm" onClick={() => handleClose(period.id)}><i className="bi bi-lock"></i> Cerrar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RankingPeriodsAdmin;
