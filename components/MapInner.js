import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function getQuakeColor(mag) {
  if (!mag) return '#fbbf24'; // yellow
  if (mag >= 6) return '#dc2626'; // red
  if (mag >= 4) return '#f97316'; // orange
  return '#fbbf24'; // yellow
}

export default function MapInner({ center, cities = [], quakes = [], landmarks = [] }) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      touchZoom={true}
      dragging={true}
    >
      {/* FREE OpenStreetMap Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      
      {/* Laguna Cities and Municipalities */}
      {cities.map(city => (
        <Marker key={city.id} position={[city.lat, city.lon]}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong>{city.name}</strong>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {city.name.includes('City') ? '🏙️ City' : '🏘️ Municipality'}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                Lat: {city.lat.toFixed(4)}, Lon: {city.lon.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Laguna Landmarks */}
      {landmarks.map(landmark => (
        <Marker key={landmark.id} position={[landmark.lat, landmark.lon]}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong>{landmark.name}</strong>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {landmark.type === 'volcano' ? '🌋 Volcano' : '🏞️ Lake'}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                Status: <span style={{ color: '#22c55e' }}>Normal</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Recent Earthquakes */}
      {quakes.map(quake => (
        <CircleMarker
          key={quake.id}
          center={[quake.lat, quake.lon]}
          radius={Math.max(5, (quake.mag || 1) * 4)}
          pathOptions={{
            fillColor: getQuakeColor(quake.mag),
            color: getQuakeColor(quake.mag),
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.6
          }}
        >
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong style={{ fontSize: '14px' }}>M{quake.mag?.toFixed(1)} Earthquake</strong>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>{quake.place}</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                Time: {new Date(quake.time).toLocaleString()}
              </div>
              <a 
                href={quake.url} 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '11px', color: '#3b82f6', display: 'block', marginTop: '6px' }}
              >
                View Details
              </a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
