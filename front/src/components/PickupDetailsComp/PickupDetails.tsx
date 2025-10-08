import React from 'react';
import Header from './Header';
import PickupInfo from './PickupInfo';
import SimpleMap from '../CollectorMapComps/SimpleMap'; 
import './PickupDetails.css'; 

const PickupDetails: React.FC = () => {
  const handleCancel = () => {
    alert('Recojo cancelado');
  };

  const handleBack = () => {
    window.history.back();
  };

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
            <SimpleMap />
          </div>
          
          
        </div>

        {/* Pickup Info Section */}
        <div className="pickupdetail-info-section">
          <PickupInfo onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default PickupDetails;