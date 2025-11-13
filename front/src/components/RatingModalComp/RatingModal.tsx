import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingModal.css';
import { createScore } from '../../services/scoreService';
import SuccessModal from '../CommonComp/SuccesModal';

interface RatingModalProps {
  appointmentId: number;
  ratedToUserId: number;
  ratedToName: string;
  ratedToCompanyName?: string;
  userRole: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ 
  appointmentId,
  ratedToUserId, 
  ratedToName,
  ratedToCompanyName,
  userRole,
  onClose,
  onSuccess 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Determinar qué nombre mostrar (razón social si es empresa, sino el nombre)
  const displayName = ratedToCompanyName || ratedToName;

  // Obtener fecha actual
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorMessage('Por favor selecciona una calificación');
      setShowErrorModal(true);
      return;
    }

    // Obtener usuario actual
    const userString = localStorage.getItem('user');
    if (!userString) {
      setErrorMessage('Error: No se encontró información del usuario');
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
        score: rating,
        comment: comment || undefined
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('[RatingModal] Error al enviar calificación:', error);
      const msg = error?.response?.data?.error || error?.message || 'Error al enviar la calificación';
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="rating-modal">
        {/* Estrellas de calificación */}
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="rating-star-button"
            >
              <Star
                size={48}
                fill={(hoveredRating || rating) >= star ? '#FDB022' : 'none'}
                stroke={(hoveredRating || rating) >= star ? '#FDB022' : '#D1D5DB'}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>

       
        <h2 className="rating-title">
          Califica a {userRole === 'recolector' ? 'tu reciclador' : 'tu recolector'}
        </h2>

        {/* Campo de texto */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe aquí..."
          className="rating-textarea"
          maxLength={500}
        />

        {/* Información del usuario a calificar */}
        <div className="rating-collector-info">
          <div className="rating-avatar">
            <div className="rating-avatar-initial">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="rating-collector-details">
            <h3 className="rating-collector-name">
              {displayName}
            </h3>
            <p className="rating-collector-date">
              {today}
            </p>
          </div>
        </div>

        
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className={`rating-submit-button ${
            (rating === 0 || isSubmitting) ? 'rating-submit-button--disabled' : ''
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
        </button>
      </div>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <SuccessModal
          title="Calificación Enviada"
          message="¡Gracias por tu calificación! Tu opinión nos ayuda a mejorar el servicio."
          onClose={() => {
            setShowSuccessModal(false);
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          }}
        />
      )}

      {/* Modal de error */}
      {showErrorModal && (
        <SuccessModal
          title="❌ Error"
          message={errorMessage}
          onClose={() => {
            setShowErrorModal(false);
          }}
        />
      )}
    </div>
  );
};

export default RatingModal;