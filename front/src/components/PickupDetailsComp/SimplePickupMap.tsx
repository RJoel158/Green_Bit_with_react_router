import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix para los iconos de Leaflet - FORZADO
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SimplePickupMapProps {
  center?: [number, number];
  markerPosition?: [number, number];
  markerText?: string;
}

const SimplePickupMap: React.FC<SimplePickupMapProps> = ({ 
  center = [-17.393, -66.157], 
  markerPosition,
  markerText = "Punto de recojo"
  
}) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // MÚLTIPLES intentos de refresh del mapa
    const timers = [100, 300, 500, 1000].map(delay => 
      setTimeout(() => {
        if (mapRef.current) {
          console.log(`Intentando refresh del mapa en ${delay}ms`);
          mapRef.current.invalidateSize();
          mapRef.current.setView(markerPosition || center, 14);
        }
      }, delay)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [markerPosition, center]);

  const handleMapReady = (map: L.Map) => {
    console.log('Mapa inicializado correctamente');
    mapRef.current = map;
    
    // Forzar refresh inmediato
    setTimeout(() => {
      map.invalidateSize();
      console.log(' Tamaño del mapa invalidado');
    }, 50);
  };

  return (
    <div 
      style={{ 
        height: '100%', 
        width: '100%', 
        minHeight: '400px',
        position: 'relative',
        zIndex: 1
      }}
    >
      <MapContainer
        center={markerPosition || center}
        zoom={14}
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '400px',
          zIndex: 1
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        whenReady={() => {
          if (mapRef.current) {
            handleMapReady(mapRef.current);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {markerPosition && (
          <Marker position={markerPosition} icon={DefaultIcon}>
            <Popup>{markerText}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default SimplePickupMap;