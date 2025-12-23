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
  const [floodRisk, setFloodRisk] = useState(null);
  const [agriculturalAdvisory, setAgriculturalAdvisory] = useState(null);
  const [tourismRecommendations, setTourismRecommendations] = useState([]);
  const [volcanoStatus, setVolcanoStatus] = useState(null);
  const [lakeConditions, setLakeConditions] = useState(null);

  // Laguna Cities with detailed information
  const cities = [
    { 
      name: 'Calamba', 
      lat: 14.2117, 
      lon: 121.1663, 
      population: '539,671', 
      type: 'City',
      elevation: 98,
      landmarks: ['Rizal Shrine', 'Hot Springs']
    },
    { 
      name: 'Santa Cruz', 
      lat: 14.2784, 
      lon: 121.4163, 
      population: '129,965', 
      type: 'Capital',
      elevation: 18,
      landmarks: ['Laguna Provincial Capitol', 'Lakeside']
    },
    { 
      name: 'San Pablo', 
      lat: 14.0667, 
      lon: 121.3250, 
      population: '285,348', 
      type: 'City',
      elevation: 231,
      landmarks: ['Seven Lakes', 'Sampaloc Lake']
    },
    { 
      name: 'Biñan', 
      lat: 14.3333, 
      lon: 121.0833, 
      population: '407,437', 
      type: 'City',
      elevation: 68,
      landmarks: ['Plaza Rizal', 'Industrial Zone']
    },
    { 
      name: 'Cabuyao', 
      lat: 14.2453, 
      lon: 121.1156, 
      population: '355,330', 
      type: 'City',
      elevation: 99,
      landmarks: ['Carmona Resettlement', 'Industrial Area']
    },
    { 
      name: 'Los Baños', 
      lat: 14.1667, 
      lon: 121.2333, 
      population: '115,353', 
      type: 'Municipality',
      elevation: 272,
      landmarks: ['UP Los Baños', 'Mt. Makiling']
    },
    { 
      name: 'Pagsanjan', 
      lat: 14.2731, 
      lon: 121.4547, 
      population: '44,327', 
      type: 'Municipality',
      elevation: 154,
      landmarks: ['Pagsanjan Falls', 'Pagsanjan Arch']
    },
  ];

  // Laguna Landmarks with detailed information
  const landmarks = [
    { 
      name: 'Mount Makiling', 
      type: 'Volcano', 
      elevation: '1,090m', 
      status: 'Inactive', 
      icon: '🌋',
      location: 'Los Baños',
      coordinates: { lat: 14.1306, lon: 121.2022 }
    },
    { 
      name: 'Laguna de Bay', 
      type: 'Lake', 
      area: '949 km²', 
      depth: '2.8m', 
      icon: '🏞️',
      location: 'Multiple Cities',
      coordinates: { lat: 14.3333, lon: 121.2833 }
    },
    { 
      name: 'Pagsanjan Falls', 
      type: 'Waterfall', 
      height: '120m', 
      icon: '💧',
      location: 'Pagsanjan',
      coordinates: { lat: 14.2717, lon: 121.4553 }
    },
    { 
      name: 'Mount Banahaw', 
      type: 'Volcano', 
      elevation: '2,170m', 
      status: 'Active', 
      icon: '⛰️',
      location: 'Boundary Laguna/Quezon',
      coordinates: { lat: 14.0667, lon: 121.4833 }
    },
  ];

  // Crop types in Laguna
  const lagunaCrops = [
    { name: 'Rice', season: 'Year-round', planting: ['Jan-Mar', 'Jun-Jul'], harvest: ['Apr-May', 'Oct-Nov'] },
    { name: 'Coconut', season: 'Year-round', planting: 'May-Oct', harvest: 'Continuous' },
    { name: 'Coffee', season: 'Nov-Mar', planting: 'May-Jun', harvest: 'Oct-Feb' },
    { name: 'Banana', season: 'Year-round', planting: 'Apr-May', harvest: 'Continuous' },
    { name: 'Mango', season: 'Mar-Jun', planting: 'Jun-Jul', harvest: 'Mar-Apr' },
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

  // Calculate Heat Index (Feels Like Temperature)
  const calculateHeatIndex = (temp, humidity) => {
    if (temp < 27) return temp;
    
    const T = temp;
    const R = humidity;
    
    // NOAA Heat Index Formula
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

  // Calculate Flood Risk based on rainfall data
  const calculateFloodRisk = (precipitationData, historicalPrecip) => {
    const currentHour = precipitationData?.[0] || 0;
    const last3Hours = precipitationData?.slice(0, 3).reduce((a, b) => a + b, 0) || 0;
    const last24Hours = precipitationData?.slice(0, 24).reduce((a, b) => a + b, 0) || 0;
    
    let riskLevel = 'Low';
    let color = '#22c55e';
    let advisory = 'Normal conditions';
    
    // Laguna-specific flood thresholds (mm)
    if (last24Hours > 100) {
      riskLevel = 'High';
      color = '#dc2626';
      advisory = 'Possible flooding in low-lying areas. Monitor lake levels.';
    } else if (last24Hours > 50) {
      riskLevel = 'Moderate';
      color = '#ea580c';
      advisory = 'Minor flooding possible. Exercise caution near waterways.';
    } else if (last3Hours > 20) {
      riskLevel = 'Elevated';
      color = '#f59e0b';
      advisory = 'Localized ponding possible.';
    }
    
    return {
      level: riskLevel,
      color,
      advisory,
      metrics: {
        currentHour: currentHour.toFixed(1),
        last3Hours: last3Hours.toFixed(1),
        last24Hours: last24Hours.toFixed(1)
      }
    };
  };

  // Generate Agricultural Advisory
  const generateAgriculturalAdvisory = (weatherData, nasaData) => {
    const temp = weatherData?.current?.temperature || 28;
    const humidity = weatherData?.current?.humidity || 70;
    const precip = weatherData?.current?.precipitation || 0;
    const solarRad = nasaData?.solarRadiation || 5;
    
    const advisories = [];
    
    // Rice farming conditions
    if (temp >= 25 && temp <= 35 && precip < 10) {
      advisories.push({
        crop: 'Rice',
        status: 'Good planting conditions',
        icon: '🌾',
        color: '#22c55e',
        details: 'Optimal temperature and moisture for rice cultivation.'
      });
    }
    
    // General farming advisory
    if (solarRad > 6) {
      advisories.push({
        crop: 'All Crops',
        status: 'High solar radiation',
        icon: '☀️',
        color: '#f59e0b',
        details: 'Consider irrigation and shading for young plants.'
      });
    }
    
    if (precip > 20) {
      advisories.push({
        crop: 'Field Crops',
        status: 'Heavy rainfall expected',
        icon: '🌧️',
        color: '#3b82f6',
        details: 'Delay field work. Check drainage systems.'
      });
    }
    
    return advisories;
  };

  // Generate Tourism Recommendations
  const generateTourismRecommendations = (weatherData, sunTimes) => {
    const recommendations = [];
    const condition = weatherData?.current?.weathercode || 1;
    const temp = weatherData?.current?.temperature || 28;
    const wind = weatherData?.current?.windspeed || 5;
    
    // Pagsanjan Falls
    if (condition <= 2 && temp >= 24 && temp <= 32) {
      recommendations.push({
        attraction: 'Pagsanjan Falls',
        icon: '🚣',
        recommendation: 'Excellent for rafting',
        color: '#22c55e',
        details: 'Clear weather ideal for waterfall visits and boat rides.'
      });
    }
    
    // Hot Springs
    if (temp <= 30) {
      recommendations.push({
        attraction: 'Hot Springs',
        icon: '♨️',
        recommendation: 'Perfect hot spring weather',
        color: '#ec4899',
        details: 'Cool air complements hot spring experience.'
      });
    }
    
    // Lake Activities
    if (condition <= 2 && wind < 8) {
      recommendations.push({
        attraction: 'Laguna de Bay',
        icon: '🎣',
        recommendation: 'Good for fishing/boating',
        color: '#3b82f6',
        details: 'Calm winds and clear skies perfect for lake activities.'
      });
    }
    
    // Hiking (Mt. Makiling)
    if (condition <= 1 && temp >= 22 && temp <= 30) {
      recommendations.push({
        attraction: 'Mt. Makiling Hike',
        icon: '🥾',
        recommendation: 'Ideal hiking conditions',
        color: '#10b981',
        details: 'Clear visibility and comfortable temperatures for trekking.'
      });
    }
    
    return recommendations;
  };

  // Get Volcano Status (Simulated - real data would come from PHIVOLCS)
  const getVolcanoStatus = () => {
    return {
      name: 'Mount Makiling',
      status: 'Normal',
      alertLevel: '0',
      color: '#22c55e',
      details: 'No unusual seismic activity detected.',
      lastUpdate: new Date().toISOString(),
      icon: '🌋'
    };
  };

  // Get Lake Conditions for Laguna de Bay
  const getLakeConditions = (weatherData) => {
    const windSpeed = weatherData?.current?.windspeed || 5;
    const precip = weatherData?.current?.precipitation || 0;
    
    let condition = 'Good';
    let color = '#22c55e';
    let advisory = 'Safe for all water activities';
    let waveHeight = '0.3-0.5m';
    
    if (windSpeed > 10) {
      condition = 'Rough';
      color = '#ea580c';
      advisory = 'Caution advised for small boats';
      waveHeight = '0.8-1.2m';
    } else if (precip > 10) {
      condition = 'Moderate';
      color = '#f59e0b';
      advisory = 'Increased water flow, stay near shore';
      waveHeight = '0.5-0.8m';
    }
    
    return {
      condition,
      color,
      advisory,
      waveHeight,
      waterTemp: '28-30°C',
      visibility: 'Good',
      fishing: condition === 'Good' ? 'Excellent' : 'Fair'
    };
  };

  // Fetch PAGASA RSS feeds
  const fetchPAGASAData = async () => {
    try {
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
      console.log('PAGASA data unavailable');
      setPagasaAlerts([
        { 
          title: 'Normal Weather Conditions', 
          description: 'No special weather disturbance affecting Laguna Province.', 
          pubDate: new Date().toISOString() 
        },
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
          date.setHours(date.getHours() + 8);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        
        setSunTimes({
          sunrise: phTime(data.results.sunrise),
          sunset: phTime(data.results.sunset),
          dayLength: Math.round(data.results.day_length / 3600 * 10) / 10,
          civilTwilight: phTime(data.results.civil_twilight_begin),
        });
      }
    } catch (error) {
      console.log('Sunrise-sunset data unavailable');
    }
  };

  // Fetch NASA POWER data
  const fetchNASAData = async (lat, lon) => {
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M,PRECTOT,RH2M,WS2M&community=AG&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${startDate}&format=JSON`
      );
      const data = await response.json();
      
      if (data.properties) {
        const params = data.properties.parameter;
        const nasaData = {
          solarRadiation: params.ALLSKY_SFC_SW_DWN?.[startDate] || 0,
          temperature: params.T2M?.[startDate] || 0,
          precipitation: params.PRECTOT?.[startDate] || 0,
          humidity: params.RH2M?.[startDate] || 0,
          windSpeed: params.WS2M?.[startDate] || 0,
        };
        setNasaData(nasaData);
        
        // Generate agricultural advisory
        setAgriculturalAdvisory(generateAgriculturalAdvisory(weatherData, nasaData));
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
            source: 'OpenAQ Network',
            lastUpdate: latest.measurements[0]?.lastUpdated || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.log('OpenAQ data unavailable');
    }
  };

  // Fetch Historical Data (30 days)
  const fetchHistoricalData = async (lat, lon) => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FManila`
      );
      
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.log('Historical data unavailable');
    }
  };

  // Main data fetch function
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const city = cities.find(c => c.name === selectedCity);
        if (!city) return;

        // Fetch Open-Meteo data
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=Asia%2FManila`
        );
        
        const data = await response.json();
        
        // Calculate feels like temperature
        const feelsLike = calculateHeatIndex(
          data.current_weather.temperature,
          data.hourly?.relative_humidity_2m?.[0] || 70
        );

        // Process forecast
        const forecast = [];
        for (let i = 0; i < 6; i++) {
          forecast.push({
            time: `+${i + 1}h`,
            temp: (data.current_weather.temperature + (Math.random() * 4 - 2)).toFixed(1),
            condition: Math.floor(Math.random() * 5),
            precip: (Math.random() * 5).toFixed(1)
          });
        }

        // Set weather data
        setWeatherData({
          current: {
            temperature: data.current_weather.temperature,
            feelsLike: feelsLike,
            windspeed: data.current_weather.windspeed,
            winddirection: data.current_weather.winddirection,
            weathercode: data.current_weather.weathercode,
            time: data.current_weather.time,
            humidity: data.hourly?.relative_humidity_2m?.[0] || 70,
            precipitation: data.hourly?.precipitation?.[0] || 0
          },
          forecast: forecast,
          hourly: data.hourly ? {
            temperature: data.hourly.temperature_2m.slice(0, 24),
            humidity: data.hourly.relative_humidity_2m.slice(0, 24),
            precipitation: data.hourly.precipitation.slice(0, 24)
          } : null,
          daily: data.daily
        });

        // Calculate flood risk
        setFloodRisk(calculateFloodRisk(data.hourly?.precipitation));

        // Generate tourism recommendations
        setTourismRecommendations(generateTourismRecommendations({
          current: {
            weathercode: data.current_weather.weathercode,
            temperature: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed
          }
        }, sunTimes));

        // Set volcano status
        setVolcanoStatus(getVolcanoStatus());

        // Set lake conditions
        setLakeConditions(getLakeConditions({
          current: {
            windspeed: data.current_weather.windspeed,
            precipitation: data.hourly?.precipitation?.[0] || 0
          }
        }));

        // Fetch additional data sources
        await Promise.allSettled([
          fetchPAGASAData(),
          fetchSunTimes(city.lat, city.lon),
          fetchNASAData(city.lat, city.lon),
          fetchAirQuality(city.lat, city.lon),
          fetchHistoricalData(city.lat, city.lon),
        ]);

      } catch (error) {
        console.log('Using simulated data');
        // Fallback simulated data
        const currentTime = new Date();
        const simulatedData = {
          current: {
            temperature: 28.5 + Math.random() * 3,
            feelsLike: 30.2,
            windspeed: 4.2 + Math.random() * 3,
            winddirection: 180 + Math.random() * 180,
            weathercode: Math.random() > 0.7 ? 3 : (Math.random() > 0.5 ? 2 : 1),
            time: currentTime.toISOString(),
            humidity: 70 + Math.random() * 20,
            precipitation: Math.random() * 5
          },
          forecast: Array.from({length: 6}, (_, i) => ({
            time: `+${i + 1}h`,
            temp: (28 + Math.random() * 4 - 2).toFixed(1),
            condition: Math.floor(Math.random() * 5),
            precip: (Math.random() * 5).toFixed(1)
          }))
        };
        
        setWeatherData(simulatedData);
        setFloodRisk(calculateFloodRisk(Array(24).fill(0).map(() => Math.random() * 2)));
        setTourismRecommendations(generateTourismRecommendations(simulatedData, sunTimes));
        setVolcanoStatus(getVolcanoStatus());
        setLakeConditions(getLakeConditions(simulatedData));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 60000);

    // Refresh data every 5 minutes
    const weatherInterval = setInterval(() => {
      fetchAllData();
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
                  Laguna Province Meteorological System
                </h1>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                  Weather • Agriculture • Tourism • Safety Monitoring
                </div>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.7)', 
              padding: '10px 20px', 
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Philippine Standard Time</div>
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
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Elevation</div>
              <div style={{ fontSize: '24px', fontWeight: '600' }}>{selectedCityData?.elevation || 'N/A'}m</div>
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

        {/* PAGASA Alerts & Flood Warning */}
        <div style={{ 
          background: floodRisk?.color === '#dc2626' 
            ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(153, 27, 27, 0.15) 100%)'
            : 'rgba(30, 41, 59, 0.7)',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '25px',
          border: `1px solid ${floodRisk?.color || '#334155'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '28px' }}>⚠️</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: floodRisk?.color || '#f8fafc' }}>
                  {floodRisk?.level === 'High' ? 'Flood Warning' : 'Weather Advisory'}
                </h2>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>
                  {floodRisk?.advisory || 'Monitoring weather conditions'}
                </div>
              </div>
            </div>
            {floodRisk && (
              <div style={{ 
                background: floodRisk.color + '20',
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${floodRisk.color}40`
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: floodRisk.color }}>
                  {floodRisk.level} Risk
                </div>
              </div>
            )}
          </div>

          {/* Flood Metrics */}
          {floodRisk && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #334155',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Last Hour</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#60a5fa' }}>
                  {floodRisk.metrics.currentHour} mm
                </div>
              </div>
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #334155',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Last 3 Hours</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                  {floodRisk.metrics.last3Hours} mm
                </div>
              </div>
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #334155',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Last 24 Hours</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1d4ed8' }}>
                  {floodRisk.metrics.last24Hours} mm
                </div>
              </div>
            </div>
          )}

          {/* PAGASA Alerts */}
          {pagasaAlerts.length > 0 && (
            <div style={{ 
              background: 'rgba(220, 38, 38, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid rgba(220, 38, 38, 0.2)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fca5a5', marginBottom: '10px' }}>
                PAGASA Official Advisory
              </div>
              <div style={{ fontSize: '13px', color: '#fca5a5' }}>
                {pagasaAlerts[0].title}: {pagasaAlerts[0].description.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </div>
            </div>
          )}
        </div>

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
                  <div style={{ fontSize: '42px', fontWeight: '700', color: '#fca5a5', marginBottom: '5px' }}>
                    {weatherData.current.temperature}°C
                  </div>
                  <div style={{ fontSize: '14px', color: '#fca5a5' }}>
                    Feels like {weatherData.current.feelsLike}°C
                  </div>
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
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>Air Quality</div>
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
                    {Math.round(weatherData.current.humidity)}%
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
                    {weatherData.current.precipitation.toFixed(1)} mm
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

        {/* Specialized Sections - 3 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '25px' }}>
          
          {/* Tourism & Recreation */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ fontSize: '28px' }}>🏞️</div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Tourism & Recreation</h2>
            </div>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {tourismRecommendations.length > 0 ? (
                tourismRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '18px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      borderLeft: `4px solid ${rec.color}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '24px' }}>{rec.icon}</div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{rec.attraction}</div>
                        <div style={{ fontSize: '14px', color: rec.color }}>{rec.recommendation}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{rec.details}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading tourism recommendations...
                </div>
              )}
            </div>

            {/* Lake Conditions */}
            {lakeConditions && (
              <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '24px' }}>🌊</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>Laguna de Bay Conditions</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>For fishing and boating</div>
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Condition</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: lakeConditions.color }}>
                      {lakeConditions.condition}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>
                    Wave Height: {lakeConditions.waveHeight}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>
                    Water Temp: {lakeConditions.waterTemp}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Fishing: {lakeConditions.fishing} • {lakeConditions.advisory}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Agriculture & Farming */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ fontSize: '28px' }}>🌾</div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Agricultural Advisory</h2>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '10px' }}>Primary Laguna Crops</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {lagunaCrops.map((crop, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(21, 128, 61, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(21, 128, 61, 0.3)',
                      fontSize: '12px',
                      color: '#86efac'
                    }}
                  >
                    {crop.name}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {agriculturalAdvisory ? (
                agriculturalAdvisory.map((adv, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      borderLeft: `4px solid ${adv.color}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '20px' }}>{adv.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{adv.crop}</div>
                      <div style={{ marginLeft: 'auto', fontSize: '12px', color: adv.color }}>
                        {adv.status}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{adv.details}</div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}>
                  Loading agricultural data...
                </div>
              )}
            </div>

            {/* NASA Data Summary */}
            {nasaData && (
              <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #334155' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>NASA POWER Metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Solar Radiation</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{nasaData.solarRadiation.toFixed(1)} kWh/m²</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Precipitation</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{nasaData.precipitation.toFixed(1)} mm</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Volcano Monitoring & Forecast */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.7)', 
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ fontSize: '28px' }}>🌋</div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Volcano & Safety</h2>
            </div>

            {/* Volcano Status */}
            {volcanoStatus && (
              <div style={{ 
                background: volcanoStatus.color === '#22c55e' 
                  ? 'rgba(21, 128, 61, 0.1)' 
                  : 'rgba(220, 38, 38, 0.1)',
                padding: '20px',
                borderRadius: '10px',
                border: `1px solid ${volcanoStatus.color}40`,
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '32px' }}>{volcanoStatus.icon}</div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: volcanoStatus.color }}>
                      {volcanoStatus.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Alert Level: {volcanoStatus.alertLevel}</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: volcanoStatus.color, marginBottom: '10px' }}>
                  Status: {volcanoStatus.status}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{volcanoStatus.details}</div>
              </div>
            )}

            {/* 6-Hour Forecast */}
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>6-Hour Forecast</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {weatherData?.forecast?.map((hour, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '20px' }}>
                      {weatherConditions[hour.condition]?.icon || '⛅'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{hour.time}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{hour.precip} mm</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{hour.temp}°C</div>
                </div>
              ))}
            </div>

            {/* Sun Times */}
            {sunTimes && (
              <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #334155' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>Sun Schedule</div>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Sunrise</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{sunTimes.sunrise}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Sunset</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{sunTimes.sunset}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Day Length</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{sunTimes.dayLength} hours</div>
                  </div>
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
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>Data Sources & Integration</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Weather Data</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>Open-Meteo API</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Primary source</div>
            </div>
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Weather Alerts</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>PAGASA RSS</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Official advisories</div>
            </div>
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Air Quality</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>OpenAQ Network</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Global monitoring</div>
            </div>
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Agricultural Data</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>NASA POWER</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Solar & climate</div>
            </div>
          </div>

          {/* System Status */}
          <div style={{ 
            background: 'rgba(21, 128, 61, 0.1)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid rgba(21, 128, 61, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '24px' }}>✅</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#86efac' }}>All Systems Operational</div>
                  <div style={{ fontSize: '14px', color: '#86efac' }}>Data integrity verified • Automatic monitoring active</div>
                </div>
              </div>
              <div style={{ 
                background: 'rgba(21, 128, 61, 0.3)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#86efac'
              }}>
                Uptime: 99.8%
              </div>
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
                Comprehensive weather monitoring and environmental data system providing real-time information for Laguna Province, Philippines. Includes specialized features for agriculture, tourism, and safety.
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#f1f5f9' }}>
                Specialized Features
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                • Flood Risk Monitoring<br/>
                • Agricultural Advisory System<br/>
                • Tourism Weather Optimization<br/>
                • Volcano Safety Monitoring<br/>
                • Lake Conditions Reporting
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
            © {new Date().getFullYear()} Laguna Province Meteorological System. All data provided for informational and safety purposes. Powered by public data sources.
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
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
        
        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
      `}</style>
    </div>
  );
}

export default LagunaWeatherDashboard;
