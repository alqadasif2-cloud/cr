import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sliders,
  Users,
  Layers,
  Clock,
  RotateCcw,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { api } from '../services/api';

interface AdminScreenProps {
  onBack: () => void;
  lang: Language;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack, lang }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const t = translations[lang];

  const loadData = async () => {
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    if (confirm(lang === 'ar' ? 'هل تريد بالتأكيد إعادة ضبط النظام إلى الحالة الافتراضية؟' : 'Reset all data to default demo state?')) {
      try {
        setLoading(true);
        await api.resetAdminDemo();
        setMessage(lang === 'ar' ? 'تمت إعادة ضبط النظام بنجاح' : 'System reset to default state');
        await loadData();
      } catch (err: any) {
        setMessage(err.message || 'فشل في إعادة الضبط');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f17] flex flex-col p-4 pb-20 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#141e2c] hover:bg-[#1a273a] text-gray-300 transition"
        >
          {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </button>
        <h2 className="text-base font-bold text-gray-100 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>{t.adminDashboard}</span>
        </h2>
        <div className="w-8"></div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-white ml-2">×</button>
        </div>
      )}

      {loading || !data ? (
        <div className="text-center py-10 text-xs text-gray-400">جاري تحميل بيانات الإدارة...</div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Stat counters */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#121926] border border-gray-800 p-3 rounded-2xl text-center">
              <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400">{lang === 'ar' ? 'المستخدمين' : 'Users'}</div>
              <div className="text-base font-bold text-white font-mono-code">{data.totalUsers}</div>
            </div>
            <div className="bg-[#121926] border border-gray-800 p-3 rounded-2xl text-center">
              <Layers className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400">{lang === 'ar' ? 'المعاملات' : 'Transactions'}</div>
              <div className="text-base font-bold text-white font-mono-code">{data.totalTransactions}</div>
            </div>
            <div className="bg-[#121926] border border-gray-800 p-3 rounded-2xl text-center">
              <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400">{lang === 'ar' ? 'أقفال نشطة' : 'Active Locks'}</div>
              <div className="text-base font-bold text-white font-mono-code">{data.activeLockedCount}</div>
            </div>
          </div>

          {/* Registered Users List */}
          <div className="bg-[#121926] border border-gray-800 rounded-2xl p-4">
            <h3 className="font-bold text-gray-200 mb-2.5">{lang === 'ar' ? 'الحسابات والمحافظ المسجلة' : 'Registered Accounts'}</h3>
            <div className="space-y-2">
              {data.users.map((u: any) => (
                <div key={u.id} className="bg-[#0b0f17] p-2.5 rounded-xl border border-gray-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-200">{u.name} (@{u.username})</span>
                    <span className="text-emerald-400 font-mono-code text-[11px]">{u.balances?.USDT?.available || 0} USDT</span>
                  </div>
                  <div className="font-mono-code text-[10px] text-gray-400 truncate">{u.address}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Rules */}
          <div className="bg-[#121926] border border-gray-800 rounded-2xl p-4 space-y-2 text-gray-300">
            <h3 className="font-bold text-gray-200 mb-1">{lang === 'ar' ? 'حدود وسياسات النظام' : 'System Constraints'}</h3>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">{lang === 'ar' ? 'الحد الأقصى لمدة القفل' : 'Max Lock Duration'}:</span>
              <span className="font-mono-code text-white">{data.settings.maxLockDurationDays} {lang === 'ar' ? 'يوماً' : 'Days'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">{lang === 'ar' ? 'رسوم الشبكة الافتراضية' : 'Default Network Fee'}:</span>
              <span className="font-mono-code text-emerald-400">0.00 USDT (مجاني)</span>
            </div>
          </div>

          {/* Reset System Action */}
          <button
            onClick={handleReset}
            className="w-full py-3 bg-[#1e1518] hover:bg-red-950/50 border border-red-500/30 text-red-300 rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إعادة ضبط النظام إلى الحالة الافتراضية' : 'Reset System to Initial State'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
