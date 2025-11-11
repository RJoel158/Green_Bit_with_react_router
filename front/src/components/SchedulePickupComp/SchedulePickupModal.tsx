import React, { useState, useEffect } from 'react';
import './SchedulePickup.css';
import SuccessModal from '../CommonComp/SuccesModal';
import ImageCarousel from './ImageCarousel';
import { debugLog } from '../../config/environment';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/endpoints';

interface SchedulePickupModalProps {
  show: boolean;
  onClose: () => void;
  selectedRequest: { id: number };
  onScheduleSuccess?: () => void;  // Callback para actualizar el mapa después de agendar exitosamente
}

interface DayAvailability {
  day: string;
  shortName: string;
  available: boolean;
}

interface Image {
  id: number;
  image: string;
  uploadedDate: string;
}

interface RequestData {
  id: number;
  idUser: number;  // ID del dueño de la solicitud
  name: string;
  description: string;
  startHour: string;
  endHour: string;
  images: Image[];
  daysAvailability: {
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    Sunday: number;
  };
}


const SchedulePickupModal: React.FC<SchedulePickupModalProps> = ({
  show,
  onClose,
  selectedRequest,
  onScheduleSuccess
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false); 
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false); // Estado para bloquear botón durante submit
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [daysAvailability, setDaysAvailability] = useState<DayAvailability[]>([]);
  const [timeError, setTimeError] = useState<string>(''); // Error de validación de hora

  //Valida el formato de hora
  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };
  //Convierte la hora al formato HH:MM:SS
  const normalizeTimeToSQL = (time: string): string => {
    if (!time) return '';

    if (time.split(':').length === 3) {
      return time;
    }

    if (time.split(':').length === 2) {
      return `${time}:00`;
    }

    return time;
  };

  /**
   * Mapeo de días de la semana de inglés a español
   
   */
  const dayMapping: { [key: string]: { full: string; short: string } } = {
    Monday: { full: 'Lunes', short: 'Lun' },
    Tuesday: { full: 'Martes', short: 'Mar' },
    Wednesday: { full: 'Miércoles', short: 'Mié' },
    Thursday: { full: 'Jueves', short: 'Jue' },
    Friday: { full: 'Viernes', short: 'Vie' },
    Saturday: { full: 'Sábado', short: 'Sáb' },
    Sunday: { full: 'Domingo', short: 'Dom' }
  };

  /**
   * Cargar datos de la solicitud cuando el modal se abre
   */
  useEffect(() => {
    if (show && selectedRequest?.id) {
      fetchRequestData();
    }
  }, [show, selectedRequest]);

  /**
   * Formatea la hora eliminando segundos y milisegundos
   */
  const formatTime = (time: string): string => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  /**
   * Obtiene los datos de la solicitud desde el backend
   * Usa el endpoint getByIdWithAdditionalInfo que trae:
   * - Información del material
   * - Descripción de la solicitud
   * - Horario disponible (startHour, endHour)
   * - Días disponibles (Monday-Sunday con valores 0 o 1)
   */
  const fetchRequestData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        API_ENDPOINTS.REQUESTS.SCHEDULE(selectedRequest.id)
      );

      if (response.data.success && response.data.data) {
        debugLog('[INFO] SchedulePickupModal: Received request data:', response.data.data);
        debugLog('[INFO] SchedulePickupModal: Images received:', response.data.data.images);
        
        // Formatear las horas antes de guardar (remover segundos/milisegundos)
        const formattedData = {
          ...response.data.data,
          startHour: formatTime(response.data.data.startHour),
          endHour: formatTime(response.data.data.endHour)
        };
        
        debugLog('[INFO] SchedulePickupModal: Setting formatted data:', formattedData);
        setRequestData(formattedData);

        // Parsear daysAvailability
        const daysData = typeof response.data.data.daysAvailability === 'string'
          ? JSON.parse(response.data.data.daysAvailability)
          : response.data.data.daysAvailability;

        // Crear array de disponibilidad de días en español
        const days: DayAvailability[] = Object.entries(dayMapping).map(([engDay, spanish]) => ({
          day: spanish.full,
          shortName: spanish.short,
          available: daysData[engDay] === 1
        }));

        setDaysAvailability(days);

        // Seleccionar automáticamente el primer día disponible
        const firstAvailable = days.find(d => d.available);
        if (firstAvailable) {
          setSelectedDay(firstAvailable.day);
        }
      }
    } catch (err) {
      console.error('Error fetching request data:', err);
      setError('No se pudieron cargar los datos de la solicitud');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula la próxima fecha para un día de la semana específico
   */
  const getNextDateForDay = (dayName: string): string => {
    const daysMap: { [key: string]: number } = {
      'Domingo': 0,
      'Lunes': 1,
      'Martes': 2,
      'Miércoles': 3,
      'Jueves': 4,
      'Viernes': 5,
      'Sábado': 6
    };

    const today = new Date();
    const targetDay = daysMap[dayName];
    const todayDay = today.getDay();

    // Calcular diferencia de días
    let diff = targetDay - todayDay;
    if (diff <= 0) diff += 7; // Si el día ya pasó, tomar la próxima semana

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);

    // Formatear fecha
    const day = nextDate.getDate().toString().padStart(2, '0');
    const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');
    const year = nextDate.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
  };

  /**
   * Valida si una hora está dentro del rango permitido
   * Convierte las horas a minutos para facilitar la comparación
   */
  const isTimeInRange = (time: string): boolean => {
    if (!time || !requestData) return false;

    // Convertir horas a minutos totales para comparación
    const selectedMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const startMinutes = parseInt(requestData.startHour.split(':')[0]) * 60 + parseInt(requestData.startHour.split(':')[1]);
    const endMinutes = parseInt(requestData.endHour.split(':')[0]) * 60 + parseInt(requestData.endHour.split(':')[1]);

    return selectedMinutes >= startMinutes && selectedMinutes <= endMinutes;
  };

  /**

   * Limpia cualquier error previo cuando el usuario modifica la hora
   */
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);

    // Limpiar mensaje de error al cambiar la hora
    if (timeError) {
      setTimeError('');
    }
  };

  const handleConfirm = async () => {
   // Validar que se haya ingresado una hora
    if (!selectedTime) {
      setTimeError('Por favor selecciona una hora');
      return;
    }
    
    // Validar formato de hora
    if (!validateTimeFormat(selectedTime)) {
      setTimeError('Formato de hora inválido. Use HH:MM');
      return;
    }
    
    // Validar que la hora esté dentro del rango permitido
    if (!isTimeInRange(selectedTime)) {
      setTimeError(`La hora debe estar entre ${requestData?.startHour} y ${requestData?.endHour}`);
      return;
    }
    
    // Bloquear el botón mientras se procesa
    setSubmitting(true);
    
    try {
      // Obtener el ID del recolector desde localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setTimeError('No se encontró información del usuario. Por favor inicia sesión nuevamente.');
        setSubmitting(false);
        return;
      }

      const parsedUser = JSON.parse(userStr);
      const collectorId = parsedUser.id;

      if (!collectorId) {
        setTimeError('No se pudo obtener el ID del recolector');
        setSubmitting(false);
        return;
      }

      // VALIDACIÓN CRÍTICA: Verificar que el recolector no esté intentando aceptar su propia solicitud
      if (requestData && requestData.idUser === collectorId) {
        setTimeError('❌ No puedes aceptar tu propia solicitud de reciclaje');
        alert('❌ ERROR: No puedes aceptar tu propia solicitud de reciclaje.\n\nDebes esperar a que otro recolector acepte tu solicitud.');
        setSubmitting(false);
        return;
      }

      // Obtener la próxima fecha para el día seleccionado (formato: "DD/MM/YY")
      const dateString = getNextDateForDay(selectedDay);
      const [day, month, year] = dateString.split('/');
      const fullYear = `20${year}`; // Convertir "25" a "2025"
      
      // Formato DATE para MySQL: "YYYY-MM-DD"
      const acceptedDate = `${fullYear}-${month}-${day}`;

      //Normalizar la hora al formato HH:MM:SS 
      const acceptedHour = normalizeTimeToSQL(selectedTime);

      // Preparar para enviar al backend
      const appointmentData = {
        idRequest: selectedRequest.id,      // ID de la solicitud
        acceptedDate: acceptedDate,         // Fecha en formato YYYY-MM-DD
        collectorId: collectorId,           // ID del recolector
        acceptedHour: acceptedHour          // Hora en formato HH:MM:SS
      };

      console.log('[INFO] Enviando cita:', appointmentData);

      // Realizar petición POST al endpoint de creación de citas
      const response = await api.post(API_ENDPOINTS.APPOINTMENTS.SCHEDULE, appointmentData);

      const result = response.data;

      console.log('[INFO] Response status:', response.status);
      console.log('[INFO] Response data:', result);

      // Verificar si la respuesta fue exitosa (status 200 o 201)
      if (!result.success) {
        const errorMsg = result.error || result.message || 'Error desconocido al crear la cita';
        console.error('[ERROR] Backend error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[SUCCESS] Cita creada:', result);
      
      // Limpiar errores y mostrar modal de confirmación
      setTimeError('');
      setShowSuccess(true);
      
      // Cerrar el modal de agendamiento y refrescar datos después del éxito
      setTimeout(() => {
        onClose();
        // Llamar al callback para actualizar el mapa
        if (onScheduleSuccess) {
          onScheduleSuccess();
        } else {
          // Fallback: recargar la página si no hay callback
          window.location.reload();
        }
      }, 1500);

    } catch (err) {
      console.error('[ERROR] Error al confirmar cita:', err);
      
      let errorMessage = 'Error al agendar el recojo. Intenta nuevamente.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Si es un error de respuesta HTTP
        const status = (err as any).response?.status;
        const errorData = (err as any).response?.data;
        
        if (status === 409) {
          // Si es un conflicto (409), mostrar modal y refrescar el mapa
          setShowConflictModal(true);
        } else if (status === 403) {
          errorMessage = '❌ No puedes aceptar tu propia solicitud de reciclaje.';
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
      }
      
      setTimeError(errorMessage);
    } finally {
      // Siempre desbloquear el botón al terminar
      setSubmitting(false);
    }
  };

  // No renderizar si el modal no está visible
  if (!show) return null;

  return (
    <>
      <div className="modal-overlay d-flex justify-content-center align-items-center"
        onClick={onClose}>
        <div className="modal-box-compact"
          onClick={(e) => e.stopPropagation()}>
          <div className="cardboard-container">
            <div className="pickup-card">
              {/* Estado de carga */}
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando información...</p>
                </div>
              ) : error ? (
                // Estado de error
                <div className="text-center p-4">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                  <button className="btn btn-secondary" onClick={onClose}>
                    Cerrar
                  </button>
                </div>
              ) : requestData ? (

                <>
                  <div className="card-header text-center mb-2">
                    <h4 className="pickup-title">
                      Reciclaje de {requestData.name}
                    </h4>
                  </div>

                  <ImageCarousel
                    images={requestData.images || []}
                    altText={`${requestData.name} reciclable`}
                  />

                  <div className="description mb-2">
                    <p className="text-muted small" style={{ 
                      wordWrap: 'break-word', 
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word'
                    }}>
                      {requestData.description}
                    </p>
                  </div>


                  <div className="availability-section mb-2">
                    <h6 className="section-title mb-2">Disponibilidad de recojo</h6>
                    <div className="days-container">
                      {daysAvailability.map((day) => (
                        <div key={day.day} className="day-item text-center">
                          <div
                            className={`day-checkbox ${day.available ? 'available' : 'unavailable'}`}
                            style={{ cursor: 'default' }}
                          ></div>
                          <small className="day-label">{day.shortName}</small>
                        </div>
                      ))}
                    </div>
                  </div>


                  <div className="schedule-section mb-2">
                    <div className="schedule-info mb-2">

                      <span className="schedule-time">
                        {requestData.startHour} - {requestData.endHour}
                      </span>
                    </div>

                    <div className="row">

                      <div className="col-md-6 mb-2">
                        <label className="form-label">Selecciona un día</label>
                        <select
                          className="form-select"
                          value={selectedDay}
                          onChange={(e) => setSelectedDay(e.target.value)}
                        >
                          {daysAvailability
                            .filter(day => day.available)
                            .map(day => (
                              <option key={day.day} value={day.day}>
                                {day.day}
                              </option>
                            ))
                          }
                        </select>
                        {selectedDay && (
                          <small className="text-date">
                            {getNextDateForDay(selectedDay)}
                          </small>
                        )}
                      </div>


                      <div className="col-md-6 mb-2">
                        <label className="form-label">Ingresa la hora</label>
                        <div className="time-picker-container">
                          <input
                            type="time"
                            className="form-control time-picker"
                            value={selectedTime}
                            onChange={handleTimeChange}
                          />
                          <div className="time-icon">🕐</div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Mensaje de error de validación de hora */}
                  {timeError && (
                    <div className="alert alert-danger mb-2" role="alert">
                      {timeError}
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      className="btn modal-button"
                      onClick={handleConfirm}
                      disabled={!selectedDay || !selectedTime || submitting}
                      style={{
                        opacity: submitting ? 0.6 : 1,
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Agendando recojo...
                        </>
                      ) : (
                        'Confirmar tu recojo'
                      )}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación exitosa */}
      {showSuccess && requestData && (
        <SuccessModal
          title="¡Recojo agendado!"
          message={`Has agendado tu recojo de ${requestData.name} para el ${selectedDay} ${getNextDateForDay(selectedDay)} a las ${selectedTime}. Espera la confirmación del reciclador.`}
          redirectUrl="/recolectorIndex"
        />
      )}

      {/* Modal de conflicto (error 409) */}
      {showConflictModal && (
        <SuccessModal
          title="Solicitud no disponible"
          message="Esta solicitud ya tiene una cita asignada o ya no está disponible. Serás redirigido al mapa para ver otras solicitudes."
          onClose={() => {
            setShowConflictModal(false);
            onClose();
            if (onScheduleSuccess) {
              onScheduleSuccess();
            }
          }}
        />
      )}
    </>
  );
};

export default SchedulePickupModal;