import React, { useEffect, useState } from 'react';
import './App.css';

interface WeatherData {
  temperature: number;
  weathercode: number;
  time: string;
}

const WEATHER_API =
  'https://api.open-meteo.com/v1/forecast?latitude=59.3293&longitude=18.0686&current_weather=true&timezone=Europe%2FStockholm';

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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(WEATHER_API);
      const data = await res.json();
      const w = data.current_weather;
      setWeather({
        temperature: w.temperature,
        weathercode: w.weathercode,
        time: w.time,
      });
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
        <h1>Stockholm Weather</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {weather && !loading && !error && (
          <div>
            <p style={{ fontSize: '2rem' }}>{weather.temperature}°C</p>
            <p>{weatherDescriptions[weather.weathercode] || 'Unknown'}</p>
            <p style={{ fontSize: '0.9rem' }}>Last updated: {new Date(weather.time).toLocaleTimeString('sv-SE')}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
