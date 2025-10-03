import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Importar el icono existente de location.png
import locationIcon from "../../assets/icons/location.png";

// Crear icono personalizado usando el archivo existente
const recyclingIcon = new L.Icon({
  iconUrl: locationIcon,
  iconSize: [35, 35],
  iconAnchor: [17.5, 35],
  popupAnchor: [0, -35],
  className: 'recycling-marker-icon'
});

// Interfaz para las requests
interface RecyclingRequest {
  id: number;
  description: string;
  latitude: number;
  longitude: number;
  materialId: number;
  registerDate: string;
  state: string;
}

const RecyclingPointsMap: React.FC = () => {
  const navigate = useNavigate();
  const [recyclingRequests, setRecyclingRequests] = useState<RecyclingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las requests activas desde el backend
  const fetchActiveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3000/api/request');
      
      if (!response.ok) {
        throw new Error('Error al obtener las solicitudes');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Usar los datos del API (reales o fallback)
        const requestsData = result.data || [];
        
        console.log('Received requests data:', requestsData);
        console.log('Total requests received:', requestsData.length);
        
        // Filtrar solo las requests que tengan coordenadas válidas
        // Según la imagen, el estado parece ser numérico (0, 1) en lugar de string
        const activeRequests = requestsData.filter((request: any) => {
          const hasCoordinates = request.latitude && request.longitude && 
                                request.latitude !== null && request.longitude !== null;
          
          // Aceptar tanto estados numéricos como string para flexibilidad
          // Incluyendo temporalmente state = 0 para ver todas las requests
          const isActive = request.state === 'open' || request.state === 1 || request.state === '1' || 
                           request.state === 0 || request.state === '0';
          
          console.log('Request filter check:', {
            id: request.id,
            latitude: request.latitude,
            longitude: request.longitude,
            state: request.state,
            hasCoordinates,
            isActive,
            willInclude: hasCoordinates && isActive
          });
          
          return hasCoordinates && isActive;
        });
        
        console.log('Filtered active requests:', activeRequests);
        console.log('Total active requests:', activeRequests.length);
        
        setRecyclingRequests(activeRequests);
        
        // Mostrar notificación si está usando datos de fallback
        if (result.fallback) {
          setError(`ℹ️ ${result.message || 'Mostrando datos de demostración'}`);
        }
      } else {
        throw new Error(result.error || 'Error al obtener solicitudes');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('No se pudieron cargar los puntos de reciclaje');
      
      // Datos estáticos como fallback
      setRecyclingRequests([
        {
          id: 1,
          description: "Cartón y papel para reciclaje",
          latitude: -17.393,
          longitude: -66.157,
          materialId: 2,
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 2,
          description: "Botellas de plástico PET",
          latitude: -17.385,
          longitude: -66.160,
          materialId: 1,
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 3,
          description: "Latas de aluminio",
          latitude: -17.400,
          longitude: -66.150,
          materialId: 5,
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 4,
          description: "Botellas de vidrio",
          latitude: -17.390,
          longitude: -66.145,
          materialId: 4,
          registerDate: "2025-01-01",
          state: "open"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequests();
  }, []);
  if (loading) {
    return (
      <div className="recycling-points-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando puntos de reciclaje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recycling-points-container">
      {/* Botón de retorno */}
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
        title="Volver atrás"
      >
        ← Volver
      </button>

      <div className="recycling-points-header">
        <h1 className="recycling-points-title">Puntos de Reciclaje</h1>
        <p className="recycling-points-subtitle">Personas que ofrecen material para reciclar</p>
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchActiveRequests} className="retry-button">
              Reintentar
            </button>
          </div>
        )}
      </div>
      
      <div className="recycling-map-wrapper">
        <div className="map-info-card">
          <div className="map-info-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="map-info-text">Aquí puedes recoger los objetos</span>
        </div>
        
        <div className="map-container">
          <MapContainer
            center={[-17.393, -66.157]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {recyclingRequests.map((request) => (
              <Marker
                key={request.id}
                position={[request.latitude, request.longitude]}
                icon={recyclingIcon}
              >
                <Popup className="custom-popup">
                  <div className="popup-content">
                    <h4>Material para reciclar</h4>
                    <p><strong>Descripción:</strong> {request.description}</p>
                    <p><strong>Fecha:</strong> {new Date(request.registerDate).toLocaleDateString()}</p>
                    <p><strong>Estado:</strong> <span className="status-open">Disponible</span></p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div className="requests-counter">
          <span>{recyclingRequests.length} puntos de reciclaje disponibles</span>
          {error && error.includes('ℹ️') && (
            <div className="db-status-indicator">
              <span className="status-dot offline"></span>
              <small>Modo offline - Datos de demostración</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecyclingPointsMap;