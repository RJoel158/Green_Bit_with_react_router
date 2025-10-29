import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 👈 IMPORTA TU IMAGEN LOCAL (cambia 'tu-imagen.png' por el nombre real)
import reciclajeIconImage from "../../assets/icons/location.png";

const reciclajeIcon = new L.Icon({
  iconUrl: reciclajeIconImage, // 👈 USA LA IMAGEN IMPORTADA
  iconSize: [30, 30], // Un poco más pequeño para el mini mapa
  iconAnchor: [15, 30],
});

interface MiniMapPreviewProps {
  lat: number;
  lng: number;
  address?: string;
}

// Componente para actualizar el centro del mapa cuando cambian las coordenadas
const UpdateMapCenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [map, lat, lng]);
  
  return null;
};

const MiniMapPreview: React.FC<MiniMapPreviewProps> = ({ lat, lng, address }) => {
  // Crear una key única para forzar re-render cuando cambien las coordenadas
  const mapKey = `${lat}-${lng}`;
  
  return (
    <div className="mini-map-container">
      <div className="mini-map-header">
        <span className="mini-map-title">📍 Ubicación seleccionada</span>
      </div>
      
      <div className="mini-map-wrapper">
        <MapContainer
          key={mapKey} // 👈 CLAVE: Esto fuerza re-render completo
          center={[lat, lng]}
          zoom={16}
          style={{ height: "150px", width: "100%" }}
          zoomControl={false}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={reciclajeIcon} />
          <UpdateMapCenter lat={lat} lng={lng} />
        </MapContainer>
      </div>
      
      <div className="mini-map-address">
        <p className="address-text">
          {address || 'Ubicación seleccionada'}
        </p>
        <p className="coordinates-text">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default MiniMapPreview;