import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Laguna Cities
const LGUS = [
  { id: 'calamba', name: 'Calamba City', lat: 14.2117, lon: 121.1663 },
  { id: 'santa_cruz', name: 'Santa Cruz (Capital)', lat: 14.2784, lon: 121.4163 },
  { id: 'san_pablo', name: 'San Pablo City', lat: 14.0667, lon: 121.3250 },
  { id: 'biñan', name: 'Biñan City', lat: 14.3333, lon: 121.0833 },
  { id: 'cabuyao', name: 'Cabuyao City', lat: 14.2453, lon: 121.1156 },
  { id: 'san_pedro', name: 'San Pedro City', lat: 14.3583, lon: 121.0583 },
];

// Simple Map Component
function SimpleMap({ center, selectedName }) {
  return (
    <div style={{
      height: '300px',
      background: '#f1f5f9',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        border: '2px solid #3b82f6',
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.1)'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '12px',
        height: '12px',
        background: '#ef4444',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 0 0 3px #ef4444'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        right: '0',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        margin: '0 20px',
        borderRadius: '6px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{selectedName}</div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Coordinates: {center.lat.toFixed(4)}, {center.lon.toFixed(4)}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState(LGUS[0]);
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [quakes, setQuakes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Weather Data
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

  // Fetch Air Quality
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

  // Fetch Earthquakes
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

  const getAqiLevel = (aqi) => {
    if (!aqi) return 'Unknown';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            L
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
              Laguna Weather Dashboard
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              100% Free APIs • Real-time Data
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Info Banner */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          background: '#eff6ff',
          borderLeft: '4px solid #3b82f6'
        }}>
          <strong>🌤️ Laguna Province Weather Monitoring</strong>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
            Select a city to view real-time weather, air quality, and earthquake data from free public APIs.
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
          marginTop: '16px'
        }}>
          <div>
            {/* Location Selector */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Select Laguna City:
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
                value={selected.id}
                onChange={e => setSelected(LGUS.find(g => g.id === e.target.value))}
              >
                {LGUS.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Currently viewing: <strong>{selected.name}</strong>
              </div>
            </div>

            {/* Current Weather */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#1e293b' }}>
                Current Weather
              </h3>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Loading weather data...
                </div>
              ) : weather ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '16px',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}>
                    <div style={{ fontSize: '12px', color: '#dc2626' }}>Temperature</div>
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
                    <div style={{ fontSize: '12px', color: '#2563eb' }}>Wind Speed</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>
                      {weather.windspeed} m/s
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Direction: {weather.winddirection}°
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
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#1e293b' }}>
                Air Quality Index
              </h3>
              {aqi !== null ? (
                <div style={{
                  padding: '20px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getAqiColor(aqi)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: getAqiColor(aqi) }}>
                        {aqi}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: getAqiColor(aqi) }}>
                        {getAqiLevel(aqi)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>US AQI</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Updated hourly</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Loading air quality data...
                </div>
              )}
            </div>

            {/* Forecast */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#1e293b' }}>
                12-Hour Forecast
              </h3>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {hourly.map((hour, i) => (
                  <div
                    key={hour.time}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: i < hourly.length - 1 ? '1px solid #e5e7eb' : 'none',
                      background: i === 0 ? '#f8fafc' : 'white'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {i === 0 ? 'Now' : new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', hour12: false })}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(hour.time).toLocaleDateString([], { weekday: 'short' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                        {hour.temp}°C
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        💧 {hour.prec} mm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Map */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#1e293b' }}>
                Laguna Map
              </h3>
              <SimpleMap center={selected} selectedName={selected.name} />
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '12px',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>
                  <span>Selected City</span>
                </div>
              </div>
            </div>

            {/* Earthquakes */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#1e293b' }}>
                Recent Earthquakes
              </h3>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
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
                            <span style={{ fontWeight: 'bold' }}>M{quake.mag?.toFixed(1)}</span>
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
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {new Date(quake.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    No recent earthquakes in Laguna area
                  </div>
                )}
              </div>
            </div>

            {/* Free APIs Info */}
            <div style={{
              background: '#f0fdf4',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
              border: '1px solid #bbf7d0'
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#1e293b' }}>
                🆓 Free APIs Used
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '12px'
              }}>
                <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#3b82f6' }}>Open-Meteo</div>
                  <div style={{ color: '#64748b' }}>Weather Data</div>
                </div>
                <div style={{ padding: '8px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#3b82f6' }}>USGS</div>
                  <div style={{ color: '#64748b' }}>Earthquakes</div>
                </div>
              </div>
              <div style={{
                marginTop: '12px',
                padding: '8px',
                background: '#dcfce7',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#059669'
              }}>
                <strong>100% FREE</strong> • No API Keys Required
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        maxWidth: '1200px',
        margin: '24px auto',
        padding: '16px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '12px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          Laguna Weather Dashboard • 100% Free APIs • Real-time Data
        </div>
        <div>
          Data updates automatically • No API keys required • Made for Laguna Province
        </div>
      </footer>
    </div>
  );
}
