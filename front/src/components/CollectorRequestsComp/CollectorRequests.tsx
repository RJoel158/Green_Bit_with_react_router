// CollectorRequests.tsx
import { useState, useEffect } from 'react';
import Header from './Header';
import RequestsTable from './RequestsTable';
import SuccessModal from '../CommonComp/SuccesModal';
import './CollectorRequests.css';

interface CollectorRequest {
  userId: number;
  email: string;
  phone: string;
  roleId: number;
  userState: number;
  registerDate: string;
  firstname?: string;
  lastname?: string;
  personState?: number;
  companyName?: string;
  nit?: string;
  institutionId?: number;
  institutionState?: number;
}

interface TableRequest {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: string;
  // Campos opcionales para determinar tipo
  firstname?: string;
  lastname?: string;
  companyName?: string;
  nit?: string;
}

type RequestType = 'Persona' | 'Empresa';

export default function CollectorRequests() {
  const [requests, setRequests] = useState<CollectorRequest[]>([]);
  const [requestType, setRequestType] = useState<RequestType>('Persona');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false); // Estado para cuando se aprueba/rechaza
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAction, setSuccessAction] = useState<'approved' | 'rejected'>('approved');
  const [processingAction, setProcessingAction] = useState<'approving' | 'rejecting'>('approving'); // Para el mensaje de loading

  // Función para obtener solicitudes según el tipo
  const fetchRequests = async (type: RequestType) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'Persona' 
        ? 'http://localhost:3000/api/users/collectors/pending' 
        : 'http://localhost:3000/api/users/collectors/pending/institution';
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
       
        setRequests(data.collectors || []);
      } else {
        setError('Error al obtener solicitudes');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Cargar solicitudes al cargar la página y cuando cambie el tipo
  useEffect(() => {
    fetchRequests(requestType);
  }, [requestType]);

  // Convertir solicitudes al formato de la tabla
  const formatRequestsForTable = (): TableRequest[] => {
    return requests.map(request => {
      const fullName = requestType === 'Persona'
        ? `${request.firstname || ''} ${request.lastname || ''}`.trim()
        : request.companyName || '';

      return {
        userId: request.userId,
        fullName: fullName || 'Sin nombre',
        email: request.email,
        phone: request.phone, 
        registrationDate: new Date(request.registerDate).toLocaleDateString('es-ES'),
        firstname: request.firstname,
        lastname: request.lastname,
        companyName: request.companyName,
        nit: request.nit,
      };
    });
  };

  // Filtrar solicitudes según la búsqueda
  const filterRequests = (requestsToFilter: TableRequest[]): TableRequest[] => {
    if (!searchQuery.trim()) {
      return requestsToFilter;
    }

    const query = searchQuery.toLowerCase().trim();
    return requestsToFilter.filter(request => 
      request.fullName.toLowerCase().includes(query) ||
      request.email.toLowerCase().includes(query)
    );
  };

  const handleRequestTypeChange = (type: RequestType) => {
    setRequestType(type);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApproveRequest = async (userId: number) => {
    setProcessingAction('approving'); // Establecer acción antes de procesar
    setProcessing(true); // Activar indicador de carga
    try {
      const endpoint = requestType === 'Persona' 
        ? `http://localhost:3000/api/users/approve/${userId}`
        : `http://localhost:3000/api/users/institution/approve/${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Solicitud aprobada exitosamente y credenciales enviadas');
        // Mostrar el modal de éxito
        setSuccessAction('approved');
        setShowSuccessModal(true);
        await fetchRequests(requestType);
      } else {
        console.error('Error al aprobar solicitud:', data.error);
        setError(data.error || 'Error al aprobar la solicitud');
      }
    } catch (err) {
      console.error('Error al aprobar solicitud:', err);
      setError('Error de conexión al aprobar la solicitud');
    } finally {
      setProcessing(false); // Desactivar indicador de carga
    }
  };

  const handleRejectRequest = async (userId: number) => {
    setProcessingAction('rejecting'); // Establecer acción antes de procesar
    setProcessing(true); // Activar indicador de carga
    try {
      // Determinar el endpoint según el tipo de solicitud
      const endpoint = requestType === 'Persona'
        ? `http://localhost:3000/api/users/reject/${userId}`
        : `http://localhost:3000/api/users/institution/reject/${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Solicitud rechazada exitosamente y email enviado');
        // Mostrar el modal de éxito
        setSuccessAction('rejected');
        setShowSuccessModal(true);
        await fetchRequests(requestType);
      } else {
        console.error('Error al rechazar solicitud:', data.error);
        setError(data.error || 'Error al rechazar la solicitud');
      }
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      setError('Error de conexión al rechazar la solicitud');
    } finally {
      setProcessing(false); // Desactivar indicador de carga
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Recargar las solicitudes después de cerrar el modal
    fetchRequests(requestType);
  };

  return (
    <>
      {showSuccessModal && (
        <SuccessModal
          title={successAction === 'approved' ? '¡Solicitud Aprobada!' : '¡Solicitud Rechazada!'}
          message={
            successAction === 'approved'
              ? `La solicitud de ${requestType === 'Persona' ? 'persona' : 'empresa'} ha sido aprobada exitosamente. Las credenciales han sido enviadas por email.`
              : `La solicitud de ${requestType === 'Persona' ? 'persona' : 'empresa'} ha sido rechazada exitosamente.`
          }
          onClose={handleCloseSuccessModal}
        />
      )}

      {processing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #4a7c59',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            color: 'white',
            marginTop: '20px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {processingAction === 'approving' ? 'Aprobando solicitud...' : 'Rechazando solicitud...'}
            <br />
            <span style={{ fontSize: '14px', fontWeight: '400' }}>
              Enviando correo electrónico
            </span>
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      <div className="collector-requests-dashboard">
      <div className="collector-requests-main">
        <Header 
          requestType={requestType}
          onRequestTypeChange={handleRequestTypeChange}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
        <div className="collector-requests-content">
          {loading && (
            <div className="collector-requests-loading">
              Cargando solicitudes...
            </div>
          )}
          
          {error && (
            <div className="collector-requests-error">
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <div className="collector-requests-layout">
              <RequestsTable 
                requests={filterRequests(formatRequestsForTable())} 
                requestType={requestType}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
