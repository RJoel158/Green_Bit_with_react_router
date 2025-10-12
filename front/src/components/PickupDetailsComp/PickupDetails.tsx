import React, { useCallback, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import PickupInfo from './PickupInfo';
import SimplePickupMap from './SimplePickupMap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './PickupDetails.css';

interface MapLocation {
  lat: number;
  lng: number;
}

const PickupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [mapLocation, setMapLocation] = React.useState<MapLocation | null>(null);
  const navigate = useNavigate();

  // ✅ Manejo seguro del botón "Cancelar cita"
  const handleCancel = async () => {
    if (!appointmentId) {
      alert('No se encontró el ID de la cita');
      return;
    }

    // Confirmación antes de cancelar
    if (!window.confirm('¿Estás seguro que deseas cancelar esta cita?')) {
      return;
    }

    try {
      console.log('🚀 Enviando solicitud de cancelación para appointment:', appointmentId);
      
      // La ruta correcta según tu server.js es /api/appointments/cancel/:id
      const response = await fetch(`/api/appointments/cancel/${appointmentId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          userId: 1, // Reemplaza con el ID real del usuario autenticado
          userRole: 'recycler' // O 'collector' según corresponda
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers.get('content-type'));

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ La respuesta no es JSON. Contenido recibido:', text.substring(0, 200));
        alert('Error: El servidor no respondió correctamente. Verifica que la ruta esté configurada.');
        return;
      }

      const data = await response.json();
      console.log('✅ Respuesta JSON:', data);

      if (response.ok && data.success) {
        alert('Cita cancelada con éxito. La solicitud estará disponible nuevamente en el mapa.');
        navigate(-1); // Volver a la página anterior
      } else {
        alert(data.error || 'Error al cancelar la cita');
      }

    } catch (error) {
      console.error('⚠️ Error en la solicitud:', error);
      alert('Error al conectar con el servidor. Revisa la consola para más detalles.');
    }
  };

  // Botón para volver
  const handleBack = () => {
    window.history.back();
  };

  // Actualiza la ubicación del mapa
  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    console.log('📍 Ubicación actualizada:', lat, lng);
    setMapLocation({ lat, lng });
  }, []);

  console.log('📄 PickupDetails component rendered');
  console.log('📍 Map location state:', mapLocation);

  // Fuerza el redibujado del mapa (por compatibilidad con Leaflet)
  useEffect(() => {
    console.log('🗺️ Iniciando refresh del mapa...');
    const timers = [100, 500, 1000, 2000].map((delay, index) =>
      setTimeout(() => {
        console.log(`⚡ Disparando resize event #${index + 1} en ${delay}ms`);
        window.dispatchEvent(new Event('resize'));
      }, delay)
    );

    return () => {
      console.log('🧹 Limpiando timers del mapa');
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="pickupdetail-page">
      {/* Header */}
      <Header />

      {/* Main Content with Bootstrap */}
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="row g-4 min-vh-100">
          
          {/* Botón Volver */}
          <div className="col-12">
            <button
              onClick={handleBack}
              className="btn btn-link pickupdetail-back-button p-0"
            >
              ← Volver
            </button>
          </div>

          {/* Sección del Mapa */}
          <div className="col-12 col-lg-8">
            <div className="pickupdetail-map-section">
              <h3 className="mb-3" style={{ color: '#4C7C5B', fontWeight: '600' }}>
                📍 Ubicación del Recojo
              </h3>
              <div
                className="pickupdetail-map-wrapper"
                style={{
                  height: '600px',
                  width: '100%',
                  position: 'relative',
                  border: '3px solid #4C7C5B',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  backgroundColor: '#e6f3e6',
                }}
              >
                <SimplePickupMap
                  markerPosition={mapLocation ? [mapLocation.lat, mapLocation.lng] : undefined}
                  center={mapLocation ? [mapLocation.lat, mapLocation.lng] : undefined}
                  markerText="Punto de recojo"
                />
              </div>
            </div>
          </div>

          {/* Sección de información */}
          <div className="col-12 col-lg-4">
            <div className="pickupdetail-info-section">
              <PickupInfo
                requestId={id}
                appointmentId={appointmentId}
                onCancel={handleCancel}
                onLocationUpdate={handleLocationUpdate}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PickupDetails;