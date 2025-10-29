// RequestsTable.tsx
import { useState } from 'react';
import SortableTable from '../common/SortableTable';
import type { ColumnDef } from '../common/SortableTable';
import CheckModal from '../CommonComp/CheckModal';
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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleRejectClick = (userId: number) => {
    setSelectedUserId(userId);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (selectedUserId !== null) {
      onReject(selectedUserId);
      setShowRejectModal(false);
      setSelectedUserId(null);
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setSelectedUserId(null);
  };

  // Definir columnas según el tipo de solicitud
  const personColumns: ColumnDef<Request>[] = [
    {
      key: 'fullName',
      label: 'Nombre Completo',
      sortable: false,
      render: (request) => (
        <div className="collector-requests-table-user-cell">
          <div className="collector-requests-table-avatar">
            {request.email.charAt(0).toUpperCase()}
          </div>
          {request.fullName}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Correo electrónico',
      sortable: false,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      sortable: false,
    },
    {
      key: 'registrationDate',
      label: 'Fecha de registro',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (request) => (
        <div className="collector-requests-table-actions">
          <button 
            className="collector-requests-table-approve-btn"
            onClick={(e) => {
              e.stopPropagation();
              onApprove(request.userId);
            }}
          >
            ✓ Aprobar
          </button>
          <button 
            className="collector-requests-table-reject-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectClick(request.userId);
            }}
          >
            ✗ Rechazar
          </button>
        </div>
      ),
    },
  ];

  const institutionColumns: ColumnDef<Request>[] = [
    {
      key: 'companyName',
      label: 'Nombre de Empresa',
      sortable: false,
      render: (request) => (
        <div className="collector-requests-table-user-cell">
          <div className="collector-requests-table-avatar">
            {request.email.charAt(0).toUpperCase()}
          </div>
          {request.companyName || request.fullName}
        </div>
      ),
    },
    {
      key: 'nit',
      label: 'NIT',
      sortable: false,
      render: (request) => request.nit || 'N/A',
    },
    {
      key: 'email',
      label: 'Correo electrónico',
      sortable: false,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      sortable: false,
    },
    {
      key: 'registrationDate',
      label: 'Fecha de registro',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (request) => (
        <div className="collector-requests-table-actions">
          <button 
            className="collector-requests-table-approve-btn"
            onClick={(e) => {
              e.stopPropagation();
              onApprove(request.userId);
            }}
          >
            ✓ Aprobar
          </button>
          <button 
            className="collector-requests-table-reject-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectClick(request.userId);
            }}
          >
            ✗ Rechazar
          </button>
        </div>
      ),
    },
  ];

  const columns = requestType === 'Persona' ? personColumns : institutionColumns;

  return (
    <>
      {showRejectModal && (
        <CheckModal
          title="Confirmar Rechazo"
          message={`¿Está seguro que desea rechazar esta solicitud de ${requestType === 'Persona' ? 'persona' : 'empresa'}? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmReject}
          onCancel={handleCancelReject}
        />
      )}
      
      <div className="collector-requests-table-container">
        <SortableTable
          data={requests}
          columns={columns}
          itemsPerPage={10}
          emptyMessage="No hay solicitudes pendientes"
          getRowKey={(request) => request.userId}
        />
      </div>
    </>
  );
}