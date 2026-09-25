'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { UserProfile, SupportedLanguage } from '@/types';
import { 
  Sprout, 
  Languages, 
  User, 
  ShieldCheck, 
  LogOut, 
  WifiOff, 
  Download, 
  Menu, 
  X,
  Bell
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  unreadAlertsCount = 2,
}) => {
  const { language, setLanguage, t, languages } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    // PWA install prompt handler
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install Krishimitra AI on your phone: Tap "Add to Home Screen" in your browser menu.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: t('navHome') },
    { id: 'scan', label: t('navDiseaseScan') },
    { id: 'chat', label: t('navChatbot') },
    { id: 'yield', label: t('navYield') },
    { id: 'weather', label: t('navWeather') },
    { id: 'kvk', label: t('navKvk') },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-green-100 shadow-sm">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t('offlineNotice')}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-md shadow-green-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-green-800 to-emerald-900 bg-clip-text text-transparent">
                  {t('appName')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                  AI Kisan
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                {t('appTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Admin Portal Tab (role-gated or visible to admin) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>{t('navAdmin')}</span>
              </button>
            )}
          </nav>

          {/* Action Tools: Language, Notifications, Install, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 hover:border-green-400 bg-white shadow-sm hover:bg-green-50/50 transition-colors"
                title="Change Language"
              >
                <Languages className="w-4 h-4 text-green-700" />
                <span className="font-semibold text-gray-800">
                  {languages.find(l => l.code === language)?.nativeLabel || 'हिंदी'}
                </span>
              </button>

              {langMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-in"
                  onMouseLeave={() => setLangMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    {t('languageSelect')}
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-green-50 transition-colors ${
                        language === l.code ? 'font-bold text-green-800 bg-green-50/70' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeLabel}</span>
                      </span>
                      <span className="text-xs text-gray-400">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Install PWA Button */}
            <button
              onClick={handleInstallPWA}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Install App"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Install App</span>
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-green-200 bg-green-50/60 hover:bg-green-100 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                      Admin
                    </span>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/30 transition-all hover:scale-102 flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>{t('loginTitle').split('/')[0].trim()}</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-green-100 bg-white/95 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-slide-up">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-green-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          {user?.role === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{t('navAdmin')}</span>
            </button>
          )}

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handleInstallPWA}
              className="text-xs font-semibold text-emerald-800 flex items-center gap-1 py-1"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Install Krishimitra App</span>
            </button>

            {user && (
              <button
                onClick={onLogout}
                className="text-xs font-semibold text-red-600 flex items-center gap-1 py-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
