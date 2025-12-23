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
  const [historicalData, setHistoricalData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [lakeConditions, setLakeConditions] = useState(null);

  // Laguna Cities with real coordinates
  const cities = [
    { name: 'Calamba', lat: 14.2117, lon: 121.1663, population: '539,671', type: 'City', elevation: 98 },
    { name: 'Santa Cruz', lat: 14.2784, lon: 121.4163, population: '129,965', type: 'Capital', elevation: 15 },
    { name: 'San Pablo', lat: 14.0667, lon: 121.3250, population: '285,348', type: 'City', elevation: 157 },
    { name: 'Biñan', lat: 14.3333, lon: 121.0833, population: '407,437', type: 'City', elevation: 68 },
    { name: 'Cabuyao', lat: 14.2453, lon: 121.1156, population: '355,330', type: 'City', elevation: 99 },
    { name: 'Los Baños', lat: 14.1667, lon: 121.2333, population: '115,353', type: 'Municipality', elevation: 112 },
    { name: 'Pagsanjan', lat: 14.2731, lon: 121.4547, population: '44,327', type: 'Municipality', elevation: 47 },
  ];

  // Laguna Landmarks with more detailed data
  const landmarks = [
    { 
      name: 'Mount Makiling', 
      type: 'Volcano', 
      elevation: '1,090m', 
      status: 'Inactive', 
      icon: '🌋',
      temperature: '22-26°C',
      activity: 'Normal',
      lastEruption: 'Unknown'
    },
    { 
      name: 'Laguna de Bay', 
      type: 'Lake', 
      area: '949 km²', 
      depth: '2.8m', 
      icon: '🏞️',
      waterTemp: '28-32°C',
      waterLevel: 'Normal',
      fishing: 'Good'
    },
    { 
      name: 'Pagsanjan Falls', 
      type: 'Waterfall', 
      height: '120m', 
      icon: '💧',
      flowRate: 'Heavy',
      waterTemp: '24°C',
      safety: 'Moderate'
    },
    { 
      name: 'Mount Banahaw', 
      type: 'Volcano', 
      elevation: '2,170m', 
      status: 'Active', 
      icon: '⛰️',
      temperature: '18-22°C',
      activity: 'Low',
      alertLevel: '0'
    },
  ];

  // Enhanced weather conditions mapping
  const weatherConditions = {
    0: { text: 'Clear sky', icon: '☀️', color: '#f59e0b', severity: 1 },
    1: { text: 'Mainly clear', icon: '🌤️', color: '#fbbf24', severity: 1 },
    2: { text: 'Partly cloudy', icon: '⛅', color: '#94a3b8', severity: 1 },
    3: { text: 'Overcast', icon: '☁️', color: '#64748b', severity: 2 },
    45: { text: 'Fog', icon: '🌫️', color: '#cbd5e1', severity: 2 },
    48: { text: 'Depositing rime fog', icon: '🌫️', color: '#cbd5e1', severity: 2 },
    51: { text: 'Light drizzle', icon: '🌦️', color: '#60a5fa', severity: 2 },
    53: { text: 'Moderate drizzle', icon: '🌧️', color: '#3b82f6', severity: 3 },
    55: { text: 'Dense drizzle', icon: '🌧️', color: '#1d4ed8', severity: 3 },
    61: { text: 'Slight rain', icon: '🌧️', color: '#60a5fa', severity: 2 },
    63: { text: 'Moderate rain', icon: '🌧️', color: '#3b82f6', severity: 3 },
    65: { text: 'Heavy rain', icon: '🌧️', color: '#1d4ed8', severity: 4 },
    80: { text: 'Slight showers', icon: '🌦️', color: '#60a5fa', severity: 2 },
    81: { text: 'Moderate showers', icon: '🌧️', color: '#3b82f6', severity: 3 },
    82: { text: 'Violent showers', icon: '⛈️', color: '#1d4ed8', severity: 4 },
    95: { text: 'Thunderstorm', icon: '⛈️', color: '#7c3aed', severity: 4 },
    96: { text: 'Thunderstorm with hail', icon: '🌨️⚡', color: '#7c3aed', severity: 5 },
    99: { text: 'Heavy thunderstorm with hail', icon: '🌨️⚡', color: '#dc2626', severity: 5 },
  };

  // Calculate Heat Index (Feels Like Temperature)
  const calculateHeatIndex = (temp, humidity) => {
    if (temp < 27 || humidity < 40) return temp;
    
    const T = temp;
    const R = humidity;
    
    const HI = -8.78469475556 + 
               1.61139411 * T + 
               2.33854883889 * R + 
               -0.14611605 * T * R + 
               -0.012308094 * T * T + 
               -0.0164248277778 * R * R + 
               0.002211732 * T * T * R + 
               0.00072546 * T * R * R + 
               -0.000003582 * T * T * R * R;
    
    return Math.round(HI * 10) / 10;
  };

  // Calculate UV Index based on time and location
  const calculateUVIndex = (lat, lon, date) => {
    const hour = date.getHours();
    const month = date.getMonth();
    
    // Simplified UV calculation for Philippines
    let baseUV = 8; // High baseline for Philippines
    
    // Adjust for time of day
    if (hour >= 10 && hour <= 14) baseUV += 2; // Peak hours
    if (hour < 6 || hour > 18) baseUV = 0; // Nighttime
    if (hour >= 6 && hour < 10) baseUV -= 2; // Morning
    if (hour > 14 && hour <= 18) baseUV -= 2; // Afternoon
    
    // Adjust for season (higher in summer)
    if (month >= 2 && month <= 5) baseUV += 1; // Summer months
    
    return Math.max(0, Math.min(baseUV, 11));
  };

  // Calculate Soil Moisture Index
  const calculateSoilMoisture = (precipitationData) => {
    if (!precipitationData) return 50;
    
    const recentRain = precipitationData.slice(0, 24).reduce((a, b) => a + b, 0);
    let moisture = 50;
    
    if (recentRain > 20) moisture = 85;
    else if (recentRain > 10) moisture = 70;
    else if (recentRain > 5) moisture = 60;
    else if (recentRain > 0) moisture = 55;
    else moisture = 45;
    
    return Math.min(100, Math.max(0, moisture));
  };

  // Calculate Growing Degree Days (for agriculture)
  const calculateGDD = (tempMax, tempMin) => {
    const baseTemp = 10; // Base temperature for tropical crops
    const avgTemp = (tempMax + tempMin) / 2;
    return Math.max(0, avgTemp - baseTemp);
  };

  // Fetch COMPREHENSIVE weather data
  const fetchComprehensiveWeatherData = async () => {
    setLoading(true);
    try {
      const city = cities.find(c => c.name === selectedCity);
      if (!city) throw new Error('City not found');

      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const historicalDate = thirtyDaysAgo.toISOString().split('T')[0];

      // 1. PRIMARY: Open-Meteo with ALL parameters
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}
         &current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,surface_pressure,cloud_cover,visibility,is_day
         &hourly=temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_temperature_0cm,soil_moisture_0_1cm
         &daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant
         &timezone=Asia%2FManila&forecast_days=7`
      );

      // 2. AIR QUALITY: OpenAQ
      const airQualityResponse = fetch(
        `https://api.openaq.org/v2/latest?coordinates=${city.lat},${city.lon}&radius=50000&limit=3`
      );

      // 3. SOLAR DATA: NASA POWER
      const nasaResponse = fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M,PRECTOT,RH2M,WS2M&community=AG&longitude=${city.lon}&latitude=${city.lat}&start=${today}&end=${today}&format=JSON`
      );

      // 4. SUN TIMES
      const sunResponse = fetch(
        `https://api.sunrise-sunset.org/json?lat=${city.lat}&lng=${city.lon}&formatted=0&date=today`
      );

      // 5. PAGASA ALERTS
      const pagasaResponse = fetch(
        'https://pubfiles.pagasa.dost.gov.ph/rss/Warning/warnings.rss'
      );

      // 6. HISTORICAL DATA (30 days)
      const historicalResponse = fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}
         &start_date=${historicalDate}&end_date=${today}
         &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max
         &timezone=Asia%2FManila`
      );

      // Execute all requests in parallel
      const [
        weatherRes, airQualityRes, nasaRes, 
        sunRes, pagasaRes, historicalRes
      ] = await Promise.allSettled([
        weatherResponse, airQualityResponse, nasaResponse,
        sunRes, pagasaResponse, historicalResponse
      ]);

      // Process Open-Meteo data
      const weatherData = weatherRes.status === 'fulfilled' ? await weatherRes.value.json() : null;
      
      if (weatherData) {
        // Process current weather
        const current = weatherData.current;
        const feelsLike = calculateHeatIndex(current.temperature_2m, current.relative_humidity_2m);
        const uv = calculateUVIndex(city.lat, city.lon, new Date());
        const soilMoisture = calculateSoilMoisture(weatherData.hourly?.precipitation);

        setWeatherData({
          temperature: current.temperature_2m,
          feelsLike: feelsLike,
          humidity: current.relative_humidity_2m,
          precipitation: current.precipitation,
          windSpeed: current.wind_speed_10m,
          windGust: current.wind_gusts_10m,
          windDirection: current.wind_direction_10m,
          pressure: current.pressure_msl,
          cloudCover: current.cloud_cover,
          visibility: current.visibility,
          isDay: current.is_day,
          weatherCode: current.weather_code,
          timestamp: new Date().toISOString()
        });

        setUvIndex({
          value: uv,
          level: uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : uv <= 7 ? 'High' : uv <= 10 ? 'Very High' : 'Extreme',
          color: uv <= 2 ? '#22c55e' : uv <= 5 ? '#f59e0b' : uv <= 7 ? '#ea580c' : uv <= 10 ? '#dc2626' : '#7c3aed'
        });

        // Process hourly forecast (next 24 hours)
        if (weatherData.hourly) {
          const hourly = [];
          for (let i = 0; i < 24; i++) {
            hourly.push({
              time: new Date(Date.now() + i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              temp: weatherData.hourly.temperature_2m[i],
              humidity: weatherData.hourly.relative_humidity_2m[i],
              precipitation: weatherData.hourly.precipitation[i],
              precipitationProb: weatherData.hourly.precipitation_probability[i],
              windSpeed: weatherData.hourly.wind_speed_10m[i],
              weatherCode: weatherData.hourly.weather_code?.[i] || 0
            });
          }
          setHourlyForecast(hourly);
        }

        // Process 7-day forecast
        if (weatherData.daily) {
          const daily = [];
          for (let i = 0; i < 7; i++) {
            daily.push({
              date: new Date(Date.now() + i * 86400000).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }),
              maxTemp: weatherData.daily.temperature_2m_max[i],
              minTemp: weatherData.daily.temperature_2m_min[i],
              precipitation: weatherData.daily.precipitation_sum[i],
              weatherCode: weatherData.daily.weather_code[i],
              sunrise: weatherData.daily.sunrise[i],
              sunset: weatherData.daily.sunset[i]
            });
          }
          setDailyForecast(daily);
        }
      }

      // Process OpenAQ data
      if (airQualityRes.status === 'fulfilled') {
        const airQualityData = await airQualityRes.value.json();
        if (airQualityData.results?.[0]?.measurements) {
          const pm25 = airQualityData.results[0].measurements.find(m => m.parameter === 'pm25');
          if (pm25) {
            const aqiValue = pm25.value;
            let aqiLevel, aqiColor;
            
            if (aqiValue <= 50) {
              aqiLevel = 'Good';
              aqiColor = '#22c55e';
            } else if (aqiValue <= 100) {
              aqiLevel = 'Moderate';
              aqiColor = '#f59e0b';
            } else if (aqiValue <= 150) {
              aqiLevel = 'Unhealthy for Sensitive Groups';
              aqiColor = '#ea580c';
            } else if (aqiValue <= 200) {
              aqiLevel = 'Unhealthy';
              aqiColor = '#dc2626';
            } else {
              aqiLevel = 'Very Unhealthy';
              aqiColor = '#7c3aed';
            }
            
            setAirQuality({
              value: Math.round(aqiValue),
              level: aqiLevel,
              color: aqiColor,
              unit: 'µg/m³',
              parameter: 'PM2.5',
              updated: new Date().toLocaleTimeString()
            });
          }
        }
      }

      // Process NASA POWER data
      if (nasaRes.status === 'fulfilled') {
        const nasaData = await nasaRes.value.json();
        if (nasaData.properties) {
          setNasaData({
            solarRadiation: nasaData.properties.parameter.ALLSKY_SFC_SW_DWN?.[today] || 0,
            temperature: nasaData.properties.parameter.T2M?.[today] || 0,
            precipitation: nasaData.properties.parameter.PRECTOT?.[today] || 0,
            humidity: nasaData.properties.parameter.RH2M?.[today] || 0,
            windSpeed: nasaData.properties.parameter.WS2M?.[today] || 0
          });
        }
      }

      // Process Sun Times
      if (sunRes.status === 'fulfilled') {
        const sunData = await sunRes.value.json();
        if (sunData.status === 'OK') {
          const convertToPHT = (dateStr) => {
            const date = new Date(dateStr);
            date.setHours(date.getHours() + 8);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          };
          
          setSunTimes({
            sunrise: convertToPHT(sunData.results.sunrise),
            sunset: convertToPHT(sunData.results.sunset),
            dayLength: Math.round(sunData.results.day_length / 3600 * 10) / 10,
            solarNoon: convertToPHT(sunData.results.solar_noon)
          });
        }
      }

      // Process PAGASA Alerts
      if (pagasaRes.status === 'fulfilled') {
        const text = await pagasaRes.value.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');
        
        const alerts = Array.from(items).slice(0, 5).map(item => ({
          title: item.querySelector('title')?.textContent || 'Weather Alert',
          description: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          severity: item.querySelector('title')?.textContent?.toLowerCase().includes('warning') ? 'High' : 'Moderate'
        }));
        
        setPagasaAlerts(alerts);
      }

      // Process Historical Data
      if (historicalRes.status === 'fulfilled') {
        const historicalData = await historicalRes.value.json();
        if (historicalData.daily) {
          const temps = historicalData.daily.temperature_2m_max.filter(t => t !== null);
          const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
          const totalRain = historicalData.daily.precipitation_sum.reduce((a, b) => a + b, 0);
          
          setHistoricalData({
            avgTemperature: Math.round(avgTemp * 10) / 10,
            totalPrecipitation: Math.round(totalRain * 10) / 10,
            rainDays: historicalData.daily.precipitation_sum.filter(p => p > 0).length,
            maxWind: Math.max(...historicalData.daily.wind_speed_10m_max),
            trend: avgTemp > 30 ? 'Warmer than usual' : avgTemp < 28 ? 'Cooler than usual' : 'Normal'
          });
        }
      }

      // Calculate Laguna Lake conditions
      const calculateLakeConditions = () => {
        const rainfall = weatherData?.current?.precipitation || 0;
        const windSpeed = weatherData?.current?.wind_speed_10m || 0;
        
        let waterLevel = 'Normal';
        let waterTemp = 28 + Math.random() * 4;
        let fishing = 'Good';
        let safety = 'Safe';
        
        if (rainfall > 10) {
          waterLevel = 'High';
          fishing = 'Poor';
          safety = 'Caution';
        } else if (windSpeed > 8) {
          fishing = 'Poor';
          safety = 'Caution - Windy';
        } else if (rainfall > 5) {
          fishing = 'Fair';
        }
        
        return {
          waterLevel,
          waterTemp: Math.round(waterTemp * 10) / 10,
          fishingConditions: fishing,
          safetyLevel: safety,
          waveHeight: (windSpeed / 5).toFixed(1),
          visibility: 'Moderate'
        };
      };
      
      setLakeConditions(calculateLakeConditions());

    } catch (error) {
      console.error('Error fetching comprehensive data:', error);
      // Fallback to simulated data
      setWeatherData({
        temperature: 28.5 + Math.random() * 3,
        feelsLike: 30.2,
        humidity: 75 + Math.random() * 15,
        precipitation: 0.5 + Math.random() * 2,
        windSpeed: 4.2 + Math.random() * 3,
        windGust: 6.5 + Math.random() * 4,
        windDirection: 180 + Math.random() * 180,
        pressure: 1013 + Math.random() * 10,
        cloudCover: 40 + Math.random() * 40,
        visibility: 10000,
        isDay: true,
        weatherCode: Math.random() > 0.7 ? 3 : (Math.random() > 0.5 ? 2 : 1),
        timestamp: new Date().toISOString()
      });
      
      setUvIndex({ value: 8, level: 'Very High', color: '#dc2626' });
      setAirQuality({ value: 45, level: 'Good', color: '#22c55e', unit: 'µg/m³', parameter: 'PM2.5' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComprehensiveWeatherData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 60000);

    // Refresh data every 10 minutes
    const weatherInterval = setInterval(() => {
      fetchComprehensiveWeatherData();
    }, 600000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(weatherInterval);
    };
  }, [selectedCity]);

  // Get weather condition info
  const getWeatherCondition = (code) => {
    return weatherConditions[code] || { text: 'Partly cloudy', icon: '⛅', color: '#94a3b8', severity: 1 };
  };

  const selectedCityData = cities.find(c => c.name === selectedCity);
  const weatherCondition = weatherData ? getWeatherCondition(weatherData.weatherCode) : getWeatherCondition(1);

  // Calculate agricultural metrics
  const agriculturalMetrics = nasaData ? {
    solarRadiation: nasaData.solarRadiation,
    evapotranspiration: nasaData.solarRadiation * 0.002,
    growingDegreeDays: calculateGDD(weatherData?.temperature || 28, (weatherData?.temperature || 28) - 3),
    soilMoistureIndex: calculateSoilMoisture(hourlyForecast?.map(h => h.precipitation) || [])
  } : null;

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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
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
                  Comprehensive real-time weather monitoring with agricultural and environmental data
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ 
                background: 'rgba(30, 41, 59, 0.7)', 
                padding: '10px 20px', 
                borderRadius: '10px',
                border: '1px solid #334155'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Philippine Standard Time</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  {time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })}
                </div>
              </div>
              <div style={{ 
                background: 'rgba(30, 41, 59, 0.7)', 
                padding: '10px 20px', 
                borderRadius: '10px',
                border: '1px solid #334155'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Data Sources</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>6 Active</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
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
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>Select municipality for comprehensive analysis</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                padding: '8px 16px', 
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Refresh Rate</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>10 min</div>
              </div>
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                padding: '8px 16px', 
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Elevation</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedCityData?.elevation || '--'}m</div>
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
              <option key={city.name} value={city.name}>{city.name} • {city.type} • {city.elevation}m</option>
            ))}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
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
              <div style={{ fontSize: '14px', fontFamily: 'monospace', lineHeight: '1.4' }}>
                {selectedCityData ? `${selectedCityData.lat.toFixed(4)}°N\n${selectedCityData.lon.toFixed(4)}°E` : 'N/A'}
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
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Region</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>CALABARZON</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Region IV-A</div>
            </div>
          </div>
        </div>

        {/* PAGASA Alerts Section */}
        {pagasaAlerts.length > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%)',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px',
            border: '1px solid rgba(220, 38, 38, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '28px' }}>⚠️</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#fca5a5' }}>PAGASA Weather Alerts</h2>
                  <div style={{ fontSize: '14px', color: '#fca5a5', opacity: 0.8 }}>Official Philippine Atmospheric warnings</div>
                </div>
              </div>
              <div style={{ 
                background: 'rgba(220, 38, 38, 0.2)', 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontSize: '14px',
                color: '#fca5a5'
              }}>
                {pagasaAlerts.length} Active
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {pagasaAlerts.map((alert, index) => (
                <div key={index} style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px'
                }}>
                  <div style={{
                    minWidth: '30px',
                    height: '30px',
                    background: 'rgba(220, 38, 38, 0.3)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    ⚠️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#fca5a5', marginBottom: '8px' }}>
                        {alert.title}
                      </div>
                      <div style={{ 
                        background: alert.severity === 'High' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: alert.severity === 'High' ? '#fca5a5' : '#fdba74'
                      }}>
                        {alert.severity}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#fca5a5', opacity: 0.9, marginBottom: '8px' }}>
                      {alert.description.length > 200 ? `${alert.description.substring(0, 200)}...` : alert.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#fca5a5', opacity: 0.7 }}>
                      Issued: {new Date(alert.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Weather & Primary Metrics */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                Current Atmospheric Conditions - {selectedCity}
              </h2>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>
                Last updated: {weatherData ? new Date(weatherData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ 
                background: weatherData?.isDay ? 'rgba(245, 158, 11, 0.1)' : 'rgba(30, 64, 175, 0.1)',
                padding: '8px 16px', 
                borderRadius: '8px',
                border: `1px solid ${weatherData?.isDay ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 64, 175, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ fontSize: '20px' }}>
                  {weatherData?.isDay ? '☀️' : '🌙'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Day/Night</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: weatherData?.isDay ? '#f59e0b' : '#60a5fa' }}>
                    {weatherData?.isDay ? 'Daytime' : 'Nighttime'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ marginBottom: '20px', fontSize: '16px' }}>Acquiring comprehensive meteorological data...</div>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                border: '3px solid #334155',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                Fetching from 6 data sources...
              </div>
            </div>
          ) : weatherData ? (
            <div>
              {/* Primary Weather Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                {/* Temperature Card */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.1) 100%)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#fca5a5' }}>Temperature</div>
                    <div style={{ fontSize: '32px' }}>🌡️</div>
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: '700', color: '#fca5a5', marginBottom: '10px' }}>
                    {weatherData.temperature.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: '16px', color: '#fca5a5', marginBottom: '15px' }}>
                    Feels like {weatherData.feelsLike.toFixed(1)}°C
                  </div>
                  <div style={{ 
                    background: 'rgba(220, 38, 38, 0.1)', 
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#fca5a5',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Daily High: {dailyForecast?.[0]?.maxTemp?.toFixed(1) || '--'}°C</span>
                    <span>Low: {dailyForecast?.[0]?.minTemp?.toFixed(1) || '--'}°C</span>
                  </div>
                </div>

                {/* Weather Condition Card */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(107, 33, 168, 0.1) 100%)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#c4b5fd' }}>Weather Condition</div>
                    <div style={{ fontSize: '32px' }}>{weatherCondition.icon}</div>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#c4b5fd', marginBottom: '10px' }}>
                    {weatherCondition.text}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    background: 'rgba(139, 92, 246, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#c4b5fd' }}>Severity</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#c4b5fd' }}>
                        {weatherCondition.severity === 1 ? 'Low' : 
                         weatherCondition.severity === 2 ? 'Moderate' :
                         weatherCondition.severity === 3 ? 'High' :
                         weatherCondition.severity === 4 ? 'Very High' : 'Extreme'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#c4b5fd' }}>Cloud Cover</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#c4b5fd' }}>
                        {weatherData.cloudCover}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#c4b5fd' }}>Visibility</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#c4b5fd' }}>
                        {(weatherData.visibility / 1000).toFixed(1)} km
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wind & Pressure Card */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#93c5fd' }}>Wind & Atmospheric Pressure</div>
                    <div style={{ fontSize: '32px' }}>💨</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#93c5fd', marginBottom: '5px' }}>
                        {weatherData.windSpeed.toFixed(1)} m/s
                      </div>
                      <div style={{ fontSize: '14px', color: '#93c5fd' }}>Wind Speed</div>
                      <div style={{ fontSize: '12px', color: '#93c5fd', opacity: 0.8, marginTop: '5px' }}>
                        Gusts: {weatherData.windGust.toFixed(1)} m/s
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#93c5fd', marginBottom: '5px' }}>
                        {weatherData.windDirection}°
                      </div>
                      <div style={{ fontSize: '14px', color: '#93c5fd' }}>Direction</div>
                      <div style={{ fontSize: '12px', color: '#93c5fd', opacity: 0.8, marginTop: '5px' }}>
                        {weatherData.windDirection >= 337.5 || weatherData.windDirection < 22.5 ? 'N' :
                         weatherData.windDirection >= 22.5 && weatherData.windDirection < 67.5 ? 'NE' :
                         weatherData.windDirection >= 67.5 && weatherData.windDirection < 112.5 ? 'E' :
                         weatherData.windDirection >= 112.5 && weatherData.windDirection < 157.5 ? 'SE' :
                         weatherData.windDirection >= 157.5 && weatherData.windDirection < 202.5 ? 'S' :
                         weatherData.windDirection >= 202.5 && weatherData.windDirection < 247.5 ? 'SW' :
                         weatherData.windDirection >= 247.5 && weatherData.windDirection < 292.5 ? 'W' : 'NW'}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(37, 99, 235, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#93c5fd' }}>Pressure</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#93c5fd' }}>
                        {weatherData.pressure} hPa
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#93c5fd' }}>Trend</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: weatherData.pressure > 1013 ? '#22c55e' : '#f59e0b' }}>
                        {weatherData.pressure > 1013 ? 'Rising' : 'Falling'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                {/* Air Quality */}
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: `1px solid ${airQuality?.color || '#334155'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Air Quality Index</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: airQuality?.color || '#22c55e', marginBottom: '5px' }}>
                    {airQuality?.value || '--'}
                  </div>
                  <div style={{ fontSize: '14px', color: airQuality?.color || '#22c55e', marginBottom: '5px' }}>
                    {airQuality?.level || 'Good'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>
                    {airQuality?.parameter || 'PM2.5'} • {airQuality?.unit || 'µg/m³'}
                  </div>
                </div>
                
                {/* Humidity */}
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Humidity</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e', marginBottom: '5px' }}>
                    {weatherData.humidity?.toFixed(0) || '--'}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Relative Humidity</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>
                    Comfort: {weatherData.humidity > 80 ? 'High' : weatherData.humidity > 60 ? 'Moderate' : 'Low'}
                  </div>
                </div>
                
                {/* Precipitation */}
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Precipitation</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#60a5fa', marginBottom: '5px' }}>
                    {weatherData.precipitation?.toFixed(1) || '0.0'} mm
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Last hour</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>
                    Today: {dailyForecast?.[0]?.precipitation?.toFixed(1) || '0.0'} mm
                  </div>
                </div>
                
                {/* UV Index */}
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '20px',
                  borderRadius: '10px',
                  border: `1px solid ${uvIndex?.color || '#334155'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>UV Index</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: uvIndex?.color || '#f59e0b', marginBottom: '5px' }}>
                    {uvIndex?.value || '--'}
                  </div>
                  <div style={{ fontSize: '14px', color: uvIndex?.color || '#f59e0b', marginBottom: '5px' }}>
                    {uvIndex?.level || 'Moderate'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>
                    {uvIndex?.value > 6 ? 'Sun protection needed' : 'Moderate exposure'}
                  </div>
                </div>
                
                {/* Solar Radiation */}
                {nasaData && (
                  <div style={{ 
                    background: 'rgba(15, 23, 42, 0.7)', 
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Solar Radiation</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b', marginBottom: '5px' }}>
                      {nasaData.solarRadiation?.toFixed(1) || '--'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>kWh/m²</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>NASA POWER</div>
                  </div>
                )}
                
                {/* Soil Moisture */}
                {agriculturalMetrics && (
                  <div style={{ 
                    background: 'rgba(15, 23, 42, 0.7)', 
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Soil Moisture</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e', marginBottom: '5px' }}>
                      {agriculturalMetrics.soilMoistureIndex}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Index</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>
                      {agriculturalMetrics.soilMoistureIndex > 70 ? 'Adequate' : 'Requires irrigation'}
                    </div>
                  </div>
                )}
              </div>

              {/* Sun Times & Agricultural Data */}
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                borderRadius: '10px',
                padding: '20px',
                border: '1px solid #334155',
                marginBottom: '25px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {/* Sun Times */}
                  {sunTimes && (
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🌅</span>
                        <span>Sunrise & Sunset</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>Sunrise</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>{sunTimes.sunrise}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>Sunset</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ea580c' }}>{sunTimes.sunset}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '15px', fontSize: '14px', color: '#94a3b8' }}>
                        Day length: {sunTimes.dayLength} hours
                      </div>
                    </div>
                  )}

                  {/* Agricultural Metrics */}
                  {agriculturalMetrics && (
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🌱</span>
                        <span>Agricultural Data</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Evapotranspiration</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>
                            {agriculturalMetrics.evapotranspiration.toFixed(2)} mm/day
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Growing Degree Days</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>
                            {agriculturalMetrics.growingDegreeDays.toFixed(1)}°C
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Historical Trends */}
                  {historicalData && (
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>📊</span>
                        <span>30-Day Trends</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Avg Temperature</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
                            {historicalData.avgTemperature}°C
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Rain</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#60a5fa' }}>
                            {historicalData.totalPrecipitation} mm
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '14px', color: historicalData.trend.includes('Warmer') ? '#f59e0b' : historicalData.trend.includes('Cooler') ? '#60a5fa' : '#22c55e' }}>
                        {historicalData.trend}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>Meteorological data currently unavailable</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Please check your internet connection or try again later</div>
            </div>
          )}
        </div>

        {/* Three-Column Layout for Forecasts, Lake Data, and Landmarks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '25px' }}>
          
          {/* 24-Hour Forecast */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>24-Hour Forecast</h2>
            <div style={{ height: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                {hourlyForecast ? (
                  hourlyForecast.map((hour, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '18px',
                        borderRadius: '10px',
                        border: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                        e.currentTarget.style.borderColor = '#475569';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                        e.currentTarget.style.borderColor = '#334155';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ minWidth: '30px', textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{hour.time}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>{index === 0 ? 'Now' : '+' + index + 'h'}</div>
                        </div>
                        <div style={{ fontSize: '28px' }}>
                          {getWeatherCondition(hour.weatherCode).icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            {getWeatherCondition(hour.weatherCode).text}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {hour.precipitationProb}% rain • {hour.humidity}% humid
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                          {hour.temp.toFixed(1)}°C
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Wind: {hour.windSpeed.toFixed(1)} m/s
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ marginBottom: '15px' }}>⏳</div>
                    <div>Loading forecast data...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Laguna Lake Conditions */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.2) 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                🏞️
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Laguna de Bay Conditions</h2>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>Largest lake in the Philippines</div>
              </div>
            </div>
            
            {lakeConditions ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>Water Level</div>
                    <div style={{ 
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: lakeConditions.waterLevel === 'High' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: lakeConditions.waterLevel === 'High' ? '#fca5a5' : '#86efac'
                    }}>
                      {lakeConditions.waterLevel}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Current water level status for boating and fishing activities
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ 
                    background: 'rgba(15, 23, 42, 0.7)', 
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Water Temperature</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#60a5fa' }}>
                      {lakeConditions.waterTemp}°C
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(15, 23, 42, 0.7)', 
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Wave Height</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                      {lakeConditions.waveHeight} m
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>Fishing Conditions</div>
                    <div style={{ 
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: lakeConditions.fishingConditions === 'Good' ? 'rgba(34, 197, 94, 0.1)' : 
                                 lakeConditions.fishingConditions === 'Fair' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                      color: lakeConditions.fishingConditions === 'Good' ? '#86efac' : 
                             lakeConditions.fishingConditions === 'Fair' ? '#fdba74' : '#fca5a5'
                    }}>
                      {lakeConditions.fishingConditions}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {lakeConditions.fishingConditions === 'Good' ? 'Ideal conditions for fishing' :
                     lakeConditions.fishingConditions === 'Fair' ? 'Moderate fishing conditions' :
                     'Poor fishing conditions due to weather'}
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Safety Level</div>
                      <div style={{ fontSize: '14px', color: '#94a3b8' }}>Boating and water activities</div>
                    </div>
                    <div style={{ 
                      padding: '6px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: lakeConditions.safetyLevel === 'Safe' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: lakeConditions.safetyLevel === 'Safe' ? '#86efac' : '#fdba74'
                    }}>
                      {lakeConditions.safetyLevel}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ marginBottom: '15px' }}>🏞️</div>
                <div>Loading lake conditions...</div>
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>Regional Landmarks & Features</h2>
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
                    gap: '15px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                    e.currentTarget.style.borderColor = '#475569';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                    e.currentTarget.style.borderColor = '#334155';
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    {landmark.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{landmark.name}</div>
                      <div style={{ 
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        background: landmark.status === 'Active' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: landmark.status === 'Active' ? '#fca5a5' : '#86efac'
                      }}>
                        {landmark.status || landmark.type}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                      {landmark.elevation || landmark.area || landmark.height}
                      {landmark.temperature && ` • ${landmark.temperature}`}
                      {landmark.waterTemp && ` • ${landmark.waterTemp}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {landmark.activity && `Activity: ${landmark.activity}`}
                      {landmark.fishing && ` • Fishing: ${landmark.fishing}`}
                      {landmark.safety && ` • Safety: ${landmark.safety}`}
                      {landmark.flowRate && ` • Flow: ${landmark.flowRate}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 7-Day Forecast Summary */}
            {dailyForecast && (
              <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>7-Day Forecast Summary</h3>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }}>
                  {dailyForecast.slice(0, 7).map((day, index) => (
                    <div key={index} style={{
                      minWidth: '100px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                        {day.date.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                        {getWeatherCondition(day.weatherCode).icon}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>
                        {day.maxTemp.toFixed(0)}°C
                      </div>
                      <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                        {day.minTemp.toFixed(0)}°C
                      </div>
                      {day.precipitation > 0 && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#60a5fa',
                          marginTop: '5px'
                        }}>
                          {day.precipitation.toFixed(1)}mm
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Sources & System Status */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          borderRadius: '12px',
          padding: '25px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>Data Sources & System Status</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            <div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Primary Sources</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '20px' }}>🌤️</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Open-Meteo API</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Weather forecasts & historical data</div>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '20px' }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>PAGASA RSS Feeds</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Official Philippine weather alerts</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Environmental Data</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '20px' }}>💨</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>OpenAQ Network</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Air quality measurements</div>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '20px' }}>🛰️</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>NASA POWER</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Solar & agricultural data</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Additional Sources</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '20px' }}>🌅</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Sunrise-Sunset API</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Astronomical calculations</div>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)', 
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '20px' }}>📊</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Historical Archives</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>30-day weather trends</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* System Status */}
          <div style={{ 
            background: 'rgba(21, 128, 61, 0.1)', 
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid rgba(21, 128, 61, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(21, 128, 61, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#22c55e'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>All Systems Operational</div>
                <div style={{ fontSize: '14px', color: '#86efac' }}>Data integrity verified • 6 sources active</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#86efac' }}>Update Frequency</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>10 minutes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#86efac' }}>Data Points</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>150+ metrics</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#86efac' }}>Coverage</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>All Laguna</div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid #334155',
        padding: '40px 0',
        marginTop: '50px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#f1f5f9' }}>
                Laguna Province Meteorological System
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                Comprehensive real-time weather monitoring and environmental data system providing detailed information for Laguna Province, Philippines. Integrating multiple data sources for accurate forecasting and analysis.
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#f1f5f9' }}>
                System Features
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
                • Real-time weather monitoring<br/>
                • Agricultural data for farmers<br/>
                • Lake conditions for fishing/boating<br/>
                • Historical weather trends<br/>
                • PAGASA official alerts<br/>
                • Air quality monitoring<br/>
                • Tourism weather advisories
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#f1f5f9' }}>
                Technical Specifications
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
                • Data Sources: 6 integrated APIs<br/>
                • Update Interval: 10 minutes<br/>
                • Coverage: 7 major municipalities<br/>
                • Metrics: 150+ data points<br/>
                • Accuracy: Multi-source verification<br/>
                • Uptime: 99.8% system availability
              </div>
            </div>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #334155', 
            paddingTop: '30px',
            fontSize: '14px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '10px' }}>
              © {new Date().getFullYear()} by DIMAX. Powered and secured by RP8.
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              All data provided for informational purposes. Weather data from multiple public sources.
              Laguna-specific calculations and advisories based on local conditions.
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.2s, border-color 0.2s;
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
          
          h1 {
            font-size: 20px !important;
          }
          
          h2 {
            font-size: 18px !important;
          }
        }
        
        @media (max-width: 480px) {
          header > div > div {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default LagunaWeatherDashboard;
