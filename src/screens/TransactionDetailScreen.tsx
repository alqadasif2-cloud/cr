import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { Transaction, User } from '../types';
import { api } from '../services/api';

interface TransactionDetailScreenProps {
  txId: string;
  user: User;
  onBack: () => void;
  lang: Language;
}

export const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({
  txId,
  user,
  onBack,
  lang,
}) => {
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    api.getTransaction(txId)
      .then((data) => setTx(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [txId]);

  if (loading || !tx) {
    return (
      <div className="flex-1 bg-[#0b0f17] flex items-center justify-center p-6 text-xs text-gray-400">
        <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        <span>جاري تحميل تفاصيل المعاملة...</span>
      </div>
    );
  }

  const isSender = tx.senderUserId === user.id;
  const isLocked = tx.status === 'LOCKED';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(tx.txHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
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
        <h2 className="text-base font-bold text-gray-100">
          {lang === 'ar' ? 'تفاصيل المعاملة' : 'Transaction Details'}
        </h2>
        <div className="w-8"></div>
      </div>

      {/* Main Status & Amount Card */}
      <div className="bg-[#121926] border border-gray-800 rounded-3xl p-5 text-center mb-4">
        <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 bg-emerald-500/10 text-emerald-400">
          {isLocked ? (
            <Clock className="w-6 h-6 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          )}
        </div>

        <div className="text-2xl font-bold font-mono-code text-white mb-1">
          {isSender ? '-' : '+'}
          {tx.amount} {tx.currency}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#182333] border border-gray-700 text-gray-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isLocked ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          ></span>
          <span>{isLocked ? t.statusLocked : t.statusCompleted}</span>
        </div>
      </div>

      {/* Details List */}
      <div className="bg-[#121926] border border-gray-800 rounded-2xl p-4 space-y-3 text-xs mb-4">
        {/* Transaction Hash */}
        <div className="pb-2.5 border-b border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span>{lang === 'ar' ? 'معرّف المعاملة (TxHash)' : 'Transaction Hash'}</span>
            <button
              onClick={handleCopyHash}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium text-[11px]"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHash ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>
          <div className="font-mono-code text-[11px] text-gray-300 break-all bg-[#0b0f17] p-2 rounded-xl border border-gray-800">
            {tx.txHash}
          </div>
        </div>

        {/* Sender */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
          <span className="text-gray-400">{t.sender}</span>
          <span className="font-semibold text-gray-200">{tx.senderName}</span>
        </div>

        {/* Recipient */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
          <span className="text-gray-400">{t.recipient}</span>
          <span className="font-semibold text-gray-200">{tx.recipientName}</span>
        </div>

        {/* Addresses */}
        <div className="pb-2.5 border-b border-gray-800">
          <span className="text-gray-400 block mb-0.5">{lang === 'ar' ? 'عنوان المرسل' : 'Sender Address'}</span>
          <span className="font-mono-code text-[10px] text-gray-400 break-all">{tx.senderAddress}</span>
        </div>
        <div className="pb-2.5 border-b border-gray-800">
          <span className="text-gray-400 block mb-0.5">{lang === 'ar' ? 'عنوان المستلم' : 'Recipient Address'}</span>
          <span className="font-mono-code text-[10px] text-gray-400 break-all">{tx.recipientAddress}</span>
        </div>

        {/* Created Timestamp */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
          <span className="text-gray-400">{lang === 'ar' ? 'تاريخ ووقت الإنشاء' : 'Timestamp'}</span>
          <span className="font-mono-code text-gray-300 text-[11px]">
            {new Date(tx.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Lock Duration Info */}
        {tx.lockDurationSeconds > 0 && (
          <>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
              <span className="text-gray-400">{t.lockDuration}</span>
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {tx.lockDurationSeconds >= 86400
                    ? `${Math.round(tx.lockDurationSeconds / 86400)} ${lang === 'ar' ? 'يوم' : 'Days'}`
                    : tx.lockDurationSeconds >= 3600
                    ? `${Math.round(tx.lockDurationSeconds / 3600)} ${lang === 'ar' ? 'ساعة' : 'Hours'}`
                    : `${Math.round(tx.lockDurationSeconds / 60)} ${lang === 'ar' ? 'دقيقة' : 'Minutes'}`}
                </span>
              </span>
            </div>

            {tx.unlockAt && (
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
                <span className="text-gray-400">{t.unlockDate}</span>
                <span className="font-mono-code text-gray-200 text-[11px]">
                  {new Date(tx.unlockAt).toLocaleString()}
                </span>
              </div>
            )}
          </>
        )}

        {tx.note && (
          <div>
            <span className="text-gray-400 block mb-0.5">{t.noteOptional}:</span>
            <span className="text-gray-300 italic">{tx.note}</span>
          </div>
        )}
      </div>
    </div>
  );
};
