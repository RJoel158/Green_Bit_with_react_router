import './AdminDashboard.css';
import { useEffect, useState } from 'react';

export default function PendingApprovals({ setActiveMenu }: { setActiveMenu?: (menu: string) => void }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('http://localhost:3000/api/users/collectors/pending');
        const data = await response.json();
        if (data.success) {
          setRequests(data.collectors || []);
        } else {
          setRequests([]);
        }
      } catch (err) {
        setRequests([]);
      }
    }
    fetchRequests();
  }, []);

  const goToAccess = () => {
    if (setActiveMenu) setActiveMenu('accesos');
    else window.dispatchEvent(new CustomEvent('navigate-to-access'));
  };

  return (
    <div className="card">
      <h2 className="card-title">Aprobaciones pendientes</h2>
      <p className="card-subtitle">Solicitudes de acceso a cuenta recicladora</p>
      <div className="list-container">
        {requests.slice(0, 3).map((request: any) => (
          <div key={request.userId} className="list-item">
            <div className="list-item-avatar avatar-green">
              <span>{request.firstname?.[0]?.toUpperCase() || request.email?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <span className="list-item-name">{request.firstname ? `${request.firstname} ${request.lastname}` : request.email}</span>
          </div>
        ))}
      </div>
      <button className="card-button" onClick={goToAccess}>
        {requests.length > 3 ? 'Ver más' : 'Ver Solicitudes'}
      </button>
    </div>
  );
}