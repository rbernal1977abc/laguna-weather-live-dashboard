import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

// LAGUNA PROVINCE CITIES AND MUNICIPALITIES
const LGUS = [
  // Cities
  { id: 'calamba', name: 'Calamba City', lat: 14.2117, lon: 121.1663, type: 'city' },
  { id: 'santa_cruz', name: 'Santa Cruz (Capital)', lat: 14.2784, lon: 121.4163, type: 'capital' },
  { id: 'san_pablo', name: 'San Pablo City', lat: 14.0667, lon: 121.3250, type: 'city' },
  { id: 'biñan', name: 'Biñan City', lat: 14.3333, lon: 121.0833, type: 'city' },
  { id: 'cabuyao', name: 'Cabuyao City', lat: 14.2453, lon: 121.1156, type: 'city' },
  { id: 'san_pedro', name: 'San Pedro City', lat: 14.3583, lon: 121.0583, type: 'city' },
  
  // Municipalities
  { id: 'alaminos', name: 'Alaminos', lat: 14.0639, lon: 121.2461, type: 'municipality' },
  { id: 'bay', name: 'Bay', lat: 14.1833, lon: 121.2833, type: 'municipality' },
  { id: 'calauan', name: 'Calauan', lat: 14.1500, lon: 121.3167, type: 'municipality' },
  { id: 'cavinti', name: 'Cavinti', lat: 14.2453, lon: 121.5075, type: 'municipality' },
  { id: 'famy', name: 'Famy', lat: 14.4361, lon: 121.4489, type: 'municipality' },
  { id: 'kalayaan', name: 'Kalayaan', lat: 14.3500, lon: 121.4833, type: 'municipality' },
  { id: 'liliw', name: 'Liliw', lat: 14.1303, lon: 121.4369, type: 'municipality' },
  { id: 'los_baños', name: 'Los Baños', lat: 14.1667, lon: 121.2333, type: 'municipality' },
  { id: 'luisiana', name: 'Luisiana', lat: 14.1850, lon: 121.5119, type: 'municipality' },
  { id: 'lumban', name: 'Lumban', lat: 14.2975, lon: 121.4597, type: 'municipality' },
  { id: 'mabitac', name: 'Mabitac', lat: 14.4333, lon: 121.4333, type: 'municipality' },
  { id: 'magdalena', name: 'Magdalena', lat: 14.2000, lon: 121.4333, type: 'municipality' },
  { id: 'majayjay', name: 'Majayjay', lat: 14.1469, lon: 121.4736, type: 'municipality' },
  { id: 'nagcarlan', name: 'Nagcarlan', lat: 14.1364, lon: 121.4153, type: 'municipality' },
  { id: 'paete', name: 'Paete', lat: 14.3647, lon: 121.4825, type: 'municipality' },
  { id: 'pagsanjan', name: 'Pagsanjan', lat: 14.2731, lon: 121.4547, type: 'municipality' },
  { id: 'pakil', name: 'Pakil', lat: 14.3811, lon: 121.4786, type: 'municipality' },
  { id: 'pangil', name: 'Pangil', lat: 14.4039, lon: 121.4669, type: 'municipality' },
  { id: 'pila', name: 'Pila', lat: 14.2333, lon: 121.3667, type: 'municipality' },
  { id: 'rizal', name: 'Rizal', lat: 14.1086, lon: 121.3944, type: 'municipality' },
  { id: 'santa_maria', name: 'Santa Maria', lat: 14.4722, lon: 121.4264, type: 'municipality' },
  { id: 'siniloan', name: 'Siniloan', lat: 14.4217, lon: 121.4464, type: 'municipality' },
  { id: 'victoria', name: 'Victoria', lat: 14.2269, lon: 121.3278, type: 'municipality' },
];

// Laguna Landmarks
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

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. FREE WEATHER DATA - Open-Meteo (no key needed)
  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&hourly=temperature_2m,precipitation,relativehumidity_2m,windspeed_10m,pressure_msl&current_weather=true&timezone=Asia%2FManila&forecast_days=2`;
        const res = await axios.get(url);
        
        setWeather(res.data.current_weather || null);
        
        if (res.data.hourly) {
          const times = res.data.hourly.time || [];
          const arr = [];
          for (let i = 0; i < Math.min(times.length, 24); i++) {
            arr.push({
              time: times[i],
              temp: res.data.hourly.temperature_2m[i],
              prec: res.data.hourly.precipitation[i],
              hum: res.data.hourly.relativehumidity_2m[i],
              wind: res.data.hourly.windspeed_10m[i],
              pres: res.data.hourly.pressure_msl[i]
            });
          }
          setHourly(arr);
        } else {
          setHourly([]);
        }
      } catch (error) {
        console.error('Weather error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [selected]);

  // 2. FREE AIR QUALITY DATA (no key needed)
  useEffect(() => {
    async function fetchAq() {
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selected.lat}&longitude=${selected.lon}&hourly=us_aqi,pm2_5,pm10`;
        const res = await axios.get(url);
        if (res.data && res.data.hourly && res.data.hourly.us_aqi) {
          const lastIndex = res.data.hourly.us_aqi.length - 1;
          setAqi({
            value: res.data.hourly.us_aqi[lastIndex],
            pm25: res.data.hourly.pm2_5[lastIndex],
            pm10: res.data.hourly.pm10[lastIndex],
            time: res.data.hourly.time[lastIndex]
          });
        } else {
          setAqi(null);
        }
      } catch (error) {
        console.error('AQI error:', error);
        setAqi(null);
      }
    }
    fetchAq();
  }, [selected]);

  // 3. FREE EARTHQUAKE DATA (no key needed)
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
          quake.lat >= 13.5 && quake.lat <= 15.0 && // Laguna area
          quake.lon >= 120.5 && quake.lon <= 122.0
        ).sort((a, b) => b.time - a.time);
        
        setQuakes(mapped.slice(0, 10));
      } catch (error) {
        console.error('Earthquake error:', error);
      }
    }
    fetchQuakes();
    const interval = setInterval(fetchQuakes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const getAqiInfo = (aqiValue) => {
    if (!aqiValue) return { level: 'Unknown', color: '#6b7280', bgColor: '#f3f4f6' };
    if (aqiValue <= 50) return { level: 'Good', color: '#059669', bgColor: '#d1fae5' };
    if (aqiValue <= 100) return { level: 'Moderate', color: '#d97706', bgColor: '#fef3c7' };
    if (aqiValue <= 150) return { level: 'Unhealthy for Sensitive', color: '#ea580c', bgColor: '#ffedd5' };
    if (aqiValue <= 200) return { level: 'Unhealthy', color: '#dc2626', bgColor: '#fee2e2' };
    if (aqiValue <= 300) return { level: 'Very Unhealthy', color: '#7c3aed', bgColor: '#ede9fe' };
    return { level: 'Hazardous', color: '#7e22ce', bgColor: '#f3e8ff' };
  };

  const aqiInfo = aqi ? getAqiInfo(aqi.value) : getAqiInfo(null);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="logo-placeholder">L</div>
          <div>
            <div className="title">Laguna Weather Dashboard</div>
            <div className="small">100% Free APIs • Real-time Data • Mobile Ready</div>
          </div>
        </div>
        <div className="small" style={{ textAlign: 'right' }}>
          <div>🆓 No API Keys Required</div>
          <div>🌍 Laguna Province</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        <div className="card" style={{ marginBottom: '16px', background: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
          <strong>📍 Laguna Province Monitoring</strong>
          <div className="small" style={{ marginTop: '8px' }}>
            Select a city to view real-time weather, air quality, and earthquake data from free public APIs.
          </div>
        </div>

        <div className="grid">
          {/* Left Column */}
          <div>
            {/* Location Selector */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <label><strong>Select Laguna City/Municipality:</strong></label>
              <select
                className="select"
                value={selected.id}
                onChange={e => setSelected(LGUS.find(g => g.id === e.target.value))}
              >
                <optgroup label="🏙️ Cities">
                  {LGUS.filter(l => l.type === 'city' || l.type === 'capital').map(g => (
                    <option key={g.id} value={g.id}>
                      {g.type === 'capital' ? '🏛️ ' : ''}{g.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏘️ Municipalities">
                  {LGUS.filter(l => l.type === 'municipality').map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </optgroup>
              </select>
              <div className="small" style={{ marginTop: '8px' }}>
                Currently viewing: <strong>{selected.name}</strong> • 
                Coordinates: {selected.lat.toFixed(4)}, {selected.lon.toFixed(4)}
              </div>
            </div>

            {/* Current Weather */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>🌡️ Current Weather</h3>
              {loading ? (
                <div className="loading" style={{ padding: '20px', textAlign: 'center' }}>
                  Loading weather data...
                </div>
              ) : weather ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  marginTop: '12px'
                }}>
                  <div style={{
                    padding: '16px',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}>
                    <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px' }}>
                      Temperature
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
                      {weather.temperature}°C
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: '#eff6ff',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <div style={{ fontSize: '12px', color: '#2563eb', marginBottom: '4px' }}>
                      Wind Speed
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>
                      {weather.windspeed} m/s
                    </div>
                    <div className="small" style={{ marginTop: '4px' }}>
                      Direction: {weather.winddirection}°
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>
                      Updated
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {new Date(weather.time).toLocaleTimeString('en-PH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="small" style={{ marginTop: '4px' }}>
                      {new Date(weather.time).toLocaleDateString('en-PH')}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Weather data unavailable
                </div>
              )}
            </div>

            {/* Air Quality */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>🌫️ Air Quality Index (US AQI)</h3>
              {aqi ? (
                <div style={{
                  padding: '20px',
                  background: aqiInfo.bgColor,
                  borderRadius: '8px',
                  border: `2px solid ${aqiInfo.color}`,
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: aqiInfo.color }}>
                        Current AQI Level
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: aqiInfo.color, margin: '8px 0' }}>
                        {aqi.value}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: aqiInfo.color }}>
                        {aqiInfo.level}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="small" style={{ color: aqiInfo.color }}>
                        Updated Hourly
                      </div>
                      <div className="small" style={{ marginTop: '8px' }}>
                        PM2.5: {aqi.pm25?.toFixed(1)} µg/m³
                      </div>
                      <div className="small">
                        PM10: {aqi.pm10?.toFixed(1)} µg/m³
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  AQI data loading...
                </div>
              )}
            </div>

            {/* 24-Hour Forecast */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>📅 24-Hour Forecast</h3>
              <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '12px' }}>
                {hourly.length > 0 ? (
                  hourly.map((hour, index) => (
                    <div
                      key={hour.time}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderBottom: index < hourly.length - 1 ? '1px solid #e5e7eb' : 'none',
                        background: index === 0 ? '#f8fafc' : 'white'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold' }}>
                          {index === 0 ? 'Now' : new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', hour12: false })}
                        </div>
                        <div className="small" style={{ color: '#6b7280' }}>
                          {new Date(hour.time).toLocaleDateString([], { weekday: 'short' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                          {hour.temp}°C
                        </div>
                        <div className="small" style={{ color: '#6b7280' }}>
                          💧 {hour.prec}mm • 💨 {hour.wind}m/s
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    Loading forecast data...
                  </div>
                )}
              </div>
            </div>

            {/* Laguna Landmarks */}
            <div className="card">
              <h3>🏔️ Laguna Landmarks</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                marginTop: '12px'
              }}>
                {LANDMARKS.map(landmark => (
                  <div
                    key={landmark.id}
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {landmark.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      {landmark.type === 'volcano' ? '🌋 Volcano' : '🏞️ Lake'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#059669' }}>
                      Status: <strong>Normal</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <aside>
            {/* Map */}
            <div className="card">
              <h3>🗺️ Laguna Province Map</h3>
              <div className="mapBox" style={{ height: '300px' }}>
                <MapClient 
                  center={{ lat: selected.lat, lon: selected.lon }} 
                  cities={LGUS} 
                  quakes={quakes} 
                  landmarks={LANDMARKS}
                />
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }}></div>
                    <span>Cities</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }}></div>
                    <span>Landmarks</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
                    <span>Earthquakes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Earthquakes */}
            <div className="card" style={{ marginTop: '16px' }}>
              <h3>⚡ Recent Earthquakes</h3>
              <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '12px' }}>
                {quakes.length > 0 ? (
                  quakes.map(quake => (
                    <div
                      key={quake.id}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #e5e7eb',
                        background: quake.mag >= 5 ? '#fef2f2' : 
                                   quake.mag >= 4 ? '#fffbeb' : '#f0fdf4'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              M{quake.mag?.toFixed(1)}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: quake.mag >= 5 ? '#fee2e2' : 
                                         quake.mag >= 4 ? '#fef3c7' : '#d1fae5',
                              color: quake.mag >= 5 ? '#dc2626' : 
                                     quake.mag >= 4 ? '#d97706' : '#059669',
                              borderRadius: '12px'
                            }}>
                              {quake.mag >= 5 ? 'Strong' : quake.mag >= 4 ? 'Moderate' : 'Light'}
                            </span>
                          </div>
                          <div className="small" style={{ marginTop: '4px', color: '#6b7280' }}>
                            {quake.place}
                          </div>
                          <div className="small" style={{ color: '#9ca3af' }}>
                            {new Date(quake.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <a
                          href={quake.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11px',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Details →
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No recent earthquakes in Laguna area
                  </div>
                )}
              </div>
            </div>

            {/* Free APIs Info */}
            <div className="card" style={{ marginTop: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <h3>🆓 Free APIs Used</h3>
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>Open-Meteo</div>
                    <div style={{ color: '#6b7280' }}>Weather Data</div>
                  </div>
                  <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>USGS</div>
                    <div style={{ color: '#6b7280' }}>Earthquakes</div>
                  </div>
                  <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>Air Quality API</div>
                    <div style={{ color: '#6b7280' }}>Pollution</div>
                  </div>
                  <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>OpenStreetMap</div>
                    <div style={{ color: '#6b7280' }}>Maps</div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', padding: '8px', background: '#dcfce7', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#059669' }}>
                    <strong>100% FREE</strong> • No API Keys Required
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Alert */}
            {isMobile && (
              <div className="card" style={{ marginTop: '16px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h3>📱 Mobile Ready</h3>
                <div style={{ fontSize: '13px', color: '#1e40af', marginTop: '8px' }}>
                  This dashboard is optimized for mobile devices and works perfectly on phones and tablets.
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Laguna Weather Dashboard • 100% Free APIs • Real-time Data
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          Data updates automatically • No API keys required • Optimized for mobile • Made for Laguna Province
        </div>
      </footer>
    </div>
  );
}
