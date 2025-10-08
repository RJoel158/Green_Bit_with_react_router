import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

const SimpleMap: React.FC = () => {
  console.log('SimpleMap rendered');

  return (
    <div className="recycling-points-container">
      <div className="recycling-points-header">
        
      </div>

      <div className="recycling-map-wrapper">
        <div className="map-container">
          <MapContainer
            key="simple-map-test"
            center={[-17.393, -66.157]}
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
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;