import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { Transaction, User, Currency } from '../types';

interface TransactionHistoryScreenProps {
  user: User;
  transactions: Transaction[];
  onSelectTx: (txId: string) => void;
  onBack: () => void;
  lang: Language;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  user,
  transactions,
  onSelectTx,
  onBack,
  lang,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received' | 'locked'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [search, setSearch] = useState('');

  const t = translations[lang];

  const filtered = transactions.filter((tx) => {
    // Type filter
    if (filterType === 'sent' && tx.senderUserId !== user.id) return false;
    if (filterType === 'received' && tx.recipientUserId !== user.id) return false;
    if (filterType === 'locked' && tx.status !== 'LOCKED') return false;

    // Currency filter
    if (selectedCurrency !== 'all' && tx.currency !== selectedCurrency) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchParty = (tx.senderName + ' ' + tx.recipientName + ' ' + tx.senderAddress + ' ' + tx.recipientAddress).toLowerCase().includes(q);
      const matchNote = (tx.note || '').toLowerCase().includes(q);
      if (!matchHash && !matchParty && !matchNote) return false;
    }

    return true;
  });

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
        <h2 className="text-base font-bold text-gray-100">{t.activity}</h2>
        <div className="w-8"></div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'ar' ? 'بحث بالعنوان، أو الطرف الآخر، أو الملاحظة...' : 'Search by address, name, note...'}
          className="w-full bg-[#131b26] border border-gray-700/80 rounded-xl py-2 px-3 ps-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <Search className="w-3.5 h-3.5 text-gray-400 absolute start-3 top-2.5" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs scrollbar-none">
        {[
          { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
          { id: 'sent', label: t.send },
          { id: 'received', label: t.receive },
          { id: 'locked', label: t.lockedFunds },
        ].map((tab) => {
          const active = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                active
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-[#141e2c] text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Currency filters */}
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="bg-[#141e2c] border border-gray-700 text-gray-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none shrink-0"
        >
          <option value="all">{lang === 'ar' ? 'جميع العملات' : 'All Coins'}</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-[#121926]/50 border border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-400">
            {t.noTransactions}
          </div>
        ) : (
          filtered.map((tx) => {
            const isSender = tx.senderUserId === user.id;
            const isLocked = tx.status === 'LOCKED';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTx(tx.id)}
                className="bg-[#121926] hover:bg-[#172132] border border-gray-800/90 rounded-2xl p-3.5 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isLocked
                        ? 'bg-amber-500/10 text-amber-400'
                        : isSender
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {isLocked ? (
                      <Clock className="w-4 h-4" />
                    ) : isSender ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-100">
                      {isLocked
                        ? lang === 'ar'
                          ? `تحويل مقفل (${tx.amount} ${tx.currency})`
                          : `Locked (${tx.amount} ${tx.currency})`
                        : isSender
                        ? `${lang === 'ar' ? 'إرسال إلى' : 'Sent to'} ${tx.recipientName}`
                        : `${lang === 'ar' ? 'استلام من' : 'Received from'} ${tx.senderName}`}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono-code flex items-center gap-2">
                      <span>{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span>·</span>
                      <span>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <div
                    className={`text-xs font-bold font-mono-code ${
                      isLocked
                        ? 'text-amber-400'
                        : isSender
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isSender ? '-' : '+'}
                    {tx.amount} {tx.currency}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {isLocked ? t.statusLocked : t.statusCompleted}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
