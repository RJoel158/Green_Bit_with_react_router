// RequestsTable.tsx
import { useState } from 'react';
import './CollectorRequests.css';

interface Request {
  userId: number;
  fullName: string;
  email: string;
  phone: string; 
  registrationDate: string;
  companyName?: string;
  nit?: string;
}

interface RequestsTableProps {
  requests: Request[];
  requestType?: 'Persona' | 'Empresa';
  onApprove: (userId: number) => void;
  onReject: (userId: number) => void;
}

export default function RequestsTable({ 
  requests, 
  requestType = 'Persona',
  onApprove,
  onReject 
}: RequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  return (
    <div className="collector-requests-table-container">
      <div className="collector-requests-table-scroll">
        <table className="collector-requests-table">
          <thead>
            <tr className="collector-requests-table-head-row">
              {requestType === 'Persona' ? (
                <>
                  <th className="collector-requests-table-head-cell">Nombre Completo</th>
                  <th className="collector-requests-table-head-cell">Correo electrónico</th>
                  <th className="collector-requests-table-head-cell">Teléfono</th>
                  <th className="collector-requests-table-head-cell">Fecha de registro</th>
                  <th className="collector-requests-table-head-cell">Acciones</th>
                </>
              ) : (
                <>
                  <th className="collector-requests-table-head-cell">Nombre de Empresa</th>
                  <th className="collector-requests-table-head-cell">NIT</th>
                  <th className="collector-requests-table-head-cell">Correo electrónico</th>
                  <th className="collector-requests-table-head-cell">Teléfono</th>
                  <th className="collector-requests-table-head-cell">Fecha de registro</th>
                  <th className="collector-requests-table-head-cell">Acciones</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((request) => (
              <tr 
                key={request.userId}
                data-user-id={request.userId}
                className="collector-requests-table-body-row"
              >
                {requestType === 'Persona' ? (
                  <>
                    <td className="collector-requests-table-body-cell">
                      <div className="collector-requests-table-user-cell">
                        <div className="collector-requests-table-avatar">
                          {request.fullName.charAt(0)}
                        </div>
                        {request.fullName}
                      </div>
                    </td>
                    <td className="collector-requests-table-body-cell">{request.email}</td>
                    <td className="collector-requests-table-body-cell">{request.phone}</td>
                    <td className="collector-requests-table-body-cell">{request.registrationDate}</td>
                    <td className="collector-requests-table-body-cell">
                      <div className="collector-requests-table-actions">
                        <button 
                          className="collector-requests-table-approve-btn"
                          onClick={() => onApprove(request.userId)}
                        >
                          ✓ Aprobar
                        </button>
                        <button 
                          className="collector-requests-table-reject-btn"
                          onClick={() => onReject(request.userId)}
                        >
                          ✗ Rechazar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="collector-requests-table-body-cell">
                      <div className="collector-requests-table-user-cell">
                        <div className="collector-requests-table-avatar">
                          {request.companyName?.charAt(0) || 'E'}
                        </div>
                        {request.companyName || request.fullName}
                      </div>
                    </td>
                    <td className="collector-requests-table-body-cell">{request.nit || 'N/A'}</td>
                    <td className="collector-requests-table-body-cell">{request.email}</td>
                    <td className="collector-requests-table-body-cell">{request.phone}</td>
                    <td className="collector-requests-table-body-cell">{request.registrationDate}</td>
                    <td className="collector-requests-table-body-cell">
                      <div className="collector-requests-table-actions">
                        <button 
                          className="collector-requests-table-approve-btn"
                          onClick={() => onApprove(request.userId)}
                        >
                          ✓ Aprobar
                        </button>
                        <button 
                          className="collector-requests-table-reject-btn"
                          onClick={() => onReject(request.userId)}
                        >
                          ✗ Rechazar
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="collector-requests-table-pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="collector-requests-table-pagination-btn"
        >
          ◀
        </button>
        <span className="collector-requests-table-pagination-page">{currentPage}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="collector-requests-table-pagination-btn"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
