import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { translations, Language } from '../i18n/translations';
import { User, UserWallet } from '../types';

interface LoginScreenProps {
  onSuccess: (user: User, wallet: UserWallet) => void;
  onGoToRegister: () => void;
  lang: Language;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onGoToRegister,
  lang,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t.fillAllFields);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await api.login(username.trim(), password);
      onSuccess(data.user, data.wallet);
    } catch (err: any) {
      setError(err.message || 'فشل في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoUsername: string) => {
    try {
      setLoading(true);
      setError('');
      setUsername(demoUsername);
      setPassword('Password123!');
      const data = await api.login(demoUsername, 'Password123!');
      onSuccess(data.user, data.wallet);
    } catch (err: any) {
      setError(err.message || 'فشل في تسجيل الدخول للحساب التجريبي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f17] p-6 flex flex-col justify-between overflow-y-auto">
      <div className="pt-4">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-0.5 mb-6 mx-auto shadow-lg flex items-center justify-center">
          <div className="w-full h-full bg-[#0d131f] rounded-[14px] flex items-center justify-center">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-white mb-1">{t.welcomeBack}</h2>
        <p className="text-xs text-center text-gray-400 mb-6">
          {lang === 'ar' ? 'قم بتسجيل الدخول إلى محفظتك المشفرة' : 'Sign in to access your secure wallet'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">{t.username}</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                className="w-full bg-[#131b26] border border-gray-700/80 rounded-xl py-2.5 px-3 ps-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <UserIcon className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">{t.password}</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131b26] border border-gray-700/80 rounded-xl py-2.5 px-3 ps-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{t.login}</span>
                {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accounts Helper */}
        <div className="mt-6 pt-5 border-t border-gray-800/80">
          <div className="text-[11px] font-medium text-gray-400 text-center mb-3">
            {lang === 'ar' ? 'أو سجّل الدخول سريعاً بحساب تجريبي معد مسبقاً:' : 'Or quick sign-in with pre-seeded test accounts:'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('ahmed')}
              disabled={loading}
              className="p-2.5 bg-[#141e2c] hover:bg-[#1a273a] border border-gray-700/60 rounded-xl text-left rtl:text-right transition group"
            >
              <div className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">أحمد المنصور</div>
              <div className="text-[10px] text-gray-400 font-mono">user: ahmed</div>
              <div className="text-[9px] text-gray-400 mt-0.5">0.045 BTC · 1,850 USDT</div>
            </button>
            <button
              onClick={() => handleQuickDemo('nour')}
              disabled={loading}
              className="p-2.5 bg-[#141e2c] hover:bg-[#1a273a] border border-gray-700/60 rounded-xl text-left rtl:text-right transition group"
            >
              <div className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">نور الصباح</div>
              <div className="text-[10px] text-gray-400 font-mono">user: nour</div>
              <div className="text-[9px] text-gray-400 mt-0.5">0.025 BTC · 950 USDT</div>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-6 pb-2 text-center">
        <button
          onClick={onGoToRegister}
          className="text-xs text-gray-400 hover:text-emerald-400 transition"
        >
          {t.loginPrompt}
        </button>
      </div>
    </div>
  );
};
