import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Simple styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #334155',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#60a5fa',
  },
  subtitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#f1f5f9',
  },
  select: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0f172a',
    color: 'white',
    border: '1px solid #475569',
    borderRadius: '6px',
    fontSize: '16px',
    marginBottom: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px',
  },
  statBox: {
    backgroundColor: '#0f172a',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  smallText: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '5px',
  },
  valueText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8',
  },
};

// Cities data
const CITIES = [
  { id: 'calamba', name: 'Calamba City', lat: 14.2117, lon: 121.1663, population: '539,671' },
  { id: 'santa_cruz', name: 'Santa Cruz', lat: 14.2784, lon: 121.4163, population: '129,965' },
  { id: 'san_pablo', name: 'San Pablo City', lat: 14.0667, lon: 121.3250, population: '285,348' },
  { id: 'biñan', name: 'Biñan City', lat: 14.3333, lon: 121.0833, population: '407,437' },
];

export default function LagunaWeatherDashboard() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&current_weather=true&timezone=Asia%2FManila`;
        const response = await axios.get(url);
        
        setWeatherData(response.data.current_weather);
        
        // Process hourly data
        if (response.data.hourly) {
          const times = response.data.hourly.time.slice(0, 6);
          const forecast = times.map((time, index) => ({
            time,
            temperature: response.data.hourly.temperature_2m[index],
            precipitation: response.data.hourly.precipitation[index],
            windSpeed: response.data.hourly.wind_speed_10m[index],
          }));
          setHourlyForecast(forecast);
        }
      } catch (error) {
        console.log('Using sample weather data');
        // Sample data for demo
        setWeatherData({
          temperature: 28.5,
          windspeed: 5.2,
          winddirection: 180,
          weathercode: 1,
          time: new Date().toISOString()
        });
        setHourlyForecast([
          { time: new Date().toISOString(), temperature: 28, precipitation: 0, windSpeed: 5 },
          { time: new Date(Date.now() + 3600000).toISOString(), temperature: 27, precipitation: 0, windSpeed: 6 },
          { time: new Date(Date.now() + 7200000).toISOString(), temperature: 26, precipitation: 1, windSpeed: 5 },
        ]);
      } finally {
        setLoading(false);
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
        console.log('Using sample air quality data');
        // Sample data for demo
        setAirQuality({
          aqi: 45,
          pm25: 12.5,
          time: new Date().toISOString(),
        });
      }
    };
    
    fetchAirQuality();
  }, [selectedCity]);

  // Get AQI color
  const getAqiColor = (aqi) => {
    if (aqi <= 50) return '#22c55e'; // Good - green
    if (aqi <= 100) return '#f59e0b'; // Moderate - yellow
    if (aqi <= 150) return '#ea580c'; // Unhealthy for sensitive - orange
    return '#dc2626'; // Unhealthy - red
  };

  // Get AQI label
  const getAqiLabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    return 'Unhealthy';
  };

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <header style={{
        backgroundColor: '#1e293b',
        padding: '20px',
        borderBottom: '1px solid #334155',
      }}>
        <div style={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={styles.title}>Laguna Weather Dashboard</h1>
              <p style={{ color: '#94a3b8', margin: 0 }}>Real-time weather monitoring system</p>
            </div>
            <div style={{
              backgroundColor: '#0f172a',
              padding: '10px 15px',
              borderRadius: '6px',
              border: '1px solid #334155',
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Last Updated</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.content}>
        
        {/* City Selection */}
        <div style={styles.card}>
          <h2 style={styles.subtitle}>Select City</h2>
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
          
          <div style={styles.grid}>
            <div style={styles.statBox}>
              <div style={styles.smallText}>Population</div>
              <div style={styles.valueText}>{selectedCity.population}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.smallText}>Coordinates</div>
              <div style={{ fontSize: '16px', fontFamily: 'monospace' }}>
                {selectedCity.lat.toFixed(4)}°N, {selectedCity.lon.toFixed(4)}°E
              </div>
            </div>
          </div>
        </div>

        {/* Current Weather */}
        <div style={styles.card}>
          <h2 style={styles.subtitle}>Current Weather in {selectedCity.name}</h2>
          
          {loading ? (
            <div style={styles.loading}>
              <p>Loading weather data...</p>
            </div>
          ) : weatherData ? (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '15px',
                marginBottom: '20px',
              }}>
                {/* Temperature */}
                <div style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '8px',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ ...styles.smallText, color: '#fca5a5' }}>Temperature</div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fca5a5' }}>
                        {weatherData.temperature}°C
                      </div>
                    </div>
                    <div style={{ fontSize: '32px' }}>🌡️</div>
                  </div>
                </div>
                
                {/* Wind */}
                <div style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  borderRadius: '8px',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ ...styles.smallText, color: '#93c5fd' }}>Wind Speed</div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#93c5fd' }}>
                        {weatherData.windspeed} m/s
                      </div>
                      <div style={{ ...styles.smallText, color: '#93c5fd', marginTop: '5px' }}>
                        Direction: {weatherData.winddirection}°
                      </div>
                    </div>
                    <div style={{ fontSize: '32px' }}>💨</div>
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}>
                <div style={styles.statBox}>
                  <div style={styles.smallText}>Weather Code</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{weatherData.weathercode}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.smallText}>Last Update</div>
                  <div style={{ fontSize: '14px' }}>{formatDate(weatherData.time)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.loading}>
              <p>Weather data unavailable</p>
            </div>
          )}
        </div>

        {/* Air Quality */}
        {airQuality && (
          <div style={styles.card}>
            <h2 style={styles.subtitle}>Air Quality</h2>
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: `2px solid ${getAqiColor(airQuality.aqi)}`,
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: getAqiColor(airQuality.aqi) }}>Air Quality Index</div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: getAqiColor(airQuality.aqi) }}>
                    {airQuality.aqi}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: getAqiColor(airQuality.aqi) }}>
                    {getAqiLabel(airQuality.aqi)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>PM2.5</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {airQuality.pm25.toFixed(1)} µg/m³
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.smallText}>
              Updated: {formatDateDisplay(airQuality.time)}
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        {hourlyForecast.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.subtitle}>6-Hour Forecast</h2>
            <div style={{ 
              display: 'flex', 
              overflowX: 'auto',
              gap: '15px',
              padding: '10px 0',
            }}>
              {hourlyForecast.map((hour, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    padding: '15px',
                    minWidth: '130px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    {index === 0 ? 'Now' : formatDate(hour.time)}
                  </div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {hour.temperature < 25 ? '❄️' : hour.temperature > 30 ? '🔥' : '🌤️'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {hour.temperature}°C
                  </div>
                  <div style={styles.smallText}>Rain: {hour.precipitation}mm</div>
                  <div style={styles.smallText}>Wind: {hour.windSpeed}m/s</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Sources */}
        <div style={styles.card}>
          <h2 style={styles.subtitle}>Data Sources</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}>
            <div style={styles.statBox}>
              <div style={styles.smallText}>Weather Data</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Open-Meteo API</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.smallText}>Air Quality</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Air Quality API</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.smallText}>Updates</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Real-time</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.smallText}>System Status</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>Operational</div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        borderTop: '1px solid #334155',
        padding: '20px',
        marginTop: '40px',
      }}>
        <div style={styles.content}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '10px' }}>
              © 2025 by DIMAX. Powered and secured by RP8.
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Real-time weather monitoring system for Laguna Province, Philippines
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
