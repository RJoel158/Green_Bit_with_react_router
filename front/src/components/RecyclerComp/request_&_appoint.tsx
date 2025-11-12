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
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger para refrescar historial

  // Función para refrescar el historial (se llama desde otros componentes)
  const refreshHistory = () => {
    console.log('[DEBUG] refreshHistory called, incrementing trigger');
    setRefreshTrigger(prev => prev + 1);
  };

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

          // Historial: TODAS las citas finalizadas (COMPLETED, REJECTED, CANCELLED) - limitado a 5 más recientes
          const allAppointments = await getAppointmentsByRecycler(user.id, undefined, 50);
          // Filtrar solo las que están en estado final (no pendientes ni activas)
          const history = allAppointments.filter(apt => 
            apt.state === APPOINTMENT_STATE.COMPLETED || 
            apt.state === APPOINTMENT_STATE.REJECTED || 
            apt.state === APPOINTMENT_STATE.CANCELLED
          );
          setAppointmentHistory(history);

        } else if (user.role === 'recolector') {
          // Para recolectores
          // Citas pendientes: appointmentconfirmation con state = PENDING (0)
          const pendingAppts = await getAppointmentsByCollector(user.id, APPOINTMENT_STATE.PENDING);
          setPendingAppointments(pendingAppts);

          // Citas activas: appointmentconfirmation con state = ACCEPTED (1)
          const activeAppts = await getAppointmentsByCollector(user.id, APPOINTMENT_STATE.ACCEPTED);
          setActiveAppointments(activeAppts);

          // Historial: TODAS las citas finalizadas (COMPLETED, REJECTED, CANCELLED) - limitado a 5 más recientes
          const allAppointments = await getAppointmentsByCollector(user.id, undefined, 5);
          // Filtrar solo las que están en estado final (no pendientes ni activas)
          const history = allAppointments.filter(apt => 
            apt.state === APPOINTMENT_STATE.COMPLETED || 
            apt.state === APPOINTMENT_STATE.REJECTED || 
            apt.state === APPOINTMENT_STATE.CANCELLED
          );
          setAppointmentHistory(history);
        }
        
        // Limpiar flag de completado
        localStorage.removeItem('appointmentCompleted');

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
  }, [user, refreshTrigger]);

  // Escuchar cambios en localStorage para refrescar cuando se completa una cita
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appointmentCompleted' && e.newValue) {
        console.log('[INFO] Appointment completed detected, refreshing history...');
        setRefreshTrigger(prev => prev + 1);
      }
    };

    // Listener para cambios desde otra pestaña
    window.addEventListener('storage', handleStorageChange);
    
    // Para cambios en la MISMA pestaña, usar polling
    const checkInterval = setInterval(() => {
      const completed = localStorage.getItem('appointmentCompleted');
      if (completed) {
        // Verificar si es reciente (menos de 5 segundos)
        const completedTime = parseInt(completed);
        const now = Date.now();
        if (now - completedTime < 5000) {
          console.log('[INFO] Recent appointment completion detected, refreshing...');
          setRefreshTrigger(prev => prev + 1);
        }
      }
    }, 1000); // Chequear cada segundo

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderRequestCard = (request: Request) => (
    <div key={request.id} className="card appointment-card mb-2">
      <div className="card-body d-flex align-items-start gap-2">
        <div className="appointment-icon">♻️</div>
        <div className="flex-grow-1">
          <h5 className="card-title appointment-title mb-1">
            {request.materialName || 'Material de reciclaje'}
          </h5>
          <p className="card-text appointment-desc mb-2">{request.description}</p>
          <div className="appointment-date mb-2">
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
    <div key={appointment.id} className="card appointment-card mb-2">
      <div className="card-body d-flex align-items-start gap-2">
        <div className="appointment-icon">♻️</div>
        <div className="flex-grow-1">
          <h5 className="card-title appointment-title mb-1">
            {appointment.materialName || 'Material de reciclaje'}
          </h5>
          <p className="card-text appointment-desc mb-2">{appointment.description}</p>
          <div className="appointment-date mb-2">
            📅 {formatDate(appointment.acceptedDate)} 🕐 {appointment.acceptedHour}
          </div>
          {user.role === 'reciclador' && appointment.collectorName && (
            <div className="mb-2 p-2" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '6px' }}>
              {appointment.collectorCompanyName ? (
                <>
                  <p className="appointment-collector mb-1">
                    <strong>🏢 Recolector:</strong> {appointment.collectorCompanyName}
                  </p>
                  {appointment.collectorNit && (
                    <p className="appointment-collector mb-0">
                      <strong>NIT:</strong> {appointment.collectorNit}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="appointment-collector mb-1">
                    <strong>👤 Recolector:</strong> {appointment.collectorName}
                  </p>
                  {appointment.collectorPhone && (
                    <p className="appointment-collector mb-0">
                      <strong>📞</strong> {appointment.collectorPhone}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          {user.role === 'recolector' && appointment.recyclerName && (
            <div className="mb-2 p-2" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '6px' }}>
              {appointment.recyclerCompanyName ? (
                <>
                  <p className="appointment-recycler mb-1">
                    <strong>🏢 Reciclador:</strong> {appointment.recyclerCompanyName}
                  </p>
                  {appointment.recyclerNit && (
                    <p className="appointment-recycler mb-0">
                      <strong>NIT:</strong> {appointment.recyclerNit}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="appointment-recycler mb-1">
                    <strong>👤 Reciclador:</strong> {appointment.recyclerName}
                  </p>
                  {appointment.recyclerPhone && (
                    <p className="appointment-recycler mb-0">
                      <strong>📞</strong> {appointment.recyclerPhone}
                    </p>
                  )}
                </>
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
