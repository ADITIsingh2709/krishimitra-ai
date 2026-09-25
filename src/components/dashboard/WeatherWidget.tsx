'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { WeatherData } from '@/types';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  CloudRain, 
  AlertTriangle, 
  Calendar, 
  Sparkles,
  RefreshCw,
  Sun
} from 'lucide-react';

interface WeatherWidgetProps {
  district?: string;
  state?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  district = 'Ludhiana', 
  state = 'Punjab' 
}) => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`);
      const data = await res.json();
      if (data.success && data.weather) {
        setWeather(data.weather);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [district, state]);

  if (loading && !weather) {
    return (
      <div className="glass-panel rounded-3xl p-6 shadow-card animate-pulse border border-green-100">
        <div className="h-6 w-48 bg-green-200/50 rounded mb-4"></div>
        <div className="h-20 bg-green-100/50 rounded-2xl mb-4"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-green-100/50 rounded-xl"></div>
          <div className="h-12 bg-green-100/50 rounded-xl"></div>
          <div className="h-12 bg-green-100/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100/80 overflow-hidden relative">
      
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              {weather.district}, {weather.state}
            </h3>
            <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              आईएमडी एवं कृषि मौसम बुलेटिन (Live)
            </span>
          </div>
        </div>
        <button
          onClick={fetchWeather}
          className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Active Weather Alert (if any) */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-bold text-amber-800">{weather.alerts[0].title}</h5>
            <p className="mt-0.5 text-amber-900/80">{weather.alerts[0].description}</p>
            <p className="mt-1 font-semibold text-amber-950">💡 {weather.alerts[0].actionAdvice}</p>
          </div>
        </div>
      )}

      {/* Current Conditions Bar */}
      <div className="bg-gradient-to-br from-green-800 to-emerald-900 text-white rounded-2xl p-5 mb-5 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {weather.tempC}°
            </span>
            <span className="text-lg text-green-200 font-semibold">C</span>
          </div>
          <p className="text-xs text-green-100 font-medium mt-1">
            {weather.condition} • Feels like {weather.feelsLikeC}°C
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-green-100">
            <Droplets className="w-4 h-4 text-sky-300" />
            <span>{weather.humidity}% {t('humidity')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-100">
            <Wind className="w-4 h-4 text-teal-300" />
            <span>{weather.windSpeedKmh} km/h</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-100 col-span-2">
            <CloudRain className="w-4 h-4 text-blue-300" />
            <span>{weather.rainfallProbability}% {t('rainProbability')}</span>
          </div>
        </div>
      </div>

      {/* 5-Day Agro-Meteorological Forecast */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          <Calendar className="w-3.5 h-3.5 text-green-700" />
          <span>5-दिवसीय कृषि मौसम पूर्वानुमान एवं कार्य सलाह</span>
        </div>

        <div className="space-y-2">
          {weather.forecast.map((day, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-green-50/50 hover:bg-green-50 border border-green-100 text-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5"
            >
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="font-bold text-gray-800">{day.day}</span>
                <span className="text-[11px] text-gray-400">({day.date})</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">
                  {day.tempMinC}° - {day.tempMaxC}°C
                </span>
                <span className="text-gray-500 hidden sm:inline">•</span>
                <span className="text-emerald-800 font-medium">
                  {day.condition}
                </span>
              </div>

              <div className="text-[11px] text-gray-600 sm:max-w-xs italic">
                {day.agriAdvice}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
