import React from 'react';
import './PickupDetails.css';

interface PickupInfoProps {
  onCancel: () => void;
}

const PickupInfo: React.FC<PickupInfoProps> = ({ onCancel }) => {
  return (
    <div className="pickupdetail-pickup-container">
      <h2 className="pickupdetail-pickup-title">
        Reciclaje de Cartón
      </h2>

      {/* Imagen placeholder */}
      <div className="pickupdetail-pickup-image">
        {/* Aquí iría la imagen del cartón */}
      </div>

      {/* Descripción */}
      <p className="pickupdetail-pickup-description">
        Cartón de embalaje en buen estado (cajas medianas y grandes). 
        No tiene manchas de grasa ni humedad.
      </p>

      {/* Información de contacto */}
      <div className="pickupdetail-pickup-grid">
        <div className="pickupdetail-info-block">
          <h3 className="pickupdetail-info-label">
            Día y Hora
          </h3>
          <p className="pickupdetail-info-value">
            Viernes 12/12/25
          </p>
          <p className="pickupdetail-info-value">
            15:45
          </p>
        </div>
        <div className="pickupdetail-info-block">
          <h3 className="pickupdetail-info-label">
            Número de contacto
          </h3>
          <p className="pickupdetail-info-value">
            +591 XXXXXXXX
          </p>
        </div>
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