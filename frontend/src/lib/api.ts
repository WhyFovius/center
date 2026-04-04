const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const getToken = () => localStorage.getItem('zd_token');
const setToken = (t: string) => localStorage.setItem('zd_token', t);
const rmToken = () => localStorage.removeItem('zd_token');
const apiFetch = async <T>(path: string, opts: RequestInit & { noAuth?: boolean } = {}): Promise<T> => {
  const { noAuth, headers: h, ...rest } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(h as any || {}) };
  if (!noAuth) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const r = await fetch(url, { ...rest, headers });
  if (!r.ok) {
    let d = 'Error';
    try { const j = await r.json(); d = typeof j.detail === 'string' ? j.detail : Array.isArray(j.detail) ? j.detail.map((e: any) => e.msg || 'Error').join('; ') : d; } catch {}
    throw new Error(d);
  }
  return r.json();
};
export const api = {
  auth: {
    register: (d: { username: string; password: string; full_name?: string }) => apiFetch<void>('/auth/register', { method: 'POST', body: JSON.stringify(d), noAuth: true }),
    login: (d: { username: string; password: string }) => apiFetch<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(d), noAuth: true }),
  },
  sim: {
    getState: () => apiFetch<any>('/simulator/state'),
    attempt: (d: { step_id: number; option_id: number; hints_used: number }) => apiFetch<any>('/simulator/attempt', { method: 'POST', body: JSON.stringify(d) }),
    resetMission: (missionCode: string) => apiFetch<any>(`/simulator/reset/${missionCode}`, { method: 'POST' }),
  },
  cert: { get: () => apiFetch<any>('/certificate/me') },
  lb: { get: () => apiFetch<any>('/leaderboard') },
  setToken, rmToken, getToken,
};
