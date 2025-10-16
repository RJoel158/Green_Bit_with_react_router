import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import locationIcon from '../../assets/icons/location.png';

// Crear icono personalizado
const customIcon = new L.Icon({
  iconUrl: locationIcon,
  iconSize: [48, 48], // Aumentado de 32x32 a 48x48
  iconAnchor: [24, 48], // Ajustado para el nuevo tamaño
  popupAnchor: [0, -48], // Ajustado para el nuevo tamaño
});

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleMapProps {
  center?: [number, number];
  markerPosition?: [number, number];
  markerText?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  center = [-17.393, -66.157], 
  markerPosition,
  markerText = "Ubicación de recojo"
}) => {

  return (
    <div className="recycling-points-container">
      <div className="recycling-points-header">
        
      </div>

      <div className="recycling-map-wrapper">
        <div className="map-container">
          <MapContainer
            key="simple-map-test"
            center={markerPosition || center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              tileSize={256}
            />
            {markerPosition && (
              <Marker position={markerPosition} icon={customIcon}>
                <Popup>{markerText}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;