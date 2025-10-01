import { useState } from 'react';
import './AdminDashboard.css';

export default function MostRecycled() {
  const [material, setMaterial] = useState('papeles');
  
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Más reciclados</h2>
          <p className="card-date">Del 1 al 6 de diciembre</p>
        </div>
        <select 
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="material-select"
        >
          <option value="papeles">Materiales</option>
          <option value="papel">Papel</option>
          <option value="carton">Cartón</option>
          <option value="plastico">Plástico</option>
        </select>
      </div>
      
      {/* Gráfico circular */}
      <div className="donut-chart">
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20"
                  strokeDasharray="100.53 150.8" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20"
                  strokeDasharray="75.4 175.93" strokeDashoffset="-100.53" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#6ee7b7" strokeWidth="20"
                  strokeDasharray="75.4 175.93" strokeDashoffset="-175.93" strokeLinecap="round"/>
        </svg>
        <div className="donut-chart-center">
          <p className="donut-chart-label">Papeles</p>
          <p className="donut-chart-value">1.890</p>
          <p className="donut-chart-sublabel">registros</p>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="stats-list">
        <div className="stats-item">
          <div className="stats-item-label">
            <div className="stats-color-dot stats-color-green"></div>
            <span className="stats-item-text">Papeles</span>
          </div>
          <span className="stats-item-value">40%</span>
        </div>
        <div className="stats-item">
          <div className="stats-item-label">
            <div className="stats-color-dot stats-color-emerald"></div>
            <span className="stats-item-text">Cartón</span>
          </div>
          <span className="stats-item-value">32%</span>
        </div>
        <div className="stats-item">
          <div className="stats-item-label">
            <div className="stats-color-dot stats-color-light-green"></div>
            <span className="stats-item-text">Plásticos</span>
          </div>
          <span className="stats-item-value">28%</span>
        </div>
      </div>
    </div>
  );
}