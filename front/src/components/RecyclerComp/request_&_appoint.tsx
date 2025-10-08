import "./requestandappointment.css";





export default function RequestAndAppoint() {
 
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
              {/* Cambiado para ver el pickupDetails */}
              <a href="/pickupDetails" className="details-button">Ir a Detalles</a>
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

      
    
    </div>
    
  );
  
}
