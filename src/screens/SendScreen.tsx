import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Coins,
  AlertCircle,
  Users,
  ChevronDown,
  Info,
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { User, UserWallet, Currency } from '../types';
import { api } from '../services/api';

interface SendScreenProps {
  user: User;
  wallet: UserWallet;
  onProceedToReview: (transferData: {
    recipientAddress: string;
    recipientName: string;
    currency: Currency;
    amount: number;
    lockDurationSeconds: number;
    lockLabel: string;
    note: string;
  }) => void;
  onBack: () => void;
  lang: Language;
}

export const SendScreen: React.FC<SendScreenProps> = ({
  user,
  wallet,
  onProceedToReview,
  onBack,
  lang,
}) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USDT');
  const [amount, setAmount] = useState('');
  const [lockDurationSeconds, setLockDurationSeconds] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isCustomLock, setIsCustomLock] = useState(false);
  const [note, setNote] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    // Load registered users for easy contact picking
    api.getUsers()
      .then((users) => {
        // filter out current user
        setRegisteredUsers(users.filter((u) => u.id !== user.id));
      })
      .catch((err) => console.error(err));
  }, [user.id]);

  const lockOptions = [
    { label: t.noLock, seconds: 0 },
    { label: t.lock5m, seconds: 300 },
    { label: t.lock15m, seconds: 900 },
    { label: t.lock30m, seconds: 1800 },
    { label: t.lock1h, seconds: 3600 },
    { label: t.lock6h, seconds: 21600 },
    { label: t.lock12h, seconds: 43200 },
    { label: t.lock24h, seconds: 86400 },
    { label: t.lock3d, seconds: 259200 },
    { label: t.lock7d, seconds: 604800 },
  ];

  const currentAvailable = wallet.balances[selectedCurrency]?.available || 0;

  const handleMax = () => {
    setAmount(currentAvailable.toString());
  };

  const handleSelectContact = (contact: any) => {
    setRecipientAddress(contact.address);
    setShowContactPicker(false);
    setError('');
  };

  const handleContinue = () => {
    setError('');
    const cleanAddress = recipientAddress.trim().toLowerCase();
    if (!cleanAddress) {
      setError(lang === 'ar' ? 'يرجى إدخال عنوان محفظة المستلم' : 'Please enter recipient wallet address');
      return;
    }

    if (!cleanAddress.startsWith('0x') && cleanAddress.length !== 10) {
      setError(
        lang === 'ar'
          ? 'يجب أن يبدأ عنوان المحفظة بالرمز 0x أو يكون رمز استلام صالحاً'
          : 'Wallet address must start with 0x or be a valid 10-char code'
      );
      return;
    }

    if (cleanAddress === wallet.address.toLowerCase()) {
      setError(lang === 'ar' ? 'لا يمكن التحويل لنفس المحفظة' : 'Cannot send to your own wallet');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(lang === 'ar' ? 'يرجى إدخال مبلغ صالح أكبر من صفر' : 'Please enter a valid amount > 0');
      return;
    }

    if (numAmount > currentAvailable) {
      setError(
        lang === 'ar'
          ? `الرصيد المتاح غير كافٍ. المتاح حالياً: ${currentAvailable} ${selectedCurrency}`
          : `Insufficient balance. Available: ${currentAvailable} ${selectedCurrency}`
      );
      return;
    }

    let finalLockSeconds = lockDurationSeconds;
    let finalLockLabel = lockOptions.find((o) => o.seconds === lockDurationSeconds)?.label || t.noLock;

    if (isCustomLock) {
      const mins = parseFloat(customMinutes);
      if (isNaN(mins) || mins <= 0) {
        setError(lang === 'ar' ? 'أدخل عدد دقائق صالح للقفل المخصص' : 'Enter valid custom minutes');
        return;
      }
      finalLockSeconds = Math.round(mins * 60);
      finalLockLabel = `${mins} ${lang === 'ar' ? 'دقيقة (مخصصة)' : 'Minutes (Custom)'}`;
    }

    // Lookup recipient display name if available from contact list
    const foundContact = registeredUsers.find(
      (u) => u.address.toLowerCase() === cleanAddress || u.receiveCode.toLowerCase() === cleanAddress
    );

    onProceedToReview({
      recipientAddress: cleanAddress,
      recipientName: foundContact ? foundContact.name : lang === 'ar' ? 'محفظة مستلم 0x' : '0x Recipient Wallet',
      currency: selectedCurrency,
      amount: numAmount,
      lockDurationSeconds: finalLockSeconds,
      lockLabel: finalLockLabel,
      note: note.trim(),
    });
  };

  return (
    <div className="flex-1 bg-[#0b0f17] flex flex-col p-4 pb-20 overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-[#141e2c] hover:bg-[#1a273a] text-gray-300 transition"
        >
          {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </button>
        <h2 className="text-base font-bold text-gray-100">{t.sendTitle}</h2>
        <div className="w-8"></div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Recipient Address */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-300">{t.recipientAddress}</label>
            {registeredUsers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowContactPicker(!showContactPicker)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Users className="w-3 h-3" />
                <span>{t.selectContact}</span>
              </button>
            )}
          </div>

          {/* Contact Quick Picker Dropdown */}
          {showContactPicker && (
            <div className="mb-2 p-2 bg-[#121b27] border border-gray-700 rounded-xl space-y-1">
              <div className="text-[10px] text-gray-400 mb-1 px-1">
                {lang === 'ar' ? 'اختر مستخدماً من النظام لإرسال فوري:' : 'Select a user to transfer to:'}
              </div>
              {registeredUsers.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleSelectContact(contact)}
                  className="w-full text-left rtl:text-right p-2 rounded-lg hover:bg-[#182333] transition flex items-center justify-between text-xs"
                >
                  <div className="font-semibold text-gray-200">{contact.name}</div>
                  <div className="font-mono-code text-[10px] text-gray-400">
                    {contact.address.substring(0, 8)}...
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x7a91c4e82d6f3b105a9e7c2d8f41b6039a5d72e1"
              className="w-full bg-[#131b26] border border-gray-700/80 rounded-xl py-2.5 px-3 font-mono-code text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Currency Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t.selectCurrency}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['BTC', 'ETH', 'USDT'] as Currency[]).map((curr) => {
              const isSelected = selectedCurrency === curr;
              return (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-[#131b26] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <span className="text-xs">{curr}</span>
                  <span className="text-[10px] text-gray-400 font-mono-code mt-0.5">
                    {wallet.balances[curr]?.available}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-300">{t.amount}</label>
            <span className="text-[11px] text-gray-400 font-mono-code">
              {t.available}: {currentAvailable} {selectedCurrency}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#131b26] border border-gray-700/80 rounded-xl py-2.5 px-3 font-mono-code text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleMax}
              className="absolute end-2 top-2 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg transition"
            >
              {t.max}
            </button>
          </div>
        </div>

        {/* Time-Lock Feature (Core Feature) */}
        <div className="bg-[#111824] border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs font-bold text-gray-100">{t.lockDuration}</h3>
          </div>
          <p className="text-[11px] text-gray-400 mb-3">{t.lockDurationDesc}</p>

          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {lockOptions.map((opt) => {
              const active = !isCustomLock && lockDurationSeconds === opt.seconds;
              return (
                <button
                  key={opt.seconds}
                  type="button"
                  onClick={() => {
                    setIsCustomLock(false);
                    setLockDurationSeconds(opt.seconds);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-medium border text-center transition ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-[#141f2e] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Custom Duration Option */}
          <div className="pt-2 border-t border-gray-800/80">
            <button
              type="button"
              onClick={() => setIsCustomLock(!isCustomLock)}
              className={`text-[11px] font-medium transition flex items-center gap-1.5 ${
                isCustomLock ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>{t.customLock}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition ${isCustomLock ? 'rotate-180' : ''}`} />
            </button>

            {isCustomLock && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder={lang === 'ar' ? 'المدة بالدقائق' : 'Minutes'}
                  className="w-32 bg-[#131b26] border border-gray-700 rounded-xl py-1.5 px-3 text-xs text-white"
                />
                <span className="text-xs text-gray-400">{lang === 'ar' ? 'دقيقة' : 'Minutes'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Note (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">{t.noteOptional}</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={lang === 'ar' ? 'مثال: دفعة تجريبية للمشروع' : 'e.g. Test transfer payment'}
            className="w-full bg-[#131b26] border border-gray-700/80 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 mt-4"
        >
          <span>{t.continue}</span>
          {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
