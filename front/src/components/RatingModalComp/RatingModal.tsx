import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingModal.css';

interface RatingModalProps {
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  // Obtener fecha actual
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    console.log('Calificación seleccionada:', {
      rating,
      comment
    });

    alert('✓ ¡Gracias por tu calificación!');
    onClose();
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
          Califica a tu colector
        </h2>

        {/* Campo de texto */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe aquí..."
          className="rating-textarea"
          maxLength={500}
        />

        {/* Información del colector -(Datos estaticos) */}
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
              Toby Fox Williams
            </h3>
            <p className="rating-collector-date">
              {today}
            </p>
          </div>
        </div>

        
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className={`rating-submit-button ${
            rating === 0 ? 'rating-submit-button--disabled' : ''
          }`}
        >
          Enviar Calificación
        </button>
      </div>
    </div>
  );
};

export default RatingModal;