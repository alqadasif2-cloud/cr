export type Currency = 'BTC' | 'ETH' | 'USDT';

export interface CurrencyBalance {
  available: number;
  locked: number;
}

export interface UserWallet {
  id: string;
  userId: string;
  address: string;
  receiveCode: string;
  createdAt: number;
  balances: {
    BTC: CurrencyBalance;
    ETH: CurrencyBalance;
    USDT: CurrencyBalance;
  };
}

export interface User {
  id: string;
  username: string;
  name: string;
  walletId: string;
  createdAt: number;
}

export type TransactionStatus = 'COMPLETED' | 'LOCKED' | 'FAILED' | 'REJECTED';

export interface Transaction {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  senderAddress: string;
  recipientAddress: string;
  senderName: string;
  recipientName: string;
  currency: Currency;
  amount: number;
  fee: number;
  lockDurationSeconds: number;
  createdAt: number;
  unlockAt: number | null;
  unlockedAt: number | null;
  status: TransactionStatus;
  note?: string;
  txHash: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'RECEIVED' | 'SENT' | 'UNLOCKED' | 'SYSTEM' | 'SECURITY';
  createdAt: number;
  read: boolean;
  relatedTxId?: string;
}

export interface SystemSettings {
  maxLockDurationDays: number;
  allowCustomLocks: boolean;
  defaultNetworkFeeUsdt: number;
  initialBalances: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
}
