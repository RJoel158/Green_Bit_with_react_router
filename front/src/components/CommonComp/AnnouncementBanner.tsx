import React, { useEffect, useState } from 'react';
import { getAnnouncementsByRole } from '../../services/announcementService';

interface Announcement {
  id: number;
  title: string;
  imagePath: string;
  targetRole: 'recolector' | 'reciclador' | 'both';
  state: number;
  createdDate: string;
  createdBy: number;
}

interface AnnouncementBannerProps {
  role: 'recolector' | 'reciclador' | 'both';
  position?: 'left' | 'right';
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ role, position = 'left' }) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncementsByRole(role);
        console.log('📢 Anuncios cargados para rol', role, ':', data);
        
        if (data && data.length > 0) {
          console.log('✅ Anuncios encontrados:', data.length);
          data.forEach((a: Announcement, idx: number) => {
            console.log(`  [${idx}] "${a.title}" - targetRole: ${a.targetRole}, imagePath: ${a.imagePath}`);
          });
          setAnnouncements(data);
          setAnnouncement(data[0]);
        } else {
          console.log('⚠️ No hay anuncios para el rol:', role);
        }
      } catch (error) {
        console.error('❌ Error cargando anuncios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [role]);

  // Auto-cambiar de anuncio cada 5 segundos
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setAnnouncement(announcements[(currentIndex + 1) % announcements.length]);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements, currentIndex]);

  // Función para obtener la URL correcta de la imagen
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    
    // Si ya es una URL completa, retornarla
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si es relativa, agregar el backend
  return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const bannerClass = position === 'left' ? 'banner-left' : 'banner-right';

  return (
    <div className={bannerClass} style={{
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      border: '2px solid #e0e0e0',
      padding: 0
    }}>
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '0.9rem',
          color: '#999'
        }}>
          Cargando anuncios...
        </div>
      ) : announcement ? (
        <>
          {/* Imagen del anuncio - ocupa todo el espacio disponible */}
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img
              src={getImageUrl(announcement.imagePath)}
              alt={announcement.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={() => {
                console.error('❌ Error cargando imagen:', getImageUrl(announcement.imagePath));
              }}
              onLoad={() => {
                console.log('✅ Imagen cargada:', getImageUrl(announcement.imagePath));
              }}
            />

            {/* Controles superpuestos en la imagen */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '12px',
              backdropFilter: 'blur(2px)'
            }}>
              {/* Indicador de página */}
              {announcements.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}>
                  {announcements.map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: idx === currentIndex ? '#149D52' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setAnnouncement(announcements[idx]);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '0.9rem',
          color: '#999'
        }}>
          Sin anuncios disponibles
        </div>
      )}
    </div>
  );
};

export default AnnouncementBanner;
