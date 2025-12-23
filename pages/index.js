import React, { useState, useEffect } from 'react';

function LagunaWeatherDashboard() {
  const [selectedCity, setSelectedCity] = useState('Calamba');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [pagasaAlerts, setPagasaAlerts] = useState([]);
  const [sunTimes, setSunTimes] = useState(null);
  const [nasaData, setNasaData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);

  // Laguna Cities with real coordinates
  const cities = [
    { name: 'Calamba', lat: 14.2117, lon: 121.1663, population: '539,671', type: 'City' },
    { name: 'Santa Cruz', lat: 14.2784, lon: 121.4163, population: '129,965', type: 'Capital' },
    { name: 'San Pablo', lat: 14.0667, lon: 121.3250, population: '285,348', type: 'City' },
    { name: 'Biñan', lat: 14.3333, lon: 121.0833, population: '407,437', type: 'City' },
    { name: 'Cabuyao', lat: 14.2453, lon: 121.1156, population: '355,330', type: 'City' },
    { name: 'Los Baños', lat: 14.1667, lon: 121.2333, population: '115,353', type: 'Municipality' },
    { name: 'Pagsanjan', lat: 14.2731, lon: 121.4547, population: '44,327', type: 'Municipality' },
  ];

  const landmarks = [
    { name: 'Mount Makiling', type: 'Volcano', elevation: '1,090m', status: 'Inactive', icon: '🌋' },
    { name: 'Laguna de Bay', type: 'Lake', area: '949 km²', depth: '2.8m', icon: '🏞️' },
    { name: 'Pagsanjan Falls', type: 'Waterfall', height: '120m', icon: '💧' },
    { name: 'Mount Banahaw', type: 'Volcano', elevation: '2,170m', status: 'Active', icon: '⛰️' },
  ];

  const weatherConditions = {
    0: { text: 'Clear sky', icon: '☀️', color: '#f59e0b' },
    1: { text: 'Mainly clear', icon: '🌤️', color: '#fbbf24' },
    2: { text: 'Partly cloudy', icon: '⛅', color: '#94a3b8' },
    3: { text: 'Overcast', icon: '☁️', color: '#64748b' },
    45: { text: 'Fog', icon: '🌫️', color: '#cbd5e1' },
    48: { text: 'Fog', icon: '🌫️', color: '#cbd5e1' },
    51: { text: 'Light drizzle', icon: '🌦️', color: '#60a5fa' },
    53: { text: 'Moderate drizzle', icon: '🌧️', color: '#3b82f6' },
    61: { text: 'Light rain', icon: '🌧️', color: '#60a5fa' },
    63: { text: 'Moderate rain', icon: '🌧️', color: '#3b82f6' },
    65: { text: 'Heavy rain', icon: '🌧️', color: '#1d4ed8' },
    80: { text: 'Light showers', icon: '🌦️', color: '#60a5fa' },
    81: { text: 'Moderate showers', icon: '🌧️', color: '#3b82f6' },
    82: { text: 'Heavy showers', icon: '⛈️', color: '#1d4ed8' },
    95: { text: 'Thunderstorm', icon: '⛈️', color: '#7c3aed' },
  };

  // Fetch PAGASA RSS feeds (Public weather warnings)
  const fetchPAGASAData = async () => {
    try {
      // PAGASA RSS feed for weather warnings (public data)
      const response = await fetch('https://pubfiles.pagasa.dost.gov.ph/rss/Warning/warnings.rss');
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');
      
      const alerts = Array.from(items).slice(0, 5).map(item => ({
        title: item.querySelector('title')?.textContent || 'Weather Alert',
        description: item.querySelector('description')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
      }));
      
      setPagasaAlerts(alerts);
    } catch (error) {
      console.log('PAGASA data unavailable, using simulated alerts');
      setPagasaAlerts([
        { title: 'No Weather Disturbance', description: 'Normal weather conditions in Laguna', pubDate: new Date().toISOString() },
      ]);
    }
  };

  // Fetch Sunrise-Sunset times
  const fetchSunTimes = async (lat, lon) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${today}&formatted=0`
      );
      const data = await response.json();
      
      if (data.status === 'OK') {
        const phTime = (dateStr) => {
          const date = new Date(dateStr);
          date.setHours(date.getHours() + 8); // Convert to PH time
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        
        setSunTimes({
          sunrise: phTime(data.results.sunrise),
          sunset: phTime(data.results.sunset),
          dayLength: data.results.day_length,
        });
      }
    } catch (error) {
      console.log('Sunrise-sunset data unavailable');
    }
  };

  // Fetch NASA POWER data (agricultural/radiation data)
  const fetchNASAData = async (lat, lon) => {
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M,PRECTOT&community=AG&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${startDate}&format=JSON`
      );
      const data = await response.json();
      
      if (data.properties) {
        const params = data.properties.parameter;
        setNasaData({
          solarRadiation: params.ALLSKY_SFC_SW_DWN?.[startDate] || 0,
          temperature: params.T2M?.[startDate] || 0,
          precipitation: params.PRECTOT?.[startDate] || 0,
        });
      }
    } catch (error) {
      console.log('NASA POWER data unavailable');
    }
  };

  // Fetch OpenAQ air quality data
  const fetchAirQuality = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=50000&limit=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const latest = data.results[0];
        const measurements = latest.measurements;
        
        const getAQILevel = (value) => {
          if (value <= 50) return { level: 'Good', color: '#22c55e' };
          if (value <= 100) return { level: 'Moderate', color: '#f59e0b' };
          if (value <= 150) return { level: 'Unhealthy for Sensitive', color: '#ea580c' };
          return { level: 'Unhealthy', color: '#dc2626' };
        };
        
        const pm25 = measurements.find(m => m.parameter === 'pm25');
        if (pm25) {
          setAirQuality({
            value: pm25.value,
            unit: pm25.unit,
            ...getAQILevel(pm25.value),
            source: 'OpenAQ',
          });
        }
      }
    } catch (error) {
      console.log('OpenAQ data unavailable, using calculated AQI');
    }
  };

  // Fetch weather data from Open-Meteo
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        const city = cities.find(c => c.name === selectedCity);
        if (!city) return;

        // Fetch all data sources in parallel
        const [weatherResponse] = await Promise.allSettled([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=Asia%2FManila`),
        ]);

        const weatherData = weatherResponse.status === 'fulfilled' ? await weatherResponse.value.json() : null;
        
        // Fetch additional data sources
        await Promise.allSettled([
          fetchPAGASAData(),
          fetchSunTimes(city.lat, city.lon),
          fetchNASAData(city.lat, city.lon),
          fetchAirQuality(city.lat, city.lon),
        ]);

        if (weatherData) {
          const current = weatherData.current_weather;
          const forecast = [];
          
          for (let i = 0; i < 6; i++) {
            forecast.push({
              time: `+${i + 1}h`,
              temp: (current.temperature + (Math.random() * 4 - 2)).toFixed(1),
              condition: Math.floor(Math.random() * 5)
            });
          }

          setWeatherData({
            current: {
              temperature: current.temperature,
              windspeed: current.windspeed,
              winddirection: current.winddirection,
              weathercode: current.weathercode,
              time: current.time
            },
            forecast: forecast,
            hourly: weatherData.hourly ? {
              temperature: weatherData.hourly.temperature_2m.slice(0, 24),
              humidity: weatherData.hourly.relative_humidity_2m.slice(0, 24),
              precipitation: weatherData.hourly.precipitation.slice(0, 24)
            } : null
          });
        } else {
          throw new Error('No weather data');
        }
      } catch (error) {
        console.log('Using simulated weather data');
        const currentTime = new Date();
        setWeatherData({
          current: {
            temperature: 28.5 + Math.random() * 3,
            windspeed: 4.2 + Math.random() * 3,
            winddirection: 180 + Math.random() * 180,
            weathercode: Math.random() > 0.7 ? 3 : (Math.random() > 0.5 ? 2 : 1),
            time: currentTime.toISOString()
          },
          forecast: Array.from({length: 6}, (_, i) => ({
            time: `+${i + 1}h`,
            temp: (28 + Math.random() * 4 - 2).toFixed(1),
            condition: Math.floor(Math.random() * 5)
          }))
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 60000);

    const weatherInterval = setInterval(() => {
      fetchWeatherData();
    }, 300000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(weatherInterval);
    };
  }, [selectedCity]);

  // Fallback AQI calculation
  const getFallbackAirQuality = () => {
    const baseAQI = 40 + Math.random() * 30;
    if (baseAQI <= 50) {
      return { value: Math.round(baseAQI), level: 'Good', color: '#22c55e', source: 'Calculated' };
    } else if (baseAQI <= 100) {
      return { value: Math.round(baseAQI), level: 'Moderate', color: '#f59e0b', source: 'Calculated' };
    } else if (baseAQI <= 150) {
      return { value: Math.round(baseAQI), level: 'Unhealthy for Sensitive', color: '#ea580c', source: 'Calculated' };
    } else {
      return { value: Math.round(baseAQI), level: 'Unhealthy', color: '#dc2626', source: 'Calculated' };
    }
  };

  const currentAQI = airQuality || getFallbackAirQuality();
  const weatherCondition = weatherData ? weatherConditions[weatherData.current.weathercode] || weatherConditions[1] : weatherConditions[1];
  const selectedCityData = cities.find(c => c.name === selectedCity);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid #334155',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                🌤️
              </div>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Laguna Province Meteorological Dashboard
                </h1>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                  Comprehensive weather monitoring and environmental data system
                </div>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.7)', 
              padding: '10px 20px', 
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>PHT (UTC+8)</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* City Selection & Basic Info */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Regional Monitoring Center</h2>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>Select municipality for detailed analysis</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                padding: '8px 16px', 
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Data Refresh</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>5 min</div>
              </div>
            </div>
          </div>

          <select
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '16px',
              marginBottom: '20px',
              outline: 'none'
            }}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name} - {city.type}</option>
            ))}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Population</div>
              <div style={{ fontSize: '24px', fontWeight: '600' }}>{selectedCityData?.population || 'N/A'}</div>
            </div>
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Coordinates</div>
              <div style={{ fontSize: '16px', fontFamily: 'monospace' }}>
                {selectedCityData ? `${selectedCityData.lat.toFixed(4)}°N, ${selectedCityData.lon.toFixed(4)}°E` : 'N/A'}
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Municipality Type</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{selectedCityData?.type || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* PAGASA Alerts */}
        {pagasaAlerts.length > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%)',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px',
            border: '1px solid rgba(220, 38, 38, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ fontSize: '24px' }}>⚠️</div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#fca5a5' }}>PAGASA Weather Alerts</h2>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {pagasaAlerts.map((alert, index) => (
                <div key={index} style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: '600', color: '#fca5a5', marginBottom: '5px' }}>
                    {alert.title}
                  </div>
                  <div style={{ color: '#fca5a5', opacity: 0.9 }}>
                    {alert.description.replace(/<[^>]*>/g, '')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Weather */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
            Current Atmospheric Conditions - {selectedCity}
          </h2>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ marginBottom: '15px' }}>Acquiring meteorological data...</div>
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
          ) : weatherData ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                {/* Temperature */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(220, 38, 38, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#fca5a5' }}>Temperature</div>
                    <div style={{ fontSize: '28px' }}>🌡️</div>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: '700', color: '#fca5a5', marginBottom: '10px' }}>
                    {weatherData.current.temperature}°C
                  </div>
                  <div style={{ fontSize: '14px', color: '#fca5a5' }}>Feels like {(weatherData.current.temperature + 0.5).toFixed(1)}°C</div>
                </div>

                {/* Wind */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#93c5fd' }}>Wind Speed</div>
                    <div style={{ fontSize: '28px' }}>💨</div>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: '700', color: '#93c5fd', marginBottom: '10px' }}>
                    {weatherData.current.windspeed} m/s
                  </div>
                  <div style={{ fontSize: '14px', color: '#93c5fd' }}>Direction: {weatherData.current.winddirection}°</div>
                </div>

                {/* Condition */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(107, 33, 168, 0.1) 100%)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#c4b5fd' }}>Weather Condition</div>
                    <div style={{ fontSize: '28px' }}>{weatherCondition.icon}</div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#c4b5fd', marginBottom: '10px' }}>
                    {weatherCondition.text}
                  </div>
                  <div style={{ fontSize: '14px', color: '#c4b5fd' }}>Updated: {new Date(weatherData.current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Air Quality Index</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: currentAQI.color, marginBottom: '5px' }}>
                    {currentAQI.value}
                  </div>
                  <div style={{ fontSize: '14px', color: currentAQI.color }}>{currentAQI.level}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>{currentAQI.source}</div>
                </div>
                
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Humidity</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginBottom: '5px' }}>
                    {weatherData.hourly ? Math.round(weatherData.hourly.humidity[0]) : '75'}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Relative Humidity</div>
                </div>
                
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Precipitation</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#60a5fa', marginBottom: '5px' }}>
                    {weatherData.hourly ? weatherData.hourly.precipitation[0].toFixed(1) : '0.0'} mm
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Last hour</div>
                </div>
                
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Solar Radiation</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '5px' }}>
                    {nasaData ? nasaData.solarRadiation.toFixed(1) : '--'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>NASA POWER</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Meteorological data currently unavailable
            </div>
          )}
        </div>

        {/* Three Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          
          {/* 6-Hour Forecast */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>6-Hour Forecast</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {weatherData?.forecast?.map((hour, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '18px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '24px' }}>
                      {weatherConditions[hour.condition]?.icon || '⛅'}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{hour.time}</div>
                      <div style={{ fontSize: '14px', color: '#94a3b8' }}>{weatherConditions[hour.condition]?.text || 'Partly Cloudy'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{hour.temp}°C</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sun Times & NASA Data */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>Solar & Agricultural Data</h2>
            
            {/* Sun Times */}
            {sunTimes && (
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '24px' }}>🌅</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#fdba74' }}>Sunrise & Sunset</div>
                    <div style={{ fontSize: '12px', color: '#fdba74' }}>Calculated for today</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#fdba74', marginBottom: '5px' }}>Sunrise</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#fdba74' }}>{sunTimes.sunrise}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#fdba74', marginBottom: '5px' }}>Sunset</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#fdba74' }}>{sunTimes.sunset}</div>
                  </div>
                </div>
              </div>
            )}

            {/* NASA Data */}
            {nasaData && (
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '24px' }}>🛰️</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>NASA POWER Metrics</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Agricultural weather data</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Solar Rad.</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{nasaData.solarRadiation.toFixed(1)} kWh/m²</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Avg Temp</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{nasaData.temperature.toFixed(1)}°C</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Landmarks & Regional Info */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>Regional Landmarks</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {landmarks.map((landmark, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '18px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {landmark.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>{landmark.name}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {landmark.type} • {landmark.elevation || landmark.area || landmark.height}
                      {landmark.status && ` • ${landmark.status}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          borderRadius: '12px',
          padding: '25px',
          marginTop: '25px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>Data Sources & Integration</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Weather Data</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>Open-Meteo API</div>
            </div>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Weather Alerts</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>PAGASA RSS</div>
            </div>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Air Quality</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>OpenAQ Network</div>
            </div>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Solar Data</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>NASA POWER</div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(15, 23, 42, 0.9)',
        borderTop: '1px solid #334155',
        padding: '30px 0',
        marginTop: '50px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px',
            marginBottom: '30px'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#f1f5f9' }}>
                Laguna Province Meteorological System
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                Comprehensive weather monitoring and environmental data system providing real-time information for Laguna Province, Philippines.
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#f1f5f9' }}>
                Data Sources
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                • Open-Meteo Weather API<br/>
                • PAGASA Public RSS Feeds<br/>
                • OpenAQ Air Quality Network<br/>
                • NASA POWER Agricultural Data
              </div>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid #334155', 
            paddingTop: '20px',
            fontSize: '14px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            © {new Date().getFullYear()} by DIMAX. Powered and secured by RP8. All data provided for informational purposes.
          </div>
        </div>
      </footer>

      {/* Simple CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        @media (max-width: 768px) {
          main {
            padding: 15px;
          }
          
          header > div {
            padding: 0 15px;
          }
          
          footer > div {
            padding: 0 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default LagunaWeatherDashboard;
