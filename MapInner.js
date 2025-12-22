import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function quakeColor(mag){
  if(!mag) return 'yellow';
  if(mag >= 6) return 'red';
  if(mag >= 4) return 'orange';
  return 'yellow';
}

export default function MapInner({ center, cities = [], quakes = [], landmarks = [] }){
  return (
    <MapContainer center={[center.lat, center.lon]} zoom={10} style={{height:'100%', width:'100%'}}>
      {/* FREE OpenStreetMap */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      
      {/* Laguna Cities */}
      {cities.map(c=> (
        <Marker key={c.id} position={[c.lat, c.lon]}>
          <Popup>{c.name}</Popup>
        </Marker>
      ))}
      
      {/* Laguna Landmarks */}
      {landmarks.map(v=> (
        <Marker key={v.id} position={[v.lat, v.lon]}>
          <Popup>{v.name}</Popup>
        </Marker>
      ))}
      
      {/* Earthquakes */}
      {quakes.map(q=> (
        <CircleMarker 
          key={q.id} 
          center={[q.lat, q.lon]} 
          radius={Math.max(4, (q.mag || 1) * 3)} 
          pathOptions={{color: quakeColor(q.mag), fillOpacity:0.7}}
        >
          <Popup>
            <strong>M{q.mag}</strong> {q.place}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
