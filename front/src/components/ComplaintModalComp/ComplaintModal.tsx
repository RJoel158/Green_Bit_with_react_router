import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ComplaintModal.css';
import { createScore } from '../../services/scoreService';
import SuccessModal from '../CommonComp/SuccesModal';

interface ComplaintModalProps {
  appointmentId: number;
  ratedToUserId: number;
  ratedToName: string;
  ratedToCompanyName?: string;
  userRole: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ComplaintModal: React.FC<ComplaintModalProps> = ({ 
  appointmentId,
  ratedToUserId, 
  ratedToName, 
  ratedToCompanyName,
  userRole,
  onClose,
  onSuccess 
}) => {
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Obtener nombre a mostrar: companyName si es empresa, sino fullName
  const displayName = ratedToCompanyName || ratedToName;
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Obtener fecha actual
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      setErrorModalMessage('Por favor describe el motivo de tu reclamo');
      setShowErrorModal(true);
      return;
    }

    // Obtener usuario actual
    const userString = localStorage.getItem('user');
    if (!userString) {
      setErrorModalMessage('Error: No se encontró información del usuario');
      setShowErrorModal(true);
      return;
    }

    const currentUser = JSON.parse(userString);

    setIsSubmitting(true);

    try {
      await createScore({
        appointmentId,
        ratedByUserId: currentUser.id,
        ratedToUserId,
        score: 1, // Score = 1 para reclamos (mínimo permitido)
        comment: `[RECLAMO] ${complaint}`
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('[ComplaintModal] Error al enviar reclamo:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al enviar el reclamo';
      setErrorModalMessage(`Error: ${errorMessage}`);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="complaint-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="complaint-modal">
          {/* Ícono de advertencia */}
          <div className="complaint-icon-container">
            <AlertTriangle size={64} color="#f44336" strokeWidth={2} />
          </div>

          <h2 className="complaint-title">
            Reportar problema con {userRole === 'recolector' ? 'el reciclador' : 'el recolector'}
          </h2>

          <p className="complaint-subtitle">
            Esta cita fue cancelada. Si deseas reportar un problema, describe la situación:
          </p>

          {/* Campo de texto para el reclamo */}
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Describe el motivo de tu reclamo..."
            className="complaint-textarea"
            maxLength={500}
          />

          <div className="complaint-char-counter">
            {complaint.length}/500 caracteres
          </div>

          {/* Información del usuario reportado */}
          <div className="complaint-user-info">
            <div className="complaint-avatar">
              <div className="complaint-avatar-initial">
                {getInitial(displayName)}
              </div>
            </div>
            <div className="complaint-user-details">
              <h3 className="complaint-user-name">
                {displayName}
              </h3>
              <p className="complaint-date">
                {today}
              </p>
            </div>
          </div>

          <div className="complaint-buttons">
            <button
              onClick={onClose}
              className="complaint-cancel-button"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!complaint.trim() || isSubmitting}
              className={`complaint-submit-button ${
                (!complaint.trim() || isSubmitting) ? 'complaint-submit-button--disabled' : ''
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reclamo'}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          title="¡Reclamo Enviado!"
          message="Tu reclamo ha sido registrado exitosamente. Nuestro equipo lo revisará pronto."
          onClose={() => {
            setShowSuccessModal(false);
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          }}
        />
      )}

      {showErrorModal && (
        <SuccessModal
          title="❌ Error"
          message={errorModalMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </>
  );
};

export default ComplaintModal;
