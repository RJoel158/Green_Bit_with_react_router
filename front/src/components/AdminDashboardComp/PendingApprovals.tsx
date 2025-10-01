import './AdminDashboard1.css';

export default function PendingApprovals() {
  const requests = [
    { id: 1, name: "Solicitud N°1" },
    { id: 2, name: "Solicitud N°2" },
    { id: 3, name: "Solicitud N°3" }
  ];

  return (
    <div className="card">
      <h2 className="card-title">Aprobaciones pendientes</h2>
      <p className="card-subtitle">Solicitudes de acceso a cuenta recicladora</p>
      
      <div className="list-container">
        {requests.map(request => (
          <div key={request.id} className="list-item">
            <div className="list-item-avatar avatar-green">
              <span>A</span>
            </div>
            <span className="list-item-name">{request.name}</span>
          </div>
        ))}
      </div>
      
      <button className="card-button">
        Ver Solicitudes
      </button>
    </div>
  );
}