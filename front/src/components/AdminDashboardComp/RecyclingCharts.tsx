import { useState, useEffect } from 'react';
import * as reportService from '../../services/reportService';
import type { CollectionsReport } from '../../services/reportService';
import './AdminDashboard.css';

export default function RecyclingChart() {
  const [collectionsData, setCollectionsData] = useState<CollectionsReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calcular últimos 30 días
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 30);
      
      const dateFrom = pastDate.toISOString().split('T')[0];
      const dateTo = today.toISOString().split('T')[0];
      
      console.log('[RecyclingChart] Fetching collections from', dateFrom, 'to', dateTo);
      
      // Obtener datos del reporte de recolecciones
      const data = await reportService.getCollectionsReport(dateFrom, dateTo);
      
      console.log('[RecyclingChart] Collections data received:', data);
      
      setCollectionsData(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerReporte = () => {
    // Navegar a la sección de reportes con tab de recolecciones
    const navigateEvent = new CustomEvent('navigate-to-reports');
    window.dispatchEvent(navigateEvent);
    setTimeout(() => {
      const tabEvent = new CustomEvent('change-report-tab', { 
        detail: { tab: 'recolecciones' } 
      });
      window.dispatchEvent(tabEvent);
    }, 100);
  };

  const renderCollectionsChart = () => {
    if (!collectionsData || !collectionsData.data || collectionsData.data.length === 0) {
      return <p style={{ padding: '2rem', textAlign: 'center' }}>No hay datos para mostrar</p>;
    }

    const data = collectionsData.data.slice(-12); // Últimos 12 días
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
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Ejes principales */}
        <line x1={leftMargin - 10} y1="20" x2={leftMargin - 10} y2={startY} stroke="#d1d5db" strokeWidth="2" />
        <line x1={leftMargin - 10} y1={startY} x2={chartWidth - rightMargin} y2={startY} stroke="#d1d5db" strokeWidth="2" />

        {/* Grid horizontal*/}
        {(() => {
          const numLines = Math.min(maxCount + 1, 6);
          const step = maxCount / (numLines - 1);
          
          return Array.from({ length: numLines }, (_, i) => {
            const value = Math.round(i * step);
            const y = startY - (value / maxCount) * chartAreaHeight;
            
            return (
              <g key={`grid-${i}`}>
                <line x1={leftMargin - 15} y1={y} x2={chartWidth - rightMargin} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={leftMargin - 20} y={y + 5} fontSize="11" textAnchor="end" fill="#9ca3af" fontWeight="500">
                  {value}
                </text>
              </g>
            );
          });
        })()}

        {/* Barras */}
        {data.map((item: any, index: number) => {
          const height = maxCount > 0 ? (item.count / maxCount) * chartAreaHeight : 0;
          const x = startX + index * barSpacing;
          const y = startY - height;
          
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
                fill="#22c55e" 
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

              {/* Mostrar el valor al lado si la barra es muy pequeña */}
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
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!collectionsData || collectionsData.data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recolecciones por día</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="recycling-stats">
          <h2 className="card-title">Recolecciones por día</h2>
          <p className="recycling-amount">IDR {collectionsData.summary.cdi}</p>
          <p className="recycling-increase">
            {collectionsData.summary.totalCollections} recolecciones totales
          </p>
          <p className="recycling-period">
            Últimos {collectionsData.summary.dayRange} días
          </p>
        </div>
        <button className="card-button" onClick={handleVerReporte}>
          Ver Reporte
        </button>
      </div>
      
      {/* Gráfico de barras SVG */}
      <div style={{ padding: '1rem', overflowX: 'auto' }}>
        {renderCollectionsChart()}
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color legend-color-primary"></div>
          <span>Recolecciones diarias</span>
        </div>
      </div>
    </div>
  );
}