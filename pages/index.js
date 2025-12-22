import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import {
  WiThermometer, WiHumidity, WiStrongWind,
  WiBarometer, WiRain, WiDaySunny,
  WiCloudy, WiRainWind, WiDayCloudy, WiDust
} from 'react-icons/wi';
import {
  FaMapMarkerAlt, FaEarthAmericas, FaVolcano,
  FaMobileAlt, FaWind, FaTemperatureHigh,
  FaTint, FaCompressAlt, FaCloudRain,
  FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';

// Dynamic imports for performance
const MapClient = dynamic(() => import('../components/MapClient'), {
  ssr: false,
  loading: () => <LoadingSpinner text="Loading Map..." />
});

const LoadingSpinner = ({ text }) => (
  <div className="h-[300px] md:h-[400px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <div className="text-gray-400 mt-2">{text || "Loading..."}</div>
    </div>
  </div>
);

// Laguna Province Municipalities and Cities (31 LGUs)
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

// Important landmarks
const LANDMARKS = [
  { id: 'makiling', name: 'Mount Makiling', lat: 14.1306, lon: 121.1933, type: 'volcano' },
  { id: 'banahaw', name: 'Mount Banahaw', lat: 14.0667, lon: 121.4833, type: 'volcano' },
  { id: 'laguna_lake', name: 'Laguna de Bay', lat: 14.3167, lon: 121.2167, type: 'lake' },
  { id: 'pagsanjan_falls', name: 'Pagsanjan Falls', lat: 14.2700, lon: 121.4567, type: 'waterfall' }
];

export default function Home() {
  const [selected, setSelected] = useState(LGUS[0]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [airQuality, setAirQuality] = useState(null);
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch ALL weather data from FREE APIs
  useEffect(() => {
    async function fetchAllWeatherData() {
      setLoading(true);
      try {
        // 1. Open-Meteo API (FREE - no key required)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FManila&forecast_days=3`;
        
        // 2. Air Quality API (FREE - no key required)
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selected.lat}&longitude=${selected.lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=Asia%2FManila`;
        
        // 3. Earthquakes API (FREE - no key required)
        const quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

        // Fetch all data in parallel
        const [weatherRes, aqiRes, quakeRes] = await Promise.allSettled([
          axios.get(weatherUrl),
          axios.get(aqiUrl),
          axios.get(quakeUrl)
        ]);

        // Process weather data
        if (weatherRes.status === 'fulfilled' && weatherRes.value.data) {
          const data = weatherRes.value.data;
          
          // Current weather
          setWeather({
            temperature: data.current.temperature_2m,
            feels_like: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            pressure: data.current.pressure_msl,
            windSpeed: data.current.wind_speed_10m,
            windDirection: data.current.wind_direction_10m,
            windGust: data.current.wind_gusts_10m,
            precipitation: data.current.precipitation,
            rain: data.current.rain,
            showers: data.current.showers,
            weatherCode: data.current.weather_code,
            cloudCover: data.current.cloud_cover,
            time: data.current.time
          });

          // Forecast data
          if (data.hourly) {
            const hourlyData = [];
            for (let i = 0; i < Math.min(24, data.hourly.time.length); i++) {
              hourlyData.push({
                time: data.hourly.time[i],
                temp: data.hourly.temperature_2m[i],
                humidity: data.hourly.relative_humidity_2m[i],
                precipitation: data.hourly.precipitation[i],
                precipitationProbability: data.hourly.precipitation_probability[i],
                weatherCode: data.hourly.weather_code[i],
                windSpeed: data.hourly.wind_speed_10m[i]
              });
            }
            setForecast(hourlyData);
          }
        }

        // Process air quality data
        if (aqiRes.status === 'fulfilled' && aqiRes.value.data) {
          const aqiData = aqiRes.value.data;
          if (aqiData.hourly && aqiData.hourly.us_aqi) {
            const latestIndex = aqiData.hourly.us_aqi.length - 1;
            setAirQuality({
              aqi: aqiData.hourly.us_aqi[latestIndex],
              pm25: aqiData.hourly.pm2_5[latestIndex],
              pm10: aqiData.hourly.pm10[latestIndex],
              co: aqiData.hourly.carbon_monoxide[latestIndex],
              no2: aqiData.hourly.nitrogen_dioxide[latestIndex],
              so2: aqiData.hourly.sulphur_dioxide[latestIndex],
              o3: aqiData.hourly.ozone[latestIndex],
              time: aqiData.hourly.time[latestIndex]
            });
          }
        }

        // Process earthquake data
        if (quakeRes.status === 'fulfilled' && quakeRes.value.data) {
          const feats = quakeRes.value.data.features || [];
          const lagunaQuakes = feats
            .map(f => {
              const [lon, lat, depth] = f.geometry.coordinates;
              return {
                id: f.id,
                mag: f.properties.mag,
                place: f.properties.place,
                time: f.properties.time,
                lat, lon, depth,
                url: f.properties.url
              };
            })
            .filter(quake => 
              quake.lat >= 13.5 && quake.lat <= 15.0 &&
              quake.lon >= 120.5 && quake.lon <= 122.0
            )
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);
          
          setEarthquakes(lagunaQuakes);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllWeatherData();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchAllWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selected]);

  // Helper functions
  const getWeatherIcon = (code) => {
    const icons = {
      0: '☀️',  // Clear sky
      1: '🌤️',  // Mainly clear
      2: '⛅',  // Partly cloudy
      3: '☁️',  // Overcast
      45: '🌫️', // Fog
      48: '🌫️', // Depositing rime fog
      51: '🌦️', // Light drizzle
      53: '🌦️', // Moderate drizzle
      55: '🌧️', // Dense drizzle
      61: '🌧️', // Slight rain
      63: '🌧️', // Moderate rain
      65: '🌧️', // Heavy rain
      71: '❄️',  // Slight snow
      73: '❄️',  // Moderate snow
      75: '❄️',  // Heavy snow
      80: '🌦️', // Slight rain showers
      81: '🌧️', // Moderate rain showers
      82: '🌧️', // Violent rain showers
      95: '⛈️',  // Thunderstorm
      96: '⛈️',  // Thunderstorm with hail
      99: '⛈️'   // Heavy thunderstorm with hail
    };
    return icons[code] || '🌤️';
  };

  const getAqiLevel = (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: 'bg-green-500', text: 'text-green-600', desc: 'Air quality is satisfactory' };
    if (aqi <= 100) return { level: 'Moderate', color: 'bg-yellow-500', text: 'text-yellow-600', desc: 'Acceptable air quality' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'bg-orange-500', text: 'text-orange-600', desc: 'Sensitive groups affected' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'bg-red-500', text: 'text-red-600', desc: 'Everyone affected' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'bg-purple-500', text: 'text-purple-600', desc: 'Health warnings' };
    return { level: 'Hazardous', color: 'bg-red-800', text: 'text-red-800', desc: 'Health emergency' };
  };

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Light rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Light snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Light rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Heavy thunderstorm'
    };
    return descriptions[code] || 'Unknown';
  };

  const aqiInfo = airQuality ? getAqiLevel(airQuality.aqi) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Laguna Free Weather Dashboard
                </h1>
                <p className="text-xs md:text-sm text-gray-600 flex items-center">
                  <FaInfoCircle className="mr-1" /> 
                  100% Free APIs • No Keys Required • Mobile Ready
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-xs md:text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                🌱 Completely Free
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-4 py-4">
        {/* Location Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center mb-3">
            <FaMapMarkerAlt className="text-blue-600 mr-2 text-lg" />
            <h2 className="font-bold text-gray-800 text-lg">Select Laguna Location</h2>
          </div>
          <select 
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
            value={selected.id}
            onChange={e => setSelected(LGUS.find(g => g.id === e.target.value))}
          >
            <optgroup label="🏛️ Cities">
              {LGUS.filter(l => l.type === 'city' || l.type === 'capital').map(g => (
                <option key={g.id} value={g.id}>
                  {g.type === 'capital' ? '🏛️ ' : '🏙️ '}{g.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="🏘️ Municipalities">
              {LGUS.filter(l => l.type === 'municipality').map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </optgroup>
          </select>
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Selected: <span className="font-semibold text-blue-600">{selected.name}</span>
            </div>
            <div className="text-xs text-gray-500">
              Lat: {selected.lat.toFixed(4)}, Lon: {selected.lon.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Weather Data */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Weather */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg flex items-center">
                  <WiThermometer className="text-red-500 mr-2 text-xl" />
                  Current Weather
                </h3>
                {weather && (
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">{getWeatherIcon(weather.weatherCode)}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(weather.time).toLocaleTimeString('en-PH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {loading ? (
                <LoadingSpinner text="Loading weather data..." />
              ) : weather ? (
                <>
                  {/* Main Weather Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {/* Temperature */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
                      <div className="flex items-center">
                        <FaTemperatureHigh className="text-red-500 text-2xl mr-3" />
                        <div>
                          <div className="text-xs text-gray-600">Temperature</div>
                          <div className="text-2xl font-bold text-gray-800">{weather.temperature}°C</div>
                          <div className="text-xs text-gray-500">Feels like {weather.feels_like}°C</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Humidity */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center">
                        <FaTint className="text-blue-500 text-2xl mr-3" />
                        <div>
                          <div className="text-xs text-gray-600">Humidity</div>
                          <div className="text-2xl font-bold text-gray-800">{weather.humidity}%</div>
                          <div className="text-xs text-gray-500">Clouds: {weather.cloudCover}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wind */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                      <div className="flex items-center">
                        <FaWind className="text-green-500 text-2xl mr-3" />
                        <div>
                          <div className="text-xs text-gray-600">Wind</div>
                          <div className="text-2xl font-bold text-gray-800">{weather.windSpeed} m/s</div>
                          <div className="text-xs text-gray-500">Gusts: {weather.windGust} m/s</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pressure */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <FaCompressAlt className="text-purple-500 text-2xl mr-3" />
                        <div>
                          <div className="text-xs text-gray-600">Pressure</div>
                          <div className="text-2xl font-bold text-gray-800">{weather.pressure} hPa</div>
                          <div className="text-xs text-gray-500">Sea level</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weather Details */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-800 capitalize">
                          {getWeatherDescription(weather.weatherCode)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Precipitation: {weather.precipitation} mm • Rain: {weather.rain} mm
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Wind Direction: {weather.windDirection}°
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date().toLocaleTimeString('en-PH')}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-2">Unable to load weather data</div>
                  <div className="text-sm">Please try again in a moment</div>
                </div>
              )}
            </div>

            {/* Air Quality */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                <WiDust className="text-gray-600 mr-2" />
                Air Quality Index (AQI)
              </h3>
              {airQuality ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${aqiInfo?.color} bg-opacity-10 border ${aqiInfo?.text.replace('text-', 'border-')} border-opacity-30`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-600">Current AQI Level</div>
                        <div className={`text-3xl font-bold ${aqiInfo?.text}`}>{airQuality.aqi}</div>
                        <div className={`font-semibold ${aqiInfo?.text}`}>{aqiInfo?.level}</div>
                        <div className="text-sm text-gray-600 mt-1">{aqiInfo?.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Updated Hourly</div>
                        <div className="text-xs text-gray-500">via Open-Meteo</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pollution Components */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">PM2.5</div>
                      <div className="font-semibold">{airQuality.pm25?.toFixed(1)} µg/m³</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">PM10</div>
                      <div className="font-semibold">{airQuality.pm10?.toFixed(1)} µg/m³</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">CO</div>
                      <div className="font-semibold">{airQuality.co?.toFixed(1)} µg/m³</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">NO₂</div>
                      <div className="font-semibold">{airQuality.no2?.toFixed(1)} µg/m³</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">SO₂</div>
                      <div className="font-semibold">{airQuality.so2?.toFixed(1)} µg/m³</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">O₃</div>
                      <div className="font-semibold">{airQuality.o3?.toFixed(1)} µg/m³</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Air quality data loading...
                </div>
              )}
            </div>

            {/* 24-Hour Forecast */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4">24-Hour Forecast</h3>
              <div className="overflow-x-auto">
                <div className="flex space-x-3 pb-4 min-w-max">
                  {forecast.map((hour, i) => (
                    <div key={hour.time} className="flex-shrink-0 w-28 bg-gradient-to-b from-blue-50 to-white p-3 rounded-xl border border-blue-100">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-800">
                          {i === 0 ? 'Now' : new Date(hour.time).toLocaleTimeString('en-PH', {
                            hour: '2-digit',
                            hour12: false
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(hour.time).toLocaleDateString('en-PH', {
                            weekday: 'short'
                          })}
                        </div>
                        <div className="text-3xl mb-2">
                          {getWeatherIcon(hour.weatherCode)}
                        </div>
                        <div className="text-xl font-bold text-blue-600">{hour.temp}°C</div>
                        <div className="text-xs text-gray-600 mt-1">
                          💧 {hour.precipitationProbability || 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          💨 {hour.windSpeed} m/s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map & Alerts */}
          <div className="space-y-4">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                <FaEarthAmericas className="text-green-600 mr-2" />
                Laguna Province Map
              </h3>
              <div className="h-[300px] md:h-[350px] rounded-xl overflow-hidden">
                <MapClient 
                  center={{ lat: selected.lat, lon: selected.lon }} 
                  cities={LGUS} 
                  quakes={earthquakes} 
                  landmarks={LANDMARKS}
                  selectedCity={selected}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Municipalities</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span>Earthquakes</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                  <span>Landmarks</span>
                </div>
              </div>
            </div>

            {/* Recent Earthquakes */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-lg">Recent Earthquakes</h3>
                <div className="text-xs text-gray-500">
                  Last 48 hours
                </div>
              </div>
              <div className="max-h-[250px] overflow-y-auto pr-2">
                {earthquakes.length > 0 ? (
                  earthquakes.map(quake => (
                    <div key={quake.id} className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-800">
                              M{quake.mag.toFixed(1)}
                            </span>
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              quake.mag >= 5 ? 'bg-red-100 text-red-800' :
                              quake.mag >= 4 ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {quake.mag >= 5 ? 'Strong' : quake.mag >= 4 ? 'Moderate' : 'Light'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 truncate max-w-[180px]">
                            {quake.place}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(quake.time).toLocaleTimeString('en-PH')}
                          </div>
                        </div>
                        <a 
                          href={quake.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs whitespace-nowrap"
                        >
                          Details
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent earthquakes in Laguna area
                  </div>
                )}
              </div>
            </div>

            {/* Free APIs Info */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-4 border border-blue-100">
              <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-center">
                <FaInfoCircle className="text-blue-600 mr-2" />
                Free APIs Used
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">Open-Meteo</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    ✓ Free
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">USGS Earthquakes</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    ✓ Free
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">Air Quality API</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    ✓ Free
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-700">OpenStreetMap</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    ✓ Free
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Alert */}
            {isMobile && (
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center">
                  <FaMobileAlt className="text-blue-600 mr-2" />
                  <div className="text-sm text-blue-800">
                    <span className="font-semibold">Mobile Optimized:</span> Fully responsive design
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="mb-2">
              🌍 <strong>Laguna Free Weather Dashboard</strong> • 100% Free APIs • No Keys Required
            </p>
            <p className="mb-2">
              APIs: Open-Meteo • USGS • OpenStreetMap • Air Quality API
            </p>
            <p className="text-xs">
              Mobile Ready • Auto-refresh every 10 minutes • Deploy on Vercel for free
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 z-50">
          <div className="flex justify-around">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center text-blue-600"
            >
              <WiThermometer className="text-xl" />
              <span className="text-xs mt-1">Weather</span>
            </button>
            <button 
              onClick={() => {
                const element = document.querySelector('[class*="Air Quality"]');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center text-green-600"
            >
              <WiDust className="text-xl" />
              <span className="text-xs mt-1">Air Quality</span>
            </button>
            <button 
              onClick={() => {
                const element = document.querySelector('[class*="Recent Earthquakes"]');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center text-red-600"
            >
              <FaEarthAmericas className="text-xl" />
              <span className="text-xs mt-1">Earthquakes</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
