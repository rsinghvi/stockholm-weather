import React, { useEffect, useState } from 'react';
import './App.css';

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  humidity: number | null;
  time: string;
}

interface City {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const cities: City[] = [
  {
    name: 'Stockholm',
    latitude: 59.3293,
    longitude: 18.0686,
    timezone: 'Europe/Stockholm',
  },
  {
    name: 'Riga',
    latitude: 56.9496,
    longitude: 24.1052,
    timezone: 'Europe/Riga',
  },
  {
    name: 'Vilnius',
    latitude: 54.6872,
    longitude: 25.2797,
    timezone: 'Europe/Vilnius',
  },
];

const weatherDescriptions: { [key: number]: string } = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function App() {
  const [weather, setWeather] = useState<{ [city: string]: WeatherData | null }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const results: { [city: string]: WeatherData | null } = {};
      await Promise.all(
        cities.map(async (city) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&hourly=relative_humidity_2m&timezone=${encodeURIComponent(city.timezone)}`;
          const res = await fetch(url);
          const data = await res.json();
          const w = data.current_weather;
          // Find humidity for the current hour if available
          let humidity: number | null = null;
          let idx = data.hourly.time.findIndex((t: string) => t === w.time);
          if (idx === -1) {
            // If exact match not found, find the closest previous hour
            idx = data.hourly.time.findIndex((t: string) => w.time.startsWith(t.slice(0, 13)));
          }
          if (idx !== -1) {
            humidity = data.hourly.relative_humidity_2m[idx];
          }
          results[city.name] = {
            temperature: w.temperature,
            weathercode: w.weathercode,
            windspeed: w.windspeed,
            humidity,
            time: w.time,
          };
        })
      );
      setWeather(results);
    } catch (e) {
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>ECD Weather forecast</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {cities.map((city) => {
            const w = weather[city.name];
            return (
              <div key={city.name} style={{ background: '#333', borderRadius: 16, padding: 24, minWidth: 220, boxShadow: '0 2px 8px #0004', margin: 8 }}>
                <h2>{city.name}</h2>
                {w ? (
                  <>
                    <p style={{ fontSize: '2rem', margin: 0 }}>{w.temperature}°C</p>
                    <p style={{ margin: 0 }}>{weatherDescriptions[w.weathercode] || 'Unknown'}</p>
                    <p style={{ margin: 0 }}>💨 Wind: {w.windspeed} km/h</p>
                    <p style={{ margin: 0 }}>💧 Humidity: {w.humidity !== null ? w.humidity + '%' : 'N/A'}</p>
                    <p style={{ fontSize: '0.9rem', marginTop: 8 }}>Last updated: {new Date(w.time).toLocaleTimeString('sv-SE')}</p>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 32, fontSize: '1rem', color: '#aaa' }}>
          Data from <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#61dafb' }}>Open-Meteo</a>. Updates every 15 minutes.
        </p>
      </header>
    </div>
  );
}

export default App;
