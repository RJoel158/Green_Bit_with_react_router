import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./requestandappointment.css";
import { getRequestsByUserAndState } from "../../services/requestService";
import { getAppointmentsByRecycler, getAppointmentsByCollector } from "../../services/appointmentService";
import type { Appointment } from "../../services/appointmentService";
import type { Request } from "../../services/requestService";
import { REQUEST_STATE, APPOINTMENT_STATE } from "../../shared/constants";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  state: number;
  avatar?: string;
}

interface RequestAndAppointProps {
  user: User;
}

export default function RequestAndAppoint({ user }: RequestAndAppointProps) {
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user.role === 'reciclador') {
          // Para recicladores
          // Solicitudes activas: requests con state = OPEN (1) - disponibles para recoger
          const requests = await getRequestsByUserAndState(user.id, REQUEST_STATE.OPEN);
          setActiveRequests(requests);

          // Citas activas: appointmentconfirmation con state = ACCEPTED (1)
          const activeAppts = await getAppointmentsByRecycler(user.id, APPOINTMENT_STATE.ACCEPTED);
          setActiveAppointments(activeAppts);

          // Historial: todas las appointmentconfirmation (limitado a 3 más recientes)
          const history = await getAppointmentsByRecycler(user.id, undefined, 3);
          setAppointmentHistory(history);

        } else if (user.role === 'recolector') {
          // Para recolectores
          // Citas pendientes: appointmentconfirmation con state = PENDING (0)
          const pendingAppts = await getAppointmentsByCollector(user.id, APPOINTMENT_STATE.PENDING);
          setPendingAppointments(pendingAppts);

          // Citas activas: appointmentconfirmation con state = ACCEPTED (1)
          const activeAppts = await getAppointmentsByCollector(user.id, APPOINTMENT_STATE.ACCEPTED);
          setActiveAppointments(activeAppts);

          // Historial: todas las appointmentconfirmation (limitado a 3 más recientes)
          const history = await getAppointmentsByCollector(user.id, undefined, 3);
          setAppointmentHistory(history);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderRequestCard = (request: Request) => (
    <div key={request.id} className="appointment-card">
      <div className="appointment-icon">♻️</div>
      <div className="appointment-details">
        <p className="appointment-title">{request.materialName || 'Material de reciclaje'}</p>
        <p className="appointment-desc">{request.description}</p>
        <p className="appointment-date">Fecha: {formatDate(request.registerDate)}</p>
        <Link to={`/pickupDetails/${request.id}`} className="details-button">Ir a Detalles</Link>
      </div>
    </div>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <div key={appointment.id} className="appointment-card">
      <div className="appointment-icon">♻️</div>
      <div className="appointment-details">
        <p className="appointment-title">{appointment.materialName || 'Material de reciclaje'}</p>
        <p className="appointment-desc">{appointment.description}</p>
        <p className="appointment-date">
          Fecha: {formatDate(appointment.acceptedDate)} - {appointment.acceptedHour}
        </p>
        {user.role === 'reciclador' && appointment.collectorName && (
          <>
            <p className="appointment-collector">Recolector: {appointment.collectorName}</p>
            {appointment.collectorPhone && (
              <p className="appointment-collector">Tel: {appointment.collectorPhone}</p>
            )}
          </>
        )}
        {user.role === 'recolector' && appointment.recyclerName && (
          <>
            <p className="appointment-recycler">Reciclador: {appointment.recyclerName}</p>
            {appointment.recyclerPhone && (
              <p className="appointment-recycler">Tel: {appointment.recyclerPhone}</p>
            )}
          </>
        )}
        <Link to={`/pickupDetails/${appointment.idRequest}?appointmentId=${appointment.id}`} className="details-button">Ver Detalles</Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="request-appoint-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="request-appoint-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="request-appoint-container">
        {user.role === 'reciclador' ? (
          <>
            {/* Para Recicladores */}
            {/* Solicitudes Activas */}
            <div className="appointments-column">
              <h3>Solicitudes activas</h3>
              {activeRequests.length > 0 ? (
                activeRequests.map(renderRequestCard)
              ) : (
                <div className="no-data">No hay solicitudes activas</div>
              )}
            </div>

            {/* Citas Activas */}
            <div className="appointments-column">
              <h3>Citas activas</h3>
              {activeAppointments.length > 0 ? (
                activeAppointments.map(renderAppointmentCard)
              ) : (
                <div className="no-data">No hay citas activas</div>
              )}
            </div>

            {/* Historial de Citas */}
            <div className="appointments-column">
              <h3>Historial de citas</h3>
              {appointmentHistory.length > 0 ? (
                appointmentHistory.map(renderAppointmentCard)
              ) : (
                <div className="no-data">No hay historial de citas</div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Para Recolectores */}
            {/* Citas Pendientes */}
            <div className="appointments-column">
              <h3>Citas pendientes</h3>
              {pendingAppointments.length > 0 ? (
                pendingAppointments.map(renderAppointmentCard)
              ) : (
                <div className="no-data">No hay citas pendientes</div>
              )}
            </div>

            {/* Citas Activas */}
            <div className="appointments-column">
              <h3>Citas activas</h3>
              {activeAppointments.length > 0 ? (
                activeAppointments.map(renderAppointmentCard)
              ) : (
                <div className="no-data">No hay citas activas</div>
              )}
            </div>

            {/* Historial de Citas */}
            <div className="appointments-column">
              <h3>Historial de citas</h3>
              {appointmentHistory.length > 0 ? (
                appointmentHistory.map(renderAppointmentCard)
              ) : (
                <div className="no-data">No hay historial de citas</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        © 2025 GreenBit · Todos los derechos reservados
      </footer>
    </div>
  );
}
