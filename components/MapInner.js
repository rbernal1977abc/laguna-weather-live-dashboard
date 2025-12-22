import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

function quakeColor(mag){
  if(!mag) return 'yellow';
  if(mag >= 6) return 'red';
  if(mag >= 4) return 'orange';
  return 'yellow';
}

export default function MapInner({ center, cities = [], quakes = [], landmarks = [] }){
  return (
    <MapContainer center={[center.lat, center.lon]} zoom={10} style={{height:'100%', width:'100%'}}>
      {/* FREE OpenStreetMap Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Laguna Cities */}
      {cities.map(c=> (
        <Marker key={c.id} position={[c.lat, c.lon]}>
          <Popup>
            <strong>{c.name}</strong><br/>
            {c.name.includes('City') ? '🏙️ City' : '🏘️ Municipality'}
          </Popup>
        </Marker>
      ))}
      
      {/* Laguna Landmarks */}
      {landmarks.map(v=> (
        <Marker key={v.id} position={[v.lat, v.lon]}>
          <Popup>
            <strong>{v.name}</strong><br/>
            {v.id.includes('volcano') ? '🌋 Volcano' : '🏞️ Lake'}
          </Popup>
        </Marker>
      ))}
      
      {/* Earthquakes */}
      {quakes.map(q=> (
        <CircleMarker 
          key={q.id} 
          center={[q.lat, q.lon]} 
          radius={Math.max(4, (q.mag || 1) * 3)} 
          pathOptions={{
            color: quakeColor(q.mag), 
            fillOpacity:0.7
          }}
        >
          <Popup>
            <strong>M{q.mag.toFixed(1)} Earthquake</strong><br/>
            {q.place}<br/>
            <a href={q.url} target="_blank" rel="noreferrer">View Details</a>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
