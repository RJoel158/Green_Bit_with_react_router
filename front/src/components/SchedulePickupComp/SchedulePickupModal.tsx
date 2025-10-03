import React, { useState } from 'react';
import './SchedulePickup.css';
import cardboardImage from "../../assets/SideBarImg.png";
import SuccessModal from '../CommonComp/SuccesModal';

interface SchedulePickupModalProps {
  show: boolean;
  onClose: () => void;
  selectedRequest: { id: number };
}
// Representa la disponibilidad de un día
interface DayAvailability {
  day: string;
  shortName: string;
  available: boolean;

}

const SchedulePickupModal: React.FC<SchedulePickupModalProps> = ({ show, onClose }) => {
  const [selectedDay, setSelectedDay] = useState<string>('Viernes');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  // Lista de días y su disponibilidad (solo visualización, estático por ahora)
  const [daysAvailability] = useState<DayAvailability[]>([
    { day: 'Lunes', shortName: 'Lun', available: false},
    { day: 'Martes', shortName: 'Mar', available: false},
    { day: 'Miércoles', shortName: 'Mié', available: false},
    { day: 'Jueves', shortName: 'Jue', available: false},
    { day: 'Viernes', shortName: 'Vie', available: true },
    { day: 'Sábado', shortName: 'Sáb', available: false},
    { day: 'Domingo', shortName: 'Dom', available: true}
  ]);

// Recibe el día de la semana como string ("Viernes", "Domingo")
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

  let diff = targetDay - todayDay;
  if (diff <= 0) diff += 7; // Si ya pasó, toma la próxima semana

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + diff);

  // Formato DD/MM/YY
  const day = nextDate.getDate().toString().padStart(2, '0');
  const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');
  const year = nextDate.getFullYear().toString().slice(-2);

  return `${day}/${month}/${year}`;
};


 const handleConfirm = () => {
    if (!selectedTime) return;
    // Abrimos el SuccessModal
    setShowSuccess(true);
  };


  if (!show) return null;

  return (
    <>
    <div className="modal-overlay d-flex justify-content-center align-items-center"
    onClick={onClose}>
      <div className="modal-box-compact"
      onClick={(e) => e.stopPropagation()}>
        <div className="cardboard-container">
          <div className="pickup-card">
            <div className="card-header text-center mb-2">
              <h4 className="pickup-title">Reciclaje de Cartón</h4>
            </div>
            
            <div className="image-placeholder mb-2">
              <img src={cardboardImage} alt="Cartón reciclable" />
            </div>
            
            <div className="description mb-2">
              <p className="text-muted small">
                Cartón de embalaje en buen estado (cajas medianas y grandes). 
                No tiene manchas de grasa ni humedad.
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
                <span className="schedule-time">14:00-16:00</span>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-2">
                  <label className="form-label">Selecciona un día</label>
                  <select 
                    className="form-select"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="Viernes">Viernes</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                  <small className="text-date">{getNextDateForDay(selectedDay)}</small>
                </div>
                
                <div className="col-md-6 mb-2">
                  <label className="form-label">Ingresa la hora</label>
                  <div className="time-picker-container">
                    <input
                      type="time"
                      className="form-control time-picker"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      min="08:00"
                      max="18:00"
                    />
                    <div className="time-icon">🕐</div>
                  </div>
                </div>
              </div>
            </div>
            
              <div className="text-center">
                <button 
                  className="btn modal-button"
                  onClick={handleConfirm}
                  disabled={!selectedTime}
                >
                  Confirmar tu recojo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          title="¡Recojo agendado!"
          message={`Has agendado tu recojo para el ${selectedDay} ${getNextDateForDay(selectedDay)} a las ${selectedTime}. Espera la confirmación del reciclador. `}
          //Cambiar cuando se tenga el mapa
          redirectUrl="/recicladorIndex" 
        />
      )}
    </>

    
  );
  
};

export default SchedulePickupModal;