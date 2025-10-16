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

  // Función para cerrar/volver (no es para cancelar la cita)
  const handleClose = () => {
    navigate(-1); // Volver a la página anterior
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

  console.log(' PickupDetails component rendered');
  console.log(' Map location state:', mapLocation);

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
                 Ubicación del Recojo
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
                onCancel={handleClose}
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