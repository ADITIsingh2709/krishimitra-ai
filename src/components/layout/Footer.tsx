'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { PhoneCall, Shield, HeartHandshake, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-b from-green-950 to-slate-950 text-gray-300 pt-12 pb-8 border-t border-green-900/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Emergency & Helpline Bar */}
        <div className="bg-gradient-to-r from-emerald-900/70 to-green-900/70 border border-green-700/50 rounded-2xl p-4 sm:p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base sm:text-lg">
                राष्ट्रीय किसान कॉल सेंटर (Kisan Call Center Helpline)
              </h4>
              <p className="text-xs sm:text-sm text-green-200">
                कृषि विशेषज्ञों से सीधे 22 भारतीय भाषाओं में निःशुल्क बात करें (टोल-फ्री)
              </p>
            </div>
          </div>
          <a
            href="tel:18001801551"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>1800-180-1551</span>
          </a>
        </div>

        {/* Informational Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800 text-sm">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <div className="w-7 h-7 rounded-lg bg-green-500 text-white flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <span>{t('appName')}</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
              भारतीय कृषि अनुसंधान परिषद (ICAR), राज्य कृषि विश्वविद्यालयों (SAUs) और कृषि विज्ञान केंद्रों (KVKs) के वैज्ञानिक पैकेज पर आधारित पूर्ण एआई निर्णय सहायता प्रणाली।
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <Shield className="w-4 h-4" />
              <span>100% CIBRC प्रमाणित कीटनाशक व उर्वरक सुरक्षा दिशानिर्देश</span>
            </div>
          </div>

          {/* Useful Farmer Portals */}
          <div>
            <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider text-green-400">
              सरकारी कृषि पोर्टल
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:text-green-300">
                  PM-KISAN सम्मान निधि
                </a>
              </li>
              <li>
                <a href="https://pmfby.gov.in" target="_blank" rel="noreferrer" className="hover:text-green-300">
                  प्रधानमंत्री फसल बीमा योजना (PMFBY)
                </a>
              </li>
              <li>
                <a href="https://soilhealth.dac.gov.in" target="_blank" rel="noreferrer" className="hover:text-green-300">
                  मृदा स्वास्थ्य कार्ड पोर्टल (Soil Health)
                </a>
              </li>
              <li>
                <a href="https://enam.gov.in" target="_blank" rel="noreferrer" className="hover:text-green-300">
                  राष्ट्रीय कृषि बाजार (e-NAM मंडी भाव)
                </a>
              </li>
            </ul>
          </div>

          {/* Technology & Offline Support */}
          <div>
            <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider text-green-400">
              तकनीकी सुविधाएं
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span>PWA ऑफलाइन रोग गाइड कैशिंग</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span>फास्टएपीआई सीएनएन ट्रांसफर लर्निंग</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span>क्लाउड 3.5 बहुभाषी चैटबॉट</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span>ह्यूमन-इन-द-लूप एग्रोनोमिस्ट सत्यापन</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} Krishimitra AI. Dedicated to Indian Farmers & Atmanirbhar Krishi.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-red-400" />
              <span>Made with respect for our Annadata</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
