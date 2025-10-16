import React from 'react';

interface LargeImageCarouselProps {
  images: Array<{ id?: number; image: string }>;
  apiUrl: string;
}

const LargeImageCarousel: React.FC<LargeImageCarouselProps> = ({ images, apiUrl }) => {
  // Determinar tamaño según pantalla
  const isMobile = window.innerWidth <= 768;
  const imageSize = isMobile ? '250px' : '350px'; // Aún más grande

  if (!images || images.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '12px',
        margin: '1rem 0'
      }}>
        <p style={{ color: '#666', fontSize: '1rem' }}>No hay imágenes disponibles para esta solicitud</p>
      </div>
    );
  }

  return (
    <div style={{ margin: '2rem 0' }}>
      <h3 style={{ 
        fontWeight: '600', 
        color: '#4C7C5B', 
        marginBottom: '1.5rem', 
        fontSize: '1.3rem' 
      }}>
         Imágenes del Material
      </h3>
      
      <div style={{
        display: 'flex',
        gap: '25px',
        overflowX: 'auto',
        padding: '15px 0',
        scrollBehavior: 'smooth'
      }}>
        {images.map((image, index) => (
          <div
            key={image.id || index}
            style={{
              flex: `0 0 ${imageSize}`, // DINÁMICO Y MUY GRANDE
              height: imageSize,        // DINÁMICO Y MUY GRANDE
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '4px solid #4C7C5B',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(76, 124, 91, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.borderColor = '#4C7C5B';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(76, 124, 91, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            }}
          >
            <img 
              src={`${apiUrl}${image.image}`}
              alt={`Material para reciclar ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e: any) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Scrollbar personalizado */}
      <style>{`
        div::-webkit-scrollbar {
          height: 10px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 5px;
        }
        div::-webkit-scrollbar-thumb {
          background: #4C7C5B;
          border-radius: 5px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #2d5016;
        }
      `}</style>
    </div>
  );
};

export default LargeImageCarousel;