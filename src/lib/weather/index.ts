import { WeatherData } from '@/types';

// Agro-climatic fallback profiles for major Indian farming districts
const DISTRICT_WEATHER_DEFAULTS: Record<string, Partial<WeatherData>> = {
  'ludhiana': {
    city: 'Ludhiana',
    district: 'Ludhiana',
    state: 'Punjab',
    tempC: 26,
    feelsLikeC: 27,
    humidity: 58,
    windSpeedKmh: 14,
    condition: 'Partly Cloudy',
    conditionIcon: 'partly-cloudy',
    rainfallProbability: 15,
  },
  'anand': {
    city: 'Anand',
    district: 'Anand',
    state: 'Gujarat',
    tempC: 31,
    feelsLikeC: 33,
    humidity: 62,
    windSpeedKmh: 18,
    condition: 'Sunny / Warm',
    conditionIcon: 'sun',
    rainfallProbability: 10,
  },
  'nagpur': {
    city: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    tempC: 33,
    feelsLikeC: 35,
    humidity: 45,
    windSpeedKmh: 12,
    condition: 'Clear Sky',
    conditionIcon: 'sun',
    rainfallProbability: 5,
  },
  'thanjavur': {
    city: 'Thanjavur',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    tempC: 29,
    feelsLikeC: 32,
    humidity: 78,
    windSpeedKmh: 20,
    condition: 'Scattered Showers',
    conditionIcon: 'rain',
    rainfallProbability: 60,
  },
};

export async function getWeatherData(district = 'Ludhiana', state = 'Punjab'): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const normalized = district.toLowerCase().trim();

  // If OpenWeather API key is provided, fetch live data
  if (apiKey && apiKey !== 'your-openweather-api-key') {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(district)},IN&units=metric&appid=${apiKey}`);
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.name,
          district,
          state,
          tempC: Math.round(data.main.temp),
          feelsLikeC: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeedKmh: Math.round((data.wind?.speed || 3) * 3.6),
          condition: data.weather?.[0]?.main || 'Clear',
          conditionIcon: data.weather?.[0]?.icon?.includes('d') ? 'sun' : 'cloud',
          rainfallProbability: data.clouds?.all || 20,
          forecast: generateAgriForecast(data.main.temp, district),
        };
      }
    } catch (err) {
      console.warn('OpenWeather fetch failed, falling back to agro-climatic baseline:', err);
    }
  }

  // Fallback realistic baseline data
  const base = DISTRICT_WEATHER_DEFAULTS[normalized] || {
    city: district,
    district,
    state,
    tempC: 28,
    feelsLikeC: 29,
    humidity: 55,
    windSpeedKmh: 14,
    condition: 'Clear / Sunny',
    conditionIcon: 'sun',
    rainfallProbability: 10,
  };

  return {
    city: base.city || district,
    district,
    state,
    tempC: base.tempC || 28,
    feelsLikeC: base.feelsLikeC || 29,
    humidity: base.humidity || 55,
    windSpeedKmh: base.windSpeedKmh || 14,
    condition: base.condition || 'Sunny',
    conditionIcon: base.conditionIcon || 'sun',
    rainfallProbability: base.rainfallProbability || 15,
    alerts: [
      {
        severity: 'warning',
        title: 'Mild Temperature Fluctuation Advisory',
        description: 'Night temperatures expected to dip by 2-3°C over next 48h.',
        actionAdvice: 'Provide light evening irrigation to safeguard sensitive nursery seedlings from cold stress.',
      },
    ],
    forecast: generateAgriForecast(base.tempC || 28, district),
  };
}

function generateAgriForecast(currentTemp: number, district: string): WeatherData['forecast'] {
  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'];
  const advisories = [
    'Optimal weather for pesticide spraying and foliar feeding in early morning.',
    'Clear skies favorable for harvesting, threshing and grain drying in sun.',
    'Moderate humidity; inspect vegetable crops for fungal leaf spot symptoms.',
    'Light breezes; safe for tractor operations and seedbed preparation.',
    'Slight chance of rain; hold off on broadcast urea application until rain clears.',
  ];

  return days.map((day, idx) => ({
    day,
    date: new Date(Date.now() + idx * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    tempMinC: Math.round(currentTemp - 7 - idx * 0.5),
    tempMaxC: Math.round(currentTemp + idx * 0.8),
    condition: idx === 2 ? 'Passing Clouds' : idx === 4 ? 'Light Drizzle' : 'Sunny & Clear',
    conditionIcon: idx === 4 ? 'rain' : idx === 2 ? 'partly-cloudy' : 'sun',
    rainMm: idx === 4 ? 4.5 : 0,
    agriAdvice: advisories[idx],
  }));
}
