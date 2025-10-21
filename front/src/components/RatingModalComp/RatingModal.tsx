import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingModal.css';
import { createScore } from '../../services/scoreService';

interface RatingModalProps {
  appointmentId: number;
  ratedToUserId: number;
  ratedToName: string;
  userRole: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ 
  appointmentId,
  ratedToUserId, 
  ratedToName, 
  userRole,
  onClose,
  onSuccess 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener fecha actual
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    // Obtener usuario actual
    const userString = localStorage.getItem('user');
    if (!userString) {
      alert('Error: No se encontró información del usuario');
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

      alert('✓ ¡Gracias por tu calificación!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('[RatingModal] Error al enviar calificación:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al enviar la calificación';
      alert(`Error: ${errorMessage}`);
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
            <img 
              src="https://i.pravatar.cc/150?img=5"
              alt="Avatar"
              className="rating-avatar-img"
            />
          </div>
          <div className="rating-collector-details">
            <h3 className="rating-collector-name">
              {ratedToName}
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
    </div>
  );
};

export default RatingModal;