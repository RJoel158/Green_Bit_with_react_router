import './AdminDashboard1.css';

export default function TopRecyclers() {
  const recyclers = [
    { name: "Cody Gakpo", amount: "IDR 75.000", avatar: "CG" },
    { name: "Riyad Mahrez", amount: "IDR 56.000", avatar: "RM" },
    { name: "Son Heung-Min", amount: "IDR 45.000", avatar: "SM" },
    { name: "Alissa Lemman", amount: "IDR 45.000", avatar: "AL" }
  ];

  return (
    <div className="card">
      <h2 className="card-title">Top Recicladores</h2>
      <p className="card-subtitle">Índice de reciclaje este mes</p>
      
      <div className="list-container">
        {recyclers.map((recycler, idx) => (
          <div key={idx} className="list-item">
            <div className="list-item-content">
              <div className="list-item-info">
                <div className="list-item-avatar avatar-dark">
                  <span>{recycler.avatar}</span>
                </div>
                <span className="list-item-name">{recycler.name}</span>
              </div>
              <span className="list-item-amount">{recycler.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}