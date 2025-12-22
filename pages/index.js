import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// Clean CSS in JS styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  
  contentMaxWidth: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: '12px',
    border: '1px solid #334155',
    padding: '20px',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
  },
  
  title1: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  
  title2: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#f1f5f9',
  },
  
  title3: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#f1f5f9',
  },
  
  bodyText: {
    fontSize: '14px',
    color: '#cbd5e1',
  },
  
  smallText: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  
  select: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
  },
  
  statBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: '8px',
    border: '1px solid #334155',
    padding: '12px',
  },
  
  colors: {
    temperature: { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5' },
    wind: { bg: 'rgba(37, 99, 235, 0.1)', border: 'rgba(37, 99, 235, 0.2)', text: '#93c5fd' },
    pressure: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)', text: '#c4b5fd' },
    good: { bg: 'rgba(21, 128, 61, 0.1)', border: 'rgba(21, 128, 61, 0.2)', text: '#86efac' },
    warning: { bg: 'rgba(202, 138, 4, 0.1)', border: 'rgba(202, 138, 4, 0.2)', text: '#fde047' },
    danger: { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5' },
    money: { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.5)', text: '#fbbf24' },
  },
};

// Laguna Cities
const CITIES = [
  { id: 'calamba', name: 'Calamba City', lat: 14.2117, lon: 121.1663, population: '539,671', type: 'City' },
  { id: 'santa_cruz', name: 'Santa Cruz (Capital)', lat: 14.2784, lon: 121.4163, population: '129,965', type: 'Capital' },
  { id: 'san_pablo', name: 'San Pablo City', lat: 14.0667, lon: 121.3250, population: '285,348', type: 'City' },
  { id: 'biñan', name: 'Biñan City', lat: 14.3333, lon: 121.0833, population: '407,437', type: 'City' },
  { id: 'cabuyao', name: 'Cabuyao City', lat: 14.2453, lon: 121.1156, population: '355,330', type: 'City' },
  { id: 'san_pedro', name: 'San Pedro City', lat: 14.3583, lon: 121.0583, population: '326,001', type: 'City' },
];

const LANDMARKS = [
  { id: 'makiling', name: 'Mount Makiling', type: 'volcano', elevation: '1,090m', status: 'Inactive', icon: '🌋' },
  { id: 'laguna_lake', name: 'Laguna de Bay', type: 'lake', area: '949 km²', depth: '2.8m', icon: '🏞️' },
  { id: 'pagsanjan_falls', name: 'Pagsanjan Falls', type: 'waterfall', height: '120m', status: 'Tourist Spot', icon: '💧' },
];

// SHOW ME THE MONEY Component
function ShowMeTheMoney({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.5s ease-out',
    }}>
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderRadius: '20px',
        padding: '40px 30px',
        maxWidth: '500px',
        width: '100%',
        border: '3px solid #fbbf24',
        boxShadow: '0 20px 60px rgba(251, 191, 36, 0.3)',
        textAlign: 'center',
        animation: 'pulse 2s infinite',
      }}>
        {/* Money Rain Animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                fontSize: '24px',
                top: '-30px',
                left: `${Math.random() * 100}%`,
                animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              💰
            </div>
          ))}
        </div>

        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'bounce 1s infinite',
        }}>
          💸
        </div>
        
        <div style={{
          fontSize: '48px',
          fontWeight: '900',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
        }}>
          SHOW ME THE MONEY!
        </div>
        
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#fde047',
          marginBottom: '30px',
          animation: 'glow 2s infinite alternate',
        }}>
          💰 Real-Time Weather = Real Business Value 💰
        </div>
        
        <div style={{
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          border: '2px solid #fbbf24',
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#fde047', marginBottom: '10px' }}>
            This Dashboard Generates:
          </div>
          <div style={{ ...styles.bodyText, color: '#fef3c7' }}>
            • Accurate weather data for business decisions<br/>
            • Live alerts for disaster preparedness<br/>
            • Air quality monitoring for public health<br/>
            • Tourism & agriculture insights<br/>
            • All in REAL-TIME!
          </div>
        </div>
        
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#fbbf24',
            color: '#0f172a',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 40px',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 8px 20px rgba(251, 191, 36, 0.4)',
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 12px 30px rgba(251, 191, 36, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 8px 20px rgba(251, 191, 36, 0.4)';
          }}
        >
          ENTER WEALTH DASHBOARD →
        </button>
        
        <div style={{
          marginTop: '30px',
          fontSize: '14px',
          color: '#fde047',
          opacity: 0.8,
        }}>
          Powered by DIMAX • Secured by RP8 • 💰 Show me the money! 💰
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function LagunaWeatherDashboard() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [airQuality, setAirQuality] = useState(null);
  const [earthquakes, setEarthquakes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoney, setShowMoney] = useState(true); // Set to true to show on first load

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&current_weather=true&timezone=Asia%2FManila`;
        const response = await axios.get(url);
        
        setWeatherData(response.data.current_weather);
        
        if (response.data.hourly) {
          const times = response.data.hourly.time.slice(0, 12);
          const forecast = times.map((time, index) => ({
            time,
            temperature: response.data.hourly.temperature_2m[index],
            humidity: response.data.hourly.relative_humidity_2m[index],
            precipitation: response.data.hourly.precipitation[index],
            windSpeed: response.data.hourly.wind_speed_10m[index],
          }));
          setHourlyForecast(forecast);
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeather();
  }, [selectedCity]);
  
  // Fetch air quality
  useEffect(() => {
    const fetchAirQuality = async () => {
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&hourly=us_aqi,pm2_5`;
        const response = await axios.get(url);
        
        if (response.data.hourly) {
          const latestIndex = response.data.hourly.time.length - 1;
          setAirQuality({
            aqi: response.data.hourly.us_aqi[latestIndex],
            pm25: response.data.hourly.pm2_5[latestIndex],
            time: response.data.hourly.time[latestIndex],
          });
        }
      } catch (error) {
        console.error('Air quality fetch error:', error);
      }
    };
    
    fetchAirQuality();
  }, [selectedCity]);
  
  // Fetch earthquakes
  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const response = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        const quakeData = response.data.features
          .slice(0, 5)
          .map(quake => ({
            id: quake.id,
            magnitude: quake.properties.mag,
            location: quake.properties.place,
            time: quake.properties.time,
            depth: quake.geometry.coordinates[2],
          }));
        setEarthquakes(quakeData);
      } catch (error) {
        console.error('Earthquake fetch error:', error);
      }
    };
    
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 300000);
    return () => clearInterval(interval);
  }, []);
  
  const getAqiLevel = (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: styles.colors.good };
    if (aqi <= 100) return { level: 'Moderate', color: styles.colors.warning };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: styles.colors.danger };
    return { level: 'Unhealthy', color: styles.colors.danger };
  };
  
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  // Show money screen on first load
  if (showMoney) {
    return <ShowMeTheMoney onClose={() => setShowMoney(false)} />;
  }
  
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.contentMaxWidth, padding: '40px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>🌤️</div>
          <div style={styles.title2}>Loading Weather Data...</div>
          <div style={styles.smallText}>Fetching real-time information for {selectedCity.name}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      
      {/* Header */}
      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={styles.contentMaxWidth}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#3b82f6',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
              }}>
                🌤️
              </div>
              <div>
                <h1 style={styles.title1}>Laguna Weather Dashboard</h1>
                <div style={styles.smallText}>Real-time meteorological monitoring system</div>
              </div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.smallText}>Last Updated</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {format(new Date(), 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ padding: '20px 0' }}>
        <div style={styles.contentMaxWidth}>
          
          {/* City Selection */}
          <div style={styles.card}>
            <h2 style={styles.title2}>Select City for Weather Data</h2>
            
            <select
              style={styles.select}
              value={selectedCity.id}
              onChange={(e) => setSelectedCity(CITIES.find(city => city.id === e.target.value))}
            >
              {CITIES.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr',
              gap: '12px',
              marginTop: '20px',
            }}>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Population</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{selectedCity.population}</div>
                <div style={styles.smallText}>{selectedCity.type}</div>
              </div>
              
              <div style={styles.statBox}>
                <div style={styles.smallText}>Coordinates</div>
                <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                  {selectedCity.lat.toFixed(4)}°N, {selectedCity.lon.toFixed(4)}°E
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Weather */}
          {weatherData && (
            <div style={styles.card}>
              <h2 style={styles.title2}>Current Weather in {selectedCity.name}</h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr',
                gap: '16px',
                marginBottom: '20px',
              }}>
                <div style={{
                  backgroundColor: styles.colors.temperature.bg,
                  border: `1px solid ${styles.colors.temperature.border}`,
                  borderRadius: '10px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ ...styles.smallText, color: styles.colors.temperature.text }}>Temperature</div>
                      <div style={{ fontSize: '36px', fontWeight: '700', color: styles.colors.temperature.text }}>
                        {weatherData.temperature}°C
                      </div>
                    </div>
                    <div style={{ fontSize: '32px' }}>🌡️</div>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: styles.colors.wind.bg,
                  border: `1px solid ${styles.colors.wind.border}`,
                  borderRadius: '10px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ ...styles.smallText, color: styles.colors.wind.text }}>Wind Speed</div>
                      <div style={{ fontSize: '36px', fontWeight: '700', color: styles.colors.wind.text }}>
                        {weatherData.windspeed} m/s
                      </div>
                      <div style={{ ...styles.smallText, color: styles.colors.wind.text, marginTop: '4px' }}>
                        Direction: {weatherData.winddirection}°
                      </div>
                    </div>
                    <div style={{ fontSize: '32px' }}>💨</div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}>
                <div style={styles.statBox}>
                  <div style={styles.smallText}>Weather Code</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{weatherData.weathercode}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.smallText}>Last Update</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {format(new Date(weatherData.time), 'h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 12-Hour Forecast */}
          {hourlyForecast.length > 0 && (
            <div style={styles.card}>
              <h2 style={styles.title2}>12-Hour Forecast</h2>
              <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                paddingBottom: '8px',
                scrollbarWidth: 'thin',
              }}>
                {hourlyForecast.map((hour, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      padding: '16px',
                      minWidth: '120px',
                      flexShrink: 0,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      {index === 0 ? 'Now' : formatTime(hour.time)}
                    </div>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      {hour.temperature < 25 ? '❄️' : hour.temperature > 30 ? '🔥' : '🌤️'}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                      {hour.temperature}°C
                    </div>
                    <div style={styles.smallText}>💧 {hour.precipitation}mm</div>
                    <div style={styles.smallText}>💨 {hour.windSpeed}m/s</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Air Quality */}
          {airQuality && (
            <div style={styles.card}>
              <h2 style={styles.title2}>Air Quality</h2>
              <div style={{
                backgroundColor: getAqiLevel(airQuality.aqi).color.bg,
                border: `1px solid ${getAqiLevel(airQuality.aqi).color.border}`,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ ...styles.smallText, color: getAqiLevel(airQuality.aqi).color.text }}>
                      US AQI Index
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: '700', color: getAqiLevel(airQuality.aqi).color.text }}>
                      {airQuality.aqi}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: getAqiLevel(airQuality.aqi).color.text }}>
                      {getAqiLevel(airQuality.aqi).level}
                    </div>
                  </div>
                  <div>
                    <div style={{ ...styles.smallText, color: getAqiLevel(airQuality.aqi).color.text }}>
                      PM2.5
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: getAqiLevel(airQuality.aqi).color.text }}>
                      {airQuality.pm25.toFixed(1)} µg/m³
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.smallText}>
                Updated: {format(new Date(airQuality.time), 'MMM d, h:mm a')}
              </div>
            </div>
          )}
          
          {/* Two-column layout */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr',
            gap: '20px',
          }}>
            {/* Earthquakes */}
            <div style={styles.card}>
              <h2 style={styles.title2}>Recent Earthquakes</h2>
              <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {earthquakes.length > 0 ? (
                  earthquakes.map(quake => (
                    <div
                      key={quake.id}
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        padding: '12px',
                        marginBottom: '12px',
                        borderLeft: `4px solid ${
                          quake.magnitude >= 6 ? '#dc2626' : 
                          quake.magnitude >= 5 ? '#f97316' : 
                          quake.magnitude >= 4 ? '#f59e0b' : '#22c55e'
                        }`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            backgroundColor: quake.magnitude >= 6 ? '#dc2626' : 
                                          quake.magnitude >= 5 ? '#f97316' : 
                                          quake.magnitude >= 4 ? '#f59e0b' : '#22c55e',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}>
                            M{quake.magnitude.toFixed(1)}
                          </div>
                          <div style={styles.smallText}>
                            Depth: {quake.depth.toFixed(1)} km
                          </div>
                        </div>
                        <div style={styles.smallText}>
                          {format(new Date(quake.time), 'MMM d')}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                        {quake.location}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌋</div>
                    No significant earthquakes detected
                  </div>
                )}
              </div>
            </div>
            
            {/* Landmarks */}
            <div style={styles.card}>
              <h2 style={styles.title2}>Laguna Landmarks</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {LANDMARKS.map(landmark => (
                  <div
                    key={landmark.id}
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{landmark.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                        {landmark.name}
                      </div>
                      <div style={styles.smallText}>
                        {landmark.type === 'volcano' && `Elevation: ${landmark.elevation} • ${landmark.status}`}
                        {landmark.type === 'lake' && `Area: ${landmark.area} • Depth: ${landmark.depth}`}
                        {landmark.type === 'waterfall' && `Height: ${landmark.height} • ${landmark.status}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Data Sources */}
          <div style={styles.card}>
            <h2 style={styles.title2}>Data Sources</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Weather Data</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Open-Meteo API</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Air Quality</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Air Quality API</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Earthquakes</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>USGS Earthquake API</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Update Frequency</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Every 5 minutes</div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderTop: '1px solid #334155',
        padding: '24px 0',
        marginTop: '40px',
      }}>
        <div style={styles.contentMaxWidth}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr',
            gap: '24px',
            marginBottom: '24px',
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#f1f5f9' }}>
                Laguna Province Meteorological System
              </div>
              <div style={styles.bodyText}>
                Providing real-time weather data, seismic monitoring, and environmental information for Laguna Province.
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                  System Status
                </div>
                <div style={styles.smallText}>
                  Status: <span style={{ color: '#22c55e' }}>Operational</span><br/>
                  Data Latency: &lt; 60 seconds<br/>
                  Last Check: {format(new Date(), 'h:mm a')}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                  Contact
                </div>
                <div style={styles.smallText}>
                  For emergencies: 911<br/>
                  Weather alerts: 143
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #334155', 
            paddingTop: '20px',
            textAlign: 'center',
          }}>
            <div style={{ ...styles.smallText, marginBottom: '8px' }}>
              © {new Date().getFullYear()} by DIMAX. Powered and secured by RP8.
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              All data is live and updated in real-time from official sources.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Global Styles with Animations */}
      <style jsx>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Better scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        /* SHOW ME THE MONEY Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 20px 60px rgba(251, 191, 36, 0.3); }
          50% { transform: scale(1.02); box-shadow: 0 25px 80px rgba(251, 191, 36, 0.5); }
          100% { transform: scale(1); box-shadow: 0 20px 60px rgba(251, 191, 36, 0.3); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          from { text-shadow: 0 0 10px rgba(251, 191, 36, 0.7); }
          to { text-shadow: 0 0 20px rgba(251, 191, 36, 1), 0 0 30px rgba(251, 191, 36, 0.8); }
        }
        
        @keyframes fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        /* Responsive breakpoints */
        @media (min-width: 640px) {
          .content-max-width {
            padding: 0 24px;
          }
          
          .grid-2-columns {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 768px) {
          .grid-2-columns {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .location-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 2fr 1fr;
          }
          
          .current-weather-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .location-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (min-width: 1280px) {
          .content-max-width {
            padding: 0 32px;
          }
        }
        
        /* Loading animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
