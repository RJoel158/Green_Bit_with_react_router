import { useState, useEffect } from 'react';
import * as reportService from '../../services/reportService';
import type { MaterialReport } from '../../services/reportService';
import './AdminDashboard.css';

export default function MostRecycled() {
  const [materialesData, setMaterialesData] = useState<MaterialReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [totalGeneral, setTotalGeneral] = useState(0);

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
      
      setDateRange({ from: dateFrom, to: dateTo });
      
      // Obtener datos del reporte de materiales
      const data = await reportService.getMaterialesReport(dateFrom, dateTo);
      
      // Calcular el total de los elementos
      const totalAllElements = data.reduce((sum, item) => sum + item.kg, 0);
      setTotalGeneral(totalAllElements);
      
      // Tomar solo los top 3 materiales más reciclados para el gráfico
      const top3 = data.slice(0, 3);
      setMaterialesData(top3);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Colores predefinidos
  const predefinedColors = ['#22c55e', '#10b981', '#6ee7b7'];

  // Función para renderizar el gráfico donut dinámicamente
  const renderDonutChart = () => {
    if (materialesData.length === 0) return null;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let currentOffset = 0;

    return (
      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        {/* Círculo de fondo */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="20"/>
        
        {/* Segmentos dinámicos */}
        {materialesData.map((item, index) => {
          const dashLength = (item.percentage / 100) * circumference;
          const dashArray = `${dashLength} ${circumference}`;
          const offset = -currentOffset;
          currentOffset += dashLength;

          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={predefinedColors[index] || '#22c55e'}
              strokeWidth="20"
              strokeDasharray={dashArray}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Más reciclados</h2>
          <p className="card-date">
            {dateRange.from && dateRange.to 
              ? `Del ${formatDate(dateRange.from)} al ${formatDate(dateRange.to)}` 
              : 'Último mes'}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando...</p>
        </div>
      ) : materialesData.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No hay datos disponibles</p>
        </div>
      ) : (
        <>
          {/* Gráfico circular */}
          <div className="donut-chart">
            {renderDonutChart()}
            <div className="donut-chart-center">
              <p className="donut-chart-label">Total</p>
              <p className="donut-chart-value">{totalGeneral.toFixed(0)}</p>
              <p className="donut-chart-sublabel">elementos</p>
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="stats-list">
            {materialesData.map((item, index) => (
              <div key={index} className="stats-item">
                <div className="stats-item-label">
                  <div 
                    className="stats-color-dot" 
                    style={{ backgroundColor: predefinedColors[index] || '#22c55e' }}
                  ></div>
                  <span className="stats-item-text">{item.name}</span>
                </div>
                <span className="stats-item-value">{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}