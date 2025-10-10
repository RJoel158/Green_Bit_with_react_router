import React, { useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  
  const handleCancel = () => {
    alert('Recojo cancelado');
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    console.log('Ubicación actualizada:', lat, lng);
    setMapLocation({ lat, lng });
  }, []);

  console.log(' Map location state:', mapLocation);
  console.log('PickupDetails component rendered');

  // Force map refresh after component mounts - AGRESIVO
  useEffect(() => {
    console.log('Iniciando refresh del mapa...');
    
    const timers = [100, 500, 1000, 2000].map((delay, index) => 
      setTimeout(() => {
        console.log(` Disparando resize event #${index + 1} en ${delay}ms`);
        window.dispatchEvent(new Event('resize'));
      }, delay)
    );

    return () => {
      console.log('Limpiando timers del mapa');
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="pickupdetail-page">
      {/* Header */}
      <Header />

      {/* Main Content with Bootstrap */}
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="row g-4 min-vh-100">
          {/* Botón Volver - Fuera del grid */}
          <div className="col-12">
            <button
              onClick={handleBack}
              className="btn btn-link pickupdetail-back-button p-0"
            >
              ← Volver
            </button>
          </div>
          
          {/* Map Section - MÁS GRANDE */}
          <div className="col-12 col-lg-8">
            <div className="pickupdetail-map-section">
              <h3 className="mb-3" style={{ color: '#4C7C5B', fontWeight: '600' }}>📍 Ubicación del Recojo</h3>
              <div 
                className="pickupdetail-map-wrapper" 
                style={{ 
                  height: '600px', 
                  width: '100%', 
                  position: 'relative',
                  border: '3px solid #4C7C5B',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  backgroundColor: '#e6f3e6'
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

          {/* Pickup Info Section - MÁS PEQUEÑA */}
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