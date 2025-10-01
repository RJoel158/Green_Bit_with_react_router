import "./requestandappointment.css";

// Agregado para la logica de mostrar modal
import { useState } from "react";
// Agregado para la logica de mostrar modal
import SchedulePickupModal from "../SchedulePickupComp/SchedulePickupModal";


export default function RequestAndAppoint() {
  // Agregado para la logica del modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  return (
    <div>
      <div className="request-appoint-container">
        {/* Solicitudes Activas */}
        <div className="appointments-column">
          <h3>Solicitudes activas</h3>
          <div className="appointment-card">
            <div className="appointment-icon">♻️</div>
            <div className="appointment-details">
              <p className="appointment-title">Reciclaje de cartón</p>
              <p className="appointment-desc">
                2 cajas medianas de cartón en buen estado
              </p>
              {/* Cambiado para logica de mostrar el modal */}
              <button className="details-button" onClick={() => setShowScheduleModal(true)}>
                Abrir Schedule Pickup
              </button>
            </div>
          </div>
        </div>

        {/* Citas Activas */}
        <div className="appointments-column">
          <h3>Citas activas</h3>
          <div className="appointment-card">
            <div className="appointment-icon">♻️</div>
            <div className="appointment-details">
              <p className="appointment-title">Reciclaje de cartón</p>
              <p className="appointment-desc">
                2 cajas medianas de cartón en buen estado
              </p>
              {/* Cambiado para probar el admin dashboard */}
              <a href="/adminDashboard" className="details-button">Ir a Admin Dashborad</a>
            </div>
          </div>
          <div className="appointment-card">
            <div className="appointment-icon">♻️</div>
            <div className="appointment-details">
              <p className="appointment-title">Reciclaje de cartón</p>
              <p className="appointment-desc">
                3 bolsas grandes de plástico transparente
              </p>
              <a href="#" className="details-button">Ver Detalles</a>
            </div>
          </div>
        </div>

        {/* Historial de Citas */}
        <div className="appointments-column">
          <h3>Historial de citas</h3>
          <div className="appointment-card">
            <div className="appointment-icon">♻️</div>
            <div className="appointment-details">
              <p className="appointment-title">Reciclaje de cartón</p>
              <p className="appointment-desc">
                1 caja pequeña y 5 botellas de vidrio
              </p>
              <a href="#" className="details-button">Ver Detalles</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        © 2025 GreenBit · Todos los derechos reservados
      </footer>

      
      {/* Agregado para el modal */}
       <SchedulePickupModal
        show={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
    
  );
  
}
