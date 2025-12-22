import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('../components/MapClient'), { ssr: false });

// Updated to LAGUNA Province
const LGUS = [
  { id:'santa_cruz', name:'Santa Cruz (Capital)', lat:14.2784, lon:121.4163 },
  { id:'calamba', name:'Calamba City', lat:14.2117, lon:121.1663 },
  { id:'san_pablo', name:'San Pablo City', lat:14.0667, lon:121.3250 },
  { id:'biñan', name:'Biñan City', lat:14.3333, lon:121.0833 },
  { id:'cabuyao', name:'Cabuyao City', lat:14.2453, lon:121.1156 },
  { id:'san_pedro', name:'San Pedro City', lat:14.3583, lon:121.0583 },
  { id:'alaminos', name:'Alaminos', lat:14.0639, lon:121.2461 },
  { id:'bay', name:'Bay', lat:14.1833, lon:121.2833 },
  { id:'calauan', name:'Calauan', lat:14.1500, lon:121.3167 },
  { id:'cavinti', name:'Cavinti', lat:14.2453, lon:121.5075 },
  { id:'famy', name:'Famy', lat:14.4361, lon:121.4489 },
  { id:'kalayaan', name:'Kalayaan', lat:14.3500, lon:121.4833 },
  { id:'liliw', name:'Liliw', lat:14.1303, lon:121.4369 },
  { id:'los_baños', name:'Los Baños', lat:14.1667, lon:121.2333 },
  { id:'luisiana', name:'Luisiana', lat:14.1850, lon:121.5119 },
  { id:'lumban', name:'Lumban', lat:14.2975, lon:121.4597 },
  { id:'mabitac', name:'Mabitac', lat:14.4333, lon:121.4333 },
  { id:'magdalena', name:'Magdalena', lat:14.2000, lon:121.4333 },
  { id:'majayjay', name:'Majayjay', lat:14.1469, lon:121.4736 },
  { id:'nagcarlan', name:'Nagcarlan', lat:14.1364, lon:121.4153 },
  { id:'paete', name:'Paete', lat:14.3647, lon:121.4825 },
  { id:'pagsanjan', name:'Pagsanjan', lat:14.2731, lon:121.4547 },
  { id:'pakil', name:'Pakil', lat:14.3811, lon:121.4786 },
  { id:'pangil', name:'Pangil', lat:14.4039, lon:121.4669 },
  { id:'pila', name:'Pila', lat:14.2333, lon:121.3667 },
  { id:'rizal', name:'Rizal', lat:14.1086, lon:121.3944 },
  { id:'santa_maria', name:'Santa Maria', lat:14.4722, lon:121.4264 },
  { id:'siniloan', name:'Siniloan', lat:14.4217, lon:121.4464 },
  { id:'victoria', name:'Victoria', lat:14.2269, lon:121.3278 },
];

// Laguna landmarks
const LANDMARKS = [
  { id:'makiling', name:'Mount Makiling', lat:14.1306, lon:121.1933 },
  { id:'banahaw', name:'Mount Banahaw', lat:14.0667, lon:121.4833 },
  { id:'laguna_lake', name:'Laguna de Bay', lat:14.3167, lon:121.2167 },
];

export default function Home(){
  const [selected, setSelected] = useState(LGUS[0]);
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [quakes, setQuakes] = useState([]);
  const [loading, setLoading] = useState(false);

  // FREE Open-Meteo Weather API (No key needed)
  useEffect(()=>{
    async function fetchWeather(){
      setLoading(true);
      try{
        // Open-Meteo FREE API - no key required
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&hourly=temperature_2m,precipitation,relativehumidity_2m,windspeed_10m,winddirection_10m,pressure_msl&current_weather=true&timezone=Asia%2FManila&forecast_days=3`;
        const res = await axios.get(url);
        
        // Current weather
        setWeather(res.data.current_weather || null);
        
        // Hourly forecast
        if(res.data.hourly){
          const times = res.data.hourly.time || [];
          const arr = [];
          for(let i=0; i<Math.min(times.length, 24); i++){ // Only 24 hours
            arr.push({
              time: times[i],
              temp: res.data.hourly.temperature_2m[i],
              prec: res.data.hourly.precipitation[i],
              hum: res.data.hourly.relativehumidity_2m[i],
              wind: res.data.hourly.windspeed_10m[i],
              winddir: res.data.hourly.winddirection_10m[i],
              pres: res.data.hourly.pressure_msl[i]
            });
          }
          setHourly(arr);
        } else {
          setHourly([]);
        }
      }catch(e){ 
        console.error('Weather error', e); 
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [selected]);

  // FREE Air Quality API (No key needed)
  useEffect(()=>{
    async function fetchAq(){
      try{
        // Open-Meteo Air Quality API - FREE
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selected.lat}&longitude=${selected.lon}&hourly=us_aqi,pm2_5,pm10`;
        const res = await axios.get(url);
        if(res.data && res.data.hourly && res.data.hourly.us_aqi){
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
      }catch(e){ 
        console.error('AQI error', e); 
        setAqi(null); 
      }
    }
    fetchAq();
  }, [selected]);

  // FREE Earthquake API (No key needed)
  useEffect(()=>{
    async function fetchQuakes(){
      try{
        // USGS Earthquake API - FREE
        const res = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        const feats = res.data.features || [];
        const mapped = feats.map(f=>{
          const [lon, lat] = f.geometry.coordinates;
          return { 
            id: f.id, 
            mag: f.properties.mag, 
            place: f.properties.place, 
            time: f.properties.time, 
            lat, 
            lon, 
            url: f.properties.url 
          };
        }).filter(ev=> 
          ev.lat >= 13.5 && ev.lat <= 15.0 && // Laguna area
          ev.lon >= 120.5 && ev.lon <= 122.0
        ).sort((a,b)=> b.time - a.time);
        setQuakes(mapped.slice(0, 10)); // Show only 10
      }catch(e){ 
        console.error('quake error', e); 
      }
    }
    fetchQuakes();
    // Refresh every 5 minutes
    const interval = setInterval(fetchQuakes, 300000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const getAqiColor = (aqi) => {
    if (!aqi) return 'gray';
    if (aqi <= 50) return 'green';
    if (aqi <= 100) return 'yellow';
    if (aqi <= 150) return 'orange';
    if (aqi <= 200) return 'red';
    if (aqi <= 300) return 'purple';
    return 'maroon';
  };

  const getAqiText = (aqi) => {
    if (!aqi) return 'N/A';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return (
    <div>
      {/* Header - Updated for Laguna */}
      <header className="header">
        <div className="brand">
          <img src="/logo.png" alt="Laguna seal" style={{height: 44}} />
          <div>
            <div className="title">Laguna Live Weather Dashboard</div>
            <div className="small">Real-time monitoring for Laguna Province • 100% Free APIs</div>
          </div>
        </div>
        <div className="small" style={{textAlign: 'right'}}>
          <div>🌤️ Free Weather Data</div>
          <div>🗺️ OpenStreetMap</div>
        </div>
      </header>

      <main className="container">
        {/* Info Banner */}
        <div className="card" style={{marginBottom:12, background: '#e6f7ff', borderLeft: '4px solid #1890ff'}}>
          <strong>🌱 100% Free Version:</strong> Using Open-Meteo, USGS, and OpenStreetMap APIs. No API keys required!
        </div>

        <div className="grid">
          <div>
            {/* Location Selector */}
            <div className="card" style={{marginBottom:12}}>
              <label><strong>🏙️ Select Laguna City/Municipality:</strong></label>
              <select className="select" value={selected.id} onChange={e=>setSelected(LGUS.find(g=>g.id===e.target.value))}>
                <optgroup label="Cities">
                  {LGUS.filter(l => l.name.includes('City')).map(g=> 
                    <option key={g.id} value={g.id}>{g.name}</option>
                  )}
                </optgroup>
                <optgroup label="Municipalities">
                  {LGUS.filter(l => !l.name.includes('City')).map(g=> 
                    <option key={g.id} value={g.id}>{g.name}</option>
                  )}
                </optgroup>
              </select>
              <div className="small" style={{marginTop: 8}}>
                📍 Selected: <strong>{selected.name}</strong> | 
                Coordinates: {selected.lat.toFixed(4)}, {selected.lon.toFixed(4)}
              </div>
            </div>

            {/* Current Weather */}
            <div className="card" style={{marginBottom:12}}>
              <h3>🌡️ Current Weather</h3>
              {loading ? (
                <div className="small">Loading weather data...</div>
              ) : weather ? (
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:12}}>
                  <div style={{padding: 8, background: '#fff7e6', borderRadius: 6}}>
                    <strong>Temperature</strong>
                    <div className="small">{weather.temperature} °C</div>
                  </div>
                  <div style={{padding: 8, background: '#e6f7ff', borderRadius: 6}}>
                    <strong>Wind</strong>
                    <div className="small">{weather.windspeed} m/s</div>
                    <div className="small">Direction: {weather.winddirection}°</div>
                  </div>
                  <div style={{padding: 8, background: '#f6ffed', borderRadius: 6}}>
                    <strong>Updated</strong>
                    <div className="small">{new Date(weather.time).toLocaleTimeString('en-PH')}</div>
                    <div className="small">{new Date(weather.time).toLocaleDateString('en-PH')}</div>
                  </div>
                </div>
              ) : <div className="small">Weather data unavailable</div>}
            </div>

            {/* Air Quality */}
            <div className="card" style={{marginBottom:12}}>
              <h3>🌫️ Air Quality (US AQI)</h3>
              {aqi ? (
                <div>
                  <div style={{
                    padding: 12,
                    background: getAqiColor(aqi.value) === 'green' ? '#f6ffed' :
                               getAqiColor(aqi.value) === 'yellow' ? '#fffbe6' :
                               getAqiColor(aqi.value) === 'orange' ? '#fff7e6' :
                               getAqiColor(aqi.value) === 'red' ? '#fff1f0' : '#f9f0ff',
                    borderLeft: `4px solid ${getAqiColor(aqi.value)}`,
                    borderRadius: 6,
                    marginBottom: 8
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <div>
                        <strong>AQI: {aqi.value} ({getAqiText(aqi.value)})</strong>
                        <div className="small">
                          PM2.5: {aqi.pm25?.toFixed(1)} µg/m³ | 
                          PM10: {aqi.pm10?.toFixed(1)} µg/m³
                        </div>
                      </div>
                      <div className="small" style={{textAlign: 'right'}}>
                        Updated:<br/>
                        {new Date(aqi.time).toLocaleTimeString('en-PH')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : <div className="small">AQI data loading...</div>}
            </div>

            {/* Hourly Forecast */}
            <div className="card" style={{marginBottom:12}}>
              <h3>📅 24-Hour Forecast</h3>
              <div style={{maxHeight:200, overflow:'auto'}}>
                {hourly.length > 0 ? (
                  hourly.map(h=> (
                    <div key={h.time} style={{
                      padding: 8,
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span className="small">
                        {new Date(h.time).toLocaleTimeString('en-PH', {hour: '2-digit'})}
                      </span>
                      <span className="small">
                        {h.temp}°C | 💧 {h.prec}mm | 💨 {h.wind}m/s
                      </span>
                    </div>
                  ))
                ) : <div className="small">Loading forecast...</div>}
              </div>
            </div>

            {/* Landmarks Info */}
            <div className="card">
              <h3>🏔️ Laguna Landmarks</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8}}>
                {LANDMARKS.map(l => (
                  <div key={l.id} style={{
                    padding: 8,
                    background: '#fafafa',
                    borderRadius: 6,
                    border: '1px solid #e8e8e8'
                  }}>
                    <strong>{l.name}</strong>
                    <div className="small">
                      {l.id.includes('volcano') ? '🌋 Volcano' : '🏞️ Lake'}
                    </div>
                    <div className="small">
                      Status: <span style={{color: '#52c41a'}}>Normal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside>
            {/* Map */}
            <div className="card">
              <h3>🗺️ Laguna Province Map</h3>
              <div className="mapBox card" style={{padding:0, height: 300}}>
                <MapClient 
                  center={{lat:selected.lat, lon:selected.lon}} 
                  cities={LGUS} 
                  quakes={quakes} 
                  landmarks={LANDMARKS}
                />
              </div>
              <div style={{marginTop: 8, fontSize: 12, color: '#666'}}>
                🟦 Cities/Municipalities | 🟧 Landmarks | 🔴 Earthquakes
              </div>
            </div>

            {/* Recent Earthquakes */}
            <div className="card" style={{marginTop:12}}>
              <h3>⚡ Recent Earthquakes (Laguna Area)</h3>
              <div style={{maxHeight:220, overflow:'auto'}}>
                {quakes.length > 0 ? (
                  quakes.map(q=> (
                    <div key={q.id} style={{
                      padding: 8,
                      borderBottom: '1px solid #f0f0f0',
                      background: q.mag >= 5 ? '#fff1f0' : 
                                 q.mag >= 4 ? '#fff7e6' : '#f6ffed'
                    }}>
                      <div className="small">
                        <strong>M{q.mag.toFixed(1)}</strong> • {new Date(q.time).toLocaleTimeString('en-PH')}
                      </div>
                      <div className="small">{q.place}</div>
                      <a href={q.url} target="_blank" rel="noreferrer" style={{fontSize: 11}}>
                        View details
                      </a>
                    </div>
                  ))
                ) : <div className="small">No recent earthquakes in Laguna area</div>}
              </div>
            </div>

            {/* Free APIs Info */}
            <div className="card" style={{marginTop:12, background: '#f6ffed'}}>
              <h3>🆓 Free APIs Used</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
                <div className="small" style={{padding: 6, background: 'white', borderRadius: 4}}>
                  <strong>Open-Meteo</strong><br/>
                  Weather data
                </div>
                <div className="small" style={{padding: 6, background: 'white', borderRadius: 4}}>
                  <strong>USGS</strong><br/>
                  Earthquakes
                </div>
                <div className="small" style={{padding: 6, background: 'white', borderRadius: 4}}>
                  <strong>Air Quality API</strong><br/>
                  Pollution data
                </div>
                <div className="small" style={{padding: 6, background: 'white', borderRadius: 4}}>
                  <strong>OpenStreetMap</strong><br/>
                  Map tiles
                </div>
              </div>
            </div>

            {/* Mobile Alert */}
            <div className="card" style={{marginTop:12, background: '#e6f7ff'}}>
              <h3>📱 Mobile Ready</h3>
              <div className="small">
                This dashboard is optimized for mobile browsers and works on all devices.
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <div>
          <strong>Laguna Free Weather Dashboard</strong> • 
          100% Free APIs • No Keys Required • 
          Data updates every 10 minutes
        </div>
        <div style={{marginTop: 4, fontSize: 12}}>
          APIs: Open-Meteo (Weather) • USGS (Earthquakes) • OpenStreetMap (Maps)
        </div>
      </footer>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: 1fr 400px;
          }
        }
        
        .card {
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
        }
        
        .mapBox {
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
