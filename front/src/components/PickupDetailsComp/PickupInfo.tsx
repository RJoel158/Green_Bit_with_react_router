//pickupInfo
import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../config/environment';
import {
  APPOINTMENT_STATE,
  getRequestStateLabel,
  getAppointmentStateLabel
} from '../../shared/constants';
import './PickupDetails.css';
import LargeImageCarousel from './LargeImageCarousel';
import RatingModal from '../RatingModalComp/RatingModal';
import { checkUserRated } from '../../services/scoreService';

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
  collectorPhone?: string;
  collectorEmail?: string;
  recyclerName?: string;
  recyclerPhone?: string;
  recyclerEmail?: string;
  collectorId?: number;
  recyclerId?: number;
}

const PickupInfo: React.FC<PickupInfoProps> = ({ requestId, appointmentId, onCancel, onLocationUpdate }) => {
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Obtener el usuario actual desde localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // Verificar si el usuario actual es el reciclador (dueño de la request)
  const isRecycler = () => {
    const currentUser = getCurrentUser();
    return currentUser && appointmentData && currentUser.id === appointmentData.recyclerId;
  };

  // Verificar si el usuario actual es el recolector (quien aceptó la request)
  const isCollector = () => {
    const currentUser = getCurrentUser();
    return currentUser && appointmentData && currentUser.id === appointmentData.collectorId;
  };

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

  // Verificar si el usuario debe calificar cuando se carga una cita completada
  useEffect(() => {
    const checkRatingStatus = async () => {
      if (appointmentData && appointmentData.state === APPOINTMENT_STATE.COMPLETED && appointmentId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const alreadyRated = await checkUserRated(Number(appointmentId), user.id);
          setHasRated(alreadyRated);
          
          // Si NO ha calificado, mostrar el modal automáticamente
          if (!alreadyRated) {
            setShowRatingModal(true);
          }
        }
      }
    };

    checkRatingStatus();
  }, [appointmentData, appointmentId]);

  const handleCancelAppointment = async () => {
    if (!appointmentId) {
      alert('No se puede cancelar: ID de cita no disponible');
      return;
    }
    if (!appointmentData) {
      alert('No se puede cancelar: Datos de la cita no disponibles');
      return;
    }

    // Confirmar cancelación de la cita
    if (!window.confirm('🚫 ¿Está seguro que desea CANCELAR esta cita?\n\n⚠️ La solicitud volverá a estar disponible en el mapa para otros recolectores.')) {
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

  // Función para aceptar un appointment
  const handleAcceptAppointment = async () => {
    if (!appointmentId || !appointmentData) {
      alert('No se puede aceptar: ID de cita no disponible');
      return;
    }

    // Confirmar ACEPTACIÓN (no cancelación)
    if (!window.confirm('✅ ¿Desea ACEPTAR esta solicitud de recolección?\n\n✓ La cita quedará confirmada y el recolector será notificado.')) {
      return;
    }

    setAccepting(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || appointmentData.recyclerId;

      const url = apiUrl(`/api/appointments/${appointmentId}/accept`);
      console.log('[INFO] POST ->', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      console.log('[INFO] Accept response:', result);

      if (!response.ok) {
        throw new Error(result?.error || `Error ${response.status}`);
      }

      if (result.success) {
        alert('✓ Cita aceptada exitosamente.');
        setAppointmentData(prev => prev ? { ...prev, state: APPOINTMENT_STATE.ACCEPTED } : prev);
        // Recargar datos
        window.location.reload();
      } else {
        throw new Error(result.error || 'Error al aceptar la cita');
      }
    } catch (err) {
      console.error('[ERROR] Error accepting appointment:', err);
      alert(`Error al aceptar la cita:\n\n${err instanceof Error ? err.message : JSON.stringify(err)}`);
    } finally {
      setAccepting(false);
    }
  };

  // Función para rechazar un appointment
  const handleRejectAppointment = async () => {
    if (!appointmentId || !appointmentData) {
      alert('No se puede rechazar: ID de cita no disponible');
      return;
    }

    // Confirmar RECHAZO (no cancelación)
    if (!window.confirm('❌ ¿Desea RECHAZAR esta solicitud de recolección?\n\n⚠️ La solicitud volverá a estar disponible en el mapa para que otros recolectores puedan tomarla.')) {
      return;
    }

    setRejecting(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || appointmentData.recyclerId;

      const url = apiUrl(`/api/appointments/${appointmentId}/reject`);
      console.log('[INFO] POST ->', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      console.log('[INFO] Reject response:', result);

      if (!response.ok) {
        throw new Error(result?.error || `Error ${response.status}`);
      }

      if (result.success) {
        alert('✓ Cita rechazada. La solicitud estará disponible nuevamente.');
        setAppointmentData(prev => prev ? { ...prev, state: APPOINTMENT_STATE.REJECTED } : prev);
        onCancel();
      } else {
        throw new Error(result.error || 'Error al rechazar la cita');
      }
    } catch (err) {
      console.error('[ERROR] Error rejecting appointment:', err);
      alert(`Error al rechazar la cita:\n\n${err instanceof Error ? err.message : JSON.stringify(err)}`);
    } finally {
      setRejecting(false);
    }
  };

  // Función para completar un appointment
  const handleCompleteAppointment = async () => {
    if (!appointmentId || !appointmentData) {
      alert('No se puede completar: ID de cita no disponible');
      return;
    }

    // Confirmar COMPLETAR (no cancelación)
    if (!window.confirm('✅ ¿Confirma que la recolección se ha COMPLETADO exitosamente?\n\n⚠️ Esta acción marcará la solicitud como finalizada y no se puede deshacer.')) {
      return;
    }

    setCompleting(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || appointmentData.collectorId || appointmentData.recyclerId;

      const url = apiUrl(`/api/appointments/${appointmentId}/complete`);
      console.log('[INFO] POST ->', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      console.log('[INFO] Complete response:', result);

      if (!response.ok) {
        throw new Error(result?.error || `Error ${response.status}`);
      }

      if (result.success) {
        alert('✓ Recolección completada exitosamente.');
        setAppointmentData(prev => prev ? { ...prev, state: APPOINTMENT_STATE.COMPLETED } : prev);
        
        // Verificar si el usuario ya calificó
        if (user?.id) {
          const alreadyRated = await checkUserRated(Number(appointmentId), user.id);
          if (!alreadyRated) {
            setShowRatingModal(true);
          }
        }

      } else {
        throw new Error(result.error || 'Error al completar la cita');
      }
    } catch (err) {
      console.error('[ERROR] Error completing appointment:', err);
      alert(`Error al completar la cita:\n\n${err instanceof Error ? err.message : JSON.stringify(err)}`);
    } finally {
      setCompleting(false);
    }
  };
  const handleRatingModalClose = () => {
    setShowRatingModal(false);
    onCancel();
  };
  
  const handleRatingSuccess = () => {
    setHasRated(true);
    setShowRatingModal(false);
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
              {appointmentData.collectorPhone && (
                <p className="pickupdetail-info-value" style={{ fontSize: '0.9em', color: '#666' }}>
                  Tel: {appointmentData.collectorPhone}
                </p>
              )}
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Reciclador
              </h3>
              <p className="pickupdetail-info-value">
                {appointmentData.recyclerName || 'No asignado'}
              </p>
              {appointmentData.recyclerPhone && (
                <p className="pickupdetail-info-value" style={{ fontSize: '0.9em', color: '#666' }}>
                  Tel: {appointmentData.recyclerPhone}
                </p>
              )}
            </div>
            <div className="pickupdetail-info-block">
              <h3 className="pickupdetail-info-label">
                Estado de Cita
              </h3>
              <p className="pickupdetail-info-value">
                {getAppointmentStateLabel(appointmentData.state)}
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
                {getRequestStateLabel(requestData.state)}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Botones según el estado de la cita */}
      {isAppointmentView && appointmentData && (
        <div className="pickupdetail-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {/* Botones para estado PENDING (0) - SOLO el Reciclador puede aceptar o rechazar */}
          {appointmentData.state === APPOINTMENT_STATE.PENDING && isRecycler() && (
            <>
              <button
                onClick={handleAcceptAppointment}
                className="pickupdetail-accept-button"
                disabled={accepting}
                style={{
                  opacity: accepting ? 0.6 : 1,
                  cursor: accepting ? 'not-allowed' : 'pointer',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                {accepting ? 'Aceptando...' : '✓ Aceptar Solicitud'}
              </button>
              <button
                onClick={handleRejectAppointment}
                className="pickupdetail-reject-button"
                disabled={rejecting}
                style={{
                  opacity: rejecting ? 0.6 : 1,
                  cursor: rejecting ? 'not-allowed' : 'pointer',
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                {rejecting ? 'Rechazando...' : '✕ Rechazar Solicitud'}
              </button>
            </>
          )}

          {/* Mensaje informativo para el recolector cuando está en estado PENDING */}
          {appointmentData.state === APPOINTMENT_STATE.PENDING && isCollector() && (
            <>
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '0.5rem',
                padding: '1rem',
                color: '#856404',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  ⏳ <strong>Esperando confirmación del reciclador</strong>
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9em' }}>
                  Tu solicitud de recolección está pendiente. El reciclador debe aceptarla para continuar.
                </p>
              </div>
              
              {/* Botón para que el recolector cancele su propia agenda */}
              <button
                onClick={handleCancelAppointment}
                className="pickupdetail-cancel-button"
                disabled={cancelling}
                style={{
                  opacity: cancelling ? 0.6 : 1,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                {cancelling ? 'Cancelando...' : '🗑️ Cancelar mi Agenda'}
              </button>
            </>
          )}

          {/* Botones para estado ACCEPTED (1) - Ambos pueden cancelar o completar */}
          {appointmentData.state === APPOINTMENT_STATE.ACCEPTED && (
            <>
              <button
                onClick={handleCompleteAppointment}
                className="pickupdetail-complete-button"
                disabled={completing}
                style={{
                  opacity: completing ? 0.6 : 1,
                  cursor: completing ? 'not-allowed' : 'pointer',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                {completing ? 'Completando...' : '✓ Marcar como Completado'}
              </button>
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
            </>
          )}

          {/* Mostrar mensaje para estados terminales */}
          {appointmentData.state === APPOINTMENT_STATE.REJECTED && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#ffebee',
              borderRadius: '0.5rem',
              color: '#c62828',
              textAlign: 'center',
              fontWeight: 500
            }}>
              ⚠️ Esta cita fue rechazada
            </div>
          )}

          {appointmentData.state === APPOINTMENT_STATE.CANCELLED && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fff3e0',
              borderRadius: '0.5rem',
              color: '#e65100',
              textAlign: 'center',
              fontWeight: 500
            }}>
              ⚠️ Esta cita ha sido cancelada
            </div>
          )}

          {appointmentData.state === APPOINTMENT_STATE.COMPLETED && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '0.5rem',
              color: '#2e7d32',
              textAlign: 'center',
              fontWeight: 500
            }}>
              ✓ Esta recolección se ha completado exitosamente
            </div>
          )}

          {/* Botón cerrar siempre disponible */}
          <button
            onClick={onCancel}
            className="pickupdetail-close-button"
            style={{
              backgroundColor: '#9e9e9e',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 600
            }}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Botón para vista de request solamente (sin appointment) */}
      {!isAppointmentView && (
        <button
          onClick={onCancel}
          className="pickupdetail-cancel-button"
        >
          Cerrar
        </button>
      )}
      {showRatingModal && appointmentData && (
        <RatingModal 
          appointmentId={Number(appointmentId)}
          ratedToUserId={isRecycler() ? appointmentData.collectorId! : appointmentData.recyclerId!}
          ratedToName={isRecycler() ? (appointmentData.collectorName || 'Recolector') : (appointmentData.recyclerName || 'Reciclador')}
          userRole={isRecycler() ? 'reciclador' : 'recolector'}
          onClose={handleRatingModalClose}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default PickupInfo;