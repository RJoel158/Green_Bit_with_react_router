import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
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
    <div key={request.id} className="card appointment-card mb-3">
      <div className="card-body d-flex align-items-start gap-3">
        <div className="appointment-icon">♻️</div>
        <div className="flex-grow-1">
          <h5 className="card-title appointment-title mb-2">
            {request.materialName || 'Material de reciclaje'}
          </h5>
          <p className="card-text appointment-desc mb-3">{request.description}</p>
          <div className="appointment-date mb-3">
            📅 {formatDate(request.registerDate)}
          </div>
          <Link to={`/pickupDetails/${request.id}`} className="btn btn-sm details-button w-100">
            Ver Detalles →
          </Link>
        </div>
      </div>
    </div>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <div key={appointment.id} className="card appointment-card mb-3">
      <div className="card-body d-flex align-items-start gap-3">
        <div className="appointment-icon">♻️</div>
        <div className="flex-grow-1">
          <h5 className="card-title appointment-title mb-2">
            {appointment.materialName || 'Material de reciclaje'}
          </h5>
          <p className="card-text appointment-desc mb-3">{appointment.description}</p>
          <div className="appointment-date mb-3">
            📅 {formatDate(appointment.acceptedDate)} <br></br>🕐 {appointment.acceptedHour}
          </div>
          {user.role === 'reciclador' && appointment.collectorName && (
            <div className="mb-3 p-2" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}>
              <p className="appointment-collector mb-1">
                <strong>👤 Recolector:</strong> {appointment.collectorName}
              </p>
              {appointment.collectorPhone && (
                <p className="appointment-collector mb-0">
                  <strong>📞 Tel:</strong> {appointment.collectorPhone}
                </p>
              )}
            </div>
          )}
          {user.role === 'recolector' && appointment.recyclerName && (
            <div className="mb-3 p-2" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}>
              <p className="appointment-recycler mb-1">
                <strong>👤 Reciclador:</strong> {appointment.recyclerName}
              </p>
              {appointment.recyclerPhone && (
                <p className="appointment-recycler mb-0">
                  <strong>📞 Tel:</strong> {appointment.recyclerPhone}
                </p>
              )}
            </div>
          )}
          <Link 
            to={`/pickupDetails/${appointment.idRequest}?appointmentId=${appointment.id}`} 
            className="btn btn-sm details-button w-100"
          >
            Ver Detalles →
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container my-4 px-3">
        <div className="row g-4">
          {user.role === 'reciclador' ? (
            <>
              {/* Para Recicladores */}
              {/* Solicitudes Activas */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="appointments-column">
                  <h3 className="text-center mb-4">Solicitudes activas</h3>
                  {activeRequests.length > 0 ? (
                    activeRequests.map(renderRequestCard)
                  ) : (
                    <div className="no-data text-center p-4">No hay solicitudes activas</div>
                  )}
                </div>
              </div>

              {/* Citas Activas */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="appointments-column">
                  <h3 className="text-center mb-4">Citas activas</h3>
                  {activeAppointments.length > 0 ? (
                    activeAppointments.map(renderAppointmentCard)
                  ) : (
                    <div className="no-data text-center p-4">No hay citas activas</div>
                  )}
                </div>
              </div>

              {/* Historial de Citas */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="appointments-column">
                  <h3 className="text-center mb-4">Historial de citas</h3>
                  {appointmentHistory.length > 0 ? (
                    appointmentHistory.map(renderAppointmentCard)
                  ) : (
                    <div className="no-data text-center p-4">No hay historial de citas</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Para Recolectores */}
              {/* Citas Pendientes */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="appointments-column">
                  <h3 className="text-center mb-4">Citas pendientes</h3>
                  {pendingAppointments.length > 0 ? (
                    pendingAppointments.map(renderAppointmentCard)
                  ) : (
                    <div className="no-data text-center p-4">No hay citas pendientes</div>
                  )}
                </div>
              </div>

              {/* Citas Activas */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="appointments-column">
                  <h3 className="text-center mb-4">Citas activas</h3>
                  {activeAppointments.length > 0 ? (
                    activeAppointments.map(renderAppointmentCard)
                  ) : (
                    <div className="no-data text-center p-4">No hay citas activas</div>
                  )}
                </div>
              </div>

              {/* Historial de Citas */}
              <div className="col-12 col-md-6 col-lg-4">
                <div className="appointments-column">
                  <h3 className="text-center mb-4">Historial de citas</h3>
                  {appointmentHistory.length > 0 ? (
                    appointmentHistory.map(renderAppointmentCard)
                  ) : (
                    <div className="no-data text-center p-4">No hay historial de citas</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        © 2025 GreenBit · Todos los derechos reservados
      </footer>
    </div>
  );
}
