import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import CommonHeader from '../CommonComp/CommonHeader';
import * as reportService from '../../services/reportService';

export default function ReportesAdmin() {
  const [selectedReport, setSelectedReport] = useState('materiales');
  const [dateFrom, setDateFrom] = useState('2025-12-01');
  const [dateTo, setDateTo] = useState('2025-12-06');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para datos dinámicos
  const [materialesData, setMaterialesData] = useState<any[]>([]);
  const [recolectoresData, setRecolectoresData] = useState<any[]>([]);
  const [citasData, setCitasData] = useState<any[]>([]);
  const [puntuacionesData, setPuntuacionesData] = useState<any[]>([]);

  // Tipos de reportes disponibles
  const reportTypes = [
    { id: 'materiales', label: '📦 Materiales', icon: '📦' },
    { id: 'recolectores', label: '🏆 Recolectores Top', icon: '🏆' },
    { id: 'citas', label: '📈 Citas/Solicitudes', icon: '📈' },
    { id: 'puntuaciones', label: '⭐ Puntuaciones', icon: '⭐' }
  ];

  /**
   * Cargar datos del reporte seleccionado
   */
  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateFrom, dateTo]);

  /**
   * Cargar datos según el reporte seleccionado
   */
  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📊 Cargando reporte: ${selectedReport}`);

      switch (selectedReport) {
        case 'materiales':
          const materiales = await reportService.getMaterialesReport(dateFrom, dateTo);
          setMaterialesData(materiales);
          break;

        case 'recolectores':
          const recolectores = await reportService.getRecolectoresReport(dateFrom, dateTo, 5);
          setRecolectoresData(recolectores);
          break;

        case 'citas':
          const citas = await reportService.getCitasReport(dateFrom, dateTo);
          setCitasData(citas);
          break;

        case 'puntuaciones':
          const puntuaciones = await reportService.getPuntuacionesReport(dateFrom, dateTo);
          setPuntuacionesData(puntuaciones);
          break;

        default:
          break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el reporte';
      setError(message);
      console.error('❌ Error cargando reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar reporte en PDF
   */
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await reportService.downloadReportPDF(selectedReport, dateFrom, dateTo);
      alert('✅ Reporte descargado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al descargar reporte';
      alert(`❌ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Gráfico Donut
  const renderDonutChart = (data: any[]) => {
    if (!data || data.length === 0) return null;

    let currentOffset = 0;
    const circles = data.map((item: any) => {
      const circumference = 2 * Math.PI * 90;
      const strokeDasharray = (item.percentage / 100) * circumference;
      const strokeDashoffset = currentOffset;
      currentOffset -= strokeDasharray;

      return (
        <circle
          key={item.name}
          cx="140"
          cy="140"
          r="90"
          fill="none"
          stroke={item.color || '#10b981'}
          strokeWidth="60"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 140 140)"
        />
      );
    });

    return circles;
  };

  // Gráfico Pirámide
  const renderPyramid = (data: any[]) => {
    if (!data || data.length === 0) return null;

    const maxWidth = 300;
    const heights = data.map((item: any) => {
      return {
        ...item,
        width: (item.percentage / 100) * maxWidth
      };
    });

    return heights.map((item: any, idx: number) => {
      const yPosition = idx * 50 + 30;
      const xCenter = 150;
      return (
        <g key={item.name || idx}>
          <rect
            x={xCenter - item.width / 2}
            y={yPosition}
            width={item.width}
            height="45"
            fill={['#149D52', '#0d7d3a', '#dcfce7', '#a7f3d0', '#e8f5e9'][idx % 5]}
            opacity="0.8"
          />
          <text
            x={xCenter}
            y={yPosition + 28}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#111827"
          >
            {item.name} ({item.percentage}%)
          </text>
        </g>
      );
    });
  };

  // Gráfico Barras
  const renderBarChart = (data: any[]) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d: any) => (d.completed || 0) + (d.pending || 0) + (d.cancelled || 0)));
    return data.map((item: any, idx: number) => {
      const completedHeight = ((item.completed || 0) / maxValue) * 150;
      const pendingHeight = ((item.pending || 0) / maxValue) * 150;
      const cancelledHeight = ((item.cancelled || 0) / maxValue) * 150;

      return (
        <g key={item.day || idx}>
          <rect
            x={50 + idx * 35}
            y={180 - completedHeight}
            width="8"
            height={completedHeight}
            fill="#22c55e"
          />
          <rect
            x={60 + idx * 35}
            y={180 - completedHeight - pendingHeight}
            width="8"
            height={pendingHeight}
            fill="#fbbf24"
          />
          <rect
            x={70 + idx * 35}
            y={180 - completedHeight - pendingHeight - cancelledHeight}
            width="8"
            height={cancelledHeight}
            fill="#ef4444"
          />
          <text
            x={60 + idx * 35}
            y="200"
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            {item.day || `D${idx + 1}`}
          </text>
        </g>
      );
    });
  };

  // Renderizar gráfico según el tipo de reporte
  const renderChart = () => {
    switch (selectedReport) {
      case 'materiales':
        return (
          <svg width="280" height="280" viewBox="0 0 280 280" style={{ margin: '0 auto', display: 'block' }}>
            {renderDonutChart(materialesData)}
          </svg>
        );
      case 'recolectores':
        return (
          <svg width="400" height="320" viewBox="0 0 400 320" style={{ margin: '0 auto', display: 'block' }}>
            {renderPyramid(recolectoresData)}
          </svg>
        );
      case 'citas':
        return (
          <svg width="700" height="250" viewBox="0 0 700 250" style={{ margin: '0 auto', display: 'block' }}>
            <line x1="40" y1="180" x2="650" y2="180" stroke="#e5e7eb" strokeWidth="1" />
            {renderBarChart(citasData)}
          </svg>
        );
      case 'puntuaciones':
        return (
          <svg width="280" height="280" viewBox="0 0 280 280" style={{ margin: '0 auto', display: 'block' }}>
            {renderDonutChart(puntuacionesData)}
          </svg>
        );
      default:
        return null;
    }
  };

  // Renderizar tabla según el tipo de reporte
  const renderTable = () => {
    switch (selectedReport) {
      case 'materiales':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#dcfce7', borderBottom: '2px solid #149D52' }}>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Material</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Kg</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {materialesData.length > 0 ? (
                materialesData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#FAF8F1' : 'white' }}>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#374151', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color || '#10b981' }}></div>
                      {item.name}
                    </td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right' }}>{(item.kg || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right', fontWeight: '600' }}>{item.percentage || 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Sin datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case 'recolectores':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#dcfce7', borderBottom: '2px solid #149D52' }}>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Rank</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Recolector</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Kg</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {recolectoresData.length > 0 ? (
                recolectoresData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#FAF8F1' : 'white' }}>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>🥇 #{item.rank || idx + 1}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right' }}>{(item.kg || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right', fontWeight: '600' }}>{item.percentage || 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Sin datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case 'citas':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#dcfce7', borderBottom: '2px solid #149D52' }}>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Día</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>✅ Completadas</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>⏳ Pendientes</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>❌ Canceladas</th>
              </tr>
            </thead>
            <tbody>
              {citasData.length > 0 ? (
                citasData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#FAF8F1' : 'white' }}>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>{item.day}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#22c55e', textAlign: 'right', fontWeight: '600' }}>{item.completed || 0}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#fbbf24', textAlign: 'right', fontWeight: '600' }}>{item.pending || 0}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#ef4444', textAlign: 'right', fontWeight: '600' }}>{item.cancelled || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Sin datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case 'puntuaciones':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#dcfce7', borderBottom: '2px solid #149D52' }}>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Clasificación</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>Cantidad</th>
                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#149D52' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {puntuacionesData.length > 0 ? (
                puntuacionesData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#FAF8F1' : 'white' }}>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>{item.label} ({item.stars}⭐)</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right' }}>{item.count || 0}</td>
                    <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'right', fontWeight: '600' }}>{item.percentage || 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Sin datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  // Obtener título del reporte actual
  const getReportTitle = () => {
    const report = reportTypes.find(r => r.id === selectedReport);
    return report?.label || 'Reportes';
  };

  // Calcular resumen según reporte
  const getReportSummary = () => {
    switch (selectedReport) {
      case 'materiales':
        const totalKgMat = materialesData.reduce((sum, item) => sum + (item.kg || 0), 0);
        return {
          stat1: { label: 'Total Reciclado', value: `${totalKgMat.toLocaleString()} kg`, color: '#149D52' },
          stat2: { label: 'Materiales Únicos', value: materialesData.length, color: '#10b981' }
        };

      case 'recolectores':
        const leader = recolectoresData[0];
        return {
          stat1: { label: 'Líder', value: leader?.name || 'N/A', color: '#149D52' },
          stat2: { label: 'Kg Recolectados', value: `${(leader?.kg || 0).toLocaleString()} kg`, color: '#10b981' }
        };

      case 'citas':
        const completedCitas = citasData.reduce((sum, item) => sum + (item.completed || 0), 0);
        const pendingCitas = citasData.reduce((sum, item) => sum + (item.pending || 0), 0);
        return {
          stat1: { label: 'Completadas', value: completedCitas, color: '#22c55e' },
          stat2: { label: 'Pendientes', value: pendingCitas, color: '#fbbf24' }
        };

      case 'puntuaciones':
        const avgScore = puntuacionesData.length > 0
          ? (puntuacionesData.reduce((sum, item) => sum + (item.stars * item.count), 0) / 
             puntuacionesData.reduce((sum, item) => sum + item.count, 0)).toFixed(1)
          : 0;
        const totalRatings = puntuacionesData.reduce((sum, item) => sum + (item.count || 0), 0);
        return {
          stat1: { label: 'Promedio', value: `${avgScore} ⭐`, color: '#149D52' },
          stat2: { label: 'Total Evaluaciones', value: totalRatings, color: '#10b981' }
        };

      default:
        return null;
    }
  };

  const summary = getReportSummary();

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FAF8F1',
      overflow: 'hidden',
      height: '100vh'
    }}>
      {/* Header */}
      <CommonHeader
        title="Reportes"
        searchPlaceholder="Buscar reporte..."
        searchQuery={searchTerm}
        onSearch={(term) => setSearchTerm(term)}
        onCreateNew={() => {}}
        createButtonText="+ Descargar PDF"
      />

      {/* Error Banner */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fecaca'
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            gap: '1rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #149D52',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280' }}>Cargando reporte...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem',
            height: 'fit-content'
          }}>
            {/* Chart & Table Section */}
            <div>
              {/* Report Type Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h2 style={{
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  color: '#149D52',
                  margin: 0
                }}>
                  {getReportTitle()}
                </h2>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Filters */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Período:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem'
                  }}
                />
                <span style={{ color: '#6b7280', fontWeight: '500' }}>-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem'
                  }}
                />
                <button 
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: loading ? '#d1d5db' : '#149D52',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Download size={16} />
                  Descargar
                </button>
              </div>

              {/* Chart */}
              <div style={{
                overflow: 'hidden',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#149D52',
                  margin: '0 0 1.5rem 0'
                }}>
                  Visualización
                </h3>
                {renderChart()}
              </div>

              {/* Table */}
              <div style={{
                overflow: 'hidden',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white'
              }}>
                <div style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#FAF8F1'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#149D52',
                    margin: 0
                  }}>
                    Detalles
                  </h3>
                </div>
                {renderTable()}
              </div>
            </div>

            {/* Right Sidebar - Summary */}
            {summary && (
              <div>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#149D52',
                      margin: 0
                    }}>
                      Resumen
                    </h3>
                  </div>

                  {/* Summary Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '0.5rem',
                      borderLeft: `4px solid ${summary.stat1.color}`
                    }}>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>{summary.stat1.label}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: summary.stat1.color, margin: 0 }}>{summary.stat1.value}</p>
                    </div>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '0.5rem',
                      borderLeft: `4px solid ${summary.stat2.color}`
                    }}>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>{summary.stat2.label}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: summary.stat2.color, margin: 0 }}>{summary.stat2.value}</p>
                    </div>
                  </div>

                  {/* Period Info */}
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500', margin: '0 0 0.5rem 0' }}>Período de reporte</p>
                    <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>
                      {new Date(dateFrom).toLocaleDateString('es-ES')} al {new Date(dateTo).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS para animación de carga */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
