import React, { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from './Header';
import PickupInfo from './PickupInfo';
import SimpleMap from '../CollectorMapComps/SimpleMap'; 
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
    setMapLocation({ lat, lng });
  }, []);

  return (
    <div className="pickupdetail-page">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="pickupdetail-content">
        {/* Map Section */}
        <div className="pickupdetail-map-section">
            {/* Botón Volver */}
          <button
            onClick={handleBack}
            className="pickupdetail-back-button"
          >
            ← Volver
          </button>
          <div className="pickupdetail-map-wrapper">
            {/* Componente SimpleMap */}
            <SimpleMap 
              markerPosition={mapLocation ? [mapLocation.lat, mapLocation.lng] : undefined}
              center={mapLocation ? [mapLocation.lat, mapLocation.lng] : undefined}
              markerText="Punto de recojo"
            />
          </div>
          
          
        </div>

        {/* Pickup Info Section */}
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
  );
};

export default PickupDetails;