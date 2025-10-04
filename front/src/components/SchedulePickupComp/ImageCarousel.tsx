import React, { useState } from 'react';
import './ImageCarousel.css';

interface Image {
  id: number;
  image: string;
  uploadedDate: string;
}

interface ImageCarouselProps {
  images: Image[];
  altText?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, altText = "Imagen de material reciclable" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Debug logs (comentados para producción)
  // console.log('[INFO] ImageCarousel: Received images:', images);
  // console.log('[INFO] ImageCarousel: Images count:', images ? images.length : 0);

  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className="image-placeholder">
        <div className="no-image-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>Sin imágenes disponibles</p>
        </div>
      </div>
    );
  }

  // Si solo hay una imagen, mostrarla sin controles
  if (images.length === 1) {
    return (
      <div className="image-placeholder single-image">
        <img 
          src={images[0].image.startsWith('/uploads') 
            ? `http://localhost:3000${images[0].image}` 
            : `http://localhost:3000/uploads/images/${images[0].image}`}
          alt={altText}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.png'; // Imagen de fallback
          }}
        />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="image-carousel">
      <div className="carousel-container">
        <img 
          src={images[currentIndex].image.startsWith('/uploads') 
            ? `http://localhost:3000${images[currentIndex].image}` 
            : `http://localhost:3000/uploads/images/${images[currentIndex].image}`}
          alt={`${altText} ${currentIndex + 1}`}
          className="carousel-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.png'; // Imagen de fallback
          }}
        />
        
        {/* Controles de navegación */}
        <button 
          className="carousel-btn prev-btn"
          onClick={prevImage}
          aria-label="Imagen anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="carousel-btn next-btn"
          onClick={nextImage}
          aria-label="Siguiente imagen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Contador de imágenes */}
        <div className="image-counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Indicadores de puntos */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToImage(index)}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;