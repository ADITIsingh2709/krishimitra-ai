'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { 
  UserProfile, 
  DiseaseDiagnosis, 
  RegionalAlert, 
  AdminActivityLog, 
  KvkCenter 
} from '@/types';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Send, 
  Building2, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Sparkles, 
  History,
  Check,
  Eye,
  X
} from 'lucide-react';

interface AdminDashboardViewProps {
  user: UserProfile | null;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user }) => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'farmers' | 'alerts' | 'kvk' | 'logs'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [reviewScans, setReviewScans] = useState<DiseaseDiagnosis[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<RegionalAlert[]>([]);
  const [kvkCenters, setKvkCenters] = useState<KvkCenter[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal / action states
  const [selectedScan, setSelectedScan] = useState<DiseaseDiagnosis | null>(null);
  const [correctedName, setCorrectedName] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // New Alert Form state
  const [alertTitle, setAlertTitle] = useState('');
  const [alertCrop, setAlertCrop] = useState('Wheat');
  const [alertState, setAlertState] = useState('Punjab');
  const [alertDistrict, setAlertDistrict] = useState('Ludhiana');
  const [alertSeverity, setAlertSeverity] = useState<'warning' | 'high' | 'critical'>('high');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertAction, setAlertAction] = useState('');

  // New KVK Form state
  const [newKvkModal, setNewKvkModal] = useState(false);
  const [kvkName, setKvkName] = useState('');
  const [kvkType, setKvkType] = useState<'KVK' | 'Krishi Seva Kendra'>('KVK');
  const [kvkState, setKvkState] = useState('Punjab');
  const [kvkDistrict, setKvkDistrict] = useState('Ludhiana');
  const [kvkAddress, setKvkAddress] = useState('');
  const [kvkPhone, setKvkPhone] = useState('');
  const [kvkPerson, setKvkPerson] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('krishi_token') || '' : '';

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resAnalytics, resQueue, resFarmers, resAlerts, resKvk, resLogs] = await Promise.all([
        fetch('/api/admin/analytics', { headers }).then(r => r.json()),
        fetch('/api/admin/review-queue', { headers }).then(r => r.json()),
        fetch('/api/admin/farmers', { headers }).then(r => r.json()),
        fetch('/api/admin/alerts', { headers }).then(r => r.json()),
        fetch('/api/kvk', { credentials: 'omit' }).then(r => r.json()),
        fetch('/api/admin/logs', { headers }).then(r => r.json()),
      ]);

      if (resAnalytics.success) setAnalytics(resAnalytics.analytics);
      if (resQueue.success) setReviewScans(resQueue.scans);
      if (resFarmers.success) setFarmers(resFarmers.farmers);
      if (resAlerts.success) setAlerts(resAlerts.alerts);
      if (resKvk.success) setKvkCenters(resKvk.centers);
      if (resLogs.success) setAdminLogs(resLogs.logs);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Verify or Correct human-in-the-loop action
  const handleReviewAction = async (action: 'VERIFY' | 'CORRECT') => {
    if (!selectedScan) return;

    try {
      const res = await fetch('/api/admin/review-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          scanId: selectedScan.id,
          action,
          correctedDisease: action === 'CORRECT' ? correctedName : undefined,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(action === 'CORRECT' ? 'निदान सफलतापूर्वक सुधारा गया और री-ट्रेनिंग हेतु दर्ज किया गया!' : 'निदान वैज्ञानिक रूप से सत्यापित कर दिया गया!');
        setTimeout(() => {
          setActionSuccess('');
          setSelectedScan(null);
        }, 1500);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Review submit failed:', err);
    }
  };

  // Handle Publish Alert
  const handlePublishAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: alertTitle,
          crop: alertCrop,
          state: alertState,
          district: alertDistrict,
          severity: alertSeverity,
          message: alertMessage,
          actionRequired: alertAction,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('क्षेत्रीय कीट/रोग अलर्ट सफलतापूर्वक प्रसारित कर दिया गया!');
        setAlertTitle('');
        setAlertMessage('');
        setAlertAction('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Alert publishing error:', err);
    }
  };

  // Handle Add KVK Center
  const handleAddKvk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kvk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: kvkName,
          type: kvkType,
          state: kvkState,
          district: kvkDistrict,
          address: kvkAddress,
          phone: kvkPhone,
          contactPerson: kvkPerson,
          latitude: 30.9010,
          longitude: 75.8573,
          services: ['मृदा व जल परीक्षण', 'प्रमाणित बीज वितरण', 'कृषि वैज्ञानिक परामर्श'],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewKvkModal(false);
        setKvkName('');
        setKvkAddress('');
        setKvkPhone('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Add KVK error:', err);
    }
  };

  // Handle Delete KVK Center
  const handleDeleteKvk = async (id: string) => {
    if (!confirm('क्या आप वाकई इस केंद्र को हटाना चाहते हैं?')) return;
    try {
      await fetch(`/api/kvk?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchAdminData();
    } catch (err) {
      console.error('Delete KVK error:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Title Header */}
      <div className="glass-panel rounded-3xl p-6 shadow-card border border-amber-200 bg-gradient-to-r from-amber-500/10 via-green-500/10 to-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-lg shadow-amber-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900">
                {t('adminTitle')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                Agronomist Portal
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              प्रभारी वैज्ञानिक: <strong>{user?.name || 'Dr. V. K. Sharma'}</strong> • ICAR/KVK Admin Console
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-amber-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            सांख्यिकी (Overview)
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'queue' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            <span>रिव्यू कतार</span>
            {reviewScans.filter(s => s.status === 'under_review').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {reviewScans.filter(s => s.status === 'under_review').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('farmers')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'farmers' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            किसान सूची ({farmers.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'alerts' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            अलर्ट जारी करें
          </button>
          <button
            onClick={() => setActiveTab('kvk')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'kvk' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            केवीके केंद्र ({kvkCenters.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'logs' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            ऑडिट लॉग
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-3xl p-5 shadow-card border border-green-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">कुल पंजीकृत किसान</span>
                <h4 className="text-2xl font-black text-gray-900">{analytics?.totalFarmers || 4}</h4>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 shadow-card border border-green-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">इस सप्ताह कुल जांचें</span>
                <h4 className="text-2xl font-black text-gray-900">{analytics?.scansThisWeek || 4}</h4>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 shadow-card border border-amber-200 bg-amber-50/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-amber-900 font-medium">समीक्षा कतार (कम विश्वास)</span>
                <h4 className="text-2xl font-black text-amber-800">{analytics?.pendingReviews || 2}</h4>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 shadow-card border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">चैटबॉट परामर्श (आज)</span>
                <h4 className="text-2xl font-black text-gray-900">{analytics?.chatbotQueriesToday || 42}</h4>
              </div>
            </div>
          </div>

          {/* Disease Prevalence Matrix */}
          <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100">
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-700" />
              <span>क्षेत्रीय फसल रोग निगरानी एवं आवृत्ति (Disease Distribution by Scans)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {analytics?.diseaseBreakdown && Object.entries(analytics.diseaseBreakdown).map(([name, count]: any, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1">
                      <span>{name}</span>
                      <span className="text-green-700">{count} मामले</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, count * 25)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50/60 rounded-2xl border border-green-200 text-xs space-y-3">
                <h4 className="font-bold text-green-950">कृषि वैज्ञानिक सारांश बुलेटिन:</h4>
                <p className="text-green-900 leading-relaxed">
                  • <strong>उत्तर भारत (पंजाब-हरियाणा):</strong> हालिया नम मौसम के कारण गेहूं में पीली रतुआ (Yellow Stripe Rust) का प्रकोप देखा गया है। अनुशंसित फफूंदनाशक का त्वरित छिड़काव आवश्यक है।
                </p>
                <p className="text-green-900 leading-relaxed">
                  • <strong>मध्य व दक्षिण भारत:</strong> टमाटर में अर्ली ब्लाइट तथा धान में ब्लास्ट के मामले सामने आए हैं। 85% से कम विश्वसनीयता वाले सभी नमूनों को मानव सत्यापन (Human-in-the-Loop) से प्रमाणित किया जा रहा है।
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: HUMAN-IN-THE-LOOP REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-panel rounded-3xl p-6 shadow-card border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>{t('humanInTheLoop')}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  सीएनएन मॉडल द्वारा 85% से कम विश्वसनीयता पर चिन्हित निदान। कृषि वैज्ञानिक द्वारा पुष्टि या सुधार किए जाने पर मॉडल री-ट्रेनिंग डेटासेट में जोड़ा जाता है।
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {reviewScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    scan.status === 'under_review'
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={scan.imageUrl}
                      alt={scan.crop}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {scan.diseaseDetected}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          scan.confidence < 85 ? 'bg-amber-200 text-amber-900' : 'bg-green-100 text-green-800'
                        }`}>
                          विश्वास: {scan.confidence}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        फसल: <strong>{scan.crop}</strong> • किसान आईडी: {scan.farmerId} • {new Date(scan.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      {scan.adminNotes && (
                        <p className="text-[11px] text-green-800 font-semibold mt-1">
                          📝 वैज्ञानिक टिप्पणी: {scan.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {scan.status === 'under_review' ? (
                      <button
                        onClick={() => {
                          setSelectedScan(scan);
                          setCorrectedName(scan.diseaseDetected);
                          setAdminNotes('');
                        }}
                        className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>जांचें व सत्यापित करें</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-green-100 text-green-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>सत्यापित</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVIEW ACTION MODAL (Confirm / Correct with Retraining Log) */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-green-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                रोग निदान समीक्षा व सुधार (Human-in-the-Loop)
              </h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <img
                src={selectedScan.imageUrl}
                alt="Leaf"
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="text-xs">
                <p className="font-bold text-gray-900">फसल: {selectedScan.crop}</p>
                <p className="text-gray-600">एआई मॉडल का प्रारंभिक निदान: <strong>{selectedScan.diseaseDetected}</strong></p>
                <p className="text-amber-700 font-semibold">विश्वास स्तर: {selectedScan.confidence}% (संदिग्ध)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                यदि गलत है, तो सही रोग चुनें या नाम लिखें (Corrected Disease):
              </label>
              <input
                type="text"
                value={correctedName}
                onChange={(e) => setCorrectedName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                कृषि वैज्ञानिक सलाह व दवा टिप्पणी (Agronomist Notes):
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="दवा की सटीक मात्रा व किसान के लिए विशेष निर्देश दर्ज करें..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
              />
            </div>

            {actionSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleReviewAction('VERIFY')}
                className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>निदान सही है (Verify)</span>
              </button>

              <button
                type="button"
                onClick={() => handleReviewAction('CORRECT')}
                className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
              >
                <Edit3 className="w-4 h-4" />
                <span>सुधारें (Correct & Retrain)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FARMER DIRECTORY */}
      {activeTab === 'farmers' && (
        <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">
              {t('farmerDirectory')}
            </h3>
            <span className="text-xs text-gray-500">गोपनीयता संरक्षित (Privacy-Preserved View)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-green-50/80 text-green-950 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">किसान का नाम</th>
                  <th className="p-3">मोबाइल नंबर</th>
                  <th className="p-3">राज्य व जिला</th>
                  <th className="p-3">मुख्य फसलें</th>
                  <th className="p-3">भूमि (एकड़)</th>
                  <th className="p-3">कुल जांचें</th>
                  <th className="p-3 rounded-r-xl">पंजीकरण तिथि</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farmers.map((f) => (
                  <tr key={f.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="p-3 font-bold text-gray-900">{f.name}</td>
                    <td className="p-3 text-gray-600">******{f.phone.slice(-4)}</td>
                    <td className="p-3 text-gray-700">{f.location?.district || 'Ludhiana'}, {f.location?.state || 'Punjab'}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {f.primaryCrops?.map((c: string) => (
                          <span key={c} className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-semibold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">{f.landSizeAcres || 2.5}</td>
                    <td className="p-3 font-bold text-green-700">{f.scansCount || 1}</td>
                    <td className="p-3 text-gray-500">{new Date(f.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST REGIONAL ALERTS */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Create Alert Form */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 shadow-card border border-green-100">
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {t('broadcastAlerts')}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              क्षेत्रीय किसानों के मोबाइल पर सीधा पुश नोटिफिकेशन चेतावनी संदेश भेजें
            </p>

            <form onSubmit={handlePublishAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">शीर्षक (Alert Title):</label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="उदा. गेहूं में पीली रतुआ का प्रकोप"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">प्रभावित फसल:</label>
                  <select
                    value={alertCrop}
                    onChange={(e) => setAlertCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  >
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Rice">Rice (धान)</option>
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                    <option value="All">All Standing Crops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">गंभीरता (Severity):</label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  >
                    <option value="warning">Warning (चेतावनी)</option>
                    <option value="high">High (गंभीर)</option>
                    <option value="critical">Critical (अति गंभीर)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">राज्य:</label>
                  <input
                    type="text"
                    required
                    value={alertState}
                    onChange={(e) => setAlertState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">जिला:</label>
                  <input
                    type="text"
                    required
                    value={alertDistrict}
                    onChange={(e) => setAlertDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">विस्तृत संदेश (Message):</label>
                <textarea
                  rows={2}
                  required
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="लक्षण व मौसमी अनुकूलता का विवरण..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">तुरंत की जाने वाली कार्रवाई (Action Required):</label>
                <textarea
                  rows={2}
                  required
                  value={alertAction}
                  onChange={(e) => setAlertAction(e.target.value)}
                  placeholder="रासायनिक दवा व उचित मात्रा..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-green-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{t('publishAlert')}</span>
              </button>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 shadow-card border border-green-100 space-y-3">
            <h3 className="font-bold text-gray-900 text-base mb-2">
              सक्रिय क्षेत्रीय अलर्ट्स ({alerts.length})
            </h3>

            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>{alt.title}</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                    {alt.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-700">{alt.message}</p>
                <p className="text-xs font-bold text-amber-900">💡 समाधान: {alt.actionRequired}</p>
                <div className="pt-1 text-[10px] text-gray-500 flex items-center justify-between">
                  <span>जारीकर्ता: {alt.adminName}</span>
                  <span>{new Date(alt.broadcastDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 5: KVK CENTER DIRECTORY MANAGEMENT */}
      {activeTab === 'kvk' && (
        <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {t('kvkManagement')}
              </h3>
              <p className="text-xs text-gray-500">
                कृषि विज्ञान केंद्र व सेवा केंद्रों के संपर्क सूत्र एवं सेवाओं का संपादन
              </p>
            </div>
            <button
              onClick={() => setNewKvkModal(true)}
              className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>नया केंद्र जोड़ें</span>
            </button>
          </div>

          <div className="space-y-3">
            {kvkCenters.map((center) => (
              <div
                key={center.id}
                className="p-4 rounded-2xl border border-gray-100 bg-white/70 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                      {center.type}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm">{center.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{center.address}</p>
                  <p className="text-xs text-gray-700 mt-0.5">
                    📞 {center.phone} • 👤 {center.contactPerson}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteKvk(center.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* New KVK Modal */}
          {newKvkModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm">नया केवीके/सेवा केंद्र जोड़ें</h4>
                  <button onClick={() => setNewKvkModal(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleAddKvk} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">केंद्र का नाम:</label>
                    <input
                      type="text"
                      required
                      value={kvkName}
                      onChange={(e) => setKvkName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">राज्य:</label>
                      <input
                        type="text"
                        required
                        value={kvkState}
                        onChange={(e) => setKvkState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">जिला:</label>
                      <input
                        type="text"
                        required
                        value={kvkDistrict}
                        onChange={(e) => setKvkDistrict(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">पता (Address):</label>
                    <input
                      type="text"
                      required
                      value={kvkAddress}
                      onChange={(e) => setKvkAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">हेल्पलाइन नंबर:</label>
                      <input
                        type="text"
                        required
                        value={kvkPhone}
                        onChange={(e) => setKvkPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">प्रभारी अधिकारी:</label>
                      <input
                        type="text"
                        required
                        value={kvkPerson}
                        onChange={(e) => setKvkPerson(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    केंद्र सुरक्षित करें
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 6: ADMIN AUDIT LOG */}
      {activeTab === 'logs' && (
        <div className="glass-panel rounded-3xl p-6 shadow-card border border-green-100 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">
              {t('adminAuditLog')}
            </h3>
            <span className="text-xs text-gray-500">अपरिवर्तनीय प्रशासनिक गतिविधि इतिहास</span>
          </div>

          <div className="space-y-2">
            {adminLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-white rounded-xl border border-gray-100 flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{log.adminName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">{log.details}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
