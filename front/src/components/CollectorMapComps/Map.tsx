import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import SchedulePickupModal from '../SchedulePickupComp/SchedulePickupModal';
import { config, apiUrl, debugLog } from '../../config/environment';
import { REQUEST_STATE } from '../../shared/constants';

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
  materialName?: string;
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

// Interfaz para materiales
interface Material {
  id: number;
  name: string;
  description?: string;
}

const RecyclingPointsMap: React.FC = () => {
  const navigate = useNavigate();
  const [recyclingRequests, setRecyclingRequests] = useState<RecyclingRequest[]>([]);
  const [markerClusters, setMarkerClusters] = useState<MarkerCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RecyclingRequest | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  //Para controlar el modal de Schedule Pickup
  const [showPickupModal, setShowPickupModal] = useState(false);

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
  const clusterRequests = (requests: RecyclingRequest[], maxDistance: number = config.clustering.maxDistance): MarkerCluster[] => {
    debugLog('Starting clustering with requests:', requests);
    const clusters: MarkerCluster[] = [];
    const processed = new Set<number>();

    requests.forEach((request, index) => {
        debugLog(`Processing request ${index}:`, request);
        if (processed.has(index)) {
          debugLog(`Request ${index} already processed, skipping`);
          return;
        }      // Validar que las coordenadas sean números válidos antes de crear el cluster
      if (isNaN(request.latitude) || isNaN(request.longitude)) {
        if (config.dev.enableDebugLogs) {
          console.warn('Skipping request with invalid coordinates:', {
            id: request.id,
            latitude: request.latitude,
            longitude: request.longitude,
            latType: typeof request.latitude,
            lngType: typeof request.longitude
          });
        }
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
      debugLog(`Created cluster:`, cluster);
    });

    debugLog('Clustering completed. Total clusters:', clusters.length);
    return clusters;
  };

  // Función para calcular si un punto está dentro del área visible del mapa
  const isPointInBounds = (lat: number, lng: number, bounds: L.LatLngBounds): boolean => {
    return bounds.contains([lat, lng]);
  };

  // Función para cargar marcadores basado en zoom y área visible
  const getVisibleRequests = (allRequests: RecyclingRequest[], zoom: number, bounds?: L.LatLngBounds): RecyclingRequest[] => {
    // Primero filtrar por área visible si hay bounds
    let filteredRequests = bounds 
      ? allRequests.filter(request => isPointInBounds(request.latitude, request.longitude, bounds))
      : allRequests;

    // Aplicar limitación basada en zoom SIEMPRE, independientemente de si hay bounds
    if (zoom < 10) {
      // Zoom muy bajo: solo mostrar algunos puntos representativos
      debugLog(`Applying zoom filter for zoom ${zoom}: showing max 20 points`);
      filteredRequests = filteredRequests.slice(0, 20);
    } else if (zoom < 12) {
      // Zoom medio: mostrar más puntos
      debugLog(`Applying zoom filter for zoom ${zoom}: showing max 50 points`);
      filteredRequests = filteredRequests.slice(0, 50);
    } else {
      // Zoom alto (>= 12): mostrar todos los puntos visibles
      debugLog(`Applying zoom filter for zoom ${zoom}: showing all ${filteredRequests.length} points`);
    }

    return filteredRequests;
  };

  // Componente para manejar eventos del mapa
  const MapEventHandler: React.FC = () => {
    useMapEvents({
      zoomend: (e) => {
        const map = e.target;
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        
        // Filtrar requests basado en zoom y área visible
        const visibleRequests = getVisibleRequests(recyclingRequests, zoom, bounds);
        const newClusters = clusterRequests(visibleRequests, zoom >= config.clustering.minZoom ? 50 : config.clustering.maxDistance);
        setMarkerClusters(newClusters);
        
        debugLog(`Zoom changed to ${zoom}, showing ${newClusters.length} clusters`);
      },
      moveend: (e) => {
        const map = e.target;
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        
        // Actualizar marcadores basado en nueva área visible
        const visibleRequests = getVisibleRequests(recyclingRequests, zoom, bounds);
        const newClusters = clusterRequests(visibleRequests, zoom >= config.clustering.minZoom ? 50 : config.clustering.maxDistance);
        setMarkerClusters(newClusters);
        
        debugLog(`Map moved, showing ${newClusters.length} clusters in current view`);
      }
    });

    return null;
  };

  // Función para obtener materiales del backend
  const fetchMaterials = async (): Promise<Material[]> => {
    try {
      debugLog('Fetching materials from API...');
      const response = await fetch(apiUrl(config.api.endpoints.materials));
      if (response.ok) {
        const materials = await response.json();
        debugLog('Materials received from API:', materials);
        
        // Validar que sea un array
        if (Array.isArray(materials)) {
          return materials;
        } else {
          console.warn('Materials API returned non-array:', materials);
        }
      } else {
        console.warn('Materials API failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
    
    // Materiales de fallback
    debugLog('Using fallback materials');
    const fallbackMaterials: Material[] = [
      { id: 1, name: 'Plástico PET', description: 'Botellas de plástico' },
      { id: 2, name: 'Cartón', description: 'Cajas de cartón' },
      { id: 3, name: 'Papel', description: 'Papel de oficina' },
      { id: 4, name: 'Vidrio', description: 'Botellas de vidrio' },
      { id: 5, name: 'Metal', description: 'Latas de aluminio' },
      { id: 18, name: 'Plástico', description: 'Envases plásticos' },
      { id: 19, name: 'Textil', description: 'Ropa y telas' },
      { id: 20, name: 'Electrónicos', description: 'Dispositivos electrónicos' }
    ];
    return fallbackMaterials;
  };

  // Función para obtener el nombre del material por ID
  const getMaterialName = (materialId: number, materialsArray: Material[]): string => {
    // Validar que materialsArray sea un array
    if (!Array.isArray(materialsArray)) {
      console.error('getMaterialName: materialsArray is not an array:', materialsArray);
      return `Material ID: ${materialId}`;
    }
    
    const material = materialsArray.find(m => m.id === materialId);
    if (material && material.name) {
      return material.name;
    }
    
    // Nombres por defecto basados en IDs comunes
    const defaultNames: { [key: number]: string } = {
      1: 'Plástico PET',
      2: 'Cartón',
      3: 'Papel',
      4: 'Vidrio',
      5: 'Metal/Aluminio',
      6: 'Orgánico',
      7: 'Baterías',
      8: 'Aceite de cocina',
      9: 'Textiles',
      10: 'Madera',
      11: 'Caucho',
      12: 'Pilas',
      13: 'Aceite usado',
      14: 'Chatarra',
      15: 'Computadoras',
      16: 'Teléfonos',
      17: 'Televisores',
      18: 'Plástico',
      19: 'Textil',
      20: 'Electrónicos'
    };
    
    return defaultNames[materialId] || `Material ID: ${materialId}`;
  };

  // Función para obtener las requests activas desde el backend
  const fetchActiveRequests = async () => {
    setLoading(true);
    setError(null);
    
    // Obtener materiales primero
    const materialsArray = await fetchMaterials();
    debugLog('Materials array for processing:', { materialsArray, isArray: Array.isArray(materialsArray) });
    
    // Guardar materiales en el estado para usar en popups
    setMaterials(materialsArray);
    
    try {
      const response = await fetch(apiUrl(config.api.endpoints.requests));

      if (!response.ok) {
        throw new Error('Error al obtener las solicitudes');
      }

      const result = await response.json();

      if (result.success) {
        // Usar los datos del API (reales o fallback)
        const requestsData = result.data || [];

        debugLog('Received requests data:', requestsData);
        debugLog('Total requests received:', requestsData.length);

        // Si el backend ya envía materialName, usarlo. Si no, usar getMaterialName como fallback
        const requestsWithMaterials = requestsData.map((request: any) => ({
          ...request,
          materialName: request.materialName || getMaterialName(request.materialId, materialsArray)
        }));

        // Filtrar solo las requests que tengan coordenadas válidas y estado OPEN (1)
        const activeRequests = requestsWithMaterials.filter((request: any) => {
          const lat = parseFloat(request.latitude);
          const lng = parseFloat(request.longitude);

          const hasValidCoordinates = !isNaN(lat) && !isNaN(lng) &&
            lat !== null && lng !== null &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180;

          // Solo mostrar requests con estado OPEN (1)
          const isOpen = request.state === REQUEST_STATE.OPEN || 
                         request.state === 1 || 
                         request.state === '1';

          console.log('Request filter check:', {
            id: request.id,
            latitude: request.latitude,
            longitude: request.longitude,
            parsedLat: lat,
            parsedLng: lng,
            state: request.state,
            hasValidCoordinates,
            isOpen,
            willInclude: hasValidCoordinates && isOpen
          });

          return hasValidCoordinates && isOpen;
        });

        debugLog('Filtered active requests:', activeRequests);
        debugLog('Total active requests:', activeRequests.length);

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

        debugLog('All normalized requests:', normalizedRequests);
        setRecyclingRequests(normalizedRequests);

        // Generar clusters de marcadores considerando el zoom inicial (14)
        // Aplicar filtro de zoom desde el inicio - zoom 14 es considerado alto
        const initialZoom = config.map.defaultZoom;
        const visibleRequests = getVisibleRequests(normalizedRequests, initialZoom, undefined);
        const clusters = clusterRequests(visibleRequests, 100); // 100 metros de distancia máxima
        debugLog(`Generated initial clusters with zoom ${initialZoom}:`, clusters);
        setMarkerClusters(clusters);

        // FORZAR DATOS PARA TESTING - TEMPORAL
        if (clusters.length === 0) {
          console.log('No clusters generated, forcing test data...');
          const testClusters = [
            {
              id: 'test-1',
              latitude: -17.393,
              longitude: -66.157,
              count: 1,
              requests: [{
                id: 999,
                description: 'Botellas de plástico PET de prueba',
                latitude: -17.393,
                longitude: -66.157,
                materialId: 1,
                materialName: getMaterialName(1, materialsArray),
                registerDate: '2025-01-01',
                state: 'open'
              }]
            }
          ];
          setMarkerClusters(testClusters);
        }

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

      // Asegurar que tenemos materiales para el fallback
      let fallbackMaterialsArray = materialsArray;
      if (!Array.isArray(fallbackMaterialsArray)) {
        fallbackMaterialsArray = [
          { id: 1, name: 'Plástico PET', description: 'Botellas de plástico' },
          { id: 2, name: 'Cartón', description: 'Cajas de cartón' },
          { id: 4, name: 'Vidrio', description: 'Botellas de vidrio' },
          { id: 5, name: 'Metal', description: 'Latas de aluminio' }
        ];
      }
      
      // Actualizar el estado de materiales también en fallback
      setMaterials(fallbackMaterialsArray);

      // Datos estáticos como fallback con algunos puntos cercanos para probar clustering
      const fallbackRequests = [
        {
          id: 1,
          description: "Cartón y papel para reciclaje",
          latitude: -17.393,
          longitude: -66.157,
          materialId: 2,
          materialName: getMaterialName(2, fallbackMaterialsArray),
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 2,
          description: "Botellas de plástico PET",
          latitude: -17.3931, // Muy cerca del punto 1
          longitude: -66.1571,
          materialId: 1,
          materialName: getMaterialName(1, fallbackMaterialsArray),
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 3,
          description: "Revistas y periódicos",
          latitude: -17.3929, // También cerca del punto 1
          longitude: -66.1569,
          materialId: 2,
          materialName: getMaterialName(2, fallbackMaterialsArray),
          registerDate: "2025-01-02",
          state: "open"
        },
        {
          id: 4,
          description: "Latas de aluminio",
          latitude: -17.400,
          longitude: -66.150,
          materialId: 5,
          materialName: getMaterialName(5, fallbackMaterialsArray),
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 5,
          description: "Botellas de vidrio",
          latitude: -17.390,
          longitude: -66.145,
          materialId: 4,
          materialName: getMaterialName(4, fallbackMaterialsArray),
          registerDate: "2025-01-01",
          state: "open"
        },
        {
          id: 6,
          description: "Envases de plástico",
          latitude: -17.3901, // Cerca del punto 5
          longitude: -66.1451,
          materialId: 1,
          materialName: getMaterialName(1, fallbackMaterialsArray),
          registerDate: "2025-01-03",
          state: "open"
        }
      ];

      setRecyclingRequests(fallbackRequests);

      // Generar clusters para los datos de fallback considerando zoom inicial
      const initialZoom = config.map.defaultZoom;
      const visibleFallbackRequests = getVisibleRequests(fallbackRequests, initialZoom, undefined);
      const fallbackClusters = clusterRequests(visibleFallbackRequests, 100);
      debugLog(`Generated fallback clusters with zoom ${initialZoom}:`, fallbackClusters);
      setMarkerClusters(fallbackClusters);

      // FORZAR DATOS PARA TESTING - TEMPORAL (fallback)
      if (fallbackClusters.length === 0) {
        console.log('No fallback clusters generated, forcing test data...');
        // Usar los materiales de fallback que se obtuvieron antes
        const testClusters = [
          {
            id: 'test-fallback-1',
            latitude: -17.393,
            longitude: -66.157,
            count: 1,
            requests: [{
              id: 998,
              description: 'Cajas de cartón de prueba',
              latitude: -17.393,
              longitude: -66.157,
              materialId: 2,
              materialName: getMaterialName(2, fallbackMaterialsArray),
              registerDate: '2025-01-01',
              state: 'open'
            }]
          }
        ];
        setMarkerClusters(testClusters);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debugLog('RecyclingPointsMap component mounted');
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
      </div>      <div className="recycling-map-wrapper">
        <div className="map-info-card">
          <div className="map-info-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <span className="map-info-text">Aquí puedes recoger los objetos</span>
        </div>

        <div className="map-container">
            <MapContainer
              center={[config.map.defaultCenter.lat, config.map.defaultCenter.lng]}
              zoom={config.map.defaultZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution={config.map.attribution}
                url={config.map.tileUrl}
                maxZoom={config.clustering.maxZoom}
                tileSize={256}
              />
              
              <MapEventHandler />

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
                          // abrir modal en marcador individual, se envia al modal el request completo
                          setSelectedRequest(cluster.requests[0]);
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
                            <h4>{cluster.count} Materiales Disponibles</h4>
                            <div className="cluster-requests-list">
                              {cluster.requests.map((request) => {
                                // Usar el materialName que ya viene del backend
                                // Si por alguna razón no existe, usar getMaterialName como fallback
                                const displayName = request.materialName || getMaterialName(request.materialId, materials);
                                
                                return (
                                <div key={request.id} className="cluster-request-item">
                                  <div className="request-info">
                                    <p><strong>{displayName}</strong></p>
                                    <small>{new Date(request.registerDate).toLocaleDateString()}</small>
                                  </div>
                                  <button 
                                    className="view-request-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRequest(request);
                                      setShowPickupModal(true);
                                    }}
                                  >
                                    Ver Detalles
                                  </button>
                                </div>
                                );
                              })}
                            </div>
                            <div className="cluster-actions">
                              <small>Selecciona un material para ver más detalles</small>
                            </div>
                          </>


                        </div>
                      </Popup>
                    )}
                  </Marker>
                ))}
            </MapContainer>
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