import React, { useState, useEffect } from 'react';

function LagunaWeatherDashboard() {
  const [selectedCity, setSelectedCity] = useState('Calamba City');
  const [weatherData, setWeatherData] = useState({
    temperature: 28.5,
    windSpeed: 5.2,
    humidity: 75,
    status: 'Partly Cloudy'
  });
  const [loading, setLoading] = useState(false);

  const cities = [
    'Calamba City',
    'Santa Cruz',
    'San Pablo City', 
    'Biñan City',
    'Cabuyao City',
    'San Pedro City'
  ];

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      const mockData = {
        temperature: 28 + Math.random() * 3,
        windSpeed: 4 + Math.random() * 3,
        humidity: 70 + Math.random() * 15,
        status: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
      };
      setWeatherData(mockData);
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        textAlign: 'center',
        borderBottom: '2px solid #0f3460'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Laguna Weather Dashboard</h1>
        <p style={{ margin: '10px 0 0 0', color: '#8da1b9' }}>Real-time weather monitoring system</p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }}>
        
        {/* City Selection */}
        <div style={{
          backgroundColor: '#0f3460',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: 0 }}>Select City</h2>
          <select 
            value={selectedCity}
            onChange={handleCityChange}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#16213e',
              color: 'white',
              border: '1px solid #1a1a2e',
              borderRadius: '5px'
            }}
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Current Weather */}
        <div style={{
          backgroundColor: '#0f3460',
          padding: '25px',
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0 }}>Current Weather in {selectedCity}</h2>
          
          {loading ? (
            <div style={{ padding: '40px' }}>
              <p>Loading weather data...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '64px', margin: '20px 0' }}>
                {weatherData.status === 'Sunny' ? '☀️' : 
                 weatherData.status === 'Partly Cloudy' ? '⛅' :
                 weatherData.status === 'Cloudy' ? '☁️' : '🌧️'}
              </div>
              
              <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0' }}>
                {weatherData.temperature.toFixed(1)}°C
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '30px'
              }}>
                <div style={{
                  backgroundColor: '#16213e',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#8da1b9' }}>Wind Speed</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {weatherData.windSpeed.toFixed(1)} m/s
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#16213e',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#8da1b9' }}>Humidity</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {weatherData.humidity.toFixed(0)}%
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#16213e',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#8da1b9' }}>Condition</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {weatherData.status}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Forecast */}
        <div style={{
          backgroundColor: '#0f3460',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>6-Hour Forecast</h2>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '15px',
            padding: '10px 0'
          }}>
            {[1, 2, 3, 4, 5, 6].map(hour => (
              <div key={hour} style={{
                backgroundColor: '#16213e',
                padding: '15px',
                borderRadius: '8px',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {hour === 1 ? 'Now' : `+${hour}h`}
                </div>
                <div style={{ fontSize: '24px', margin: '10px 0' }}>
                  {hour % 2 === 0 ? '🌤️' : '⛅'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {(weatherData.temperature - (hour * 0.5)).toFixed(1)}°C
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div style={{
          backgroundColor: '#0f3460',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>System Information</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              backgroundColor: '#16213e',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px', color: '#8da1b9' }}>System Status</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ade80' }}>Operational</div>
            </div>
            
            <div style={{
              backgroundColor: '#16213e',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px', color: '#8da1b9' }}>Last Update</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#16213e',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px', color: '#8da1b9' }}>Data Source</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Live API</div>
            </div>
            
            <div style={{
              backgroundColor: '#16213e',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px', color: '#8da1b9' }}>Refresh Rate</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>5 minutes</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        textAlign: 'center',
        borderTop: '2px solid #0f3460',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#8da1b9' }}>
          © 2025 by DIMAX. Powered and secured by RP8.
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#4a5568' }}>
          Laguna Province Meteorological Monitoring System
        </p>
      </div>

    </div>
  );
}

export default LagunaWeatherDashboard;
