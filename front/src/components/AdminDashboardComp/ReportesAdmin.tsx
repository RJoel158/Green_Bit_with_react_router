import { useState, useEffect, useRef } from 'react';
import CommonHeader from '../CommonComp/CommonHeader';
import * as reportService from '../../services/reportService';

export default function ReportesAdmin() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialesData, setMaterialesData] = useState<any[]>([]);
  const [scoresData, setScoresData] = useState<any | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'materiales' | 'scores'>('materiales');
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

      const fileName = `Reporte_${activeTab === 'materiales' ? 'Materiales' : 'Calificaciones'}_${new Date().toISOString().slice(0, 10)}.pdf`;
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
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
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

  const total = materialesData.reduce((s: number, i: any) => s + (i.kg || 0), 0);
  const topMaterial = materialesData[0] || null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FAF8F1', height: '100vh', overflow: 'hidden' }}>
      <CommonHeader title="Reportes" searchPlaceholder="Buscar..." searchQuery="" onSearch={() => {}} onCreateNew={() => {}} createButtonText="Actualizar" />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1rem', overflow: 'auto' }} ref={reportRef}>
        {/* Tabs + Botón PDF */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e5e7eb', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('materiales')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'materiales' ? '#149D52' : 'transparent',
                color: activeTab === 'materiales' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '0.375rem 0.375rem 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
            >
              📊 Reporte de Materiales
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'scores' ? '#149D52' : 'transparent',
                color: activeTab === 'scores' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '0.375rem 0.375rem 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
            >
              ⭐ Reporte de Calificaciones
            </button>
          </div>
          <button
            onClick={downloadPDF}
            disabled={loading || (!materialesData.length && !scoresData)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#149D52',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading || (!materialesData.length && !scoresData) ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              opacity: loading || (!materialesData.length && !scoresData) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
            }}
          >
            📥 Descargar PDF
          </button>
        </div>

        {/* Indicador si es admin o no */}
        <div style={{ padding: '0.75rem 1rem', backgroundColor: isAdmin ? '#fef3c7' : '#e0f2fe', borderRadius: '0.375rem', fontSize: '0.875rem', color: isAdmin ? '#92400e' : '#0c4a6e', fontWeight: '500' }}>
          {isAdmin ? '📊 Modo Administrador - Viendo reportes de TODOS los usuarios' : '👤 Viendo solo tus reportes'}
        </div>

        {/* Filtros */}
        {activeTab === 'materiales' && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#149D52' }}>Desde:</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#149D52' }}>Hasta:</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            </div>
            <button onClick={loadData} disabled={loading} style={{ padding: '0.625rem 1.5rem', backgroundColor: '#149D52', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        )}

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem' }}>❌ Error: {error}</div>}

        {/* REPORTE MATERIALES */}
        {activeTab === 'materiales' && !loading && materialesData.length === 0 && !error && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: '#9ca3af' }}>
            Sin datos disponibles
          </div>
        )}

        {activeTab === 'materiales' && materialesData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Gráfico Donut con Leyenda */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>📊 Distribución de Materiales</h3>
              <svg width="300" height="300" viewBox="0 0 300 300" style={{ marginBottom: '1rem' }}>
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
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', maxHeight: '200px', overflowY: 'auto' }}>
                {materialesData.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      backgroundColor: item.color || '#10b981',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {item.kg} items • {item.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Barras Horizontal */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>📈 Comparativa de Materiales</h3>
              
              {/* Box resumen */}
              <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #149D52', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#149D52', fontWeight: '600', margin: '0 0 0.5rem 0' }}>🏆 TOP MATERIAL</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{topMaterial?.name}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{topMaterial?.kg} items ({topMaterial?.percentage}%)</p>
              </div>

              {/* Barras horizontales */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {materialesData.map((item: any) => {
                  const percentage = item.percentage;
                  
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ minWidth: '100px', fontSize: '0.85rem', fontWeight: '600', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ flex: 1, height: '28px', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: item.color || '#10b981',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '0.5rem',
                            transition: 'width 0.3s ease'
                          }}
                        >
                          {percentage > 15 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white' }}>
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ minWidth: '50px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280' }}>
                        {item.kg} items
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* REPORTE SCORES */}
        {activeTab === 'scores' && !loading && scoresData !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Primera fila: Gráfico + Estadísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Distribución de Calificaciones</h3>
                {renderScoresChart()}
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'auto' }}>
                <div style={{ backgroundColor: '#dcfce7', padding: '1.5rem', borderRadius: '0.375rem', borderLeft: '4px solid #149D52' }}>
                  <p style={{ fontSize: '0.875rem', color: '#149D52', fontWeight: '600', margin: '0 0 0.5rem 0' }}>📊 RESUMEN</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>⭐ {scoresData.average.toFixed(1)}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>Promedio de {scoresData.total} calificaciones</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[5, 4, 3, 2, 1].map((score) => {
                    const count = scoresData[`count_${score}`] || 0;
                    const percentageNum = scoresData.total > 0 ? ((count / scoresData.total) * 100) : 0;
                    const percentage = parseFloat(percentageNum.toFixed(1));
                    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
                    const color = colors[score - 1];

                    return (
                      <div key={score} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', minWidth: '30px' }}>
                          {'⭐'.repeat(score)}
                        </span>
                        <div style={{ flex: 1, height: '24px', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percentage}%`,
                              backgroundColor: color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: 'white'
                            }}
                          >
                            {percentage > 10 ? `${percentage}%` : ''}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', minWidth: '40px', textAlign: 'right' }}>
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
              <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>📋 Detalles de Calificaciones</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #149D52' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700', color: '#149D52', whiteSpace: 'nowrap' }}>⭐ Score</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700', color: '#149D52', whiteSpace: 'nowrap' }}>👤 Quien Califica</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700', color: '#149D52', whiteSpace: 'nowrap' }}>→ Calificado A</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '700', color: '#149D52', whiteSpace: 'nowrap' }}>📝 Comentario</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '700', color: '#149D52', whiteSpace: 'nowrap' }}>📅 Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoresData.details.map((detail: any, idx: number) => {
                        const scoreColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
                        const scoreColor = scoreColors[detail.score - 1];

                        return (
                          <tr key={detail.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                            <td style={{ padding: '0.75rem', fontWeight: '700', color: scoreColor }}>
                              {'⭐'.repeat(detail.score)} {detail.score}
                            </td>
                            <td style={{ padding: '0.75rem', color: '#374151', fontWeight: '600' }}>
                              {detail.ratedByUsername || `Usuario ${detail.ratedByUserId}`}
                            </td>
                            <td style={{ padding: '0.75rem', color: '#374151', fontWeight: '600' }}>
                              {detail.ratedToUsername || `Usuario ${detail.ratedToUserId}`}
                            </td>
                            <td style={{ padding: '0.75rem', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {detail.comment || '(sin comentario)'}
                            </td>
                            <td style={{ padding: '0.75rem', color: '#6b7280', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
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

        {activeTab === 'scores' && !loading && scoresData === null && !error && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: '#9ca3af' }}>
            Sin datos de calificaciones
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #dcfce7', borderTop: '4px solid #149D52', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#6b7280', fontWeight: '600' }}>Cargando...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
