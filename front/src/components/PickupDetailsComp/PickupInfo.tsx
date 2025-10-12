//pickupInfo
import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../config/environment';
import './PickupDetails.css';
import LargeImageCarousel from './LargeImageCarousel';

interface PickupInfoProps {
  requestId?: string;
  appointmentId?: string | null;
  onCancel: () => void;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

interface RequestData {
  id: number;
  description: string;
  materialName?: string;
  userName?: string;
  registerDate: string;
  state: number;
  latitude?: number;
  longitude?: number;
  images?: any[];
}

interface AppointmentData {
  id: number;
  idRequest: number;
  acceptedDate: string;
  acceptedHour: string;
  state: number;
  description: string;
  materialName?: string;
  collectorName?: string;
  recyclerName?: string;
  collectorId?: number;
  recyclerId?: number;
}

const PickupInfo: React.FC<PickupInfoProps> = ({ requestId, appointmentId, onCancel, onLocationUpdate }) => {
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!requestId) {
        setError('ID de solicitud no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Si hay appointmentId, cargar datos del appointment
        if (appointmentId) {
          // Cargar datos del appointment que incluyen info de la request
          const appointmentResponse = await fetch(apiUrl(`/api/appointments/${appointmentId}`));
          
          if (!appointmentResponse.ok) {
            throw new Error(`Error ${appointmentResponse.status}: ${appointmentResponse.statusText}`);
          }

          const appointmentResult = await appointmentResponse.json();
          if (appointmentResult.success) {
            setAppointmentData(appointmentResult.data);
            // También cargar los datos básicos de la request
            const requestResponse = await fetch(apiUrl(`/api/request/${requestId}`));
            if (requestResponse.ok) {
              const requestResult = await requestResponse.json();
              if (requestResult.success) {
                setRequestData(requestResult.data);
              }
            }
          } else {
            throw new Error('No se pudieron cargar los datos de la cita');
          }
        } else {
          // Solo cargar datos de la request
          const response = await fetch(apiUrl(`/api/request/${requestId}`));
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          if (data.success) {
            setRequestData(data.data);
          } else {
            throw new Error('No se pudieron cargar los datos de la solicitud');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId, appointmentId]);

  // Actualizar ubicación cuando se carguen los datos del request
  useEffect(() => {
    if (requestData) {
      console.log('RequestData loaded:', requestData);
      console.log('Images array:', requestData.images);
      if (requestData.images && requestData.images.length > 0) {
        console.log('First image object:', requestData.images[0]);
        console.log('Image field:', requestData.images[0].image);
        console.log('apiUrl(""):', apiUrl(''));
        console.log('Final image URL:', `${apiUrl('')}${requestData.images[0].image}`);
        
        // Verificar si existe el archivo
        fetch(`${apiUrl('')}${requestData.images[0].image}`, { method: 'HEAD' })
          .then(response => {
            console.log('Image exists check:', response.status, response.statusText);
          })
          .catch(error => {
            console.error('Error checking image existence:', error);
          });
      }
      if (requestData.latitude && requestData.longitude && onLocationUpdate) {
        onLocationUpdate(requestData.latitude, requestData.longitude);
      }
    }
  }, [requestData, onLocationUpdate]);

  const handleCancelAppointment = async () => {
  if (!appointmentId) {
    alert('No se puede cancelar: ID de cita no disponible');
    return;
  }
  if (!appointmentData) {
    alert('No se puede cancelar: Datos de la cita no disponibles');
    return;
  }
  if (!window.confirm('¿Está seguro que desea cancelar este recojo?\n\nLa solicitud volverá a estar disponible en el mapa para otros recolectores.')) {
    return;
  }

  setCancelling(true);

  try {
    console.log('[INFO] Iniciando cancelación, appointmentId=', appointmentId, 'appointmentData=', appointmentData);

    // Seleccionar userId de forma segura (null si no existe)
    const userId = appointmentData.collectorId ?? appointmentData.recyclerId ?? null;
    if (!userId) {
      console.warn('[WARN] userId no encontrado en appointmentData. Verifica si el backend acepta peticiones sin userId.');
    }

    // Si usas token JWT en localStorage/sessionStorage:
    const token = localStorage.getItem('token'); // o donde lo guardes

    const url = apiUrl(`/api/appointments/${appointmentId}/cancel`);
    console.log('[INFO] POST ->', url, 'payload=', { userId, userRole: 'collector' });

    const response = await fetch(url, {
      method: 'POST', // <- si tu backend espera otro método, cámbialo (DELETE, PUT, PATCH)
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        // Ajusta nombres de campo si el backend usa snake_case o distintos nombres
        userId,
        userRole: 'collector'
      })
    });

    // Manejo seguro del body aunque no sea JSON
    const text = await response.text();
    let result: any = null;
    try {
      result = text ? JSON.parse(text) : null;
    } catch (e) {
      // respuesta no JSON
      result = { success: response.ok, raw: text };
    }

    console.log('[INFO] Response status:', response.status, 'parsed:', result);

    if (!response.ok) {
      // Extrae mensaje de error si existe
      const msg = result?.error || result?.message || result?.raw || `Error ${response.status}`;
      throw new Error(msg);
    }

    // Aquí suponemos que result.success indica éxito
    if (result && (result.success === true || response.status === 200 || response.status === 204)) {
      alert('✓ Cita cancelada exitosamente.\n\nLa solicitud estará disponible nuevamente en el mapa.');
      // Actualiza estado local para reflejar la cancelación sin recargar
      setAppointmentData(prev => prev ? { ...prev, state: 3 } : prev);
      onCancel();
    } else {
      const msg = result?.error || result?.message || 'El servidor respondió sin confirmar la cancelación';
      throw new Error(msg);
    }
  } catch (err) {
    console.error('[ERROR] Error cancelling appointment:', err);
    alert(`Error al cancelar la cita:\n\n${err instanceof Error ? err.message : JSON.stringify(err)}`);
  } finally {
    setCancelling(false);
  }
};

  if (loading) {
    return (
      <div className="pickupdetail-pickup-container">
        <div className="loading">Cargando detalles...</div>
      </div>
    );
  }

  if (error || (!requestData && !appointmentData)) {
    return (
      <div className="pickupdetail-pickup-container">
        <div className="error">Error: {error || 'No se encontraron los datos'}</div>
      </div>
    );
  }

  // Determinar qué datos mostrar
  const isAppointmentView = appointmentData !== null;
  const displayData = isAppointmentView ? appointmentData : requestData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determinar si se puede cancelar (estados 0 y 1 son cancelables)
  const canCancel = appointmentData && (appointmentData.state === 0 || appointmentData.state === 1);
  
  return (
    <div className="pickupdetail-pickup-container">
      <h2 className="pickupdetail-pickup-title">
        {displayData?.materialName ? `Reciclaje de ${displayData.materialName}` : 'Reciclaje de Material'}
      </h2>

      {/* Imágenes del material - GRANDES */}
      <LargeImageCarousel 
        images={requestData?.images || []} 
        apiUrl={apiUrl('')}
      />

      {/* Descripción */}
      <p className="pickupdetail-pickup-description">
        {displayData?.description}
      </p>

      {/* Información de contacto */}
      <div className="pickupdetail-pickup-grid">
        {isAppointmentView && appointmentData ? (
          <>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Fecha de Cita
              </h3>
              <p className="pickupdetail-info-value">
                {formatDate(appointmentData.acceptedDate)}
              </p>
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Hora
              </h3>
              <p className="pickupdetail-info-value">
                {appointmentData.acceptedHour}
              </p>
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Recolector
              </h3>
              <p className="pickupdetail-info-value">
                {appointmentData.collectorName || 'No asignado'}
              </p>
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Reciclador
              </h3>
              <p className="pickupdetail-info-value">
                {appointmentData.recyclerName || 'No asignado'}
              </p>
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Estado de Cita
              </h3>
              <p className="pickupdetail-info-value">
                {appointmentData.state === 0 ? 'Pendiente' : 
                 appointmentData.state === 1 ? 'Confirmada' : 
                 appointmentData.state === 2 ? 'En Progreso' : 
                 appointmentData.state === 3 ? 'Cancelada' : 'Completada'}
              </p>
            </div>
          </>
        ) : requestData ? (
          <>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Fecha de Solicitud
              </h3>
              <p className="pickupdetail-info-value">
                {formatDate(requestData.registerDate)}
              </p>
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Solicitante
              </h3>
              <p className="pickupdetail-info-value">
                {requestData.userName || 'Usuario'}
              </p>
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Estado
              </h3>
              <p className="pickupdetail-info-value">
                {requestData.state === 0 ? 'Pendiente' : 
                 requestData.state === 1 ? 'En Proceso' : 
                 requestData.state === 2 ? 'Activa' : 'Completada'}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Botón cancelar - condicional según el tipo de vista */}
      {isAppointmentView && canCancel ? (
        <button 
          onClick={handleCancelAppointment}
          className="pickupdetail-cancel-button"
          disabled={cancelling}
          style={{
            opacity: cancelling ? 0.6 : 1,
            cursor: cancelling ? 'not-allowed' : 'pointer'
          }}
        >
          {cancelling ? 'Cancelando...' : 'Cancelar Recojo'}
        </button>
      ) : !isAppointmentView ? (
        <button 
          onClick={onCancel}
          className="pickupdetail-cancel-button"
        >
          Cerrar
        </button>
      ) : null}

      {/* Mostrar mensaje si la cita ya está cancelada */}
      {isAppointmentView && appointmentData?.state === 3 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: '#fee', 
          borderRadius: '0.5rem',
          color: '#c00',
          textAlign: 'center',
          fontWeight: 500
        }}>
          ⚠️ Esta cita ha sido cancelada
        </div>
      )}
    </div>
  );
};

export default PickupInfo;