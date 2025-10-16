import React from 'react';

interface ImageCarouselProps {
  images: Array<{ id?: number; image: string }>;
  apiUrl: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, apiUrl }) => {
  if (!images || images.length === 0) {
    return (
      <div className="no-images">
        <p>No hay imágenes disponibles para esta solicitud</p>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <h3 className="carousel-title">Imágenes del Material</h3>
      
      {/* Solo miniaturas */}
      <div className="carousel-thumbnails">
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className="carousel-thumbnail"
          >
            <img 
              src={`${apiUrl}${image.image}`}
              alt={`Material para reciclar ${index + 1}`}
              onError={(e: any) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        .carousel-container {
          margin: 1.5rem 0;
        }

        .carousel-title {
          font-weight: bold;
          color: #4C7C5B;
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .carousel-thumbnails {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 5px 0;
          scrollbar-width: thin;
          scrollbar-color: #4C7C5B #f0f0f0;
        }

        .carousel-thumbnails::-webkit-scrollbar {
          height: 6px;
        }

        .carousel-thumbnails::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 3px;
        }

        .carousel-thumbnails::-webkit-scrollbar-thumb {
          background: #4C7C5B;
          border-radius: 3px;
        }

        .carousel-thumbnail {
          flex: 0 0 150px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid #e0e0e0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .carousel-thumbnail:hover {
          transform: scale(1.05);
          border-color: #4C7C5B;
          box-shadow: 0 4px 12px rgba(76, 124, 91, 0.3);
        }

        .carousel-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .no-images {
          padding: 2rem;
          text-align: center;
          color: #666;
          background: #f5f5f5;
          border-radius: 8px;
          margin: 1rem 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .carousel-thumbnail {
            flex: 0 0 120px;
            height: 120px;
          }
        }

        @media (max-width: 480px) {
          .carousel-thumbnail {
            flex: 0 0 100px;
            height: 100px;
          }

          .carousel-title {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageCarousel;