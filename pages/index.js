import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import '../styles.css';

// Simple Map Component (all in one)
const MapComponent = dynamic(() => {
  return Promise.resolve(function Map({ center, cities, quakes, landmarks }) {
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
      setIsLoaded(true);
    }, []);
    
    if (!isLoaded) {
      return (
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          borderRadius: '8px'
        }}>
          Loading map...
        </div>
      );
    }
    
    return (
      <div style={{
        height: '300px',
        background: '#f1f5f9',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div>Interactive Map</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Coordinates: {center.lat.toFixed(4)}, {center.lon.toFixed(4)}
          </div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>
            {cities.length} cities • {quakes.length} earthquakes
          </div>
        </div>
      </div>
    );
  });
}, { ssr: false });

// LAGUNA CITIES
const LGUS = [
  { id: 'calamba', name: 'Calamba City', lat: 14.2117, lon: 121.1663, type: 'city' },
  { id: 'santa_cruz', name: 'Santa Cruz (Capital)', lat: 14.2784, lon: 121.4163, type: 'capital' },
  { id: 'san_pablo', name: 'San Pablo City', lat: 14.0667, lon: 121.3250, type: 'city' },
  { id: 'biñan', name: 'Biñan City', lat: 14.3333, lon: 121.0833, type: 'city' },
  { id: 'cabuyao', name: 'Cabuyao City', lat: 14.2453, lon: 121.1156, type: 'city' },
  { id: 'san_pedro', name: 'San Pedro City', lat: 14.3583, lon: 121.0583, type: 'city' },
  { id: 'alaminos', name: 'Alaminos', lat: 14.0639, lon: 121.2461, type: 'municipality' },
  { id: 'bay', name: 'Bay', lat: 14.1833, lon: 121.2833, type: 'municipality' },
  { id: 'calauan', name: 'Calauan', lat: 14.1500, lon: 121.3167, type: 'municipality' },
  { id: 'cavinti', name: 'Cavinti', lat: 14.2453, lon: 121.5075, type: 'municipality' },
];

// LAGUNA LANDMARKS
const LANDMARKS = [
  { id: 'makiling', name: 'Mount Makiling', lat: 14.1306, lon: 121.1933, type: 'volcano' },
  { id: 'banahaw', name: 'Mount Banahaw', lat: 14.0667, lon: 121.4833, type: 'volcano' },
  { id: 'laguna_lake', name: 'Laguna de Bay', lat: 14.3167, lon: 121.2167, type: 'lake' }
];

export default function Home() {
  const [selected, setSelected] = useState(LGUS[0]);
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [quakes, setQuakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // WEATHER DATA
  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&hourly=temperature_2m,precipitation&current_weather=true&timezone=Asia%2FManila`;
        const res = await axios.get(url);
        
        setWeather(res.data.current_weather || null);
        
        if (res.data.hourly) {
          const times = res.data.hourly.time || [];
          const arr = [];
          for (let i = 0; i < Math.min(times.length, 12); i++) {
            arr.push({
              time: times[i],
              temp: res.data.hourly.temperature_2m[i],
              prec: res.data.hourly.precipitation[i]
            });
          }
          setHourly(arr);
        }
      } catch (error) {
        console.error('Weather error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [selected]);

  // AIR QUALITY
  useEffect(() => {
    async function fetchAq() {
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selected.lat}&longitude=${selected.lon}&hourly=us_aqi`;
        const res = await axios.get(url);
        if (res.data && res.data.hourly && res.data.hourly.us_aqi) {
          const last = res.data.hourly.us_aqi.slice(-1)[0];
          setAqi(last);
        }
      } catch (error) {
        console.error('AQI error:', error);
      }
    }
    fetchAq();
  }, [selected]);

  // EARTHQUAKES
  useEffect(() => {
    async function fetchQuakes() {
      try {
        const res = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        const feats = res.data.features || [];
        const mapped = feats.map(f => {
          const [lon, lat] = f.geometry.coordinates;
          return {
            id: f.id,
            mag: f.properties.mag,
            place: f.properties.place,
            time: f.properties.time,
            lat, lon,
            url: f.properties.url
          };
        }).filter(quake =>
          quake.lat >= 13.5 && quake.lat <= 15.0 &&
          quake.lon >= 120.5 && quake.lon <= 122.0
        ).sort((a, b) => b.time - a.time);
        
        setQuakes(mapped.slice(0, 5));
      } catch (error) {
        console.error('Earthquake error:', error);
      }
    }
    fetchQuakes();
  }, []);

  const getAqiColor = (aqi) => {
    if (!aqi) return '#6b7280';
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#8b5cf6';
  };

  return (
    <div>
      <header className="header">
        <div className="brand">
          <div className="logo-placeholder">L</div>
          <div>
            <div className="title">Laguna Weather Dashboard</div>
            <div className="small">100% Free • Real-time • Mobile Ready</div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="card" style={{ marginBottom: '16px', background: '#eff6ff' }}>
          <strong>🌤️ Laguna Province Weather Monitoring</strong>
          <div className="small" style={{ marginTop: '8px' }}>
            Select a city to view real-time weather data from free public APIs.
          </div>
        </div>

        <div className="grid">
          <div>
            {/* SELECTOR */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <label><strong>Select City:</strong></label>
              <select
                className="select"
                value={selected.id}
                onChange={e => setSelected(LGUS.find(g => g.id === e.target.value))}
              >
                {LGUS.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <div className="small" style={{ marginTop: '8px' }}>
                Viewing: <strong>{selected.name}</strong>
              </div>
            </div>

            {/* WEATHER */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>Current Weather</h3>
              {loading ? (
                <div className="small">Loading...</div>
              ) : weather ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginTop: '12px'
                }}>
                  <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px' }}>
                    <div className="small">Temperature</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                      {weather.temperature}°C
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px' }}>
                    <div className="small">Wind Speed</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                      {weather.windspeed} m/s
                    </div>
                  </div>
                </div>
              ) : (
                <div className="small">No data</div>
              )}
            </div>

            {/* AQI */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>Air Quality</h3>
              {aqi !== null ? (
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getAqiColor(aqi)}`,
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: getAqiColor(aqi) }}>
                        {aqi}
                      </div>
                      <div className="small">US AQI Index</div>
                    </div>
                    <div className="small" style={{ textAlign: 'right' }}>
                      Updated hourly<br/>
                      via Open-Meteo
                    </div>
                  </div>
                </div>
              ) : (
                <div className="small">Loading AQI...</div>
              )}
            </div>

            {/* FORECAST */}
            <div className="card">
              <h3>12-Hour Forecast</h3>
              <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '12px' }}>
                {hourly.map((hour, i) => (
                  <div
                    key={hour.time}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px',
                      borderBottom: i < hourly.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <div className="small">
                      {i === 0 ? 'Now' : new Date(hour.time).toLocaleTimeString([], { hour: '2-digit' })}
                    </div>
                    <div className="small">
                      {hour.temp}°C • 💧 {hour.prec}mm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside>
            {/* MAP */}
            <div className="card">
              <h3>Laguna Map</h3>
              <div style={{ height: '300px', marginTop: '12px' }}>
                <MapComponent 
                  center={{ lat: selected.lat, lon: selected.lon }} 
                  cities={LGUS} 
                  quakes={quakes} 
                  landmarks={LANDMARKS}
                />
              </div>
            </div>

            {/* EARTHQUAKES */}
            <div className="card" style={{ marginTop: '16px' }}>
              <h3>Recent Earthquakes</h3>
              <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '12px' }}>
                {quakes.length > 0 ? (
                  quakes.map(quake => (
                    <div
                      key={quake.id}
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <div className="small">
                        <strong>M{quake.mag}</strong> • {new Date(quake.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="small" style={{ color: '#6b7280' }}>
                        {quake.place}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="small" style={{ padding: '12px', textAlign: 'center' }}>
                    No recent earthquakes
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <div className="card" style={{ marginTop: '16px', background: '#f0fdf4' }}>
              <h3>🆓 Free APIs</h3>
              <div className="small" style={{ marginTop: '8px' }}>
                • Open-Meteo: Weather<br/>
                • USGS: Earthquakes<br/>
                • Air Quality API<br/>
                <div style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                  <strong>No API keys needed!</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <div>Laguna Weather Dashboard • 100% Free • Real-time Data</div>
        <div className="small" style={{ marginTop: '4px' }}>
          Updates automatically • Mobile optimized
        </div>
      </footer>
    </div>
  );
}
