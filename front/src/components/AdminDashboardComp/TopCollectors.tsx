import './AdminDashboard1.css';

export default function TopCollectors() {
  const collectors = [
    { name: "Rooney Bardhi", amount: "IDR 75.000", avatar: "RB" },
    { name: "Another Institution", amount: "IDR 58.000", avatar: "AI" },
    { name: "Educative center", amount: "IDR 45.000", avatar: "EC" },
    { name: "Last Corp", amount: "IDR 45.000", avatar: "LC" }
  ];

  return (
    <div className="card">
      <h2 className="card-title">Top Colectores</h2>
      <p className="card-subtitle">Índice de recolección este mes</p>
      
      <div className="list-container">
        {collectors.map((collector, idx) => (
          <div key={idx} className="list-item">
            <div className="list-item-content">
              <div className="list-item-info">
                <div className="list-item-avatar avatar-blue">
                  <span>{collector.avatar}</span>
                </div>
                <span className="list-item-name">{collector.name}</span>
              </div>
              <span className="list-item-amount">{collector.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}