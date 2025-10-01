import './AdminDashboard.css';

export default function RecyclingChart() {
  const data = [
    { month: 'E', value: 35 },
    { month: 'F', value: 45 },
    { month: 'M', value: 50 },
    { month: 'A', value: 42 },
    { month: 'M', value: 65 },
    { month: 'J', value: 75 },
    { month: 'J', value: 62 },
    { month: 'A', value: 70 },
    { month: 'S', value: 78 },
    { month: 'O', value: 55 },
    { month: 'N', value: 85 },
    { month: 'D', value: 90 }
  ];
  
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="card">
      <div className="card-header">
        <div className="recycling-stats">
          <h2 className="card-title">Reciclaje por mes</h2>
          <p className="recycling-amount">IDR 7.852.000</p>
          <p className="recycling-increase">↑ 21% más que el período pasado</p>
          <p className="recycling-period">Reciclaje del 1 al 12 Diciembre, 2025</p>
        </div>
        <button className="card-button">
          Ver Reporte
        </button>
      </div>
      
      {/* Gráfico de barras */}
      <div className="chart-container">
        {data.map((item, idx) => (
          <div key={idx} className="chart-bar">
            <div 
              className="chart-bar-fill" 
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="chart-bar-label">{item.month}</span>
          </div>
        ))}
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color legend-color-primary"></div>
          <span>Últimos 6 días</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-color-secondary"></div>
          <span>Último Mes</span>
        </div>
      </div>
    </div>
  );
}