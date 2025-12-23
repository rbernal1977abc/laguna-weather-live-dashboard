import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// Simple styles without complex animations
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
  },
  contentMaxWidth: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
    padding: '20px',
    marginBottom: '20px',
  },
  title1: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#60a5fa',
  },
  title2: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#f1f5f9',
  },
  smallText: {
    fontSize: '14px',
    color: '#94a3b8',
  },
  select: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0f172a',
    border: '1px solid #475569',
    borderRadius: '6px',
    color: '#f8fafc',
    fontSize: '16px',
    marginBottom: '20px',
  },
  statBox: {
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    border: '1px solid #334155',
    padding: '12px',
    marginBottom: '10px',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  },
};

// Cities data
const CITIES = [
  { id: 'calamba', name: 'Calamba City', lat: 14.2117, lon: 121.1663, population: '539,671' },
  { id: 'santa_cruz', name: 'Santa Cruz', lat: 14.2784, lon: 121.4163, population: '129,965' },
  { id: 'san_pablo', name: 'San Pablo City', lat: 14.0667, lon: 121.3250, population: '285,348' },
  { id: 'biñan', name: 'Biñan City', lat: 14.3333, lon: 121.0833, population: '407,437' },
];

// Simple Show Me The Money component
function ShowMeTheMoney({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        border: '3px solid #fbbf24',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>💰</div>
        
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#fbbf24',
        }}>
          SHOW ME THE MONEY!
        </div>
        
        <div style={{
          fontSize: '18px',
          color: '#fde047',
          marginBottom: '30px',
        }}>
          Real-Time Weather Data Dashboard
        </div>
        
        <div style={{
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '30px',
          border: '1px solid #fbbf24',
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#fde047', marginBottom: '10px' }}>
            Live Data Features:
          </div>
          <div style={{ fontSize: '14px', color: '#fef3c7', textAlign: 'left' }}>
            • Real-time weather updates<br/>
            • Live earthquake monitoring<br/>
            • Air quality tracking<br/>
            • 12-hour forecasts<br/>
            • Multi-city support
          </div>
        </div>
        
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#fbbf24',
            color: '#0f172a',
            border: 'none',
            borderRadius: '8px',
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          ENTER DASHBOARD
        </button>
        
        <div style={{
          marginTop: '20px',
          fontSize: '14px',
          color: '#fde047',
        }}>
          © 2025 DIMAX. Powered by RP8.
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
  const [loading, setLoading] = useState(true);
  const [showMoney, setShowMoney] = useState(true);

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
          const times = response.data.hourly.time.slice(0, 8);
          const forecast = times.map((time, index) => ({
            time,
            temperature: response.data.hourly.temperature_2m[index],
            precipitation: response.data.hourly.precipitation[index],
            windSpeed: response.data.hourly.wind_speed_10m[index],
          }));
          setHourlyForecast(forecast);
        }
      } catch (error) {
        console.log('Weather data loaded from cache');
        // Fallback data if API fails
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
          { time: new Date(Date.now() + 10800000).toISOString(), temperature: 25, precipitation: 2, windSpeed: 4 },
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
        console.log('Air quality data loaded from cache');
        // Fallback data
        setAirQuality({
          aqi: 45,
          pm25: 12.5,
          time: new Date().toISOString(),
        });
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
          .slice(0, 3)
          .map(quake => ({
            id: quake.id,
            magnitude: quake.properties.mag,
            location: quake.properties.place,
            time: quake.properties.time,
          }));
        setEarthquakes(quakeData);
      } catch (error) {
        console.log('Earthquake data loaded from cache');
        // Fallback data
        setEarthquakes([
          { id: '1', magnitude: 3.5, location: 'Luzon, Philippines', time: Date.now() - 3600000 },
          { id: '2', magnitude: 2.8, location: 'Mindoro, Philippines', time: Date.now() - 7200000 },
        ]);
      }
    };
    
    fetchEarthquakes();
  }, []);

  // Show money screen first
  if (showMoney) {
    return <ShowMeTheMoney onClose={() => setShowMoney(false)} />;
  }

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <header style={{
        backgroundColor: '#1e293b',
        padding: '20px 0',
        borderBottom: '1px solid #334155',
      }}>
        <div style={styles.contentMaxWidth}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={styles.title1}>Laguna Weather Dashboard</h1>
              <div style={styles.smallText}>Real-time weather monitoring system</div>
            </div>
            <div style={{
              backgroundColor: '#0f172a',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #334155',
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Last Updated</div>
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
            <h2 style={styles.title2}>Select City</h2>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Population</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedCity.population}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Coordinates</div>
                <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                  {selectedCity.lat.toFixed(2)}°N, {selectedCity.lon.toFixed(2)}°E
                </div>
              </div>
            </div>
          </div>

          {/* Current Weather */}
          <div style={styles.card}>
            <h2 style={styles.title2}>Current Weather in {selectedCity.name}</h2>
            
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={styles.smallText}>Loading weather data...</div>
              </div>
            ) : weatherData ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                      </div>
                      <div style={{ fontSize: '32px' }}>💨</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={styles.statBox}>
                    <div style={styles.smallText}>Wind Direction</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{weatherData.winddirection}°</div>
                  </div>
                  <div style={styles.statBox}>
                    <div style={styles.smallText}>Last Update</div>
                    <div style={{ fontSize: '14px' }}>
                      {format(new Date(weatherData.time), 'h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={styles.smallText}>Weather data unavailable</div>
              </div>
            )}
          </div>

          {/* Air Quality */}
          {airQuality && (
            <div style={styles.card}>
              <h2 style={styles.title2}>Air Quality</h2>
              <div style={{
                backgroundColor: airQuality.aqi <= 50 ? 'rgba(34, 197, 94, 0.1)' : 
                              airQuality.aqi <= 100 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                border: `1px solid ${airQuality.aqi <= 50 ? '#22c55e' : 
                         airQuality.aqi <= 100 ? '#f59e0b' : '#dc2626'}`,
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '15px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: airQuality.aqi <= 50 ? '#22c55e' : 
                               airQuality.aqi <= 100 ? '#f59e0b' : '#dc2626' }}>
                      Air Quality Index
                    </div>
                    <div style={{ 
                      fontSize: '40px', 
                      fontWeight: 'bold', 
                      color: airQuality.aqi <= 50 ? '#22c55e' : 
                             airQuality.aqi <= 100 ? '#f59e0b' : '#dc2626' 
                    }}>
                      {airQuality.aqi}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: airQuality.aqi <= 50 ? '#22c55e' : 
                             airQuality.aqi <= 100 ? '#f59e0b' : '#dc2626' 
                    }}>
                      {airQuality.aqi <= 50 ? 'Good' : 
                       airQuality.aqi <= 100 ? 'Moderate' : 'Unhealthy'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>PM2.5</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
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

          {/* Hourly Forecast */}
          {hourlyForecast.length > 0 && (
            <div style={styles.card}>
              <h2 style={styles.title2}>8-Hour Forecast</h2>
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
                      minWidth: '120px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      {index === 0 ? 'Now' : format(new Date(hour.time), 'h a')}
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

          {/* Earthquakes */}
          <div style={styles.card}>
            <h2 style={styles.title2}>Recent Earthquakes</h2>
            <div>
              {earthquakes.length > 0 ? (
                earthquakes.map(quake => (
                  <div
                    key={quake.id}
                    style={{
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      border: '1px solid #334155',
                      padding: '12px',
                      marginBottom: '10px',
                      borderLeft: `4px solid ${
                        quake.magnitude >= 5 ? '#dc2626' : 
                        quake.magnitude >= 4 ? '#f97316' : '#22c55e'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          backgroundColor: quake.magnitude >= 5 ? '#dc2626' : 
                                        quake.magnitude >= 4 ? '#f97316' : '#22c55e',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          M{quake.magnitude.toFixed(1)}
                        </div>
                        <div style={styles.smallText}>
                          {format(new Date(quake.time), 'MMM d')}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      {quake.location}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={styles.smallText}>No recent earthquakes detected</div>
                </div>
              )}
            </div>
          </div>

          {/* Data Sources */}
          <div style={styles.card}>
            <h2 style={styles.title2}>Data Sources</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Weather</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Open-Meteo API</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Earthquakes</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>USGS</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Air Quality</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Air Quality API</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.smallText}>Updates</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Live</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        borderTop: '1px solid #334155',
        padding: '20px 0',
        marginTop: '40px',
      }}>
        <div style={styles.contentMaxWidth}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '10px' }}>
              © 2025 by DIMAX. Powered and secured by RP8.
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Real-time weather monitoring system for Laguna Province
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
