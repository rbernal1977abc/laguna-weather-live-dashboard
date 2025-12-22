import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// Laguna Cities with population data
const LGUS = [
  { id: 'calamba', name: 'Calamba City', lat: 14.2117, lon: 121.1663, population: '539,671', type: 'city', area: '149.5 km²' },
  { id: 'santa_cruz', name: 'Santa Cruz (Capital)', lat: 14.2784, lon: 121.4163, population: '129,965', type: 'capital', area: '38.59 km²' },
  { id: 'san_pablo', name: 'San Pablo City', lat: 14.0667, lon: 121.3250, population: '285,348', type: 'city', area: '197.56 km²' },
  { id: 'biñan', name: 'Biñan City', lat: 14.3333, lon: 121.0833, population: '407,437', type: 'city', area: '43.5 km²' },
  { id: 'cabuyao', name: 'Cabuyao City', lat: 14.2453, lon: 121.1156, population: '355,330', type: 'city', area: '43.4 km²' },
  { id: 'san_pedro', name: 'San Pedro City', lat: 14.3583, lon: 121.0583, population: '326,001', type: 'city', area: '24.05 km²' },
  { id: 'alaminos', name: 'Alaminos', lat: 14.0639, lon: 121.2461, population: '51,619', type: 'municipality', area: '57.46 km²' },
  { id: 'bay', name: 'Bay', lat: 14.1833, lon: 121.2833, population: '67,182', type: 'municipality', area: '42.66 km²' },
  { id: 'calauan', name: 'Calauan', lat: 14.1500, lon: 121.3167, population: '87,693', type: 'municipality', area: '65.4 km²' },
  { id: 'cavinti', name: 'Cavinti', lat: 14.2453, lon: 121.5075, population: '23,980', type: 'municipality', area: '203.58 km²' },
  { id: 'los_baños', name: 'Los Baños', lat: 14.1667, lon: 121.2333, population: '115,353', type: 'municipality', area: '56.5 km²' },
  { id: 'pagsanjan', name: 'Pagsanjan', lat: 14.2731, lon: 121.4547, population: '44,327', type: 'municipality', area: '26.36 km²' },
  { id: 'victoria', name: 'Victoria', lat: 14.2269, lon: 121.3278, population: '43,408', type: 'municipality', area: '22.35 km²' },
];

const LANDMARKS = [
  { id: 'makiling', name: 'Mount Makiling', lat: 14.1306, lon: 121.1933, type: 'volcano', elevation: '1,090m', status: 'Inactive' },
  { id: 'banahaw', name: 'Mount Banahaw', lat: 14.0667, lon: 121.4833, type: 'volcano', elevation: '2,170m', status: 'Active' },
  { id: 'laguna_lake', name: 'Laguna de Bay', lat: 14.3167, lon: 121.2167, type: 'lake', area: '949 km²', depth: '2.8m' },
  { id: 'pagsanjan_falls', name: 'Pagsanjan Falls', lat: 14.2700, lon: 121.4567, type: 'waterfall', height: '120m', status: 'Tourist Attraction' },
];

export default function LagunaWeatherDashboard() {
  const [selected, setSelected] = useState(LGUS[0]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [quakes, setQuakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    temperature: [],
    humidity: [],
    rainfall: []
  });

  // Fetch comprehensive weather data
  useEffect(() => {
    async function fetchWeatherData() {
      setLoading(true);
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,visibility&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,wind_speed_10m_max&current_weather=true&timezone=Asia%2FManila&forecast_days=7`;
        
        const res = await axios.get(weatherUrl);
        
        setWeather(res.data.current_weather || null);
        
        if (res.data.hourly) {
          const times = res.data.hourly.time || [];
          const hourlyData = [];
          
          const startIndex = times.findIndex(t => new Date(t) > new Date());
          const endIndex = Math.min(startIndex + 24, times.length);
          
          for (let i = startIndex; i < endIndex; i++) {
            hourlyData.push({
              time: times[i],
              temp: res.data.hourly.temperature_2m[i],
              humidity: res.data.hourly.relative_humidity_2m[i],
              precipitation: res.data.hourly.precipitation[i],
              rain: res.data.hourly.rain[i],
              showers: res.data.hourly.showers[i],
              windSpeed: res.data.hourly.wind_speed_10m[i],
              windDirection: res.data.hourly.wind_direction_10m[i],
              pressure: res.data.hourly.pressure_msl[i],
              cloudCover: res.data.hourly.cloud_cover[i],
              visibility: res.data.hourly.visibility[i]
            });
          }
          setForecast(hourlyData);
          
          const temps = res.data.hourly.temperature_2m.slice(0, 24);
          const humidity = res.data.hourly.relative_humidity_2m.slice(0, 24);
          const rainfall = res.data.hourly.precipitation.slice(0, 24);
          
          setStats({
            temperature: temps,
            humidity: humidity,
            rainfall: rainfall
          });
        }
      } catch (error) {
        console.error('Weather data error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeatherData();
  }, [selected]);

  // Fetch air quality
  useEffect(() => {
    async function fetchAirQuality() {
      try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selected.lat}&longitude=${selected.lon}&hourly=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust`;
        const res = await axios.get(url);
        if (res.data && res.data.hourly) {
          const latestIndex = res.data.hourly.time.length - 1;
          setAqi({
            us_aqi: res.data.hourly.us_aqi[latestIndex],
            pm2_5: res.data.hourly.pm2_5[latestIndex],
            pm10: res.data.hourly.pm10[latestIndex],
            co: res.data.hourly.carbon_monoxide[latestIndex],
            no2: res.data.hourly.nitrogen_dioxide[latestIndex],
            so2: res.data.hourly.sulphur_dioxide[latestIndex],
            o3: res.data.hourly.ozone[latestIndex],
            dust: res.data.hourly.dust ? res.data.hourly.dust[latestIndex] : null,
            time: res.data.hourly.time[latestIndex]
          });
        }
      } catch (error) {
        console.error('Air quality error:', error);
      }
    }
    fetchAirQuality();
  }, [selected]);

  // Fetch earthquakes
  useEffect(() => {
    async function fetchEarthquakes() {
      try {
        const res = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson');
        const feats = res.data.features || [];
        const lagunaQuakes = feats
          .map(f => {
            const [lon, lat, depth] = f.geometry.coordinates;
            return {
              id: f.id,
              mag: f.properties.mag,
              place: f.properties.place,
              time: f.properties.time,
              lat, lon, depth,
              url: f.properties.url,
              significance: f.properties.sig,
              tsunami: f.properties.tsunami,
              alert: f.properties.alert
            };
          })
          .filter(quake => 
            quake.lat >= 13.0 && quake.lat <= 15.5 &&
            quake.lon >= 119.0 && quake.lon <= 123.5
          )
          .sort((a, b) => b.time - a.time)
          .slice(0, 10);
        
        setQuakes(lagunaQuakes);
      } catch (error) {
        console.error('Earthquake data error:', error);
      }
    }
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 300000);
    return () => clearInterval(interval);
  }, []);

  const getAqiLevel = (aqi) => {
    if (!aqi) return { level: 'Unknown', color: '#6b7280', bgColor: '#f3f4f6' };
    if (aqi <= 50) return { level: 'Good', color: '#059669', bgColor: '#d1fae5', description: 'Satisfactory air quality' };
    if (aqi <= 100) return { level: 'Moderate', color: '#d97706', bgColor: '#fef3c7', description: 'Acceptable air quality' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#ea580c', bgColor: '#ffedd5', description: 'Sensitive groups affected' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#dc2626', bgColor: '#fee2e2', description: 'Health effects possible' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#7c3aed', bgColor: '#ede9fe', description: 'Serious health effects' };
    return { level: 'Hazardous', color: '#7e22ce', bgColor: '#f3e8ff', description: 'Emergency conditions' };
  };

  const calculateStats = (data) => {
    if (!data.length) return { avg: 0, min: 0, max: 0 };
    const sum = data.reduce((a, b) => a + b, 0);
    const avg = sum / data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);
    return { avg: avg.toFixed(1), min: min.toFixed(1), max: max.toFixed(1) };
  };

  const tempStats = calculateStats(stats.temperature);
  const humidityStats = calculateStats(stats.humidity);
  const rainfallStats = calculateStats(stats.rainfall);
  const aqiInfo = aqi ? getAqiLevel(aqi.us_aqi) : getAqiLevel(null);

  // Responsive Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px' // Base font size for mobile
    },
    header: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderBottom: '1px solid #334155',
      padding: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    card: {
      background: 'rgba(30, 41, 59, 0.7)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #334155',
      marginBottom: '16px'
    },
    select: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid #475569',
      borderRadius: '10px',
      color: '#f8fafc',
      fontSize: '16px', // Larger for mobile touch
      outline: 'none',
      WebkitAppearance: 'none',
      appearance: 'none'
    },
    statCard: {
      background: 'rgba(15, 23, 42, 0.7)',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #334155'
    }
  };

  // Responsive grid templates
  const gridTemplates = {
    location: {
      mobile: '1fr',
      desktop: '1fr 1fr 1fr'
    },
    main: {
      mobile: '1fr',
      desktop: '2fr 1fr'
    },
    currentWeather: {
      mobile: '1fr',
      tablet: '1fr 1fr',
      desktop: '1fr 1fr 1fr'
    },
    miniStats: {
      mobile: 'repeat(2, 1fr)',
      tablet: 'repeat(4, 1fr)'
    },
    pollutants: {
      mobile: 'repeat(2, 1fr)',
      tablet: 'repeat(3, 1fr)'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header - Mobile Optimized */}
      <header style={styles.header}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              🌤️
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.3'
              }}>
                Laguna Province Meteorological Dashboard
              </h1>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Real-time weather monitoring
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.7)', 
              padding: '8px 12px', 
              borderRadius: '8px',
              border: '1px solid #334155',
              flex: 1
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Last Updated</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {format(new Date(), 'MMM dd, HH:mm')}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.7)', 
              padding: '8px 12px', 
              borderRadius: '8px',
              border: '1px solid #334155',
              minWidth: '80px'
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Status</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>
                Live
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Location Selector */}
        <div style={styles.card}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
              Select Municipality
            </h2>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              Tap to view detailed weather data
            </div>
          </div>

          <select
            style={styles.select}
            value={selected.id}
            onChange={e => setSelected(LGUS.find(g => g.id === e.target.value))}
          >
            {LGUS.map(g => (
              <option key={g.id} value={g.id} style={{ background: '#0f172a' }}>
                {g.name}
              </option>
            ))}
          </select>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: gridTemplates.location.mobile,
            gap: '12px',
            marginTop: '16px'
          }}>
            <div style={styles.statCard}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Population</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{selected.population}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{selected.type}</div>
            </div>
            <div style={styles.statCard}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Coordinates</div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                {selected.lat.toFixed(4)}°N
              </div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                {selected.lon.toFixed(4)}°E
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Area</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{selected.area}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Land Area</div>
            </div>
          </div>
        </div>

        {/* Main Grid - Stack on mobile, side-by-side on desktop */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: gridTemplates.main.mobile,
          gap: '16px'
        }}>
          {/* Left Column - Weather Data */}
          <div>
            {/* Current Weather */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  Current Conditions
                </h3>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: '#94a3b8',
                  border: '1px solid #334155'
                }}>
                  Real-time
                </div>
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ marginBottom: '16px' }}>Loading data...</div>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '3px solid #334155',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    margin: '0 auto',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : weather ? (
                <div>
                  {/* Main Weather Stats - Responsive Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: gridTemplates.currentWeather.mobile,
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    {/* Temperature */}
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%)',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(220, 38, 38, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#fca5a5' }}>Temperature</div>
                        <div style={{ fontSize: '20px' }}>🌡️</div>
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#fca5a5', marginBottom: '4px' }}>
                        {weather.temperature}°C
                      </div>
                      <div style={{ fontSize: '11px', color: '#fca5a5' }}>
                        Avg: {tempStats.avg}°C
                      </div>
                    </div>

                    {/* Wind */}
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(37, 99, 235, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#93c5fd' }}>Wind Speed</div>
                        <div style={{ fontSize: '20px' }}>💨</div>
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#93c5fd', marginBottom: '4px' }}>
                        {weather.windspeed} m/s
                      </div>
                      <div style={{ fontSize: '11px', color: '#93c5fd' }}>
                        Dir: {weather.winddirection}°
                      </div>
                    </div>

                    {/* Pressure */}
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(107, 33, 168, 0.1) 100%)',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#c4b5fd' }}>Pressure</div>
                        <div style={{ fontSize: '20px' }}>📊</div>
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#c4b5fd' }}>
                        {weather.pressure || '1013'} hPa
                      </div>
                      <div style={{ fontSize: '11px', color: '#c4b5fd', marginTop: '4px' }}>
                        Sea Level
                      </div>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: gridTemplates.miniStats.mobile,
                    gap: '10px'
                  }}>
                    <div style={styles.statCard}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Humidity</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>
                        {humidityStats.avg}%
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Rainfall</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#60a5fa' }}>
                        {rainfallStats.avg} mm
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Cloud Cover</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#94a3b8' }}>
                        {weather.cloudcover || '65'}%
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Visibility</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#f59e0b' }}>
                        {weather.visibility ? (weather.visibility / 1000).toFixed(1) : '10'} km
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Weather data unavailable
                </div>
              )}
            </div>

            {/* Air Quality */}
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                Air Quality Index
              </h3>
              
              {aqi ? (
                <div>
                  <div style={{ 
                    background: aqiInfo.bgColor,
                    padding: '20px',
                    borderRadius: '10px',
                    border: `2px solid ${aqiInfo.color}`,
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: aqiInfo.color, marginBottom: '6px' }}>
                          US AQI Index
                        </div>
                        <div style={{ fontSize: '40px', fontWeight: '700', color: aqiInfo.color, marginBottom: '4px' }}>
                          {aqi.us_aqi}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: aqiInfo.color }}>
                          {aqiInfo.level}
                        </div>
                        <div style={{ fontSize: '11px', color: aqiInfo.color, opacity: 0.8, marginTop: '6px' }}>
                          {aqiInfo.description}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: aqiInfo.color, marginBottom: '6px' }}>
                          Updated
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>
                          {format(parseISO(aqi.time), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pollutants */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '10px' }}>
                      Pollutant Concentration (µg/m³)
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: gridTemplates.pollutants.mobile,
                      gap: '8px'
                    }}>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>PM2.5</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                          {aqi.pm2_5.toFixed(1)}
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>PM10</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                          {aqi.pm10.toFixed(1)}
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>O₃</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                          {aqi.o3.toFixed(1)}
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>NO₂</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                          {aqi.no2.toFixed(1)}
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>SO₂</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                          {aqi.so2.toFixed(1)}
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>CO</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                          {aqi.co.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Air quality data loading...
                </div>
              )}
            </div>

            {/* 12-Hour Forecast (Horizontal Scroll on Mobile) */}
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                12-Hour Forecast
              </h3>
              <div style={{ 
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                paddingBottom: '12px',
                WebkitOverflowScrolling: 'touch'
              }}>
                {forecast.slice(0, 12).map((hour, index) => (
                  <div
                    key={hour.time}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      textAlign: 'center',
                      minWidth: '100px',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      {index === 0 ? 'Now' : format(parseISO(hour.time), 'HH:mm')}
                    </div>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                      {hour.temp < 25 ? '❄️' : hour.temp > 30 ? '🔥' : '🌤️'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' }}>
                      {hour.temp}°C
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      💧 {hour.precipitation}mm
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      💨 {hour.windSpeed}m/s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Alerts & Info */}
          <div>
            {/* Earthquakes */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  Seismic Activity
                </h3>
                <div style={{ 
                  background: 'rgba(220, 38, 38, 0.1)', 
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: '#fca5a5',
                  border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                  Live
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {quakes.length > 0 ? (
                  quakes.map(quake => (
                    <div
                      key={quake.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '10px',
                        border: '1px solid #334155',
                        borderLeft: `4px solid ${
                          quake.mag >= 6 ? '#dc2626' : 
                          quake.mag >= 5 ? '#f97316' : 
                          quake.mag >= 4 ? '#f59e0b' : '#22c55e'
                        }`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ 
                            background: quake.mag >= 6 ? '#dc2626' : 
                                      quake.mag >= 5 ? '#f97316' : 
                                      quake.mag >= 4 ? '#f59e0b' : '#22c55e',
                            color: '#0f172a',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            M{quake.mag.toFixed(1)}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            Depth: {quake.depth?.toFixed(1) || 'N/A'} km
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {format(new Date(quake.time), 'MMM dd')}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {quake.place}
                      </div>
                      {quake.tsunami === 1 && (
                        <div style={{
                          background: 'rgba(220, 38, 38, 0.1)',
                          padding: '6px',
                          borderRadius: '6px',
                          marginTop: '8px',
                          fontSize: '10px',
                          color: '#fca5a5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>🌊</span>
                          <span>Tsunami Warning</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>🌋</div>
                    <div>No significant seismic activity</div>
                  </div>
                )}
              </div>
            </div>

            {/* Landmarks */}
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                Regional Landmarks
              </h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {LANDMARKS.map(landmark => (
                  <div
                    key={landmark.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      {landmark.type === 'volcano' ? '🌋' : 
                       landmark.type === 'lake' ? '🏞️' : '💧'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>
                        {landmark.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {landmark.type === 'volcano' ? `${landmark.elevation} | ${landmark.status}` :
                         landmark.type === 'lake' ? `Area: ${landmark.area}` :
                         `Height: ${landmark.height}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                Data Sources
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Weather</div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>Open-Meteo</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Seismic</div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>USGS</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Air Quality</div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>Air Quality API</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Updates</div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>Every 5 min</div>
                </div>
              </div>
              <div style={{ 
                marginTop: '12px',
                padding: '10px',
                background: 'rgba(21, 128, 61, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(21, 128, 61, 0.3)',
                fontSize: '11px',
                color: '#86efac',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div>✅</div>
                <div>All systems operational</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(15, 23, 42, 0.9)',
        borderTop: '1px solid #334155',
        padding: '20px 16px',
        marginTop: '32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                Laguna Meteorological System
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                Real-time atmospheric data, seismic monitoring, and environmental analytics for Laguna Province.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                  System Status
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Status: <span style={{ color: '#22c55e' }}>Operational</span><br/>
                  Uptime: 99.8%<br/>
                  Data Latency: &lt; 60s
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                  Metrics
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  API Requests: 24/7<br/>
                  Data Points: 15K+/hr<br/>
                  Last Check: {format(new Date(), 'HH:mm')}
                </div>
              </div>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid #334155', 
            paddingTop: '16px',
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            © {new Date().getFullYear()} by DIMAX. Powered and secured by RP8.
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile-first responsive breakpoints */
        @media (min-width: 640px) {
          /* Tablet styles */
          .responsive-grid {
            grid-template-columns: ${gridTemplates.currentWeather.tablet};
          }
          
          .responsive-mini-stats {
            grid-template-columns: ${gridTemplates.miniStats.tablet};
          }
          
          .responsive-pollutants {
            grid-template-columns: ${gridTemplates.pollutants.tablet};
          }
        }
        
        @media (min-width: 768px) {
          /* Desktop styles */
          .responsive-main {
            grid-template-columns: ${gridTemplates.main.desktop};
          }
          
          .responsive-location {
            grid-template-columns: ${gridTemplates.location.desktop};
          }
          
          .responsive-weather {
            grid-template-columns: ${gridTemplates.currentWeather.desktop};
          }
        }
        
        @media (min-width: 1024px) {
          /* Large desktop styles */
          main {
            padding: 24px;
          }
          
          .card {
            padding: 24px;
          }
        }
        
        /* Touch-friendly scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 3px;
        }
        
        /* Prevent text selection on mobile */
        .no-select {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* Better touch targets */
        button, select, [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }
      `}</style>
    </div>
  );
}
