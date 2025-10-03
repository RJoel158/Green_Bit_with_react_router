import React, { useState, useEffect } from 'react';
import './SchedulePickup.css';
import SuccessModal from '../CommonComp/SuccesModal';
import ImageCarousel from './ImageCarousel';

interface SchedulePickupModalProps {
  show: boolean;
  onClose: () => void;
  selectedRequest: { id: number };
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
  selectedRequest 
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [daysAvailability, setDaysAvailability] = useState<DayAvailability[]>([]);
  const [timeError, setTimeError] = useState<string>(''); // Error de validación de hora

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

      const response = await fetch(
        `http://localhost:3000/api/request/${selectedRequest.id}/schedule`
      );

      if (!response.ok) {
        throw new Error('Error al cargar los datos de la solicitud');
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log('[INFO] SchedulePickupModal: Received request data:', result.data);
        console.log('[INFO] SchedulePickupModal: Images received:', result.data.images);
        
        // Formatear las horas antes de guardar (remover segundos/milisegundos)
        const formattedData = {
          ...result.data,
          startHour: formatTime(result.data.startHour),
          endHour: formatTime(result.data.endHour)
        };
        
        console.log('[INFO] SchedulePickupModal: Setting formatted data:', formattedData);
        setRequestData(formattedData);
        
        // Parsear daysAvailability
        const daysData = typeof result.data.daysAvailability === 'string' 
          ? JSON.parse(result.data.daysAvailability) 
          : result.data.daysAvailability;

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
   * Maneja el cambio de hora en el time picker
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

  const handleConfirm = () => {
    // Validar que se haya ingresado una hora
    if (!selectedTime) {
      setTimeError('Por favor selecciona una hora');
      return;
    }
    
    // Validar que la hora esté dentro del rango permitido
    if (!isTimeInRange(selectedTime)) {
      setTimeError(`La hora debe estar entre ${requestData?.startHour} y ${requestData?.endHour}`);
      return;
    }
    
    // Si todo es válido, limpiar error y mostrar modal de éxito
    setTimeError('');
    setShowSuccess(true);
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
                  
                  {/* Debug info temporal */}
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px', padding: '8px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                    <div><strong>Debug Info:</strong></div>
                    <div>• Request ID: {requestData.id}</div>
                    <div>• Material: {requestData.name}</div>
                    <div>• Images count: {requestData.images ? requestData.images.length : 0}</div>
                    {requestData.images && requestData.images.length > 0 && (
                      <div>• First image: {requestData.images[0].image}</div>
                    )}
                  </div>
                  
                  <ImageCarousel 
                    images={requestData.images || []} 
                    altText={`${requestData.name} reciclable`} 
                  />
                  
                  <div className="description mb-2">
                    <p className="text-muted small">
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
                      disabled={!selectedDay || !selectedTime}
                    >
                      Confirmar tu recojo
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
          redirectUrl="/recicladorIndex" 
        />
      )}
    </>
  );
};

export default SchedulePickupModal;