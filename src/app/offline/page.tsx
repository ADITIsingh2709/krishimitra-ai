'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, Home, Sprout } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fbfdfa]">
      <div className="glass-panel rounded-3xl p-8 max-w-md w-full text-center shadow-card border border-green-100 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-gray-900">
          आप वर्तमान में ऑफ़लाइन हैं (You are Offline)
        </h1>

        <p className="text-xs text-gray-600 leading-relaxed">
          इंटरनेट नेटवर्क उपलब्ध नहीं है। कृषिमित्र AI का ऑफ़लाइन कैश सक्रिय है। आपके पहले से देखे गए रोग निदान और कृषि परामर्श उपलब्ध रहेंगे।
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>डैशबोर्ड पर लौटें</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
