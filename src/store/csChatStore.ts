export interface CsMessage {
  id: string;
  sender: 'buyer' | 'admin' | 'system';
  text: string;
  createdAt: string;
  waForwardUrl?: string;
}

export interface CsThread {
  id: string;
  buyerName: string;
  buyerEmail: string;
  unreadByAdmin: number;
  unreadByBuyer: number;
  updatedAt: string;
  messages: CsMessage[];
}

export const CS_STORAGE_KEY = 'vtc_cs_threads_v1';
export const CS_UPDATE_EVENT = 'vtc-cs-updated';
export const CS_OPEN_EVENT = 'vtc-open-cs-chat';

export const CS_OPENING_TEXT =
  'Halo! Selamat datang di CS VTC SHOP. Ada kendala seputar akun, pembayaran, refund, laporan seller, atau cara buka toko?';
export const CS_WAITING_TEXT =
  'Pesan terkirim ke Admin Platform. Admin akan membalas...';

export function emitCsUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CS_UPDATE_EVENT));
  }
}

export function openCsChatWindow(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CS_OPEN_EVENT));
  }
}

export function loadCsThreads(): CsThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is CsThread =>
        Boolean(t && typeof t.id === 'string' && Array.isArray(t.messages))
    );
  } catch {
    return [];
  }
}

export function saveCsThreads(threads: CsThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CS_STORAGE_KEY, JSON.stringify(threads));
    emitCsUpdate();
  } catch {
    // Ignore storage quota errors
  }
}

export function buildDefaultOpeningMessage(threadId: string): CsMessage {
  return {
    id: `cs-open-${threadId}`,
    sender: 'admin',
    text: CS_OPENING_TEXT,
    createdAt: new Date().toISOString(),
  };
}

export function getOrCreateBuyerThread(user: {
  id: string;
  name: string;
  email: string;
}): CsThread {
  const threads = loadCsThreads();
  const existing = threads.find((t) => t.id === user.id);
  if (existing) {
    if (existing.messages.length === 0) {
      existing.messages = [buildDefaultOpeningMessage(user.id)];
      saveCsThreads(threads);
    }
    return existing;
  }

  const created: CsThread = {
    id: user.id,
    buyerName: user.name || 'Pembeli VTC SHOP',
    buyerEmail: user.email || '',
    unreadByAdmin: 0,
    unreadByBuyer: 0,
    updatedAt: new Date().toISOString(),
    messages: [buildDefaultOpeningMessage(user.id)],
  };
  saveCsThreads([created, ...threads]);
  return created;
}

export function appendBuyerCsMessage(
  user: { id: string; name: string; email: string },
  rawText: string
): { thread: CsThread; message: CsMessage } {
  const clean = rawText.trim();
  const threads = loadCsThreads();
  const now = new Date().toISOString();
  const buyerMsg: CsMessage = {
    id: `cs-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender: 'buyer',
    text: clean,
    createdAt: now,
  };
  const waitingMsg: CsMessage = {
    id: `cs-wait-${Date.now()}`,
    sender: 'system',
    text: CS_WAITING_TEXT,
    createdAt: now,
  };

  let target = threads.find((t) => t.id === user.id);
  if (!target) {
    target = {
      id: user.id,
      buyerName: user.name || 'Pembeli VTC SHOP',
      buyerEmail: user.email || '',
      unreadByAdmin: 0,
      unreadByBuyer: 0,
      updatedAt: now,
      messages: [buildDefaultOpeningMessage(user.id)],
    };
    threads.unshift(target);
  }

  // Keep clean thread: strip previous waiting notice so only one waiting notice sits at bottom
  const cleanedHistory = target.messages.filter((m) => m.sender !== 'system');
  target.buyerName = user.name || target.buyerName;
  target.buyerEmail = user.email || target.buyerEmail;
  target.messages = [...cleanedHistory, buyerMsg, waitingMsg];
  target.unreadByAdmin = (target.unreadByAdmin || 0) + 1;
  target.updatedAt = now;

  const reordered = [target, ...threads.filter((t) => t.id !== target!.id)];
  saveCsThreads(reordered);

  return { thread: target, message: buyerMsg };
}

export function appendAdminCsReply(
  threadId: string,
  rawText: string
): CsThread[] {
  const clean = rawText.trim();
  if (!clean) return loadCsThreads();

  const threads = loadCsThreads();
  const now = new Date().toISOString();
  const adminMsg: CsMessage = {
    id: `cs-adm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender: 'admin',
    text: clean,
    createdAt: now,
  };

  const target = threads.find((t) => t.id === threadId);
  if (!target) return threads;

  target.messages = [
    ...target.messages.filter((m) => m.sender !== 'system'),
    adminMsg,
  ];
  target.unreadByAdmin = 0;
  target.unreadByBuyer = (target.unreadByBuyer || 0) + 1;
  target.updatedAt = now;

  const reordered = [target, ...threads.filter((t) => t.id !== threadId)];
  saveCsThreads(reordered);
  return reordered;
}

export function markThreadReadByBuyer(threadId: string): void {
  const threads = loadCsThreads();
  const target = threads.find((t) => t.id === threadId);
  if (!target || !target.unreadByBuyer) return;
  target.unreadByBuyer = 0;
  saveCsThreads(threads);
}

export function markThreadReadByAdmin(threadId: string): void {
  const threads = loadCsThreads();
  const target = threads.find((t) => t.id === threadId);
  if (!target || !target.unreadByAdmin) return;
  target.unreadByAdmin = 0;
  saveCsThreads(threads);
}

export function mergeServerThreads(serverThreads: CsThread[]): CsThread[] {
  if (!Array.isArray(serverThreads) || serverThreads.length === 0) {
    return loadCsThreads();
  }
  const local = loadCsThreads();
  const map = new Map<string, CsThread>();
  for (const t of local) {
    map.set(t.id, t);
  }
  for (const srv of serverThreads) {
    const existing = map.get(srv.id);
    if (!existing) {
      map.set(srv.id, srv);
      continue;
    }
    const existingIds = new Set(existing.messages.map((m) => m.id));
    const mergedMessages = [...existing.messages.filter((m) => m.sender !== 'system')];
    for (const m of srv.messages) {
      if (m.sender === 'system') continue;
      if (!existingIds.has(m.id)) {
        mergedMessages.push(m);
      } else {
        const idx = mergedMessages.findIndex((x) => x.id === m.id);
        if (idx >= 0 && m.waForwardUrl && !mergedMessages[idx].waForwardUrl) {
          mergedMessages[idx] = { ...mergedMessages[idx], waForwardUrl: m.waForwardUrl };
        }
      }
    }
    mergedMessages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const lastNonSystem = mergedMessages[mergedMessages.length - 1];
    if (lastNonSystem?.sender === 'buyer') {
      mergedMessages.push({
        id: `cs-wait-${existing.id}`,
        sender: 'system',
        text: CS_WAITING_TEXT,
        createdAt: lastNonSystem.createdAt,
      });
    }

    map.set(srv.id, {
      ...existing,
      ...srv,
      unreadByAdmin: Math.max(existing.unreadByAdmin || 0, srv.unreadByAdmin || 0),
      unreadByBuyer: Math.max(existing.unreadByBuyer || 0, srv.unreadByBuyer || 0),
      updatedAt:
        srv.updatedAt > existing.updatedAt ? srv.updatedAt : existing.updatedAt,
      messages: mergedMessages,
    });
  }

  const merged = Array.from(map.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
  saveCsThreads(merged);
  return merged;
}
