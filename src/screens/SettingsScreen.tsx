import React from 'react';
import {
  Globe,
  Smartphone,
  ShieldAlert,
  Sliders,
  Code2,
  LogOut,
  ChevronRight,
  User as UserIcon,
  HelpCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { User, UserWallet } from '../types';

interface SettingsScreenProps {
  user: User;
  wallet: UserWallet;
  lang: Language;
  onToggleLang: () => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onSwitchUser: (username: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  wallet,
  lang,
  onToggleLang,
  isFrameMode,
  onToggleFrameMode,
  onNavigate,
  onLogout,
  onSwitchUser,
}) => {
  const t = translations[lang];

  return (
    <div className="flex-1 bg-[#0b0f17] flex flex-col p-4 pb-20 overflow-y-auto space-y-4">
      <div className="pt-1">
        <h2 className="text-base font-bold text-gray-100 mb-1">{t.settingsTitle}</h2>
        <p className="text-xs text-gray-400">
          {lang === 'ar' ? 'تخصيص التطبيق، اللغات، وإعدادات النظام' : 'App preferences, language and developer tools'}
        </p>
      </div>

      {/* User profile brief card */}
      <div
        onClick={() => onNavigate('profile')}
        className="bg-[#121926] hover:bg-[#162132] border border-gray-800 rounded-2xl p-4 flex items-center justify-between transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5">
            <div className="w-full h-full bg-[#0d131f] rounded-[14px] flex items-center justify-center font-bold text-emerald-400 text-sm">
              {user.name.charAt(0)}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-white">{user.name}</div>
            <div className="text-[11px] text-gray-400 font-mono-code">@{user.username}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 4)}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 rtl:rotate-180" />
      </div>

      {/* Fast User Switcher for Real Sandbox Multi-User Testing */}
      <div className="bg-[#121926] border border-emerald-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
          <Users className="w-4 h-4" />
          <span>{t.switchAccount}</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-3">{t.testWithTwoUsers}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onSwitchUser('ahmed')}
            className={`p-2.5 rounded-xl border text-left rtl:text-right transition ${
              user.username === 'ahmed'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-[#141f2e] border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="font-semibold text-xs">أحمد المنصور</div>
            <div className="text-[10px] text-gray-400 font-mono">@ahmed</div>
          </button>
          <button
            onClick={() => onSwitchUser('nour')}
            className={`p-2.5 rounded-xl border text-left rtl:text-right transition ${
              user.username === 'nour'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-[#141f2e] border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="font-semibold text-xs">نور الصباح</div>
            <div className="text-[10px] text-gray-400 font-mono">@nour</div>
          </button>
        </div>
      </div>

      {/* Preferences Group */}
      <div className="bg-[#121926] border border-gray-800 rounded-2xl divide-y divide-gray-800 text-xs">
        {/* Language */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-gray-200">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t.language}</span>
          </div>
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1 rounded-lg bg-[#182333] border border-gray-700 text-gray-200 hover:text-white font-medium text-[11px] transition"
          >
            {lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-gray-200">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{t.appearance}</span>
          </div>
          <button
            onClick={onToggleFrameMode}
            className="px-2.5 py-1 rounded-lg bg-[#182333] border border-gray-700 text-gray-200 hover:text-white font-medium text-[11px] transition"
          >
            {isFrameMode ? t.desktopMode : t.androidFrame}
          </button>
        </div>
      </div>

      {/* Developer & Architecture tools */}
      <div className="bg-[#121926] border border-gray-800 rounded-2xl divide-y divide-gray-800 text-xs">
        {/* Android Native Source Inspector */}
        <div
          onClick={() => onNavigate('android-export')}
          className="p-3.5 flex items-center justify-between hover:bg-[#162132] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
            <Code2 className="w-4 h-4" />
            <span>{t.androidCodeHub}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 rtl:rotate-180" />
        </div>

        {/* Admin Dashboard */}
        <div
          onClick={() => onNavigate('admin')}
          className="p-3.5 flex items-center justify-between hover:bg-[#162132] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-gray-200">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>{t.adminDashboard}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 rtl:rotate-180" />
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>{t.logout}</span>
      </button>

      {/* Version footer */}
      <div className="text-center text-[10px] text-gray-400 pt-2 font-mono-code">
        <div>Crypto Wallet Android • Version 1.0.0</div>
        <div>Kotlin • Jetpack Compose • Material 3 • Cloud Architecture</div>
      </div>
    </div>
  );
};
