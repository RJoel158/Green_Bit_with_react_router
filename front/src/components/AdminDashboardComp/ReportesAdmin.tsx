import { useState, useEffect, useRef } from 'react';
import CommonHeader from '../CommonComp/CommonHeader';
import * as reportService from '../../services/reportService';
import './AdminReports.css';

export default function ReportesAdmin() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialesData, setMaterialesData] = useState<any[]>([]);
  const [scoresData, setScoresData] = useState<any | null>(null);
  const [collectionsData, setCollectionsData] = useState<any | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'materiales' | 'scores' | 'recolecciones'>('materiales');
  const reportRef = useRef<HTMLDivElement>(null);

  // Obtener userId y rol del usuario autenticado
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const currentUser = JSON.parse(userString);
        setUserId(currentUser.id);
        setIsAdmin(currentUser.role === 'admin');
        console.log('[DEBUG] Usuario:', { id: currentUser.id, role: currentUser.role, isAdmin: currentUser.role === 'admin' });
      } catch (err) {
        console.error('Error al parsear usuario:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (userId !== null) {
      loadData();
    }
  }, [dateFrom, dateTo, userId, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userIdToFilter = isAdmin ? undefined : userId || undefined;

      if (activeTab === 'materiales') {
        const data = await reportService.getMaterialesReport(dateFrom, dateTo, userIdToFilter);
        setMaterialesData(data);
        console.log('[DEBUG] Materiales cargados:', { count: data.length });
      } else if (activeTab === 'scores') {
        const data = await reportService.getScoresReport(userIdToFilter);
        setScoresData(data);
        console.log('[DEBUG] Scores cargados:', data);
      } else if (activeTab === 'recolecciones') {
        const data = await reportService.getCollectionsReport(dateFrom, dateTo);
        setCollectionsData(data);
        console.log('[DEBUG] Collections loaded:', data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============ DESCARGAR PDF ============
  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      // Dinámicamente importar html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#FAF8F1',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Reporte_${activeTab === 'materiales' ? 'Materiales' : activeTab === 'scores' ? 'Calificaciones' : 'Recolecciones'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
    }
  };

  // ============ GRÁFICO DONUT MEJORADO CON LEYENDA ============
  const renderDonut = () => {
    if (!materialesData?.length) return null;

    const centerX = 140;
    const centerY = 140;
    const radius = 90;
    let startAngle = -Math.PI / 2;

    return materialesData.map((item: any) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = `
        M ${centerX} ${centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;

      startAngle = endAngle;

      return (
        <path
          key={item.name}
          d={pathData}
          fill={item.color || '#10b981'}
          stroke="white"
          strokeWidth="2"
          className="reportes-donut-path"
        />
      );
    });
  };

  // ============ GRÁFICO DE BARRAS PARA SCORES ============
  const renderScoresChart = () => {
    if (!scoresData) return null;

    const maxScore = 5;
    const chartWidth = 500;
    const chartHeight = 300;
    const barWidth = 50;
    const barSpacing = 80;
    const startX = 50;
    const startY = 250;

    const counts = [1, 2, 3, 4, 5].map(score => scoresData[`count_${score}`] || 0);
    const maxCount = Math.max(...counts, 1);

    return (
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Ejes */}
        <line x1="40" y1="20" x2="40" y2={startY} stroke="#d1d5db" strokeWidth="2" />
        <line x1="40" y1={startY} x2={chartWidth} y2={startY} stroke="#d1d5db" strokeWidth="2" />

        {/* Grid horizontal */}
        {[1, 2, 3, 4, 5].map((score) => {
          const y = startY - (score / maxScore) * 200;
          return (
            <g key={`grid-${score}`}>
              <line x1="35" y1={y} x2={chartWidth - 10} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x="10" y={y + 5} fontSize="12" textAnchor="end" fill="#9ca3af">
                {score}
              </text>
            </g>
          );
        })}

        {/* Barras */}
        {[1, 2, 3, 4, 5].map((score) => {
          const count = scoresData[`count_${score}`] || 0;
          const height = maxCount > 0 ? (count / maxCount) * 200 : 0;
          const x = startX + score * barSpacing;
          const y = startY - height;
          const color = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'][score - 1];

          return (
            <g key={`bar-${score}`}>
              <rect x={x - barWidth / 2} y={y} width={barWidth} height={height} fill={color} rx="4" />
              <text x={x} y={startY + 20} fontSize="14" fontWeight="bold" textAnchor="middle" fill="#374151">
                ⭐{score}
              </text>
              <text x={x} y={y - 5} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#374151">
                {count}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderCollectionsChart = () => {
    if (!collectionsData || !collectionsData.data || collectionsData.data.length === 0) {
      return <p className="reportes-no-data">No hay datos para mostrar</p>;
    }

    const data = collectionsData.data;
    const chartWidth = 600;
    const chartHeight = 300;
    const maxCount = Math.max(...data.map((d: any) => d.count), 1);
    
    // Calcular dinámicamente el ancho y espaciado de las barras
    const totalBars = data.length;
    const leftMargin = 70; 
    const rightMargin = 30; 
    const availableWidth = chartWidth - leftMargin - rightMargin;
    const barWidth = Math.min(60, Math.max(20, availableWidth / totalBars * 0.6)); 
    const barSpacing = availableWidth / totalBars;
    
    const startX = leftMargin + barSpacing / 2; 
    const startY = 250;
    const chartAreaHeight = 200;

    return (
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Ejes principales */}
        <line x1={leftMargin - 10} y1="20" x2={leftMargin - 10} y2={startY} stroke="#d1d5db" strokeWidth="2" />
        <line x1={leftMargin - 10} y1={startY} x2={chartWidth - rightMargin} y2={startY} stroke="#d1d5db" strokeWidth="2" />

        {/* Grid horizontal con valores */}
        {[0, 1, 2, 3, 4, 5].map((level) => {
          const y = startY - (level / 5) * chartAreaHeight;
          const value = Math.round((level / 5) * maxCount);
          return (
            <g key={`grid-${level}`}>
              <line x1={leftMargin - 15} y1={y} x2={chartWidth - rightMargin} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={leftMargin - 20} y={y + 5} fontSize="11" textAnchor="end" fill="#9ca3af" fontWeight="500">
                {value}
              </text>
            </g>
          );
        })}

        {/* Barras con animación y degradado */}
        {data.map((item: any, index: number) => {
          const height = maxCount > 0 ? (item.count / maxCount) * chartAreaHeight : 0;
          const x = startX + index * barSpacing;
          const y = startY - height;
          
          // Formatear fecha de manera más limpia
          const date = new Date(item.date);
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const dateLabel = `${day}/${month}`;

          return (
            <g key={`bar-${index}`}>
              {/* Barra con bordes redondeados */}
              <rect 
                x={x - barWidth / 2} 
                y={y} 
                width={barWidth} 
                height={Math.max(height, 2)} 
                fill={item.color} 
                rx="6"
                opacity="0.9"
              />
              
              {/* Highlight en la parte superior de la barra */}
              <rect 
                x={x - barWidth / 2 + 2} 
                y={y + 2} 
                width={barWidth - 4} 
                height={Math.min(height * 0.3, 20)} 
                fill="white" 
                rx="4"
                opacity="0.2"
              />
              
              {/* Etiqueta de fecha */}
              <text 
                x={x} 
                y={startY + 15} 
                fontSize="11" 
                fontWeight="600" 
                textAnchor="middle" 
                fill="#374151"
              >
                {dateLabel}
              </text>
              
              {/* Valor en la parte superior de la barra */}
              {height > 15 && (
                <text 
                  x={x} 
                  y={y - 8} 
                  fontSize="12" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  fill="#374151"
                >
                  {item.count}
                </text>
              )}
              
              {/* Si la barra es muy pequeña, mostrar el valor al lado */}
              {height <= 15 && height > 0 && (
                <text 
                  x={x} 
                  y={startY - 10} 
                  fontSize="12" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  fill="#374151"
                >
                  {item.count}
                </text>
              )}
            </g>
          );
        })}

        {/* Etiqueta del eje Y */}
        <text 
          x={leftMargin - 50} 
          y="15" 
          fontSize="11" 
          fill="#6b7280" 
          fontWeight="600"
        >
          📊
        </text>
      </svg>
    );
  };

  const total = materialesData.reduce((s: number, i: any) => s + (i.kg || 0), 0);
  const topMaterial = materialesData[0] || null;

  return (
    <div className="admin-reports-container">
      <CommonHeader title="Reportes" searchPlaceholder="Buscar..." searchQuery="" onSearch={() => { }} onCreateNew={() => { }} createButtonText="Actualizar" />

      <div className="admin-reports-content" ref={reportRef}>
        {/* Tabs + Botón PDF */}
        <div className="admin-reports-tabs-container">
          <div className="admin-reports-tabs">
            <button
              onClick={() => setActiveTab('materiales')}
              className={`admin-reports-tab ${activeTab === 'materiales' ? 'active' : ''}`}
            >
              📊 Reporte de Materiales
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={`admin-reports-tab ${activeTab === 'scores' ? 'active' : ''}`}
            >
              ⭐ Reporte de Calificaciones
            </button>
            <button
              onClick={() => setActiveTab('recolecciones')}
              className={`admin-reports-tab ${activeTab === 'recolecciones' ? 'active' : ''}`}
            >
              🚛 Reporte de Recolecciones
            </button>
          </div>
          <button
            onClick={downloadPDF}
            disabled={loading || (!materialesData.length && !scoresData && !collectionsData)}
            className="admin-reports-download-btn"
          >
            📥 Descargar PDF
          </button>
        </div>

        {/* Indicador si es admin o no */}
        <div className={`admin-reports-mode-indicator ${isAdmin ? 'admin' : 'user'}`}>
          {isAdmin ? '📊 Modo Administrador - Viendo reportes de TODOS los usuarios' : '👤 Viendo solo tus reportes'}
        </div>

        {/* Filtros */}
        {activeTab === 'materiales' && (
          <div className="admin-reports-filters">
            <div className="admin-reports-filter-field">
              <label className="admin-reports-filter-label">Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="admin-reports-filter-input"
              />
            </div>
            <div className="admin-reports-filter-field">
              <label className="admin-reports-filter-label">Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="admin-reports-filter-input"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="admin-reports-filter-btn"
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        )}

        {activeTab === 'recolecciones' && (
          <div className="admin-reports-filters">
            <div className="admin-reports-filter-field">
              <label className="admin-reports-filter-label">Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="admin-reports-filter-input"
              />
            </div>
            <div className="admin-reports-filter-field">
              <label className="admin-reports-filter-label">Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="admin-reports-filter-input"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="admin-reports-filter-btn"
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        )}

        {error && <div className="admin-reports-error">❌ Error: {error}</div>}

        {/* REPORTE MATERIALES */}
        {activeTab === 'materiales' && !loading && materialesData.length === 0 && !error && (
          <div className="admin-reports-no-data">
            Sin datos disponibles
          </div>
        )}

        {activeTab === 'materiales' && materialesData.length > 0 && (
          <div className="admin-reports-grid-two">
            {/* Gráfico Donut con Leyenda */}
            <div className="admin-reports-card admin-reports-card-center">
              <h3 className="admin-reports-card-title">📊 Distribución de Materiales</h3>
              <svg width="300" height="300" viewBox="0 0 300 300">
                {renderDonut()}
                <circle cx="150" cy="150" r="55" fill="white" />
                <text x="150" y="145" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#149D52">
                  {total}
                </text>
                <text x="150" y="170" textAnchor="middle" fontSize="14" fill="#6b7280" fontWeight="600">
                  items reciclados
                </text>
              </svg>

              {/* Leyenda mejorada */}
              <div className="admin-reports-donut-legend">
                {materialesData.map((item: any, idx: number) => (
                  <div key={idx} className="admin-reports-legend-item">
                    <div
                      className="admin-reports-legend-color"
                      style={{ backgroundColor: item.color || '#10b981' }}
                    />
                    <div className="admin-reports-legend-details">
                      <div className="admin-reports-legend-name">
                        {item.name}
                      </div>
                      <div className="admin-reports-legend-stats">
                        {item.kg} items • {item.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Barras Horizontal */}
            <div className="admin-reports-card">
              <h3 className="admin-reports-card-title">📈 Comparativa de Materiales</h3>

              {/* Box resumen */}
              <div className="admin-reports-summary-box">
                <p className="admin-reports-summary-label">🏆 TOP MATERIAL</p>
                <p className="admin-reports-summary-value">{topMaterial?.name}</p>
                <p className="admin-reports-summary-text">{topMaterial?.kg} items ({topMaterial?.percentage}%)</p>
              </div>

              {/* Barras horizontales */}
              <div className="admin-reports-bars-container">
                {materialesData.map((item: any) => {
                  const percentage = item.percentage;

                  return (
                    <div key={item.id} className="admin-reports-bar-item">
                      <div className="admin-reports-bar-label">{item.name}</div>
                      <div className="admin-reports-bar-track">
                        <div
                          className="admin-reports-bar-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color || '#10b981'
                          }}
                        >
                          {percentage > 15 && (
                            <span className="admin-reports-bar-percentage">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="admin-reports-bar-value">{item.kg} items</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* REPORTE SCORES */}
        {activeTab === 'scores' && !loading && scoresData !== null && (
          <div className="admin-reports-scores-container">
            {/* Primera fila: Gráfico + Estadísticas */}
            <div className="admin-reports-grid-two">
              <div className="admin-reports-scores-card">
                <h3 className="admin-reports-card-title">Distribución de Calificaciones</h3>
                {renderScoresChart()}
              </div>

              <div className="admin-reports-scores-stats">
                <div className="admin-reports-scores-summary">
                  <p className="admin-reports-scores-summary-label">📊 RESUMEN</p>
                  <p className="admin-reports-scores-summary-value">⭐ {scoresData.average.toFixed(1)}</p>
                  <p className="admin-reports-scores-summary-text">Promedio de {scoresData.total} calificaciones</p>
                </div>

                <div className="admin-reports-scores-bars">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const count = scoresData[`count_${score}`] || 0;
                    const percentageNum = scoresData.total > 0 ? ((count / scoresData.total) * 100) : 0;
                    const percentage = parseFloat(percentageNum.toFixed(1));
                    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
                    const color = colors[score - 1];

                    return (
                      <div key={score} className="admin-reports-scores-bar-item">
                        <span className="admin-reports-scores-bar-stars">
                          {'⭐'.repeat(score)}
                        </span>
                        <div className="admin-reports-scores-bar-track">
                          <div
                            className="admin-reports-scores-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: color
                            }}
                          >
                            {percentage > 10 ? `${percentage}%` : ''}
                          </div>
                        </div>
                        <span className="admin-reports-scores-bar-count">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Segunda fila: Tabla detallada de calificaciones */}
            {scoresData.details && scoresData.details.length > 0 && (
              <div className="admin-reports-table-container">
                <h3 className="admin-reports-table-title">📋 Detalles de Calificaciones</h3>
                <div className="admin-reports-table-wrapper">
                  <table className="admin-reports-table">
                    <thead>
                      <tr>
                        <th>⭐ Score</th>
                        <th>👤 Quien Califica</th>
                        <th>→ Calificado A</th>
                        <th>📝 Comentario</th>
                        <th className="center">📅 Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoresData.details.map((detail: any) => {
                        const scoreColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
                        const scoreColor = scoreColors[detail.score - 1];

                        return (
                          <tr key={detail.id}>
                            <td className="score" style={{ color: scoreColor }}>
                              {'⭐'.repeat(detail.score)} {detail.score}
                            </td>
                            <td className="username">
                              {detail.ratedByUsername || `Usuario ${detail.ratedByUserId}`}
                            </td>
                            <td className="username">
                              {detail.ratedToUsername || `Usuario ${detail.ratedToUserId}`}
                            </td>
                            <td className="comment">
                              {detail.comment || '(sin comentario)'}
                            </td>
                            <td className="date">
                              {new Date(detail.createdDate).toLocaleDateString('es-ES')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REPORTE RECOLECCIONES */}
        {activeTab === 'recolecciones' && !loading && collectionsData !== null && (
          <div className="admin-reports-collections-container">
            {/* Primera fila: Gráfico + Estadísticas */}
            <div className="admin-reports-grid-two">
              <div className="admin-reports-collections-chart">
                <h3 className="admin-reports-card-title">🚛 Recolecciones por Fecha</h3>
                {renderCollectionsChart()}
              </div>

              <div className="admin-reports-collections-stats">
                <div className="admin-reports-collections-summary-green">
                  <p className="admin-reports-collections-summary-label green">📊 RESUMEN GENERAL</p>
                  <p className="admin-reports-collections-summary-value large">🚛 {collectionsData.summary.totalCollections} recolecciones</p>
                  <p className="admin-reports-collections-summary-text">En {collectionsData.summary.dayRange} días</p>
                </div>

                <div className="admin-reports-collections-summary-yellow">
                  <p className="admin-reports-collections-summary-label yellow">📈 IDR (Índice Diario de Recolecciones)</p>
                  <p className="admin-reports-collections-summary-value xlarge">{collectionsData.summary.cdi}</p>
                  <p className="admin-reports-collections-summary-text">recolecciones por día en promedio</p>
                </div>

                <div className="admin-reports-collections-info">
                  <p className="admin-reports-collections-info-label">📅 Días con actividad:</p>
                  <div className="admin-reports-collections-info-item">
                    <div className="admin-reports-collections-info-dot"></div>
                    <span className="admin-reports-collections-info-text">{collectionsData.data.length} días con recolecciones completadas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recolecciones' && !loading && collectionsData !== null && collectionsData.data && collectionsData.data.length === 0 && (
          <div className="admin-reports-empty-state">
            <p className="admin-reports-empty-title">📭 No se encontraron recolecciones</p>
            <p className="admin-reports-empty-text">Intenta seleccionar un rango de fechas diferente</p>
          </div>
        )}

        {activeTab === 'recolecciones' && !loading && collectionsData === null && !error && (
          <div className="admin-reports-empty-state">
            <p className="admin-reports-empty-title">📭 Sin datos de recolecciones</p>
            <p className="admin-reports-empty-text">Error al cargar el reporte de recolecciones</p>
          </div>
        )}

        {activeTab === 'scores' && !loading && scoresData === null && !error && (
          <div className="admin-reports-no-data">
            Sin datos de calificaciones
          </div>
        )}

        {loading && (
          <div className="admin-reports-loading">
            <div className="admin-reports-spinner" />
            <span className="admin-reports-loading-text">Cargando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
