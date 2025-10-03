import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import SchedulePickupModal from '../SchedulePickupComp/SchedulePickupModal';


// Error Boundary Component
class MapErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Map Error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error Details:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="map-error-fallback">
          <h3>Error al cargar el mapa</h3>
          <p>Ha ocurrido un problema con las coordenadas del mapa.</p>
          <button onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

// Crear icono para clusters (grupos de marcadores)
const createClusterIcon = (count: number) => {
  const size = count > 10 ? 50 : count > 5 ? 45 : 40;
  const svgIcon = `
    <div class="cluster-marker" style="
      width: ${size}px; 
      height: ${size}px; 
      background: linear-gradient(135deg, #4a7d25 0%, #5a8c2f 100%);
      border: 3px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-weight: bold;
      color: white;
      font-size: ${size > 45 ? '14px' : '12px'};
    ">
      ${count}
    </div>
  `;

  return new L.DivIcon({
    html: svgIcon,
    className: 'cluster-marker-container',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

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

// Interfaz para clusters de marcadores
interface MarkerCluster {
  id: string;
  latitude: number;
  longitude: number;
  requests: RecyclingRequest[];
  count: number;
}

const RecyclingPointsMap: React.FC = () => {
  const navigate = useNavigate();
  const [recyclingRequests, setRecyclingRequests] = useState<RecyclingRequest[]>([]);
  const [markerClusters, setMarkerClusters] = useState<MarkerCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //Para controlar el modal de Schedule Pickup
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{id:number} | null>(null);

  // Función para calcular la distancia entre dos puntos en metros
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  };

  // Función para agrupar marcadores cercanos
  const clusterRequests = (requests: RecyclingRequest[], maxDistance: number = 100): MarkerCluster[] => {
    console.log('Starting clustering with requests:', requests);
    const clusters: MarkerCluster[] = [];
    const processed = new Set<number>();

    requests.forEach((request, index) => {
      console.log(`Processing request ${index}:`, request);
      if (processed.has(index)) {
        console.log(`Request ${index} already processed, skipping`);
        return;
      }

      // Validar que las coordenadas sean números válidos antes de crear el cluster
      if (isNaN(request.latitude) || isNaN(request.longitude)) {
        console.warn('Skipping request with invalid coordinates:', {
          id: request.id,
          latitude: request.latitude,
          longitude: request.longitude,
          latType: typeof request.latitude,
          lngType: typeof request.longitude
        });
        return;
      }

      const cluster: MarkerCluster = {
        id: `cluster-${request.id}`,
        latitude: request.latitude,
        longitude: request.longitude,
        requests: [request],
        count: 1
      };

      // Buscar requests cercanas para agrupar
      requests.forEach((otherRequest, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return;

        const distance = calculateDistance(
          request.latitude, request.longitude,
          otherRequest.latitude, otherRequest.longitude
        );

        if (distance <= maxDistance) {
          cluster.requests.push(otherRequest);
          cluster.count++;
          processed.add(otherIndex);

          // Calcular centroide del cluster
          const totalLat = cluster.requests.reduce((sum, req) => sum + req.latitude, 0);
          const totalLng = cluster.requests.reduce((sum, req) => sum + req.longitude, 0);
          cluster.latitude = totalLat / cluster.requests.length;
          cluster.longitude = totalLng / cluster.requests.length;
        }
      });

      processed.add(index);
      clusters.push(cluster);
      console.log(`Created cluster:`, cluster);
    });

    console.log('Clustering completed. Total clusters:', clusters.length);
    return clusters;
  };

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
          // Parsear coordenadas a números y validar que sean válidos
          const lat = parseFloat(request.latitude);
          const lng = parseFloat(request.longitude);

          const hasValidCoordinates = !isNaN(lat) && !isNaN(lng) &&
            lat !== null && lng !== null &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180;

          // Aceptar tanto estados numéricos como string para flexibilidad
          // Incluyendo state = 0 y state = 1 para ver todas las requests con coordenadas
          const isActive = request.state === 'open' ||
            request.state === 1 || request.state === '1' ||
            request.state === 0 || request.state === '0';

          console.log('Request filter check:', {
            id: request.id,
            latitude: request.latitude,
            longitude: request.longitude,
            parsedLat: lat,
            parsedLng: lng,
            state: request.state,
            hasValidCoordinates,
            isActive,
            willInclude: hasValidCoordinates && isActive
          });

          return hasValidCoordinates && isActive;
        });

        console.log('Filtered active requests:', activeRequests);
        console.log('Total active requests:', activeRequests.length);

        // Normalizar las coordenadas de las requests para asegurar que sean números
        const normalizedRequests = activeRequests.map((request: any) => {
          const normalizedRequest = {
            ...request,
            latitude: parseFloat(request.latitude),
            longitude: parseFloat(request.longitude)
          };

          console.log('Normalized request:', {
            id: request.id,
            originalLat: request.latitude,
            originalLng: request.longitude,
            normalizedLat: normalizedRequest.latitude,
            normalizedLng: normalizedRequest.longitude,
            isLatValid: !isNaN(normalizedRequest.latitude),
            isLngValid: !isNaN(normalizedRequest.longitude)
          });

          return normalizedRequest;
        });

        console.log('All normalized requests:', normalizedRequests);
        setRecyclingRequests(normalizedRequests);

        // Generar clusters de marcadores
        const clusters = clusterRequests(normalizedRequests, 100); // 100 metros de distancia máxima
        console.log('Generated clusters:', clusters);
        setMarkerClusters(clusters);

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

      // Datos estáticos como fallback con algunos puntos cercanos para probar clustering
      const fallbackRequests = [
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
          latitude: -17.3931, // Muy cerca del punto 1
          longitude: -66.1571,
          materialId: 1,
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 3,
          description: "Revistas y periódicos",
          latitude: -17.3929, // También cerca del punto 1
          longitude: -66.1569,
          materialId: 2,
          registerDate: "2025-01-02",
          state: "open"
        },
        {
          id: 4,
          description: "Latas de aluminio",
          latitude: -17.400,
          longitude: -66.150,
          materialId: 5,
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 5,
          description: "Botellas de vidrio",
          latitude: -17.390,
          longitude: -66.145,
          materialId: 4,
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 6,
          description: "Envases de plástico",
          latitude: -17.3901, // Cerca del punto 5
          longitude: -66.1451,
          materialId: 1,
          registerDate: "2025-01-03",
          state: "open"
        }
      ];

      setRecyclingRequests(fallbackRequests);

      // Generar clusters para los datos de fallback
      const fallbackClusters = clusterRequests(fallbackRequests, 100);
      setMarkerClusters(fallbackClusters);
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
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <span className="map-info-text">Aquí puedes recoger los objetos</span>
        </div>

        <div className="map-container">
          <MapErrorBoundary>
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

              {markerClusters
                .filter(cluster => !isNaN(cluster.latitude) && !isNaN(cluster.longitude))
                .map((cluster) => (
                  <Marker
                    key={cluster.id}
                    position={[cluster.latitude, cluster.longitude]}
                    icon={cluster.count > 1 ? createClusterIcon(cluster.count) : recyclingIcon}

                    eventHandlers={{
                      click: () => {
                        if (cluster.count === 1) {
                          // abrir modal en marcador individual, se envia al modal el id
                          setSelectedRequest({id:cluster.requests[0].id});
                          setShowPickupModal(true);
                        }
                      }
                    }}
                  >

                    {cluster.count > 1 && (
                      <Popup className="custom-popup">
                        <div className="popup-content">
                          {/* Popup para cluster con múltiples requests */}
                          <>
                            <h4>{cluster.count} Puntos de Reciclaje</h4>
                            <div className="cluster-requests-list">
                              {cluster.requests.slice(0, 3).map((request, index) => (
                                <div key={request.id} className="cluster-request-item">
                                  <p><strong>#{index + 1}:</strong> {request.description}</p>
                                  <small>{new Date(request.registerDate).toLocaleDateString()}</small>
                                </div>
                              ))}
                              {cluster.requests.length > 3 && (
                                <p className="more-items">
                                  ... y {cluster.requests.length - 3} más
                                </p>
                              )}
                            </div>
                            <div className="cluster-actions">
                              <small>Haz zoom para ver marcadores individuales</small>
                            </div>
                          </>


                        </div>
                      </Popup>
                    )}
                  </Marker>
                ))}
            </MapContainer>
          </MapErrorBoundary>
          {showPickupModal && selectedRequest && (
            <SchedulePickupModal
              show={showPickupModal}
              onClose={() => setShowPickupModal(false)}
              selectedRequest={selectedRequest}
          
            />
          )}
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