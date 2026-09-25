'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { DiseaseDiagnosis, UserProfile } from '@/types';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Pill, 
  Leaf, 
  ShieldAlert, 
  MessageSquare, 
  Check, 
  History,
  FileCheck2
} from 'lucide-react';

interface DiseaseScannerProps {
  user: UserProfile | null;
  onOpenChatWithQuery?: (query: string) => void;
  pastScans?: DiseaseDiagnosis[];
}

export const DiseaseScanner: React.FC<DiseaseScannerProps> = ({
  user,
  onOpenChatWithQuery,
  pastScans = [],
}) => {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'scan' | 'history'>('scan');
  const [localScans, setLocalScans] = useState<DiseaseDiagnosis[]>(pastScans);

  // Sample leaf presets for fast zero-friction testing
  const samplePresets = [
    {
      id: 'tomato_early_blight',
      crop: 'Tomato',
      label: 'टमाटर झुलसा (Tomato Early Blight)',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'wheat_yellow_rust',
      crop: 'Wheat',
      label: 'गेहूं पीली रतुआ (Wheat Yellow Rust)',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'rice_blast',
      crop: 'Rice',
      label: 'धान ब्लास्ट (Rice Blast - Low Confidence Demo)',
      image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'cotton_pink_bollworm',
      crop: 'Cotton',
      label: 'कपास गुलाबी सुंडी (Cotton Pink Bollworm)',
      image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'healthy_leaf',
      crop: 'Wheat',
      label: 'स्वस्थ पत्ती (Healthy Crop)',
      image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const runDiagnosis = async (presetKey?: string, customImageUrl?: string) => {
    setAnalyzing(true);
    setError(null);
    setDiagnosis(null);

    try {
      const res = await fetch('/api/ml/predict-disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishi_token') || ''}`,
        },
        body: JSON.stringify({
          crop: selectedCrop,
          imageUrl: customImageUrl || previewUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
          presetKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Diagnosis failed');

      setDiagnosis(data.diagnosis);
      setLocalScans([data.diagnosis, ...localScans]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      runDiagnosis(undefined, url);
    }
  };

  const handleSelectPreset = (p: typeof samplePresets[0]) => {
    setSelectedCrop(p.crop);
    setPreviewUrl(p.image);
    runDiagnosis(p.id, p.image);
  };

  const severityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">अति गंभीर (Critical)</span>;
      case 'high':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">गंभीर (High)</span>;
      case 'moderate':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">मध्यम (Moderate)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">सामान्य (Healthy/Low)</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Subtab Toggle: Scanner vs Previous History */}
      <div className="flex items-center justify-between border-b border-green-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('scan')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'scan'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-green-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('navDiseaseScan')}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-green-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t('scanHistory')} ({localScans.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upload / Camera & Sample Leaves */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {t('scanTitle')}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {t('scanSubtitle')}
              </p>

              {/* Crop Picker */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  फसल चुनें (Crop):
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                >
                  <option value="Tomato">Tomato (टमाटर)</option>
                  <option value="Potato">Potato (आलू)</option>
                  <option value="Rice">Rice / Paddy (धान/चावल)</option>
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Maize">Maize (मक्का)</option>
                </select>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-green-300 hover:border-green-500 bg-green-50/50 hover:bg-green-50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[190px] relative overflow-hidden group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-inner">
                    <img
                      src={previewUrl}
                      alt="Crop Leaf"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold">
                      फोटो बदलने के लिए क्लिक करें
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-green-600/10 text-green-700 flex items-center justify-center mb-2.5">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800">
                      {t('uploadPrompt')}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      PNG, JPG या मोबाइल कैमरा से सीधी फोटो
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Quick Test Presets */}
            <div className="glass-panel rounded-3xl p-5 shadow-card border border-green-100">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                {t('sampleLeaves')}
              </label>
              <div className="space-y-1.5">
                {samplePresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className="w-full text-left p-2 rounded-xl text-xs font-semibold hover:bg-green-100/60 border border-transparent hover:border-green-200 transition-all flex items-center gap-2 text-gray-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Diagnosis Result Report */}
          <div className="lg:col-span-7">
            {analyzing ? (
              <div className="glass-panel rounded-3xl p-10 text-center shadow-card border border-green-100 flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 text-white flex items-center justify-center shadow-lg animate-bounce mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800">
                  {t('analyzingImage')}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  सीएनएन डीप लर्निंग मॉडल पत्ती के ऊतकों और रोग लक्षणों का विश्लेषण कर रहा है...
                </p>
              </div>
            ) : diagnosis ? (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-card border border-green-100 space-y-5 animate-fade-in">
                
                {/* Result Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-green-700 bg-green-100/80 px-2 py-0.5 rounded">
                      {t('diagnosisResult')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                      {diagnosis.diseaseDetected}
                    </h3>
                    <p className="text-xs italic text-gray-500">
                      {diagnosis.scientificName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {severityBadge(diagnosis.severity)}
                  </div>
                </div>

                {/* Human-in-the-loop Notification (if confidence < 85%) */}
                {diagnosis.status === 'under_review' && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">कृषि वैज्ञानिक समीक्षा कतार (Human-in-the-Loop Active)</span>
                      <p className="mt-0.5 text-amber-800">
                        इस स्कैन की विश्वसनीयता स्तर {diagnosis.confidence}% है (85% सुरक्षा सीमा से कम)। इसे कृषि वैज्ञानिक के सत्यापन के लिए एडमिन रिव्यू कतार में भेजा गया है।
                      </p>
                    </div>
                  </div>
                )}

                {/* Confidence Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1 font-semibold text-gray-700">
                    <span>{t('confidenceScore')}</span>
                    <span className="text-green-700 font-bold">{diagnosis.confidence}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${diagnosis.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Immediate Action */}
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-900 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{t('immediateAction')}</span>
                  </div>
                  <p className="text-xs text-red-950 font-medium leading-relaxed">
                    {diagnosis.recommendation}
                  </p>
                </div>

                {/* Chemical Treatment & Timing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-green-50/80 border border-green-200">
                    <div className="flex items-center gap-2 font-bold text-xs text-green-900 mb-1">
                      <Pill className="w-4 h-4 text-green-700 shrink-0" />
                      <span>{t('chemicalTreatment')}</span>
                    </div>
                    <p className="text-xs text-gray-800 font-semibold mb-1">
                      {diagnosis.chemicalTreatment}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      <strong>मात्रा:</strong> {diagnosis.dosage}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{t('optimalTiming')}</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed">
                      {diagnosis.timing}
                    </p>
                  </div>
                </div>

                {/* Organic / Bio Alternative */}
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-950 mb-1">
                    <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{t('organicAlternative')}</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    {diagnosis.organicAlternative}
                  </p>
                </div>

                {/* Prevention Tips */}
                {diagnosis.preventionTips && diagnosis.preventionTips.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 mb-2">
                      {t('preventionTips')}
                    </h5>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {diagnosis.preventionTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ask Chatbot Follow-up Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onOpenChatWithQuery) {
                        onOpenChatWithQuery(`मेरी ${diagnosis.crop} की फसल में ${diagnosis.diseaseDetected} का लक्षण दिखा है। मुझे क्या सावधानी बरतनी चाहिए?`);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-99"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t('askFollowUp')}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-10 text-center shadow-card border border-green-100 flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-gray-800">
                  पत्ती की फोटो अपलोड करें
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  बाईं ओर से अपनी फसल की पत्ती की तस्वीर अपलोड करें या तुरंत परिणाम देखने के लिए नीचे दिए गए नमूनों में से कोई एक चुनें।
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* History Subtab */
        <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100">
          <h3 className="font-bold text-gray-900 text-base mb-4">
            {t('scanHistory')}
          </h3>

          <div className="space-y-3">
            {localScans.map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-green-200 bg-white/70 hover:bg-green-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={scan.imageUrl}
                    alt={scan.crop}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {scan.diseaseDetected}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {scan.crop} • {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600">
                    विश्वास: <strong className="text-green-700">{scan.confidence}%</strong>
                  </span>
                  {scan.status === 'verified_by_admin' ? (
                    <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-800 text-[11px] font-semibold flex items-center gap-1 border border-green-200">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>वैज्ञानिक सत्यापित</span>
                    </span>
                  ) : scan.status === 'under_review' ? (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-semibold flex items-center gap-1 border border-amber-200">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      <span>रिव्यू में</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-semibold">
                      एआई जाँचा गया
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
