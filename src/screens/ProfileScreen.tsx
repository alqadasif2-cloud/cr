import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User as UserIcon,
  ShieldCheck,
  Key,
  Copy,
  Calendar,
  Check,
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { User, UserWallet } from '../types';

interface ProfileScreenProps {
  user: User;
  wallet: UserWallet;
  onBack: () => void;
  lang: Language;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  wallet,
  onBack,
  lang,
}) => {
  const [copied, setCopied] = React.useState(false);
  const t = translations[lang];

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <h2 className="text-base font-bold text-gray-100">{t.profile}</h2>
        <div className="w-8"></div>
      </div>

      {/* Avatar & Name */}
      <div className="bg-[#121926] border border-gray-800 rounded-3xl p-6 text-center mb-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 mx-auto mb-3">
          <div className="w-full h-full bg-[#0d131f] rounded-[22px] flex items-center justify-center font-bold text-emerald-400 text-xl">
            {user.name.charAt(0)}
          </div>
        </div>
        <h3 className="text-base font-bold text-white mb-0.5">{user.name}</h3>
        <div className="text-xs text-gray-400 font-mono-code mb-2">@{user.username}</div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'حساب موثق ونشط' : 'Verified & Active'}</span>
        </div>
      </div>

      {/* Info fields */}
      <div className="bg-[#121926] border border-gray-800 rounded-2xl p-4 space-y-3.5 text-xs mb-4">
        <div>
          <span className="text-gray-400 block mb-1">{lang === 'ar' ? 'عنوان المحفظة الرئيسي' : 'Primary Wallet Address'}</span>
          <div className="bg-[#0b0f17] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between font-mono-code text-[11px] text-gray-200">
            <span className="truncate pr-2">{wallet.address}</span>
            <button
              onClick={handleCopy}
              className="text-emerald-400 hover:text-emerald-300 font-sans text-xs flex items-center gap-1 shrink-0 font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم' : 'نسخ'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <span className="text-gray-400">{lang === 'ar' ? 'معرّف رابط الاستلام' : 'Receive Code'}</span>
          <span className="font-mono-code text-gray-200 font-bold">{wallet.receiveCode}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <span className="text-gray-400">{lang === 'ar' ? 'تاريخ الانضمام' : 'Member Since'}</span>
          <span className="font-mono-code text-gray-200">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <span className="text-gray-400">{t.accountStatus}</span>
          <span className="text-emerald-400 font-semibold">{t.active}</span>
        </div>
      </div>
    </div>
  );
};
