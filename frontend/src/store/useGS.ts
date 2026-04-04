import { create } from 'zustand';
import type { SimulatorState, Progress, StepState, FeedbackState, Consequence, Certificate, LearningBand, ScenarioStep, Mission, GameScreen, Lang, Theme, ScenarioTrack } from '@/types';
import { api } from '@/lib/api';

interface GS {
  authed: boolean; loading: boolean; error: string | null; screen: GameScreen;
  sim: SimulatorState | null; ss: Map<number, StepState>; prog: Progress | null;
  mi: number; si: number; selOpt: number | null; fb: FeedbackState | null;
  cert: Certificate | null; band: LearningBand; hints: Map<string, number>;
  submitting: boolean; lessons: string[];
  lang: Lang; theme: Theme; muted: boolean;
  track: ScenarioTrack;
  gp: 'explore' | 'lesson' | 'decision' | 'consequence';
  px: number; py: number; pdir: 'up' | 'down' | 'left' | 'right'; pmov: boolean;
  encTriggered: boolean; encStep: ScenarioStep | null;
  energy: number; shield: number;

  setAuthed: (v: boolean) => void; setScreen: (s: GameScreen) => void;
  setLoading: (v: boolean) => void; setError: (v: string | null) => void;
  setLang: (l: Lang) => void; setTheme: (t: Theme) => void; setMuted: (v: boolean) => void; toggleMute: () => void;
  setTrack: (t: ScenarioTrack) => void;

  load: () => Promise<void>;
  submit: (sid: number, oid: number, hu: number) => Promise<void>;
  next: () => void; selectMission: (i: number) => void;
  selectOpt: (id: number | null) => void; setFb: (f: FeedbackState | null) => void;
  useHint: (sid: number) => void; getHints: (sid: number) => number;
  logout: () => void;

  setGp: (p: GS['gp']) => void; setPPos: (x: number, y: number) => void;
  setPDir: (d: GS['pdir']) => void; setPMov: (v: boolean) => void;
  setEncTrig: (v: boolean) => void; setEncStep: (s: ScenarioStep | null) => void;
  setEnergy: (v: number) => void; setShield: (v: number) => void;
  resetCurrentMission: () => Promise<void>;
}

function ssFor(m: Map<number, StepState>, id: number): StepState {
  return m.get(id) || { step_id: id, attempts_count: 0, mistakes_count: 0, resolved: false, first_try_success: false, chosen_option_id: null, resolved_at: null };
}
function firstMission(p: Progress | null, ms: Mission[]) { return p ? Math.min(p.unlocked_mission_index, Math.max(ms.length - 1, 0)) : 0; }
function firstUnresolved(m: Mission, ss: Map<number, StepState>) { const i = m.steps.findIndex(s => !ssFor(ss, s.id).resolved); return i >= 0 ? i : Math.max(0, m.steps.length - 1); }
function playerSpawn() { return { px: 640, py: 430 }; }
function band(p: Progress | null, rc: number): LearningBand { const r = p?.success_rate ?? 0; return rc < 2 || r < 45 ? 'novice' : r < 78 ? 'intermediate' : 'advanced'; }
function family(s?: ScenarioStep | null): string {
  if (!s) return 'generic';
  const f = [s.attack_type, s.location, s.title, s.code].join(' ').toLowerCase();
  if (f.includes('wifi') || f.includes('wi-fi') || f.includes('кафе')) return 'wifi';
  if (f.includes('sms') || f.includes('смартф') || f.includes('qr') || f.includes('smishing')) return 'mobile';
  if (f.includes('парол') || f.includes('credential') || f.includes('2fa') || f.includes('otp')) return 'identity';
  if (f.includes('чат') || f.includes('звонок') || f.includes('соц')) return 'social';
  if (f.includes('почт') || f.includes('email') || f.includes('фиш')) return 'email';
  return 'generic';
}
function emo(f: string, ok: boolean): string {
  if (ok) return { email: 'Письмо остановлено. Никто из коллег не перешёл по поддельной ссылке.', social: 'Попытка социальной инженерии сорвалась.', wifi: 'Сеанс не перехвачен.', mobile: 'Смартфон не скомпрометирован.', identity: 'Учётная запись удержана под контролем.' }[f] || 'Инцидент сдержан.';
  return { email: 'Через пару минут с вашего адреса ушла рассылка с тем же фишингом.', social: 'Атакующий начал действовать от вашего имени.', wifi: 'Сессия перехвачена: токены авторизации у злоумышленника.', mobile: 'Вредоносный поток активирован.', identity: 'В аккаунте уже меняются настройки безопасности.' }[f] || 'Атака развивается.';
}
function rule(f: string): string {
  return { email: 'Всегда проверяйте домен, Reply-To и контекст запроса.', social: 'Срочный запрос на коды подтверждайте через независимый канал.', wifi: 'Публичная сеть — не доверенная среда для рабочих данных.', mobile: 'SMS, QR и push не доказывают подлинность.', identity: 'При захвате аккаунта: разрыв сессий, новый пароль, MFA.' }[f] || 'Сначала проверка источника, потом действие.';
}
function missed(f: string, h?: string): string {
  if (h) return h;
  return { email: 'Пропущены маркеры подмены: домен, подпись, канал ответа.', social: 'Пропущен признак давления срочностью.', wifi: 'Пропущен риск доверия к неподтверждённой сети.', mobile: 'Пропущен риск перехода из недоверенного канала.', identity: 'Пропущены признаки захвата учётной записи.' }[f] || 'Пропущены индикаторы компрометации.';
}
function bLabel(b: LearningBand): string { return b === 'advanced' ? 'Продвинутый' : b === 'intermediate' ? 'Средний' : 'Новичок'; }
function fmt(v: number, s: string): string { return v > 0 ? `+${v}${s}` : v < 0 ? `${v}${s}` : `0${s}`; }

export const useGS = create<GS>((set, get) => ({
  authed: false, loading: false, error: null, screen: 'auth',
  sim: null, ss: new Map<number, StepState>(), prog: null,
  mi: 0, si: 0, selOpt: null, fb: null, cert: null, band: 'novice',
  hints: new Map<string, number>(), submitting: false, lessons: [],
  lang: (localStorage.getItem('zd_lang') as Lang) || 'ru', theme: (localStorage.getItem('zd_theme') as Theme) || 'light',
  muted: localStorage.getItem('zd_sfx_mute') === '1',
  track: 'network',
  gp: 'explore', px: 550, py: 405, pdir: 'down', pmov: false,
  encTriggered: false, encStep: null, energy: 100, shield: 100,

  setAuthed: v => set({ authed: v }), setScreen: s => set({ screen: s }),
  setLoading: v => set({ loading: v }), setError: v => set({ error: v }),
  setLang: l => {
    localStorage.setItem('zd_lang', l);
    set({ lang: l });
  }, setTheme: t => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('zd_theme', t);
    set({ theme: t });
  },
  setMuted: v => {
    localStorage.setItem('zd_sfx_mute', v ? '1' : '0');
    set({ muted: v });
  },
  toggleMute: () => {
    const v = !get().muted;
    localStorage.setItem('zd_sfx_mute', v ? '1' : '0');
    set({ muted: v });
  },
  setTrack: t => set({ track: t }),

  load: async () => {
    set({ loading: true, error: null });
    try {
      const d = await api.sim.getState();
      const ss = new Map<number, StepState>((d.step_states || []).map((s: StepState) => [s.step_id, s]));
      const ms: Mission[] = d.missions || []; const pr: Progress = d.progress;
      const mi = firstMission(pr, ms); const m = ms[mi];
      const si = m ? firstUnresolved(m, ss) : 0;
      const rc = ms.reduce((a: number, x: Mission) => a + x.steps.filter(s => ssFor(ss, s.id).resolved).length, 0);
      set({ sim: d, ss, prog: pr, mi, si, selOpt: null, fb: null, band: band(pr, rc), hints: new Map(), lessons: [], loading: false, screen: 'menu', gp: 'explore', energy: pr.security_level, shield: pr.security_level, ...playerSpawn() });
    } catch (e: any) { set({ error: e.message, loading: false }); throw e; }
  },

  submit: async (sid, oid, huc) => {
    set({ submitting: true });
    try {
      const r = await api.sim.attempt({ step_id: sid, option_id: oid, hints_used: huc });
      const { ss, sim, lessons } = get();
      const nss = new Map(ss); nss.set(r.step_state.step_id, r.step_state);
      const b = band(r.progress, r.progress.resolved_steps);
      const ul = [...lessons]; if (r.correct && r.message) ul.unshift(r.message);
      set({ ss: nss, prog: r.progress, band: b, lessons: ul.slice(0, 3) });
      if (r.all_completed) try { const c = await api.cert.get(); set({ cert: c }); } catch {}
      const cs = sim?.missions[get().mi]?.steps[get().si];
      const fam = family(cs);
      const con: Consequence = {
        status: r.correct ? 'contained' : 'breach',
        badge: r.correct ? 'Инцидент под контролем' : 'Атака развивается',
        summary: r.correct ? `Решение остановило атакующего. Режим: ${bLabel(b)}.` : `Решение создало точку входа. Режим: ${bLabel(b)}.`,
        coach: r.correct ? 'Действие сработало. Закрепите паттерн.' : 'Повторите эпизод и попробуйте другой шаг.',
        emotionalOutcome: emo(fam, r.correct), missedSignal: missed(fam, r.message),
        inductiveRule: rule(fam),
        timeline: [{ stage: 'Контекст', text: 'Подозрительная активность' }, { stage: 'Ваше действие', text: r.correct ? 'Подтверждено' : 'Рискованный выбор' }, { stage: 'Последствие', text: emo(fam, r.correct) }],
        metrics: [
          { label: 'Безопасность', value: fmt(r.progress?.security_level ?? 0, '%'), tone: (r.progress?.security_level ?? 0) >= 0 ? 'positive' : 'negative' },
          { label: 'Репутация', value: fmt(r.progress?.reputation ?? 0, ''), tone: (r.progress?.reputation ?? 0) >= 0 ? 'positive' : 'negative' },
          { label: 'Ошибки', value: fmt(r.progress?.total_mistakes ?? 0, ''), tone: (r.progress?.total_mistakes ?? 0) > 0 ? 'negative' : 'neutral' },
          { label: 'Попытка', value: fmt(r.step_state?.attempts_count ?? 0, ''), tone: 'neutral' },
          { label: 'Подсказки', value: huc > 0 ? `-${huc * 2}` : '0', tone: huc > 0 ? 'negative' : 'neutral' },
        ],
      };
      set({ fb: { kind: r.correct ? 'success' : 'warning', title: r.title, message: r.message, detail: r.detail, references: r.references || [], stepId: r.step_state.step_id, consequence: con }, submitting: false, gp: 'consequence', energy: r.progress.security_level, shield: r.progress.security_level });
    } catch (e: any) {
      const message = e?.message || 'Ошибка';
      if (typeof message === 'string' && message.toLowerCase().includes('locked')) {
        try {
          await get().load();
          set({ submitting: false, fb: null, gp: 'explore', screen: 'lobby', ...playerSpawn(), encTriggered: false, encStep: null });
          return;
        } catch {}
      }
      set({ fb: { kind: 'warning', title: 'Ошибка', message, detail: '', references: [], stepId: null, consequence: null }, submitting: false });
    }
  },

  next: () => {
    const { sim, mi, si, ss } = get(); if (!sim) return;
    const ms = sim.missions; const m = ms[mi]; if (!m) return;
    const step = m.steps[si]; if (!step) return;
    if (!ssFor(ss, step.id).resolved) return;
    if (si < m.steps.length - 1) {
      set({ si: si + 1, selOpt: null, fb: null, gp: 'explore', encTriggered: false, encStep: null, ...playerSpawn() });
      return;
    }
    // Mission completed - try to unlock next mission
    const prog = get().prog;
    if (prog && mi < ms.length - 1) {
      const nextMission = ms[mi + 1];
      const nextIndex = mi + 1;
      const nextSi = nextMission ? firstUnresolved(nextMission, ss) : 0;
      set({ mi: nextIndex, si: nextSi, selOpt: null, fb: null, gp: 'explore', encTriggered: false, encStep: null, ...playerSpawn() });
      return;
    }
    set({ fb: null, gp: 'explore', encTriggered: false, encStep: null, screen: 'lobby', ...playerSpawn() });
  },

  selectMission: i => { const { sim, ss } = get(); if (!sim) return; const m = sim.missions[i]; if (!m) return; set({ mi: i, si: firstUnresolved(m, ss), selOpt: null, fb: null, gp: 'explore', encTriggered: false, encStep: null, ...playerSpawn() }); },
  selectOpt: id => set({ selOpt: id }), setFb: f => set({ fb: f }),
  useHint: sid => { const { hints } = get(); const k = String(sid); const c = hints.get(k) || 0; const n = new Map(hints); n.set(k, c + 1); set({ hints: n }); },
  getHints: sid => get().hints.get(String(sid)) || 0,

  logout: () => { api.rmToken(); set({ authed: false, sim: null, ss: new Map(), prog: null, mi: 0, si: 0, selOpt: null, fb: null, cert: null, band: 'novice', hints: new Map(), submitting: false, lessons: [], error: null, loading: false, screen: 'auth', track: 'network', gp: 'explore', ...playerSpawn(), encTriggered: false, encStep: null, energy: 100, shield: 100 }); },

  resetCurrentMission: async () => {
    const { sim, mi } = get();
    if (!sim) return;
    const mission = sim.missions[mi];
    if (!mission) return;
    try {
      await api.sim.resetMission(mission.code);
      // Reload state from backend
      const d = await api.sim.getState();
      const ss = new Map<number, StepState>((d.step_states || []).map((s: StepState) => [s.step_id, s]));
      const ms: Mission[] = d.missions || [];
      const pr: Progress = d.progress;
      const newMi = Math.min(mi, ms.length - 1);
      const newM = ms[newMi];
      const newSi = newM ? firstUnresolved(newM, ss) : 0;
      const rc = ms.reduce((a: number, x: Mission) => a + x.steps.filter(s => ssFor(ss, s.id).resolved).length, 0);
      set({
        sim: d, ss, prog: pr, mi: newMi, si: newSi,
        selOpt: null, fb: null, band: band(pr, rc), hints: new Map(), lessons: [],
        gp: 'explore', encTriggered: false, encStep: null,
        energy: pr.security_level, shield: pr.security_level,
        ...playerSpawn(),
      });
    } catch (e) {
      console.error('Mission reset failed:', e);
    }
  },

  setGp: p => set({ gp: p }), setPPos: (x, y) => set({ px: x, py: y }), setPDir: d => set({ pdir: d }), setPMov: v => set({ pmov: v }),
  setEncTrig: v => set({ encTriggered: v }), setEncStep: s => set({ encStep: s, gp: s ? 'lesson' : 'explore' }),
  setEnergy: v => set({ energy: v }), setShield: v => set({ shield: v }),
}));

export { ssFor, family, bLabel };
