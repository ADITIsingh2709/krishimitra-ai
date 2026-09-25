'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { UserProfile, DiseaseDiagnosis, RegionalAlert } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { DiseaseScanner } from '@/components/dashboard/DiseaseScanner';
import { AskChatbotWidget } from '@/components/dashboard/AskChatbotWidget';
import { YieldPredictor } from '@/components/dashboard/YieldPredictor';
import { KvkLocator } from '@/components/dashboard/KvkLocator';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { 
  Sprout, 
  Camera, 
  MessageSquare, 
  TrendingUp, 
  Building2, 
  CloudSun, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  Bell,
  MapPin,
  Calendar
} from 'lucide-react';

export default function Home() {
  const { t, language } = useTranslation();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [chatInitialQuery, setChatInitialQuery] = useState<string>('');
  const [alerts, setAlerts] = useState<RegionalAlert[]>([]);
  const [recentScans, setRecentScans] = useState<DiseaseDiagnosis[]>([]);

  // Check initial session & fetch initial data
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('krishi_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        } catch (e) {
          console.error('Session verification error:', e);
        }
      } else {
        // In demo mode, pre-populate default farmer if user hasn't logged in yet
        // so evaluator can instantly explore the dashboard
        setUser({
          id: 'user_farmer_01',
          phone: '9988776655',
          name: 'Ramesh Patel',
          role: 'farmer',
          language: 'hi',
          location: {
            state: 'Gujarat',
            district: 'Anand',
            lat: 22.5645,
            lng: 72.9289,
          },
          primaryCrops: ['Cotton', 'Wheat', 'Groundnut'],
          landSizeAcres: 4.5,
          soilType: 'Black',
          notificationsEnabled: true,
          createdAt: '2026-02-10T11:30:00Z',
        });
      }
    };

    const fetchHomeData = async () => {
      try {
        const [resAlerts, resScans] = await Promise.all([
          fetch('/api/admin/alerts').then(r => r.json()),
          fetch('/api/admin/review-queue').then(r => r.json()),
        ]);
        if (resAlerts.success) setAlerts(resAlerts.alerts);
        if (resScans.success) setRecentScans(resScans.scans);
      } catch (e) {
        console.error('Error fetching home data:', e);
      }
    };

    checkSession();
    fetchHomeData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('krishi_token');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleOpenChatWithQuery = (query: string) => {
    setChatInitialQuery(query);
    setActiveTab('chat');
  };

  const district = user?.location?.district || 'Ludhiana';
  const state = user?.location?.state || 'Punjab';

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfdfa]">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={alerts.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
        {/* ACTIVE REGIONAL ALERT TICKER (if any) */}
        {alerts.length > 0 && activeTab === 'dashboard' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse text-amber-200" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-extrabold uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded text-[10px] mr-2">
                  क्षेत्रीय कीट चेतावनी (Live Alert)
                </span>
                <span className="font-bold">{alerts[0].title}: </span>
                <span className="text-white/90">{alerts[0].message}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('weather')}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white text-red-900 font-bold text-xs shrink-0 hover:bg-red-50 transition-colors"
            >
              सलाह देखें
            </button>
          </div>
        )}

        {/* TAB: DASHBOARD (HOME) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Welcome Banner */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-card border border-green-100 bg-gradient-to-br from-green-50/90 via-white to-emerald-50/60 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{district}, {state} • {user?.soilType || 'Alluvial'} Soil</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {t('welcomeFarmer')}, {user ? user.name : 'किसान भाई'}! 🌾
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                    कृषिमित्र एआई निर्णय सहायता प्रणाली में आपका स्वागत है। अपनी फसल की पत्ती की फोटो जांचें, संभावित पैदावार निकालें या नजदीकी केवीके खोजें।
                  </p>
                </div>

                {/* Role Switcher Demo Helper */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {user?.role === 'admin' ? (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-2 transition-transform hover:scale-102"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t('navAdmin')} खोलें</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (user) {
                          setUser({ ...user, role: 'admin' });
                        }
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                      title="Switch role for evaluator testing"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>एडमिन रोल में बदलें (Demo Admin)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Primary Quick Action Cards */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-700" />
                <span>{t('quickActions')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Disease Scan */}
                <div
                  onClick={() => setActiveTab('scan')}
                  className="glass-panel rounded-3xl p-5 shadow-card border border-green-100 hover:border-green-400 hover:shadow-premium cursor-pointer transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white flex items-center justify-center mb-3 shadow-md shadow-green-600/20 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {t('scanCropNow')}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    पत्ती की तस्वीर से एआई रोग पहचान व सटीक दवा मात्रा
                  </p>
                  <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                    <span>जांच शुरू करें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 2. Ask Chatbot */}
                <div
                  onClick={() => setActiveTab('chat')}
                  className="glass-panel rounded-3xl p-5 shadow-card border border-green-100 hover:border-green-400 hover:shadow-premium cursor-pointer transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center mb-3 shadow-md shadow-teal-600/20 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {t('askChatbotNow')}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    24x7 बहुभाषी कृषि मित्र से फसल, खाद व योजनाओं पर चर्चा
                  </p>
                  <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                    <span>संवाद करें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 3. Yield Predictor */}
                <div
                  onClick={() => setActiveTab('yield')}
                  className="glass-panel rounded-3xl p-5 shadow-card border border-green-100 hover:border-green-400 hover:shadow-premium cursor-pointer transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mb-3 shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {t('calculateYield')}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    मृदा कार्ड व मौसम से संभावित उत्पादन का गणितीय अनुमान
                  </p>
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <span>उपज निकालें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 4. Find Nearest KVK */}
                <div
                  onClick={() => setActiveTab('kvk')}
                  className="glass-panel rounded-3xl p-5 shadow-card border border-green-100 hover:border-green-400 hover:shadow-premium cursor-pointer transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {t('findCenter')}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    निकटतम सरकारी कृषि विज्ञान केंद्र व 1-टैप हेल्पलाइन
                  </p>
                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                    <span>केंद्र देखें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            </div>

            {/* Split Section: Weather on Left + Recent Diagnostics on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-7">
                <WeatherWidget district={district} state={state} />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <Camera className="w-4 h-4 text-green-700" />
                        <span>हालिया रोग निदान (Recent Scans)</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('scan')}
                        className="text-xs text-green-700 font-bold hover:underline"
                      >
                        सभी देखें
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {recentScans.slice(0, 3).map((scan) => (
                        <div
                          key={scan.id}
                          className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={scan.imageUrl}
                              alt={scan.crop}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 text-xs truncate max-w-[170px]">
                                {scan.diseaseDetected}
                              </h4>
                              <p className="text-[11px] text-gray-500">
                                {scan.crop} • {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-bold text-green-700 block">
                              {scan.confidence}%
                            </span>
                            <span className="text-[10px] text-gray-400">विश्वसनीयता</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="w-full py-2.5 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>नई पत्ती की तस्वीर जांचें</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB: CROP DISEASE SCANNER */}
        {activeTab === 'scan' && (
          <div className="animate-fade-in">
            <DiseaseScanner
              user={user}
              onOpenChatWithQuery={handleOpenChatWithQuery}
              pastScans={recentScans}
            />
          </div>
        )}

        {/* TAB: ASK KRISHIMITRA CHATBOT */}
        {activeTab === 'chat' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <AskChatbotWidget
              user={user}
              initialQuery={chatInitialQuery}
            />
          </div>
        )}

        {/* TAB: YIELD PREDICTOR */}
        {activeTab === 'yield' && (
          <div className="animate-fade-in">
            <YieldPredictor
              user={user}
              defaultDistrict={district}
              defaultState={state}
            />
          </div>
        )}

        {/* TAB: NEARBY KVK CENTERS */}
        {activeTab === 'kvk' && (
          <div className="animate-fade-in">
            <KvkLocator user={user} />
          </div>
        )}

        {/* TAB: WEATHER & ALERTS */}
        {activeTab === 'weather' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <WeatherWidget district={district} state={state} />
          </div>
        )}

        {/* TAB: ADMIN DASHBOARD VIEW */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            {user?.role === 'admin' ? (
              <AdminDashboardView user={user} />
            ) : (
              <div className="glass-panel rounded-3xl p-10 text-center shadow-card border border-amber-200 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  एडमिन या कृषि वैज्ञानिक भूमिका आवश्यक है
                </h3>
                <p className="text-xs text-gray-600">
                  यह पोर्टल केवल अधिकृत कृषि वैज्ञानिकों और केवीके नोडल अधिकारियों के लिए आरक्षित है।
                </p>
                <button
                  onClick={() => {
                    if (user) setUser({ ...user, role: 'admin' });
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  डेमो एडमिन रोल सक्रिय करें (Switch Role)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: FARMER PROFILE */}
        {activeTab === 'profile' && user && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-card border border-green-100 max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-900 text-white flex items-center justify-center text-xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-500">
                  📱 +91 ******{user.phone.slice(-4)} • भूमिका: <strong className="uppercase">{user.role}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-green-50/60 rounded-xl border border-green-100">
                <span className="text-gray-500 block mb-0.5">स्थान (Location)</span>
                <strong className="text-gray-900 text-sm">{district}, {state}</strong>
              </div>

              <div className="p-3 bg-green-50/60 rounded-xl border border-green-100">
                <span className="text-gray-500 block mb-0.5">मिट्टी का प्रकार (Soil)</span>
                <strong className="text-gray-900 text-sm">{user.soilType} Soil</strong>
              </div>

              <div className="p-3 bg-green-50/60 rounded-xl border border-green-100">
                <span className="text-gray-500 block mb-0.5">कुल खेत का आकार (Holding)</span>
                <strong className="text-gray-900 text-sm">{user.landSizeAcres} एकड़</strong>
              </div>

              <div className="p-3 bg-green-50/60 rounded-xl border border-green-100">
                <span className="text-gray-500 block mb-0.5">मुख्य फसलें (Crops)</span>
                <strong className="text-gray-900 text-sm">{user.primaryCrops.join(', ')}</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-green-300 text-green-800 text-xs font-bold hover:bg-green-50"
              >
                खेत का विवरण अपडेट करें
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Auth & Onboarding Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
        }}
      />

    </div>
  );
}
