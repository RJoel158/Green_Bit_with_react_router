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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successOnClose, setSuccessOnClose] = useState<(() => void) | undefined>(undefined);

  // Determinar qué nombre mostrar (razón social si es empresa, sino el nombre)
  const displayName = ratedToCompanyName || ratedToName;

  // Obtener fecha actual
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      setSuccessTitle('Validación');
      setSuccessMessage('Por favor describe el motivo de tu reclamo');
      setSuccessOnClose(() => undefined);
      setShowSuccessModal(true);
      return;
    }

    // Obtener usuario actual
    const userString = localStorage.getItem('user');
    if (!userString) {
      setSuccessTitle('Error');
      setSuccessMessage('No se encontró información del usuario');
      setSuccessOnClose(() => undefined);
      setShowSuccessModal(true);
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
      // Mostrar éxito usando SuccessModal
      setSuccessTitle('Reclamo enviado');
      setSuccessMessage('Reclamo enviado exitosamente');
      setSuccessOnClose(() => () => {
        if (onSuccess) onSuccess();
        onClose();
      });
      setShowSuccessModal(true);
    } catch (error: any) {
  console.error('[ComplaintModal] Error al enviar reclamo:', error);
  const errorMessage = error?.response?.data?.error || error?.message || 'Error al enviar el reclamo';
  setSuccessTitle('Error');
  setSuccessMessage(errorMessage);
  setSuccessOnClose(() => undefined);
  setShowSuccessModal(true);
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
            <span className="complaint-avatar-initial">
              {displayName.charAt(0).toUpperCase()}
            </span>
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
          title={successTitle}
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            if (successOnClose) successOnClose();
          }}
        />
      )}
    </>
  );
};

export default ComplaintModal;
