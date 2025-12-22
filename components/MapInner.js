import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

// Custom icons
const cityIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="20" height="20">
      <circle cx="12" cy="12" r="8" fill="blue" opacity="0.7"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const capitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="gold" opacity="0.9"/>
      <circle cx="12" cy="12" r="5" fill="red"/>
      <circle cx="12" cy="12" r="2" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const volcanoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange" width="18" height="18">
      <path d="M12 2L4 10L7 14H9V21H15V14H17L20 10L12 2Z" fill="orange"/>
    </svg>
  `),
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

const lakeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="18" height="18">
      <path d="M12 2L2 12H5V22H19V12H22L12 2Z" fill="blue" opacity="0.7"/>
    </svg>
  `),
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const selectedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="red" opacity="0.8"/>
      <circle cx="12" cy="12" r="6" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="red"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function quakeColor(mag) {
  if (!mag) return '#fbbf24';
  if (mag >= 6) return '#dc2626';
  if (mag >= 4) return '#f97316';
  return '#fbbf24';
}

export default function MapInner({ center, cities = [], quakes = [], landmarks = [], selectedCity }) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      touchZoom={true}
      dragging={true}
      zoomControl={true}
    >
      {/* FREE OpenStreetMap Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      
      {/* Cities */}
      {cities.map(c => (
        <Marker
          key={c.id}
          position={[c.lat, c.lon]}
          icon={selectedCity && c.id === selectedCity.id ? selectedIcon : 
                c.type === 'capital' ? capitalIcon : cityIcon}
        >
          <Popup>
            <div className="p-2">
              <strong>{c.name}</strong>
              <div className="text-sm text-gray-600">
                {c.type === 'capital' ? '🏛️ Provincial Capital' : 
                 c.type === 'city' ? '🏙️ City' : '🏘️ Municipality'}
              </div>
              <div className="text-xs mt-1">
                Coordinates: {c.lat.toFixed(4)}, {c.lon.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Landmarks */}
      {landmarks.map(l => (
        <Marker
          key={l.id}
          position={[l.lat, l.lon]}
          icon={l.type === 'volcano' ? volcanoIcon : lakeIcon}
        >
          <Popup>
            <div className="p-2">
              <strong>{l.name}</strong>
              <div className="text-sm text-gray-600">
                {l.type === 'volcano' ? '🌋 Volcano' : 
                 l.type === 'lake' ? '🏞️ Lake' : '💧 Waterfall'}
              </div>
              <div className="text-xs mt-1">
                Status: <span className="text-green-600 font-medium">Normal</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Earthquakes */}
      {quakes.map(q => (
        <CircleMarker
          key={q.id}
          center={[q.lat, q.lon]}
          radius={Math.max(6, (q.mag || 1) * 4)}
          pathOptions={{
            fillColor: quakeColor(q.mag),
            color: quakeColor(q.mag),
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
          }}
        >
          <Popup>
            <div className="p-2">
              <strong className="text-lg">M{q.mag.toFixed(1)} Earthquake</strong>
              <div className="text-sm mt-1">{q.place}</div>
              <div className="text-xs text-gray-600 mt-2">
                Time: {new Date(q.time).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                Depth: {q.depth?.toFixed(1) || 'Unknown'} km
              </div>
              <div className="mt-2">
                <a 
                  href={q.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View USGS Details
                </a>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
