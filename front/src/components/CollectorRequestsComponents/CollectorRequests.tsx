// CollectorRequests.tsx
import { useState, useEffect } from 'react';
import Sidebar from '../AdminDashboardComp/Sidebar';
import Header from './Header';
import RequestsTable from './RequestsTable';
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
  status: string;
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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Función para obtener solicitudes según el tipo
  const fetchRequests = async (type: RequestType) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'Persona' 
        ? 'http://localhost:3000/api/users/withPerson' 
        : 'http://localhost:3000/api/users/withInstitution';
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo recolectores pendientes de aprobación
        const pendingCollectors = data.users.filter((user: CollectorRequest) => 
          user.roleId === 2 && user.userState === 0
        );
        setRequests(pendingCollectors);
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
        status: request.userState === 0 ? 'Pendiente' : 'Aprobado',
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
    try {
      // Aquí iría la lógica para aprobar la solicitud
      console.log('Aprobar solicitud:', userId);
      // Recargar las solicitudes después de aprobar
      await fetchRequests(requestType);
    } catch (err) {
      console.error('Error al aprobar solicitud:', err);
    }
  };

  const handleRejectRequest = async (userId: number) => {
    try {
      // Aquí iría la lógica para rechazar la solicitud
      console.log('Rechazar solicitud:', userId);
      // Recargar las solicitudes después de rechazar
      await fetchRequests(requestType);
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
    }
  };

  return (
    <div className="collector-requests-dashboard">
      <Sidebar />
      <div className="collector-requests-main">
        <Header 
          requestType={requestType}
          onRequestTypeChange={handleRequestTypeChange}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
        <div className="collector-requests-content">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando solicitudes...
            </div>
          )}
          
          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#ef4444',
              backgroundColor: '#fee2e2',
              borderRadius: '0.5rem',
              margin: '1rem 0'
            }}>
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
  );
}
