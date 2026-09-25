'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { KvkCenter, UserProfile } from '@/types';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Navigation, 
  ExternalLink, 
  Check, 
  Clock, 
  Search, 
  Layers,
  Map as MapIcon,
  List
} from 'lucide-react';

interface KvkLocatorProps {
  user: UserProfile | null;
}

export const KvkLocator: React.FC<KvkLocatorProps> = ({ user }) => {
  const { t } = useTranslation();
  const [centers, setCenters] = useState<KvkCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDistrict, setSearchDistrict] = useState(user?.location?.district || 'Ludhiana');
  const [searchState, setSearchState] = useState(user?.location?.state || 'Punjab');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCenter, setSelectedCenter] = useState<KvkCenter | null>(null);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const lat = user?.location?.lat || 30.9010;
      const lng = user?.location?.lng || 75.8573;
      const res = await fetch(`/api/kvk?lat=${lat}&lng=${lng}&district=${encodeURIComponent(searchDistrict)}&state=${encodeURIComponent(searchState)}&limit=5`);
      const data = await res.json();
      if (data.success && data.centers) {
        setCenters(data.centers);
        if (data.centers.length > 0) setSelectedCenter(data.centers[0]);
      }
    } catch (err) {
      console.error('KVK fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, [searchDistrict, searchState]);

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Controls */}
      <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-green-700/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                {t('kvkTitle')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('kvkSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & District Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl bg-gray-100 p-1 text-xs font-semibold text-gray-600">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-white text-green-800 shadow-xs' : 'hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>सूची (List)</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'map' ? 'bg-white text-green-800 shadow-xs' : 'hover:text-gray-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>नक्शा (Map)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none bg-white"
            >
              <option value="Ludhiana">Ludhiana (पंजाब)</option>
              <option value="Anand">Anand (गुजरात)</option>
              <option value="Nagpur">Nagpur (महाराष्ट्र)</option>
              <option value="Thanjavur">Thanjavur (तमिलनाडु)</option>
              <option value="Kanpur Nagar">Kanpur (उत्तर प्रदेश)</option>
              <option value="Gurugram">Gurugram (हरियाणा)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.map((center, idx) => (
            <div
              key={center.id}
              className="glass-panel rounded-3xl p-6 shadow-card border border-green-100 hover:border-green-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                    center.type === 'KVK'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {center.type}
                  </span>

                  {center.distanceKm !== undefined && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      📍 {center.distanceKm} km {t('distance')}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-gray-900 text-base leading-snug">
                  {center.name}
                </h4>

                <p className="text-xs text-gray-500 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{center.address}</span>
                </p>

                <p className="text-xs text-gray-700 font-medium mt-2">
                  👤 <strong>प्रभारी:</strong> {center.contactPerson}
                </p>

                {center.operationalHours && (
                  <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{center.operationalHours}</span>
                  </p>
                )}

                {/* Available Services */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {t('servicesOffered')}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {center.services.map((service, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-lg bg-green-50 text-green-900 text-[11px] font-medium border border-green-200"
                      >
                        ✓ {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct Actions: Call Now & Directions */}
              <div className="mt-5 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${center.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-2.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('callNow')}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-white hover:bg-green-50 text-green-800 border border-green-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('getDirections')}</span>
                </a>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Map View Simulation & Pinpoint Cards */
        <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100">
          <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-200 border border-green-300 relative overflow-hidden flex items-center justify-center p-4">
            
            {/* Map Grid Lines SVG Background */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#052e16" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated Pins for Nearby Centers */}
            <div className="relative z-10 w-full max-w-xl h-full flex flex-col justify-around">
              <div className="flex items-center justify-between">
                {centers.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCenter(c)}
                    className={`p-2 rounded-2xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-transform hover:scale-110 ${
                      selectedCenter?.id === c.id
                        ? 'bg-green-800 text-white ring-4 ring-green-400'
                        : 'bg-white text-gray-800 border border-green-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span className="hidden sm:inline">{c.name.split(',')[0]}</span>
                    <span>({c.distanceKm} km)</span>
                  </button>
                ))}
              </div>

              {selectedCenter && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-green-200 animate-slide-up self-center max-w-md w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      {selectedCenter.type} • {selectedCenter.distanceKm} km दूर
                    </span>
                    <a
                      href={`tel:${selectedCenter.phone}`}
                      className="text-xs font-bold text-green-700 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{selectedCenter.phone}</span>
                    </a>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{selectedCenter.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedCenter.address}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
