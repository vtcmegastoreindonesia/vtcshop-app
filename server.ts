import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const AUTH_STORE_PATH = path.resolve(__dirname, '.vtv_auth_store.json');
const CS_STORE_PATH = path.resolve(__dirname, '.vtv_cs_store.json');
const ADMIN_WA_NUMBER = '6283878502333';
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface StoredUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller';
  passwordHash?: string;
  authMethod: string;
  biometrics?: {
    credentialId: string;
    label: 'Face ID' | 'Fingerprint';
    createdAt: string;
  }[];
  createdAt: string;
}

interface AuthStoreData {
  users: StoredUser[];
  adminPasscodeHash: string | null;
}

function readAuthStore(): AuthStoreData {
  try {
    if (fs.existsSync(AUTH_STORE_PATH)) {
      const raw = fs.readFileSync(AUTH_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as AuthStoreData;
      if (parsed && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to clean store
  }
  return { users: [], adminPasscodeHash: null };
}

function writeAuthStore(data: AuthStoreData) {
  try {
    fs.writeFileSync(AUTH_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore disk write issues in read-only environments
  }
}

interface StoredCsMessage {
  id: string;
  sender: 'buyer' | 'admin';
  text: string;
  createdAt: string;
  waForwardUrl?: string;
}

interface StoredCsThread {
  id: string;
  buyerName: string;
  buyerEmail: string;
  unreadByAdmin: number;
  unreadByBuyer: number;
  updatedAt: string;
  messages: StoredCsMessage[];
}

function readCsStore(): StoredCsThread[] {
  try {
    if (fs.existsSync(CS_STORE_PATH)) {
      const raw = fs.readFileSync(CS_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback to empty CS store
  }
  return [];
}

function writeCsStore(threads: StoredCsThread[]) {
  try {
    fs.writeFileSync(CS_STORE_PATH, JSON.stringify(threads, null, 2), 'utf-8');
  } catch {
    // Ignore disk write issues
  }
}

function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(secret, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifySecret(secret: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const derived = crypto.scryptSync(secret, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

interface TokenPayload {
  userId: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  authMethod: string;
  exp: number;
}

function signToken(payload: Omit<TokenPayload, 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    ) as TokenPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('62')) return digits;
  return digits;
}

// In-memory Pending Registration Store (key: normalized email)
const pendingRegistrations = new Map<
  string,
  {
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller';
    passwordHash: string;
    otpHash: string;
    expiresAt: number;
  }
>();

// In-memory Phone-First Registration Store (No HP -> Captcha -> OTP -> Username+Password)
const pendingPhoneRegistrations = new Map<
  string,
  {
    phone: string;
    role: 'buyer' | 'seller';
    otpHash: string;
    otpVerified: boolean;
    expiresAt: number;
  }
>();

// In-memory Failed Password Attempt Lockout Store (3x salah -> kunci 5 menit)
const failedLoginAttempts = new Map<
  string,
  { count: number; lockedUntil: number }
>();

// In-memory OTP store (key: normalized contact - phone or email)
const otpStore = new Map<
  string,
  { codeHash: string; channel: 'WhatsApp' | 'SMS' | 'Email'; expiresAt: number }
>();

// In-memory Forgot Password verification code store (key: normalized email)
const resetPasswordStore = new Map<
  string,
  { codeHash: string; expiresAt: number }
>();

function getBearerToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim();
}

function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Sesi login telah berakhir. Silakan login ulang.' });
    return;
  }
  (req as express.Request & { user: TokenPayload }).user = payload;
  next();
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // ---------------- AUTH ROUTES ----------------

  // Daftar Super Cepat Step 1 & 2: No HP + CAPTCHA Geser Gambar -> Kirim OTP
  app.post('/api/auth/register/phone-otp/send', (req, res) => {
    const { phone, role, captchaSliderVal, captchaTargetVal } = req.body ?? {};
    const cleanPhoneRaw = typeof phone === 'string' ? phone.replace(/[\s-]/g, '') : '';
    const waRegex = /^(\+?62|0)8[1-9][0-9]{7,11}$/;
    if (!waRegex.test(cleanPhoneRaw)) {
      res.status(400).json({
        error: 'Nomor HP / WhatsApp tidak valid. Awali dengan 08 atau 628 (10–14 digit).',
      });
      return;
    }

    const slider = Number(captchaSliderVal);
    const target = Number(captchaTargetVal);
    if (!Number.isFinite(slider) || !Number.isFinite(target) || Math.abs(slider - target) > 8) {
      res.status(400).json({
        error: 'CAPTCHA Geser Gambar belum tepat. Geser potongan gambar ke posisi target.',
      });
      return;
    }

    const normPhone = normalizePhone(cleanPhoneRaw);
    const store = readAuthStore();
    if (store.users.some((u) => u.phone && normalizePhone(u.phone) === normPhone)) {
      res.status(409).json({
        error: 'Nomor HP sudah terdaftar. Silakan masuk di menu Masuk atau gunakan OTP.',
      });
      return;
    }

    const otpCode = String(crypto.randomInt(100000, 999999));
    const userRole: 'buyer' | 'seller' = role === 'seller' ? 'seller' : 'buyer';

    pendingPhoneRegistrations.set(normPhone, {
      phone: cleanPhoneRaw,
      role: userRole,
      otpHash: hashSecret(otpCode),
      otpVerified: false,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    res.json({
      ok: true,
      phone: cleanPhoneRaw,
      previewOtp: otpCode,
      message: `Kode OTP 6 digit otomatis dikirim ke ${cleanPhoneRaw}.`,
    });
  });

  // Daftar Super Cepat Step 3: Verifikasi OTP 6 Digit
  app.post('/api/auth/register/phone-otp/verify', (req, res) => {
    const { phone, code } = req.body ?? {};
    const cleanPhoneRaw = typeof phone === 'string' ? phone.replace(/[\s-]/g, '') : '';
    const normPhone = normalizePhone(cleanPhoneRaw);
    const cleanCode = typeof code === 'string' ? code.trim() : '';

    if (!normPhone || cleanCode.length !== 6) {
      res.status(400).json({ error: 'Masukkan 6 digit kode OTP yang valid.' });
      return;
    }

    const pending = pendingPhoneRegistrations.get(normPhone);
    if (!pending || Date.now() > pending.expiresAt) {
      res.status(400).json({
        error: 'Sesi OTP pendaftaran kadaluarsa. Silakan kirim ulang kode OTP.',
      });
      return;
    }

    if (!verifySecret(cleanCode, pending.otpHash)) {
      res.status(401).json({ error: 'Kode OTP salah. Periksa kembali kode 6 digit Anda.' });
      return;
    }

    pending.otpVerified = true;
    pending.expiresAt = Date.now() + 15 * 60 * 1000;
    pendingPhoneRegistrations.set(normPhone, pending);

    res.json({ ok: true, phone: pending.phone });
  });

  // Daftar Super Cepat Step 4: Atur Username + Password -> Akun otomatis aktif & masuk Beranda
  app.post('/api/auth/register/complete', (req, res) => {
    const { phone, username, password, email } = req.body ?? {};
    const cleanPhoneRaw = typeof phone === 'string' ? phone.replace(/[\s-]/g, '') : '';
    const normPhone = normalizePhone(cleanPhoneRaw);
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    const pending = pendingPhoneRegistrations.get(normPhone);
    if (!pending || !pending.otpVerified || Date.now() > pending.expiresAt) {
      res.status(400).json({
        error: 'Verifikasi OTP No. HP belum selesai atau kadaluarsa.',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(cleanUsername)) {
      res.status(400).json({
        error: 'Username 3–24 karakter (huruf, angka, titik, atau garis bawah).',
      });
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password minimal 6 karakter.' });
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Format email pemulihan tidak valid.' });
      return;
    }

    const store = readAuthStore();
    if (
      store.users.some(
        (u) => u.username && u.username.toLowerCase() === cleanUsername.toLowerCase()
      )
    ) {
      res.status(409).json({ error: 'Username sudah dipakai. Pilih username lain.' });
      return;
    }
    if (cleanEmail && store.users.some((u) => u.email === cleanEmail)) {
      res.status(409).json({ error: 'Email sudah terdaftar di akun lain.' });
      return;
    }
    if (store.users.some((u) => u.phone && normalizePhone(u.phone) === normPhone)) {
      res.status(409).json({ error: 'Nomor HP sudah aktif terdaftar.' });
      return;
    }

    const assignedEmail = cleanEmail || `${normPhone}@akun.vtcshop.id`;
    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID()}`,
      name: cleanUsername,
      username: cleanUsername,
      email: assignedEmail,
      phone: pending.phone,
      role: pending.role,
      passwordHash: hashSecret(password),
      authMethod: 'No. HP, OTP & Username',
      biometrics: [],
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    writeAuthStore(store);
    pendingPhoneRegistrations.delete(normPhone);

    const token = signToken({
      userId: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      authMethod: newUser.authMethod,
    });

    res.json({
      ok: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        authMethod: newUser.authMethod,
        hasBiometric: false,
      },
    });
  });

  // Step 1 Daftar: Validasi lengkap + otomatis kirim OTP ke Email & WhatsApp
  app.post('/api/auth/register/send-otp', (req, res) => {
    const { name, email, password, phone, role } = req.body ?? {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPhoneRaw = typeof phone === 'string' ? phone.replace(/[\s-]/g, '') : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const waRegex = /^(\+?62|0)8[1-9][0-9]{7,11}$/;

    if (cleanName.length < 2) {
      res.status(400).json({ error: 'Nama lengkap minimal 2 karakter.' });
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }
    if (!waRegex.test(cleanPhoneRaw)) {
      res.status(400).json({
        error: 'Nomor WhatsApp tidak valid (awali dengan 08 atau 628, 10–14 digit).',
      });
      return;
    }
    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password minimal 6 karakter.' });
      return;
    }

    const store = readAuthStore();
    if (store.users.some((u) => u.email === cleanEmail)) {
      res.status(409).json({
        error: 'Email sudah terdaftar dan aktif. Silakan masuk di tab Masuk.',
      });
      return;
    }

    const otpCode = String(crypto.randomInt(100000, 999999));
    const userRole: 'buyer' | 'seller' = role === 'seller' ? 'seller' : 'buyer';

    pendingRegistrations.set(cleanEmail, {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhoneRaw,
      role: userRole,
      passwordHash: hashSecret(password),
      otpHash: hashSecret(otpCode),
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    res.json({
      ok: true,
      email: cleanEmail,
      phone: cleanPhoneRaw,
      previewOtp: otpCode,
      message: `Kode OTP 6 digit otomatis dikirim ke WhatsApp (${cleanPhoneRaw}) & Email (${cleanEmail}).`,
    });
  });

  // Kirim Ulang OTP Pendaftaran
  app.post('/api/auth/register/resend-otp', (req, res) => {
    const { email } = req.body ?? {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pending = pendingRegistrations.get(cleanEmail);
    if (!pending) {
      res.status(404).json({
        error: 'Data pendaftaran belum ada atau sudah kadaluarsa. Silakan isi form Daftar kembali.',
      });
      return;
    }

    const otpCode = String(crypto.randomInt(100000, 999999));
    pending.otpHash = hashSecret(otpCode);
    pending.expiresAt = Date.now() + 10 * 60 * 1000;
    pendingRegistrations.set(cleanEmail, pending);

    res.json({
      ok: true,
      email: cleanEmail,
      phone: pending.phone,
      previewOtp: otpCode,
      message: `Kode OTP baru telah dikirim ulang ke WhatsApp (${pending.phone}) & Email (${cleanEmail}).`,
    });
  });

  // Step 2 Daftar: Verifikasi OTP -> Akun otomatis aktif & langsung login ke Beranda
  app.post('/api/auth/register/verify-otp', (req, res) => {
    const { email, code } = req.body ?? {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanCode = typeof code === 'string' ? code.trim() : '';

    if (!cleanEmail || cleanCode.length !== 6) {
      res.status(400).json({ error: 'Masukkan 6 digit kode OTP yang valid.' });
      return;
    }

    const pending = pendingRegistrations.get(cleanEmail);
    if (!pending || Date.now() > pending.expiresAt) {
      res.status(400).json({
        error: 'Kode OTP kadaluarsa atau pendaftaran belum dimulai. Silakan ulangi Daftar.',
      });
      return;
    }

    if (!verifySecret(cleanCode, pending.otpHash)) {
      res.status(401).json({ error: 'Kode OTP salah. Periksa kembali kode OTP Anda.' });
      return;
    }

    const store = readAuthStore();
    if (store.users.some((u) => u.email === cleanEmail)) {
      pendingRegistrations.delete(cleanEmail);
      res.status(409).json({ error: 'Email sudah aktif. Silakan masuk.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID()}`,
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      role: pending.role,
      passwordHash: pending.passwordHash,
      authMethod: 'Email, WhatsApp & OTP',
      biometrics: [],
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    writeAuthStore(store);
    pendingRegistrations.delete(cleanEmail);

    const token = signToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      authMethod: newUser.authMethod,
    });

    res.json({
      ok: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        authMethod: newUser.authMethod,
        hasBiometric: false,
      },
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone } = req.body ?? {};
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      name.trim().length < 2 ||
      !email.includes('@') ||
      password.length < 6
    ) {
      res.status(400).json({
        error: 'Nama (min 2 karakter), email valid, dan password (min 6 karakter) wajib diisi.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const store = readAuthStore();
    if (store.users.some((u) => u.email === cleanEmail)) {
      res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      role: 'buyer',
      passwordHash: hashSecret(password),
      authMethod: 'Email & Password',
      biometrics: [],
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    writeAuthStore(store);

    const token = signToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      authMethod: newUser.authMethod,
    });

    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        authMethod: newUser.authMethod,
        hasBiometric: false,
      },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, email, password } = req.body ?? {};
    const rawId =
      typeof identifier === 'string' && identifier.trim()
        ? identifier.trim()
        : typeof email === 'string'
          ? email.trim()
          : '';

    if (!rawId || typeof password !== 'string' || !password) {
      res.status(400).json({
        error: 'No. HP / Username / Email dan password wajib diisi.',
      });
      return;
    }

    const cleanId = rawId.toLowerCase();
    const normPhone = normalizePhone(rawId);
    const store = readAuthStore();
    const user = store.users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.phone && normPhone.length >= 9 && normalizePhone(u.phone) === normPhone)
    );

    const lockKey = user ? user.id : cleanId;
    const attemptState = failedLoginAttempts.get(lockKey);
    const now = Date.now();

    if (attemptState && attemptState.lockedUntil > now) {
      const remainingSec = Math.ceil((attemptState.lockedUntil - now) / 1000);
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      res.status(423).json({
        error: `Akun dikunci sementara karena 3x salah password. Coba lagi dalam ${mins}m ${secs}d. Peringatan keamanan telah dikirim ke Email.`,
        lockedUntil: attemptState.lockedUntil,
        remainingSeconds: remainingSec,
        securityAlertSent: true,
        alertEmail: user?.email || (rawId.includes('@') ? rawId : 'Email terdaftar'),
      });
      return;
    }

    if (!user || !user.passwordHash || !verifySecret(password, user.passwordHash)) {
      const prevCount =
        attemptState && attemptState.lockedUntil <= now ? attemptState.count : 0;
      const nextCount = prevCount + 1;

      if (nextCount >= 3) {
        const lockedUntil = now + 5 * 60 * 1000;
        failedLoginAttempts.set(lockKey, { count: nextCount, lockedUntil });
        res.status(423).json({
          error:
            'Salah password 3x! Akun dikunci sementara selama 5 menit & peringatan keamanan otomatis dikirim ke Email Anda.',
          lockedUntil,
          remainingSeconds: 300,
          securityAlertSent: true,
          alertEmail: user?.email || (rawId.includes('@') ? rawId : 'Email terdaftar'),
        });
        return;
      }

      failedLoginAttempts.set(lockKey, { count: nextCount, lockedUntil: 0 });
      res.status(401).json({
        error: `Kredensial atau password salah (${nextCount}/3 percobaan sebelum kunci sementara 5 menit).`,
        attemptsRemaining: 3 - nextCount,
      });
      return;
    }

    failedLoginAttempts.delete(lockKey);

    const token = signToken({
      userId: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod: 'Password',
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: 'Password',
        hasBiometric: (user.biometrics?.length ?? 0) > 0,
      },
    });
  });

  app.post('/api/auth/forgot-password/send', (req, res) => {
    const { email } = req.body ?? {};
    if (typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Masukkan alamat email yang valid.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const store = readAuthStore();
    const user = store.users.find((u) => u.email === cleanEmail);
    if (!user) {
      res.status(404).json({
        error: 'Email belum terdaftar di VTC SHOP INDONESIA. Silakan daftar terlebih dahulu.',
      });
      return;
    }

    const code = String(crypto.randomInt(100000, 999999));
    resetPasswordStore.set(cleanEmail, {
      codeHash: hashSecret(code),
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    res.json({
      ok: true,
      email: cleanEmail,
      previewCode: code,
      message: `Kode verifikasi reset password telah dikirim ke email terverifikasi ${cleanEmail}.`,
    });
  });

  app.post('/api/auth/forgot-password/reset', (req, res) => {
    const { email, code, newPassword } = req.body ?? {};
    if (
      typeof email !== 'string' ||
      typeof code !== 'string' ||
      typeof newPassword !== 'string' ||
      newPassword.length < 6
    ) {
      res.status(400).json({
        error: 'Email, kode verifikasi, dan password baru (min. 6 karakter) wajib diisi.',
      });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const record = resetPasswordStore.get(cleanEmail);
    if (!record || Date.now() > record.expiresAt) {
      res.status(400).json({
        error: 'Kode verifikasi email kadaluarsa atau belum diminta.',
      });
      return;
    }
    if (!verifySecret(code.trim(), record.codeHash)) {
      res.status(401).json({ error: 'Kode verifikasi email tidak valid.' });
      return;
    }

    const store = readAuthStore();
    const user = store.users.find((u) => u.email === cleanEmail);
    if (!user) {
      res.status(404).json({ error: 'Akun email tidak ditemukan.' });
      return;
    }

    user.passwordHash = hashSecret(newPassword);
    writeAuthStore(store);
    resetPasswordStore.delete(cleanEmail);

    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod: 'Email & Password',
    });

    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: 'Email & Password',
        hasBiometric: (user.biometrics?.length ?? 0) > 0,
      },
    });
  });

  app.post('/api/auth/google', (req, res) => {
    const { email, name } = req.body ?? {};
    if (typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Masukkan email Google yang valid.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const displayName =
      typeof name === 'string' && name.trim().length >= 2
        ? name.trim()
        : cleanEmail.split('@')[0];

    const store = readAuthStore();
    let user = store.users.find((u) => u.email === cleanEmail);
    if (!user) {
      user = {
        id: `usr-${crypto.randomUUID()}`,
        name: displayName,
        email: cleanEmail,
        role: 'buyer',
        authMethod: 'Google',
        biometrics: [],
        createdAt: new Date().toISOString(),
      };
      store.users.push(user);
      writeAuthStore(store);
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod: 'Google',
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: 'Google',
        hasBiometric: (user.biometrics?.length ?? 0) > 0,
      },
    });
  });

  app.post('/api/auth/social', (req, res) => {
    const { provider, email, name } = req.body ?? {};
    const validProvider: 'Google' | 'Facebook' | 'Apple' =
      provider === 'Facebook'
        ? 'Facebook'
        : provider === 'Apple'
          ? 'Apple'
          : 'Google';

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      res.status(400).json({
        error: `Masukkan alamat email akun ${validProvider} yang valid.`,
      });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const displayName =
      typeof name === 'string' && name.trim().length >= 2
        ? name.trim()
        : cleanEmail.split('@')[0];

    const store = readAuthStore();
    let user = store.users.find((u) => u.email === cleanEmail);
    if (!user) {
      user = {
        id: `usr-${crypto.randomUUID()}`,
        name: displayName,
        username: displayName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 18) || undefined,
        email: cleanEmail,
        role: 'buyer',
        authMethod: validProvider,
        biometrics: [],
        createdAt: new Date().toISOString(),
      };
      store.users.push(user);
      writeAuthStore(store);
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod: validProvider,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: validProvider,
        hasBiometric: (user.biometrics?.length ?? 0) > 0,
      },
    });
  });

  app.post('/api/auth/otp/send', (req, res) => {
    const { phone, contact, channel } = req.body ?? {};
    const rawTarget = typeof contact === 'string' && contact.trim() ? contact.trim() : typeof phone === 'string' ? phone.trim() : '';
    const selectedChannel: 'WhatsApp' | 'SMS' | 'Email' =
      channel === 'SMS' ? 'SMS' : channel === 'Email' ? 'Email' : 'WhatsApp';

    let storeKey = '';
    if (selectedChannel === 'Email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawTarget)) {
        res.status(400).json({ error: 'Masukkan alamat email yang valid untuk menerima OTP.' });
        return;
      }
      storeKey = rawTarget.toLowerCase();
    } else {
      const norm = normalizePhone(rawTarget);
      if (norm.length < 9) {
        res.status(400).json({ error: `Masukkan nomor ${selectedChannel} yang valid.` });
        return;
      }
      storeKey = norm;
    }

    const otpCode = String(crypto.randomInt(100000, 999999));
    otpStore.set(storeKey, {
      codeHash: hashSecret(otpCode),
      channel: selectedChannel,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.json({
      ok: true,
      channel: selectedChannel,
      contact: rawTarget,
      previewOtp: otpCode,
      message: `Kode OTP 6 digit telah dikirim via ${selectedChannel} ke ${rawTarget}.`,
    });
  });

  app.post('/api/auth/otp/verify', (req, res) => {
    const { phone, contact, channel, code, name } = req.body ?? {};
    const rawTarget = typeof contact === 'string' && contact.trim() ? contact.trim() : typeof phone === 'string' ? phone.trim() : '';
    const selectedChannel: 'WhatsApp' | 'SMS' | 'Email' =
      channel === 'SMS' ? 'SMS' : channel === 'Email' ? 'Email' : 'WhatsApp';

    if (!rawTarget || typeof code !== 'string') {
      res.status(400).json({ error: 'Tujuan kontak dan kode OTP wajib diisi.' });
      return;
    }

    const storeKey =
      selectedChannel === 'Email'
        ? rawTarget.toLowerCase()
        : normalizePhone(rawTarget);

    const record = otpStore.get(storeKey);
    if (!record || Date.now() > record.expiresAt) {
      res.status(400).json({ error: 'Kode OTP kadaluarsa atau belum dikirim.' });
      return;
    }
    if (!verifySecret(code.trim(), record.codeHash)) {
      res.status(401).json({ error: 'Kode OTP tidak sesuai.' });
      return;
    }
    otpStore.delete(storeKey);

    const store = readAuthStore();
    let user =
      record.channel === 'Email'
        ? store.users.find((u) => u.email.toLowerCase() === storeKey)
        : store.users.find((u) => u.phone && normalizePhone(u.phone) === storeKey);

    if (!user) {
      const fallbackName =
        typeof name === 'string' && name.trim().length >= 2
          ? name.trim()
          : record.channel === 'Email'
            ? storeKey.split('@')[0]
            : `Pengguna ${storeKey.slice(-4)}`;
      user = {
        id: `usr-${crypto.randomUUID()}`,
        name: fallbackName,
        email:
          record.channel === 'Email'
            ? storeKey
            : `${storeKey}@otp.vtcshop.id`,
        phone: record.channel === 'Email' ? undefined : rawTarget,
        role: 'buyer',
        authMethod: `OTP ${record.channel}`,
        biometrics: [],
        createdAt: new Date().toISOString(),
      };
      store.users.push(user);
      writeAuthStore(store);
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod: `OTP ${record.channel}`,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: `OTP ${record.channel}`,
        hasBiometric: (user.biometrics?.length ?? 0) > 0,
      },
    });
  });

  app.post('/api/auth/biometric/register', requireAuth, (req, res) => {
    const reqUser = (req as express.Request & { user: TokenPayload }).user;
    const { credentialId, label } = req.body ?? {};
    if (typeof credentialId !== 'string' || credentialId.length < 8) {
      res.status(400).json({ error: 'Kredensial biometrik tidak valid.' });
      return;
    }
    const bioLabel: 'Face ID' | 'Fingerprint' =
      label === 'Face ID' ? 'Face ID' : 'Fingerprint';

    const store = readAuthStore();
    const user = store.users.find((u) => u.id === reqUser.userId);
    if (!user) {
      res.status(404).json({ error: 'Akun tidak ditemukan.' });
      return;
    }
    user.biometrics = user.biometrics ?? [];
    if (!user.biometrics.some((b) => b.credentialId === credentialId)) {
      user.biometrics.push({
        credentialId,
        label: bioLabel,
        createdAt: new Date().toISOString(),
      });
      writeAuthStore(store);
    }

    res.json({ ok: true, label: bioLabel });
  });

  app.post('/api/auth/biometric/login', (req, res) => {
    const { credentialId, label } = req.body ?? {};
    if (typeof credentialId !== 'string' || credentialId.length < 8) {
      res.status(400).json({ error: 'Data verifikasi biometrik tidak valid.' });
      return;
    }
    const store = readAuthStore();
    const user = store.users.find((u) =>
      u.biometrics?.some((b) => b.credentialId === credentialId)
    );
    if (!user) {
      res.status(401).json({
        error: 'Biometrik perangkat ini belum tertaut ke akun. Silakan login dulu lalu aktifkan Face ID / Fingerprint di Pengaturan.',
      });
      return;
    }

    const authMethod = label === 'Face ID' ? 'Face ID' : 'Fingerprint';
    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod,
        hasBiometric: true,
      },
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const reqUser = (req as express.Request & { user: TokenPayload }).user;
    const store = readAuthStore();
    const stored = store.users.find((u) => u.id === reqUser.userId);
    res.json({
      user: {
        id: reqUser.userId,
        name: reqUser.name,
        username: reqUser.username || stored?.username,
        email: reqUser.email,
        phone: reqUser.phone,
        role: reqUser.role,
        authMethod: reqUser.authMethod,
        hasBiometric: (stored?.biometrics?.length ?? 0) > 0,
      },
    });
  });

  // ---------------- ADMIN ACCESS CONTROL ROUTES ----------------

  app.get('/api/admin/status', requireAuth, (req, res) => {
    const reqUser = (req as express.Request & { user: TokenPayload }).user;
    const store = readAuthStore();
    const envPasscode = (process.env.ADMIN_PASSCODE ?? '').trim();
    res.json({
      hasEnvPasscode: envPasscode.length > 0,
      isClaimed: Boolean(store.adminPasscodeHash),
      isAdminSession: reqUser.role === 'admin',
    });
  });

  app.post('/api/admin/claim', requireAuth, (req, res) => {
    const reqUser = (req as express.Request & { user: TokenPayload }).user;
    const { passcode } = req.body ?? {};
    const envPasscode = (process.env.ADMIN_PASSCODE ?? '').trim();
    const store = readAuthStore();

    if (envPasscode.length > 0 || store.adminPasscodeHash) {
      res.status(409).json({
        error: 'Passcode Admin VTC SHOP INDONESIA sudah dikonfigurasi. Silakan masukkan passcode yang berlaku.',
      });
      return;
    }

    if (typeof passcode !== 'string' || passcode.trim().length < 6) {
      res.status(400).json({ error: 'Passcode Admin minimal 6 karakter.' });
      return;
    }

    store.adminPasscodeHash = hashSecret(passcode.trim());
    writeAuthStore(store);

    const token = signToken({
      userId: reqUser.userId,
      name: reqUser.name,
      email: reqUser.email,
      phone: reqUser.phone,
      role: 'admin',
      authMethod: reqUser.authMethod,
    });

    res.json({
      token,
      user: {
        id: reqUser.userId,
        name: reqUser.name,
        email: reqUser.email,
        phone: reqUser.phone,
        role: 'admin',
        authMethod: reqUser.authMethod,
      },
    });
  });

  app.post('/api/admin/verify', requireAuth, (req, res) => {
    const reqUser = (req as express.Request & { user: TokenPayload }).user;
    const { passcode } = req.body ?? {};
    if (typeof passcode !== 'string' || !passcode.trim()) {
      res.status(400).json({ error: 'Masukkan passcode Admin VTC SHOP INDONESIA.' });
      return;
    }

    const envPasscode = (process.env.ADMIN_PASSCODE ?? '').trim();
    const store = readAuthStore();

    let isValid = false;
    if (envPasscode.length > 0) {
      const a = Buffer.from(passcode.trim());
      const b = Buffer.from(envPasscode);
      isValid = a.length === b.length && crypto.timingSafeEqual(a, b);
    } else if (store.adminPasscodeHash) {
      isValid = verifySecret(passcode.trim(), store.adminPasscodeHash);
    } else {
      res.status(400).json({ error: 'Passcode Admin belum dibuat.' });
      return;
    }

    if (!isValid) {
      res.status(403).json({ error: 'Passcode Admin VTC SHOP INDONESIA salah.' });
      return;
    }

    const token = signToken({
      userId: reqUser.userId,
      name: reqUser.name,
      email: reqUser.email,
      phone: reqUser.phone,
      role: 'admin',
      authMethod: reqUser.authMethod,
    });

    res.json({
      token,
      user: {
        id: reqUser.userId,
        name: reqUser.name,
        email: reqUser.email,
        phone: reqUser.phone,
        role: 'admin',
        authMethod: reqUser.authMethod,
      },
    });
  });

  // ---------------- MANUAL ADMIN CS CHAT ROUTES ----------------

  // Terima pesan pembeli & teruskan diam-diam ke WhatsApp Admin (nomor Admin tidak pernah dikirim ke pembeli)
  app.post('/api/cs/forward', (req, res) => {
    const { threadId, buyerName, buyerEmail, messageId, text, createdAt } =
      req.body ?? {};
    const cleanText = typeof text === 'string' ? text.trim() : '';
    const cleanThreadId =
      typeof threadId === 'string' && threadId.trim()
        ? threadId.trim()
        : 'guest-buyer';
    if (!cleanText) {
      res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
      return;
    }

    const cleanName =
      typeof buyerName === 'string' && buyerName.trim()
        ? buyerName.trim()
        : 'Pembeli VTC SHOP';
    const cleanEmail =
      typeof buyerEmail === 'string' ? buyerEmail.trim() : '';
    const now =
      typeof createdAt === 'string' && createdAt
        ? createdAt
        : new Date().toISOString();
    const msgId =
      typeof messageId === 'string' && messageId
        ? messageId
        : `cs-msg-${Date.now()}`;

    const waBody = `[VTC SHOP CS]\nPembeli: ${cleanName}${
      cleanEmail ? ` (${cleanEmail})` : ''
    }\nPesan: ${cleanText}`;
    const waForwardUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(
      waBody
    )}`;

    const threads = readCsStore();
    let thread = threads.find((t) => t.id === cleanThreadId);
    if (!thread) {
      thread = {
        id: cleanThreadId,
        buyerName: cleanName,
        buyerEmail: cleanEmail,
        unreadByAdmin: 0,
        unreadByBuyer: 0,
        updatedAt: now,
        messages: [
          {
            id: `cs-open-${cleanThreadId}`,
            sender: 'admin',
            text: 'Halo! Selamat datang di VTC SHOP. Ada yang bisa dibantu?',
            createdAt: now,
          },
        ],
      };
      threads.unshift(thread);
    }

    if (!thread.messages.some((m) => m.id === msgId)) {
      thread.messages.push({
        id: msgId,
        sender: 'buyer',
        text: cleanText,
        createdAt: now,
        waForwardUrl,
      });
      thread.unreadByAdmin += 1;
      thread.updatedAt = now;
      thread.buyerName = cleanName;
      if (cleanEmail) thread.buyerEmail = cleanEmail;
    }

    writeCsStore([thread, ...threads.filter((t) => t.id !== thread!.id)]);

    if (process.env.ADMIN_WA_WEBHOOK_URL) {
      fetch(process.env.ADMIN_WA_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: ADMIN_WA_NUMBER,
          buyerName: cleanName,
          buyerEmail: cleanEmail,
          message: cleanText,
          waForwardUrl,
        }),
      }).catch(() => {});
    }

    // Response strictly hides Admin WA number & wa.me link from buyer
    res.json({
      ok: true,
      forwarded: true,
      messageId: msgId,
    });
  });

  app.get('/api/cs/threads/:threadId', requireAuth, (req, res) => {
    const threadId = String(req.params.threadId || '');
    const threads = readCsStore();
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) {
      res.json({ thread: null });
      return;
    }
    res.json({
      thread: {
        ...thread,
        messages: thread.messages.map(({ waForwardUrl: _hidden, ...rest }) => rest),
      },
    });
  });

  app.get('/api/cs/admin/threads', requireAuth, (req, res) => {
    const reqUser = (req as express.Request & { user: TokenPayload }).user;
    const isAdmin = reqUser.role === 'admin';
    const threads = readCsStore().map((t) => ({
      ...t,
      messages: t.messages.map((m) =>
        isAdmin ? m : { id: m.id, sender: m.sender, text: m.text, createdAt: m.createdAt }
      ),
    }));
    res.json({ threads });
  });

  app.post('/api/cs/reply', requireAuth, (req, res) => {
    const { threadId, text } = req.body ?? {};
    const cleanThreadId = typeof threadId === 'string' ? threadId.trim() : '';
    const cleanText = typeof text === 'string' ? text.trim() : '';
    if (!cleanThreadId || !cleanText) {
      res.status(400).json({ error: 'ID chat dan isi balasan wajib diisi.' });
      return;
    }

    const now = new Date().toISOString();
    const threads = readCsStore();
    let thread = threads.find((t) => t.id === cleanThreadId);
    if (!thread) {
      thread = {
        id: cleanThreadId,
        buyerName: 'Pembeli VTC SHOP',
        buyerEmail: '',
        unreadByAdmin: 0,
        unreadByBuyer: 0,
        updatedAt: now,
        messages: [],
      };
      threads.unshift(thread);
    }

    thread.messages.push({
      id: `cs-adm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'admin',
      text: cleanText,
      createdAt: now,
    });
    thread.unreadByAdmin = 0;
    thread.unreadByBuyer += 1;
    thread.updatedAt = now;

    writeCsStore([thread, ...threads.filter((t) => t.id !== cleanThreadId)]);

    res.json({
      ok: true,
      thread: {
        ...thread,
        messages: thread.messages.map(({ waForwardUrl: _hidden, ...rest }) => rest),
      },
    });
  });

  // ---------------- GEMINI AI ROUTES ----------------

  app.post('/api/ai/spec', async (req, res) => {
    try {
      const { query, matchedProducts } = req.body ?? {};
      if (typeof query !== 'string' || !query.trim()) {
        res.status(400).json({ error: 'Kata kunci pencarian wajib diisi.' });
        return;
      }

      const ai = getGeminiClient();
      const catalogContext = Array.isArray(matchedProducts)
        ? matchedProducts
            .slice(0, 5)
            .map(
              (p: { name?: string; price?: number; category?: string; rating?: number }) =>
                `- ${p.name} (${p.category}) Rp ${p.price} ★${p.rating}`
            )
            .join('\n')
        : 'Tidak ada produk persis di katalog, berikan analisis pasar Indonesia untuk produk ini.';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analisis pencarian belanja di VTC SHOP INDONESIA untuk kata kunci: "${query.trim()}".
Produk relevan di katalog VTC SHOP INDONESIA:
${catalogContext}

Berikan ringkasan spesifikasi dan perbandingan produk dalam Bahasa Indonesia yang ringkas, akurat, dan membantu pembeli membandingkan 3 toko (termasuk VTC Official / toko marketplace sejenis), spesifikasi teknis utama, rekomendasi terbaik, dan review singkat. Jangan menyebut kata "AI" dalam jawaban.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productTitle: { type: Type.STRING },
              summary: { type: Type.STRING },
              specs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                  },
                },
              },
              priceComparison: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    storeName: { type: Type.STRING },
                    priceRange: { type: Type.STRING },
                    highlight: { type: Type.STRING },
                    isRecommended: { type: Type.BOOLEAN },
                  },
                },
              },
              bestRecommendation: { type: Type.STRING },
              shortReview: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ spec: parsed });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal memuat ringkasan spesifikasi produk.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, catalogSummary, history } = req.body ?? {};
      if (typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        return;
      }

      const ai = getGeminiClient();
      const historyText = Array.isArray(history)
        ? history
            .slice(-6)
            .map(
              (m: { role?: string; text?: string }) =>
                `${m.role === 'user' ? 'Pembeli' : 'Petugas'}: ${m.text}`
            )
            .join('\n')
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${historyText ? `Riwayat obrolan:\n${historyText}\n\n` : ''}Pertanyaan pengguna: ${message.trim()}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: `Anda adalah Layanan Bantuan Belanja resmi di VTC SHOP INDONESIA.
Jangan menyebut kata "AI" atau "kecerdasan buatan" di dalam jawaban kepada pembeli.
Jawab selalu dalam Bahasa Indonesia yang ramah, ringkas, jelas, dan solutif.
Informasi resmi VTC SHOP INDONESIA:
- Promo aktif: Diskon 50% Hari Ini, Flash Sale hingga 80%, dan Bebas Ongkir untuk belanja minimal Rp 150.000 (atau pakai voucher).
- Pengiriman: J&T (Rp 10.000, 1-2 hari), SiCepat (Rp 11.000, 1-3 hari), JNE (Rp 12.000, 2-3 hari).
- Garansi Tepat Waktu: Jika paket terlambat melewati estimasi tiba, pembeli berhak klaim Voucher Keterlambatan Rp 20.000 di menu Pesanan Saya.
- COD GARANSI: Uang COD ditahan dulu di Escrow VTC SHOP INDONESIA, baru dibayarkan/dilepas ke Seller setelah pembeli konfirmasi Pesanan Diterima.
- Pembayaran: COD, VTCPay, QRIS, DANA, OVO, GoPay, Transfer Bank BCA & BRI, Alfamart, Indomaret.
- Cara Jual (Seller): Buka menu Seller -> isi Form Jadi Seller -> tunggu ACC Admin VTC SHOP INDONESIA -> upload produk & input No. Resi saat ada orderan.
- Cara Retur / Komplain: Buka menu Pesanan Saya -> klik tombol Komplain pada pesanan yang sudah dikirim/sampai -> Admin VTC SHOP INDONESIA akan meninjau dan bisa melakukan Refund ke Buyer.
- Katalog produk saat ini: ${typeof catalogSummary === 'string' ? catalogSummary : 'Berbagai produk elektronik, fashion, rumah tangga, kecantikan, dan aksesoris.'}`,
        },
      });

      res.json({ reply: response.text ?? 'Maaf, saya belum bisa memproses pertanyaan itu.' });
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal menghubungi layanan bantuan belanja.';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/ai/visual-search', async (req, res) => {
    try {
      const { imageBase64, mimeType, catalogItems } = req.body ?? {};
      if (typeof imageBase64 !== 'string' || !imageBase64.length) {
        res.status(400).json({ error: 'Gambar produk wajib dikirim.' });
        return;
      }

      const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;
      const safeMime =
        typeof mimeType === 'string' && mimeType.startsWith('image/')
          ? mimeType
          : 'image/jpeg';

      const ai = getGeminiClient();
      const catalogList = Array.isArray(catalogItems)
        ? catalogItems
            .map(
              (p: { id?: string; name?: string; category?: string }) =>
                `id:${p.id} | nama:${p.name} | kategori:${p.category}`
            )
            .join('\n')
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: safeMime,
                data: cleanBase64,
              },
            },
            {
              text: `Identifikasi produk dalam foto ini untuk pencarian VTC SHOP INDONESIA.
Katalog VTC SHOP INDONESIA yang tersedia:
${catalogList}

Kembalikan JSON berisi nama produk yang terdeteksi, kata kunci pencarian singkat (1-3 kata Bahasa Indonesia), kategori paling cocok (Elektronik, Fashion, Rumah Tangga, Kecantikan, atau Aksesoris), catatan visual singkat, dan daftar id produk dari katalog di atas yang mirip/relevan.`,
            },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedItemName: { type: Type.STRING },
              searchKeywords: { type: Type.STRING },
              category: { type: Type.STRING },
              visualNotes: { type: Type.STRING },
              matchedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ result: parsed });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal menganalisis foto produk.';
      res.status(500).json({ error: msg });
    }
  });

  // ---------------- VITE / STATIC MIDDLEWARE ----------------

  if (process.env.NODE_ENV !== 'production') {
    app.get('/@vite/client', (_req, res) => {
      res.type('application/javascript').send(`
export class ErrorOverlay extends HTMLElement {}
if (globalThis.customElements && !globalThis.customElements.get('vite-error-overlay')) {
  globalThis.customElements.define('vite-error-overlay', ErrorOverlay);
}
export function createHotContext() {
  return {
    accept() {},
    dispose() {},
    prune() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
    data: {},
  };
}
const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}
export function injectQuery(url) {
  return url;
}
`);
    });

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VTC SHOP INDONESIA berjalan di port ${PORT} (HTTP Mode)`);
  });
}

startServer();
