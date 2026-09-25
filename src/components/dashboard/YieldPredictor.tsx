'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { UserProfile, SoilType, YieldPredictionResult } from '@/types';
import { 
  TrendingUp, 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  Droplet, 
  Sun, 
  Layers, 
  Gauge, 
  Check, 
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';

interface YieldPredictorProps {
  user: UserProfile | null;
  defaultDistrict?: string;
  defaultState?: string;
}

export const YieldPredictor: React.FC<YieldPredictorProps> = ({
  user,
  defaultDistrict = 'Ludhiana',
  defaultState = 'Punjab',
}) => {
  const { t } = useTranslation();

  const [crop, setCrop] = useState('Wheat');
  const [soilType, setSoilType] = useState<SoilType>(user?.soilType || 'Alluvial');
  const [areaAcres, setAreaAcres] = useState(user?.landSizeAcres ? user.landSizeAcres.toString() : '4.5');
  const [irrigationType, setIrrigationType] = useState<'Tube Well' | 'Canal' | 'Drip/Sprinkler' | 'Rainfed'>('Tube Well');
  
  // Soil NPK parameters (editable or autofilled via Soil Card)
  const [nitrogen, setNitrogen] = useState('130');
  const [phosphorus, setPhosphorus] = useState('48');
  const [potassium, setPotassium] = useState('160');
  const [soilPh, setSoilPh] = useState('7.4');

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<YieldPredictionResult | null>(null);

  // Trigger OCR extraction on Soil Card photo
  const handleOcrCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setOcrLoading(true);
    setOcrSuccess(false);

    try {
      const res = await fetch('/api/ml/ocr-soil-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageSample: 'sample_card.jpg' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNitrogen(data.data.nitrogen.toString());
        setPhosphorus(data.data.phosphorus.toString());
        setPotassium(data.data.potassium.toString());
        setSoilPh(data.data.ph.toString());
        setOcrSuccess(true);
      }
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);

    try {
      const res = await fetch('/api/ml/predict-yield', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishi_token') || ''}`,
        },
        body: JSON.stringify({
          crop,
          soilType,
          areaAcres: parseFloat(areaAcres) || 1,
          irrigationType,
          nitrogen: parseFloat(nitrogen) || 120,
          phosphorus: parseFloat(phosphorus) || 50,
          potassium: parseFloat(potassium) || 40,
          ph: parseFloat(soilPh) || 7.0,
          rainfallMm: 550,
          temperatureC: 25,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
      }
    } catch (err) {
      console.error('Yield prediction error:', err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Input Parameters Form */}
      <div className="lg:col-span-6 space-y-4">
        <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-green-600/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                {t('yieldTitle')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('yieldSubtitle')}
              </p>
            </div>
          </div>

          {/* Soil Health Card OCR Autofill Box */}
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('soilHealthCardUpload')}</span>
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{ocrLoading ? 'स्कैनिंग...' : 'कार्ड अपलोड करें'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOcrCardUpload}
                  className="hidden"
                />
              </label>
            </div>

            {ocrSuccess && (
              <div className="mt-2 text-[11px] text-green-800 font-semibold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>मृदा स्वास्थ्य कार्ड से N, P, K और pH मान स्वतः भर दिए गए हैं!</span>
              </div>
            )}
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  फसल (Crop):
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Rice">Rice (धान/चावल)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Maize">Maize (मक्का)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Sugarcane">Sugarcane (गन्ना)</option>
                  <option value="Potato">Potato (आलू)</option>
                  <option value="Tomato">Tomato (टमाटर)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('soilType')}:
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                >
                  <option value="Alluvial">Alluvial (जलोढ़)</option>
                  <option value="Black">Black Soil (काली मिट्टी)</option>
                  <option value="Red & Yellow">Red & Yellow (लाल-पीली)</option>
                  <option value="Laterite">Laterite (लैटेराइट)</option>
                  <option value="Clayey Loam">Clayey Loam (चिकनी दोमट)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('landSize')}:
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('irrigationType')}:
                </label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                >
                  <option value="Tube Well">Tube Well (नलकूप / बोरवेल)</option>
                  <option value="Canal">Canal (नहर जल)</option>
                  <option value="Drip/Sprinkler">Drip/Sprinkler (ड्रिप/फव्वारा)</option>
                  <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
                </select>
              </div>
            </div>

            {/* Soil Nutrients N-P-K & pH Grid */}
            <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                मृदा पोषक तत्व (Soil Nutrients)
              </span>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">N (नत्रजन)</label>
                  <input
                    type="number"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    className="w-full p-1.5 text-xs text-center border border-gray-200 rounded-lg outline-none font-bold text-green-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">P (फास्फोरस)</label>
                  <input
                    type="number"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    className="w-full p-1.5 text-xs text-center border border-gray-200 rounded-lg outline-none font-bold text-green-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">K (पोटाश)</label>
                  <input
                    type="number"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    className="w-full p-1.5 text-xs text-center border border-gray-200 rounded-lg outline-none font-bold text-green-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">pH (सामू)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    className="w-full p-1.5 text-xs text-center border border-gray-200 rounded-lg outline-none font-bold text-green-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-green-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-99 disabled:opacity-50"
            >
              {calculating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>गणना की जा रही है...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('calculateYieldBtn')}</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>

      {/* Prediction Output & Recommendations */}
      <div className="lg:col-span-6">
        {result ? (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-card border border-green-100 space-y-5 animate-fade-in">
            
            {/* Top Stat Cards */}
            <div className="bg-gradient-to-br from-green-800 to-emerald-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-32 h-32" />
              </div>

              <div className="relative z-10">
                <span className="text-xs uppercase tracking-wider font-bold text-green-300">
                  {result.crop} • {result.soilType} Soil
                </span>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">
                    {result.predictedYieldPerAcreQuintals}
                  </span>
                  <span className="text-base font-semibold text-green-200">
                    {t('quintals')} / एकड़
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-green-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-green-300 block text-[11px]">{t('totalEstimatedYield')}</span>
                    <strong className="text-white text-base">
                      {result.totalPredictedYieldQuintals} {t('quintals')} ({result.areaAcres} एकड़)
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="text-green-300 block text-[11px]">मॉडल शुद्धता (Confidence)</span>
                    <strong className="text-emerald-300 text-base">{result.confidenceScore}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-950">
                  {t('benchmarkComparison')}
                </span>
                <p className="text-[11px] text-emerald-800">
                  जिले का औसत: <strong>{result.districtBenchmarkQuintals} क्विंटल/एकड़</strong>
                </p>
              </div>

              <div className="flex items-center gap-1 text-sm font-black text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>+{result.yieldDeltaPercentage}%</span>
              </div>
            </div>

            {/* Agronomic Action Tips to Maximize Harvest */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{t('actionTips')}</span>
              </h4>

              <div className="space-y-2">
                {result.actionableTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-gray-100 text-xs text-gray-700 leading-relaxed shadow-xs flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-10 text-center shadow-card border border-green-100 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-gray-800">
              सटीक पैदावार अनुमान तैयार करें
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              अपनी फसल, खेत का आकार और मृदा स्वास्थ्य कार्ड विवरण दर्ज करें। एक्सजीबूस्ट (XGBoost) मॉडल आपके खेत की संभावित उपज का विश्लेषण करेगा।
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
