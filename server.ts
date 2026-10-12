import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Data storage structure
interface User {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  createdAt: number;
  status: 'active' | 'suspended';
  walletId: string;
}

interface Wallet {
  id: string;
  userId: string;
  address: string; // 0x... 40 hex chars
  receiveCode: string; // 10 chars
  createdAt: number;
  balances: {
    BTC: { available: number; locked: number };
    ETH: { available: number; locked: number };
    USDT: { available: number; locked: number };
  };
}

export type Currency = 'BTC' | 'ETH' | 'USDT';

interface Transaction {
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
  status: 'COMPLETED' | 'LOCKED' | 'FAILED' | 'REJECTED';
  note?: string;
  txHash: string;
}

interface Notification {
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

interface SystemSettings {
  maxLockDurationDays: number;
  allowCustomLocks: boolean;
  defaultNetworkFeeUsdt: number;
  initialBalances: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
}

interface DatabaseSchema {
  users: User[];
  wallets: Wallet[];
  transactions: Transaction[];
  notifications: Notification[];
  settings: SystemSettings;
}

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'crypto_salt_2026').digest('hex');
}

function generate0xAddress(): string {
  return '0x' + crypto.randomBytes(20).toString('hex');
}

function generateReceiveCode(): string {
  return crypto.randomBytes(5).toString('hex');
}

function generateTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

// Initial Database Seeding
function initDatabase(): DatabaseSchema {
  const user1Id = 'usr_ahmed_' + crypto.randomBytes(4).toString('hex');
  const user2Id = 'usr_nour_' + crypto.randomBytes(4).toString('hex');
  
  const wallet1Id = 'wlt_' + crypto.randomBytes(6).toString('hex');
  const wallet2Id = 'wlt_' + crypto.randomBytes(6).toString('hex');

  const addr1 = '0x7a91c4e82d6f3b105a9e7c2d8f41b6039a5d72e1';
  const addr2 = '0x3f82b1d94c7e6a502b8d9c1e7a50f3b48c2e61a9';

  const now = Date.now();

  const initialDb: DatabaseSchema = {
    users: [
      {
        id: user1Id,
        username: 'ahmed',
        name: 'أحمد المنصور',
        passwordHash: hashPassword('Password123!'),
        createdAt: now - 86400000 * 5,
        status: 'active',
        walletId: wallet1Id,
      },
      {
        id: user2Id,
        username: 'nour',
        name: 'نور الصباح',
        passwordHash: hashPassword('Password123!'),
        createdAt: now - 86400000 * 3,
        status: 'active',
        walletId: wallet2Id,
      },
    ],
    wallets: [
      {
        id: wallet1Id,
        userId: user1Id,
        address: addr1,
        receiveCode: '8f3a92c7d1',
        createdAt: now - 86400000 * 5,
        balances: {
          BTC: { available: 0.045, locked: 0.005 },
          ETH: { available: 2.85, locked: 0.25 },
          USDT: { available: 1850.0, locked: 300.0 },
        },
      },
      {
        id: wallet2Id,
        userId: user2Id,
        address: addr2,
        receiveCode: 'a2e5c9b14f',
        createdAt: now - 86400000 * 3,
        balances: {
          BTC: { available: 0.025, locked: 0.0 },
          ETH: { available: 1.50, locked: 0.0 },
          USDT: { available: 950.0, locked: 0.0 },
        },
      },
    ],
    transactions: [
      {
        id: 'tx_seed_1',
        senderUserId: user2Id,
        recipientUserId: user1Id,
        senderAddress: addr2,
        recipientAddress: addr1,
        senderName: 'نور الصباح',
        recipientName: 'أحمد المنصور',
        currency: 'USDT',
        amount: 300.0,
        fee: 0.0,
        lockDurationSeconds: 86400, // 24 hours lock
        createdAt: now - 3600000 * 18, // 18 hours ago
        unlockAt: now + 3600000 * 6, // 6 hours remaining
        unlockedAt: null,
        status: 'LOCKED',
        note: 'تحويل مع قفل 24 ساعة - دفعة تجريبية',
        txHash: generateTxHash(),
      },
      {
        id: 'tx_seed_2',
        senderUserId: user1Id,
        recipientUserId: user2Id,
        senderAddress: addr1,
        recipientAddress: addr2,
        senderName: 'أحمد المنصور',
        recipientName: 'نور الصباح',
        currency: 'ETH',
        amount: 0.50,
        fee: 0.0,
        lockDurationSeconds: 0,
        createdAt: now - 86400000 * 2,
        unlockAt: null,
        unlockedAt: null,
        status: 'COMPLETED',
        note: 'تحويل فوري مباشر',
        txHash: generateTxHash(),
      },
    ],
    notifications: [
      {
        id: 'notif_seed_1',
        userId: user1Id,
        title: 'تحويل مقفل وارد',
        titleAr: 'تحويل مقفل وارد',
        message: 'استلمت 300.00 USDT مقفلة من نور الصباح ستتاح بعد 6 ساعات',
        messageAr: 'استلمت 300.00 USDT مقفلة من نور الصباح ستتاح بعد 6 ساعات',
        type: 'RECEIVED',
        createdAt: now - 3600000 * 18,
        read: false,
        relatedTxId: 'tx_seed_1',
      },
      {
        id: 'notif_seed_2',
        userId: user2Id,
        title: 'تم الإرسال بنجاح',
        titleAr: 'تم الإرسال بنجاح',
        message: 'تم إرسال 300.00 USDT إلى أحمد المنصور مع قفل 24 ساعة',
        messageAr: 'تم إرسال 300.00 USDT إلى أحمد المنصور مع قفل 24 ساعة',
        type: 'SENT',
        createdAt: now - 3600000 * 18,
        read: true,
        relatedTxId: 'tx_seed_1',
      },
    ],
    settings: {
      maxLockDurationDays: 30,
      allowCustomLocks: true,
      defaultNetworkFeeUsdt: 0,
      initialBalances: {
        BTC: 0.05,
        ETH: 2.5,
        USDT: 1000.0,
      },
    },
  };

  return initialDb;
}

let db: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db.json, reinitializing:', err);
  }
  const initial = initDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(dataToSave: DatabaseSchema = db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

db = loadDatabase();

// Central Server-Authoritative Unlock Worker
function processTimeLocks() {
  const now = Date.now();
  let updated = false;

  for (const tx of db.transactions) {
    if (tx.status === 'LOCKED' && tx.unlockAt && now >= tx.unlockAt) {
      // Find recipient wallet
      const recipientWallet = db.wallets.find((w) => w.userId === tx.recipientUserId);
      if (recipientWallet) {
        const bal = recipientWallet.balances[tx.currency];
        if (bal) {
          // Release locked to available
          bal.locked = Math.max(0, bal.locked - tx.amount);
          bal.available = bal.available + tx.amount;
        }
      }

      tx.status = 'COMPLETED';
      tx.unlockedAt = now;
      updated = true;

      // Add Notification
      db.notifications.unshift({
        id: 'notif_unlock_' + crypto.randomBytes(4).toString('hex'),
        userId: tx.recipientUserId,
        title: 'أصبح الرصيد متاحاً!',
        titleAr: 'أصبح الرصيد متاحاً!',
        message: `تم فك قفل ${tx.amount} ${tx.currency} وأصبح متاحاً للاستخدام بالكامل في محفظتك.`,
        messageAr: `تم فك قفل ${tx.amount} ${tx.currency} وأصبح متاحاً للاستخدام بالكامل في محفظتك.`,
        type: 'UNLOCKED',
        createdAt: now,
        read: false,
        relatedTxId: tx.id,
      });

      console.log(`[TimeLock Released] Tx ${tx.id} for user ${tx.recipientUserId}: ${tx.amount} ${tx.currency}`);
    }
  }

  if (updated) {
    saveDatabase();
  }
}

// Background scheduler every 4 seconds
setInterval(processTimeLocks, 4000);

// Middleware for token auth or demo user fallback
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = db.users.find((u) => u.id === token);
    if (user) return user;
  }
  // Optional userId query or header for flexibility
  const customUserId = req.headers['x-user-id'] as string;
  if (customUserId) {
    const user = db.users.find((u) => u.id === customUserId);
    if (user) return user;
  }
  // Default to first user if none provided (for demo convenience)
  return db.users[0] || null;
}

// ================= API ROUTES =================

// Always check timelocks on each request
app.use('/api', (req, res, next) => {
  processTimeLocks();
  next();
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { username, name, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' });
  }

  const userId = 'usr_' + crypto.randomBytes(6).toString('hex');
  const walletId = 'wlt_' + crypto.randomBytes(6).toString('hex');
  let address = generate0xAddress();
  while (db.wallets.some((w) => w.address === address)) {
    address = generate0xAddress();
  }

  let receiveCode = generateReceiveCode();
  while (db.wallets.some((w) => w.receiveCode === receiveCode)) {
    receiveCode = generateReceiveCode();
  }

  const now = Date.now();
  const initBal = db.settings.initialBalances;

  const newUser: User = {
    id: userId,
    username: cleanUsername,
    name: name?.trim() || cleanUsername,
    passwordHash: hashPassword(password),
    createdAt: now,
    status: 'active',
    walletId,
  };

  const newWallet: Wallet = {
    id: walletId,
    userId,
    address,
    receiveCode,
    createdAt: now,
    balances: {
      BTC: { available: initBal.BTC, locked: 0 },
      ETH: { available: initBal.ETH, locked: 0 },
      USDT: { available: initBal.USDT, locked: 0 },
    },
  };

  db.users.push(newUser);
  db.wallets.push(newWallet);

  // Welcome notification
  db.notifications.unshift({
    id: 'notif_welcome_' + crypto.randomBytes(4).toString('hex'),
    userId,
    title: 'مرحباً بك في Crypto Wallet!',
    titleAr: 'مرحباً بك في Crypto Wallet!',
    message: `تم إنشاء محفظتك بنجاح بالعنوان ${address}. تم إيداع رصيد محاكاة ترحيبي.`,
    messageAr: `تم إنشاء محفظتك بنجاح بالعنوان ${address}. تم إيداع رصيد محاكاة ترحيبي.`,
    type: 'SYSTEM',
    createdAt: now,
    read: false,
  });

  saveDatabase();

  res.json({
    token: userId,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      walletId: newUser.walletId,
      createdAt: newUser.createdAt,
    },
    wallet: newWallet,
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const user = db.users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const wallet = db.wallets.find((w) => w.userId === user.id);

  res.json({
    token: user.id,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      walletId: user.walletId,
      createdAt: user.createdAt,
    },
    wallet,
  });
});

// Auth: Me
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'غير مصرح به' });
  }
  const wallet = db.wallets.find((w) => w.userId === user.id);
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      walletId: user.walletId,
      createdAt: user.createdAt,
    },
    wallet,
  });
});

// List all registered users (for quick selector / testing)
app.get('/api/users', (req, res) => {
  const usersWithWallets = db.users.map((u) => {
    const wallet = db.wallets.find((w) => w.userId === u.id);
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      address: wallet?.address || '',
      receiveCode: wallet?.receiveCode || '',
    };
  });
  res.json(usersWithWallets);
});

// Wallet Details
app.get('/api/wallet', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح به' });

  const wallet = db.wallets.find((w) => w.userId === user.id);
  if (!wallet) return res.status(404).json({ error: 'المحفظة غير موجودة' });

  // Calculate approximate total in USDT for display convenience
  // Simulated rates: BTC = $68,500, ETH = $3,450, USDT = $1.00
  const btcTotal = wallet.balances.BTC.available + wallet.balances.BTC.locked;
  const ethTotal = wallet.balances.ETH.available + wallet.balances.ETH.locked;
  const usdtTotal = wallet.balances.USDT.available + wallet.balances.USDT.locked;

  const totalUsdtEquivalent = (btcTotal * 68500) + (ethTotal * 3450) + usdtTotal;

  res.json({
    wallet,
    rates: {
      BTC: 68500,
      ETH: 3450,
      USDT: 1.0,
    },
    totalUsdtEquivalent,
  });
});

// Public Receive info lookup by receiveCode or 0x address
app.get('/api/receive/:code', (req, res) => {
  const { code } = req.params;
  const cleanCode = code.trim().toLowerCase();

  const wallet = db.wallets.find(
    (w) => w.receiveCode.toLowerCase() === cleanCode || w.address.toLowerCase() === cleanCode
  );

  if (!wallet) {
    return res.status(404).json({ error: 'عنوان المحفظة أو رمز الاستلام غير صحيح' });
  }

  const user = db.users.find((u) => u.id === wallet.userId);

  res.json({
    address: wallet.address,
    receiveCode: wallet.receiveCode,
    recipientName: user?.name || 'مستخدم Crypto Wallet',
    recipientUsername: user?.username || '',
    supportedCurrencies: ['BTC', 'ETH', 'USDT'],
  });
});

// Transfer Funds with Time-Lock
app.post('/api/transfer', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'يرجى تسجيل الدخول أولاً' });

  const { recipientAddress, currency, amount, lockDurationSeconds, note } = req.body;

  // 1. Validation
  if (!recipientAddress || !currency || !amount) {
    return res.status(400).json({ error: 'يرجى تعبئة جميع الحقول المطلوبة' });
  }

  const cleanRecipientAddress = recipientAddress.trim().toLowerCase();
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'المبلغ غير صالح، يجب أن يكون أكبر من صفر' });
  }

  const validCurrencies: Currency[] = ['BTC', 'ETH', 'USDT'];
  if (!validCurrencies.includes(currency as Currency)) {
    return res.status(400).json({ error: 'العملة المختارة غير مدعومة' });
  }

  const senderWallet = db.wallets.find((w) => w.userId === user.id);
  if (!senderWallet) return res.status(400).json({ error: 'محفظة المرسل غير موجودة' });

  // Recipient Wallet lookup (by address or receive code)
  const recipientWallet = db.wallets.find(
    (w) => w.address.toLowerCase() === cleanRecipientAddress || w.receiveCode.toLowerCase() === cleanRecipientAddress
  );

  if (!recipientWallet) {
    return res.status(404).json({ error: 'عنوان المستلم غير موجود في النظام. تأكد من إدخال عنوان صحيح يبدأ بـ 0x' });
  }

  if (recipientWallet.userId === user.id) {
    return res.status(400).json({ error: 'لا يمكنك إرسال رصيد إلى نفس محفظتك' });
  }

  const recipientUser = db.users.find((u) => u.id === recipientWallet.userId);

  // 2. Balance Check
  const currentAvailable = senderWallet.balances[currency as Currency].available;
  if (currentAvailable < numAmount) {
    return res.status(400).json({
      error: `الرصيد المتاح غير كافٍ. المتاح حالياً: ${currentAvailable} ${currency}`,
    });
  }

  // 3. Lock Duration Validation
  const lockSeconds = Math.max(0, parseInt(lockDurationSeconds || 0, 10));
  const maxSeconds = db.settings.maxLockDurationDays * 86400;
  if (lockSeconds > maxSeconds) {
    return res.status(400).json({
      error: `مدة القفل تتجاوز الحد الأقصى المسموح به (${db.settings.maxLockDurationDays} يوماً)`,
    });
  }

  const now = Date.now();
  const isLocked = lockSeconds > 0;
  const unlockAt = isLocked ? now + (lockSeconds * 1000) : null;
  const txHash = generateTxHash();

  // 4. Atomic Balance Execution
  // Deduct from sender available balance
  senderWallet.balances[currency as Currency].available -= numAmount;

  if (isLocked) {
    // Add to recipient locked balance
    recipientWallet.balances[currency as Currency].locked += numAmount;
  } else {
    // Add directly to recipient available balance
    recipientWallet.balances[currency as Currency].available += numAmount;
  }

  const tx: Transaction = {
    id: 'tx_' + crypto.randomBytes(8).toString('hex'),
    senderUserId: user.id,
    recipientUserId: recipientWallet.userId,
    senderAddress: senderWallet.address,
    recipientAddress: recipientWallet.address,
    senderName: user.name,
    recipientName: recipientUser?.name || 'مستلم',
    currency: currency as Currency,
    amount: numAmount,
    fee: 0,
    lockDurationSeconds: lockSeconds,
    createdAt: now,
    unlockAt,
    unlockedAt: null,
    status: isLocked ? 'LOCKED' : 'COMPLETED',
    note: note?.trim() || '',
    txHash,
  };

  db.transactions.unshift(tx);

  // Notifications
  const lockDescriptionAr = isLocked
    ? lockSeconds >= 86400
      ? `${Math.round(lockSeconds / 86400)} يوم`
      : lockSeconds >= 3600
      ? `${Math.round(lockSeconds / 3600)} ساعة`
      : `${Math.round(lockSeconds / 60)} دقيقة`
    : '';

  // Recipient notification
  db.notifications.unshift({
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: recipientWallet.userId,
    title: isLocked ? 'تحويل وارد مقفل' : 'تحويل وارد جديد',
    titleAr: isLocked ? 'تحويل وارد مقفل' : 'تحويل وارد جديد',
    message: isLocked
      ? `استلمت ${numAmount} ${currency} مقفلة لمدة (${lockDescriptionAr}) من ${user.name}`
      : `استلمت ${numAmount} ${currency} من ${user.name}`,
    messageAr: isLocked
      ? `استلمت ${numAmount} ${currency} مقفلة لمدة (${lockDescriptionAr}) من ${user.name}`
      : `استلمت ${numAmount} ${currency} من ${user.name}`,
    type: 'RECEIVED',
    createdAt: now,
    read: false,
    relatedTxId: tx.id,
  });

  // Sender notification
  db.notifications.unshift({
    id: 'notif_' + crypto.randomBytes(6).toString('hex'),
    userId: user.id,
    title: 'تم إرسال التحويل',
    titleAr: 'تم إرسال التحويل',
    message: isLocked
      ? `تم إرسال ${numAmount} ${currency} بنجاح إلى ${recipientUser?.name || 'المستلم'} بقفل (${lockDescriptionAr})`
      : `تم إرسال ${numAmount} ${currency} بنجاح إلى ${recipientUser?.name || 'المستلم'}`,
    messageAr: isLocked
      ? `تم إرسال ${numAmount} ${currency} بنجاح إلى ${recipientUser?.name || 'المستلم'} بقفل (${lockDescriptionAr})`
      : `تم إرسال ${numAmount} ${currency} بنجاح إلى ${recipientUser?.name || 'المستلم'}`,
    type: 'SENT',
    createdAt: now,
    read: false,
    relatedTxId: tx.id,
  });

  saveDatabase();

  res.json({
    success: true,
    transaction: tx,
    updatedBalances: senderWallet.balances,
  });
});

// Force Unlock trigger (or test maturation)
app.post('/api/unlock-check', (req, res) => {
  processTimeLocks();
  res.json({ success: true, timestamp: Date.now() });
});

// Demo Instant Unlock (for testing time-locks without waiting real hours)
app.post('/api/transactions/:id/fast-forward', (req, res) => {
  const { id } = req.params;
  const tx = db.transactions.find((t) => t.id === id);

  if (!tx) return res.status(404).json({ error: 'العملية غير موجودة' });
  if (tx.status !== 'LOCKED') return res.status(400).json({ error: 'العملية ليست مقفلة حالياً' });

  // Move unlock timestamp to now
  tx.unlockAt = Date.now() - 1000;
  processTimeLocks();

  res.json({ success: true, message: 'تم تسريع وقت القفل وإتاحة الرصيد فورياً للتجربة' });
});

// Transactions list
app.get('/api/transactions', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح به' });

  const { type, currency, status } = req.query;

  let list = db.transactions.filter(
    (t) => t.senderUserId === user.id || t.recipientUserId === user.id
  );

  if (type === 'sent') {
    list = list.filter((t) => t.senderUserId === user.id);
  } else if (type === 'received') {
    list = list.filter((t) => t.recipientUserId === user.id);
  } else if (type === 'locked') {
    list = list.filter((t) => t.status === 'LOCKED');
  }

  if (currency) {
    list = list.filter((t) => t.currency === currency);
  }

  if (status) {
    list = list.filter((t) => t.status === status);
  }

  res.json(list);
});

// Single Transaction Details
app.get('/api/transactions/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح به' });

  const { id } = req.params;
  const tx = db.transactions.find((t) => t.id === id);

  if (!tx) return res.status(404).json({ error: 'العملية غير موجودة' });

  res.json(tx);
});

// Locked Funds List for user
app.get('/api/locked-funds', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح به' });

  const incomingLocked = db.transactions.filter(
    (t) => t.recipientUserId === user.id && t.status === 'LOCKED'
  );

  const outgoingLocked = db.transactions.filter(
    (t) => t.senderUserId === user.id && t.status === 'LOCKED'
  );

  res.json({
    incomingLocked,
    outgoingLocked,
    serverTime: Date.now(),
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح به' });

  const userNotifs = db.notifications.filter((n) => n.userId === user.id);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  res.json({
    notifications: userNotifs,
    unreadCount,
  });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح به' });

  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === user.id);
  if (notif) {
    notif.read = true;
    saveDatabase();
  }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'غير مصرح به' });

  db.notifications.forEach((n) => {
    if (n.userId === user.id) n.read = true;
  });
  saveDatabase();
  res.json({ success: true });
});

// Admin Overview
app.get('/api/admin/overview', (req, res) => {
  const totalUsers = db.users.length;
  const totalTransactions = db.transactions.length;
  const activeLockedCount = db.transactions.filter((t) => t.status === 'LOCKED').length;

  res.json({
    totalUsers,
    totalTransactions,
    activeLockedCount,
    users: db.users.map((u) => {
      const w = db.wallets.find((wl) => wl.userId === u.id);
      return {
        id: u.id,
        username: u.username,
        name: u.name,
        address: w?.address,
        createdAt: u.createdAt,
        balances: w?.balances,
      };
    }),
    transactions: db.transactions.slice(0, 50),
    settings: db.settings,
  });
});

// Admin Reset to Demo State
app.post('/api/admin/reset-demo', (req, res) => {
  db = initDatabase();
  saveDatabase(db);
  res.json({ success: true, message: 'تمت إعادة ضبط النظام إلى الحالة الافتراضية بنجاح' });
});

// ================= VITE / FRONTEND SERVING =================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Crypto Wallet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
