import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../config/environment';
import './PickupDetails.css';
import ImageCarousel from './ImageCarousel';

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
}

const PickupInfo: React.FC<PickupInfoProps> = ({ requestId, appointmentId, onCancel, onLocationUpdate }) => {
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {/* Imágenes del material */}
      {requestData?.images && requestData.images.length > 0 ? (
        <ImageCarousel 
          images={requestData.images} 
          apiUrl={apiUrl('')}
        />
      ) : (
        <div className="pickupdetail-no-images">
          <p>No hay imágenes disponibles para esta solicitud</p>
        </div>
      )}

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
                 appointmentData.state === 2 ? 'En Progreso' : 'Completada'}
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

      {/* Botón cancelar */}
      <button 
        onClick={onCancel}
        className="pickupdetail-cancel-button"
      >
        Cancelar Recojo
      </button>
    </div>
  );
};

export default PickupInfo;