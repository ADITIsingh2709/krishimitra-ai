'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { UserProfile, SoilType } from '@/types';
import { 
  X, 
  Phone, 
  User, 
  KeyRound, 
  MapPin, 
  Sprout, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  LocateFixed
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { language, setLanguage, t, languages } = useTranslation();

  // Step 1: Input (Name & Phone), Step 2: OTP, Step 3: Onboarding (if new)
  const [step, setStep] = useState<'details' | 'otp' | 'onboarding'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);

  // Onboarding state
  const [stateName, setStateName] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(['Wheat', 'Rice']);
  const [landSize, setLandSize] = useState('4.5');
  const [soilType, setSoilType] = useState<SoilType>('Alluvial');
  const [detectingGps, setDetectingGps] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setError('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (Please enter valid 10-digit mobile)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, name: name || 'Kisan' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setDemoCode(data.demoCode || '123456');
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('कृपया 6 अंकों का ओटीपी दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');

      localStorage.setItem('krishi_token', data.token);

      if (data.isNewUser || !data.user.location?.district) {
        setTempUser(data.user);
        setStep('onboarding');
      } else {
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        // Default detected district mapping for India
        setDistrict('Ludhiana');
        setStateName('Punjab');
      },
      (err) => {
        setDetectingGps(false);
        alert('Could not get GPS coordinates. Please select manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishi_token')}`,
        },
        body: JSON.stringify({
          name: name || tempUser.name,
          location: {
            state: stateName,
            district,
            lat: stateName === 'Punjab' ? 30.9010 : 22.5645,
            lng: stateName === 'Punjab' ? 75.8573 : 72.9289,
          },
          primaryCrops,
          landSizeAcres: parseFloat(landSize) || 2.5,
          soilType,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save farm details');

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Admin Login
  const handleDemoAdminLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', code: '123456', roleOverride: 'admin' }),
      });
      const data = await res.json();
      localStorage.setItem('krishi_token', data.token);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-green-100 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-green-700 via-green-800 to-emerald-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-green-200" />
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-green-200">
              {t('appName')}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold">
            {step === 'onboarding' ? t('onboardingTitle') : t('loginTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-green-100/90 mt-1">
            {step === 'onboarding' ? t('onboardingSubtitle') : t('loginSubtitle')}
          </p>
        </div>

        {/* Language Selection First Banner */}
        {step !== 'onboarding' && (
          <div className="bg-green-50/80 px-6 py-3 border-b border-green-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-green-900">{t('languageSelect')}:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    language === l.code
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'bg-white border border-green-200 text-gray-700 hover:bg-green-100/60'
                  }`}
                >
                  <span className="mr-1">{l.flag}</span>
                  <span>{l.nativeLabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Full Name & Mobile Number */}
          {step === 'details' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t('mobileNumber')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-semibold text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('mobilePlaceholder')}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm font-medium tracking-wide outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-green-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-99 disabled:opacity-50"
              >
                {loading ? t('loading') : (
                  <>
                    <span>{t('sendOtp')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Admin Quick Entry Button */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-[11px] text-gray-500 mb-2">
                  {t('demoAdminNotice')}
                </p>
                <button
                  type="button"
                  onClick={handleDemoAdminLogin}
                  disabled={loading}
                  className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{t('loginAsAdmin')}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-green-900 flex items-center justify-between">
                <span>ओटीपी भेजा गया: +91 {phone}</span>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-green-700 underline font-semibold"
                >
                  बदलें
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t('enterOtp')}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t('otpPlaceholder')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm font-bold tracking-widest outline-none text-center"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    डेमो कोड: <strong className="text-green-700">{demoCode || '123456'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(demoCode || '123456')}
                    className="text-green-700 font-semibold hover:underline"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-green-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? t('loading') : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('verifyOtp')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Onboarding First Farm Setup */}
          {step === 'onboarding' && (
            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              
              {/* GPS Auto-detect Button */}
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={detectingGps}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LocateFixed className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
                <span>{detectingGps ? 'जीपीएस द्वारा खोजा जा रहा है...' : t('autoDetectLocation')}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('state')}
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  >
                    <option value="Punjab">Punjab (पंजाब)</option>
                    <option value="Gujarat">Gujarat (गुजरात)</option>
                    <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                    <option value="Tamil Nadu">Tamil Nadu (तमिलनाडु)</option>
                    <option value="Telangana">Telangana (तेलंगाना)</option>
                    <option value="Haryana">Haryana (हरियाणा)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                    <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                    <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('district')}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('soilType')}
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                >
                  <option value="Alluvial">Alluvial Soil (जलोढ़ मिट्टी - उपजाऊ)</option>
                  <option value="Black">Black Cotton Soil (काली मिट्टी - कपास, सोयाबीन)</option>
                  <option value="Red & Yellow">Red & Yellow Soil (लाल व पीली मिट्टी)</option>
                  <option value="Laterite">Laterite Soil (लैटेराइट मिट्टी)</option>
                  <option value="Clayey Loam">Clayey Loam (चिकनी दोमट - धान)</option>
                  <option value="Arid / Desert">Arid / Sandy Soil (रेतीली मिट्टी)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('landSize')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('primaryCrops')}
                  </label>
                  <select
                    onChange={(e) => {
                      const crop = e.target.value;
                      if (!primaryCrops.includes(crop)) {
                        setPrimaryCrops([...primaryCrops, crop]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  >
                    <option value="">+ फसल जोड़ें</option>
                    <option value="Wheat">गेहूं (Wheat)</option>
                    <option value="Rice">धान/चावल (Paddy/Rice)</option>
                    <option value="Cotton">कपास (Cotton)</option>
                    <option value="Mustard">सरसों (Mustard)</option>
                    <option value="Sugarcane">गन्ना (Sugarcane)</option>
                    <option value="Maize">मक्का (Maize)</option>
                    <option value="Potato">आलू (Potato)</option>
                    <option value="Tomato">टमाटर (Tomato)</option>
                  </select>
                </div>
              </div>

              {/* Crop Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {primaryCrops.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-lg bg-green-100 text-green-800 text-xs font-semibold flex items-center gap-1 border border-green-200"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => setPrimaryCrops(primaryCrops.filter(x => x !== c))}
                      className="hover:text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-green-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? t('loading') : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('completeRegistration')}</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
