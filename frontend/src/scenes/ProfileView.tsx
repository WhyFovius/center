import { useMemo, useState, useRef, useEffect } from 'react';
import { Shield, Trophy, Target, Award, AlertTriangle, User, CheckCircle, TrendingUp, Calendar, QrCode, Camera, Upload, X } from 'lucide-react';
import { useGS, ssFor } from '@/store/useGS';
import type { Mission } from '@/types';
import { AIGenerator } from '@/components/layout/AIGenerator';
import Footer from '@/components/layout/Footer';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

function catAttack(step: { attack_type: string; title: string; payload: string; code: string }): string {
  const s = [step.attack_type, step.title, step.payload, step.code].join(' ').toLowerCase();
  if (s.includes('skim')) return 'skimming';
  if (s.includes('credential') || s.includes('парол') || s.includes('stuffing')) return 'password_attack';
  if (s.includes('social') || s.includes('социаль') || s.includes('deepfake') || s.includes('звонок')) return 'social_engineering';
  if (s.includes('wifi') || s.includes('wi-fi') || s.includes('mitm')) return 'public_wifi';
  if (s.includes('api') || s.includes('oauth') || s.includes('token')) return 'api_security';
  return 'phishing';
}

const catTitle: Record<string, string> = { phishing: 'Фишинг', skimming: 'Скимминг', password_attack: 'Атаки на пароли', social_engineering: 'Социальная инженерия', public_wifi: 'Общественный Wi-Fi', api_security: 'API и токены' };

export function ProfileView() {
  const user = useGS(s => s.sim?.user);
  const prog = useGS(s => s.prog);
  const missions = useGS(s => s.sim?.missions ?? []);
  const totalSteps = useGS(s => s.sim?.total_steps ?? 0);
  const ss = useGS(s => s.ss);
  const cert = useGS(s => s.cert);
  const lessons = useGS(s => s.lessons);
  const setScreen = useGS(s => s.setScreen);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('zd_token');
    if (user) {
      // Fetch the most recent avatar for this user
      fetch(`/api/v1/avatar/list?user_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (data.filename) setAvatarUrl(`/api/v1/avatar/${data.filename}`);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('zd_token');
      const fd = new FormData();
      fd.append('file', file);
      const resp = await fetch('/api/v1/avatar/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!resp.ok) throw new Error('Upload failed');
      const data = await resp.json();
      setAvatarUrl(`/api/v1/avatar/${data.avatar_url.split('/').pop()}`);
      setShowAvatarModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const firstTryCount = useMemo(() => missions.reduce((a, m) => a + m.steps.filter(s => ssFor(ss, s.id).first_try_success).length, 0), [missions, ss]);
  const totalMistakes = useMemo(() => missions.reduce((a, m) => a + m.steps.reduce((b, s) => b + (ssFor(ss, s.id).mistakes_count || 0), 0), 0), [missions, ss]);

  const catStats = useMemo(() => {
    const order = ['phishing', 'skimming', 'password_attack', 'social_engineering', 'public_wifi', 'api_security'];
    const stats = new Map(order.map(k => [k, { total: 0, resolved: 0, mistakes: 0 }]));
    missions.forEach((m: Mission) => m.steps.forEach(step => {
      const key = catAttack(step); const s = ssFor(ss, step.id);
      const slot = stats.get(key) || { total: 0, resolved: 0, mistakes: 0 };
      slot.total++; slot.resolved += s.resolved ? 1 : 0; slot.mistakes += s.mistakes_count || 0;
      stats.set(key, slot);
    }));
    return { order, stats };
  }, [missions, ss]);

  const achievements = useMemo(() => [
    { id: 'first_try', name: 'Первая кровь', desc: 'Решил с первой попытки', icon: <Trophy className="w-5 h-5" />, unlocked: firstTryCount > 0, color: '#f59e0b' },
    { id: 'flawless', name: 'Безупречный', desc: 'Все сценарии без ошибок', icon: <Shield className="w-5 h-5" />, unlocked: totalMistakes === 0 && prog && prog.resolved_steps > 0, color: '#10b981' },
    { id: 'complete', name: 'Завершитель', desc: 'Завершил все сценарии', icon: <CheckCircle className="w-5 h-5" />, unlocked: prog ? prog.resolved_steps >= totalSteps : false, color: '#3b82f6' },
    { id: 'survivor', name: 'Выживший', desc: 'Пережил 5 атак', icon: <AlertTriangle className="w-5 h-5" />, unlocked: prog ? prog.security_level >= 50 : false, color: '#ef4444' },
    { id: 'expert', name: 'Эксперт', desc: '80%+ эффективности', icon: <TrendingUp className="w-5 h-5" />, unlocked: prog ? prog.success_rate >= 80 : false, color: '#a855f7' },
    { id: 'certified', name: 'Сертифицирован', desc: 'Получил сертификат', icon: <Award className="w-5 h-5" />, unlocked: cert?.available || false, color: '#06b6d4' },
  ], [firstTryCount, totalMistakes, prog, totalSteps, cert]);

  if (!user || !prog) return <div className="flex items-center justify-center h-full text-text-muted">Нет данных</div>;

  const maxM = Math.max(1, ...Array.from(catStats.stats.values()).map(d => d.mistakes));

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-surface">
        <button onClick={() => setScreen('menu')} className="text-sm text-text-secondary hover:text-text transition-colors">← Назад</button>
        <h1 className="text-base font-bold text-text">Профиль</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with avatar */}
          <div className="relative flex items-center gap-6 p-6 bg-surface border border-border rounded-2xl">
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-bg-secondary flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-text-muted" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text">{user.full_name}</h2>
              <p className="text-base text-text-secondary">@{user.username}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">Лига: {prog.league}</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">{prog.resolved_steps} сценариев</span>
              </div>
            </div>
            {cert?.available && (
              <div className="px-4 py-2 rounded-full text-sm font-semibold bg-success-soft text-success border border-success/30">
                ✅ Сертификат доступен
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Shield className="w-5 h-5 text-primary" />, label: 'Безопасность', value: `${prog.security_level}%` },
              { icon: <Trophy className="w-5 h-5 text-accent" />, label: 'Репутация', value: String(prog.reputation) },
              { icon: <Target className="w-5 h-5 text-info" />, label: 'Прогресс', value: `${prog.resolved_steps}/${totalSteps}` },
              { icon: <TrendingUp className="w-5 h-5 text-purple-500" />, label: 'Эффективность', value: `${prog.success_rate}%` },
            ].map((s, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-text-muted">{s.label}</span></div>
                <div className="text-2xl font-bold text-text">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-text flex items-center gap-2"><Award className="w-5 h-5 text-accent" />Достижения</h3>
              <span className="text-sm text-text-muted">{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {achievements.map(a => (
                <div key={a.id} className={`p-4 rounded-xl border transition-all ${a.unlocked ? 'border-border bg-bg-secondary' : 'border-border/50 bg-bg-secondary/50 opacity-40'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: a.unlocked ? a.color : '#9ca3af' }}>{a.icon}</span>
                    <span className="text-sm font-semibold text-text">{a.name}</span>
                  </div>
                  <p className="text-xs text-text-muted">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission progress */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-base font-bold text-text mb-4">Прогресс по сценариям</h3>
            <div className="space-y-4">
              {missions.map((m: Mission) => {
                const done = m.steps.filter(s => ssFor(ss, s.id).resolved).length;
                const total = m.steps.length;
                const pct = total ? Math.round(done / total * 100) : 0;
                return (
                  <div key={m.id}>
                    <div className="flex justify-between text-sm text-text-muted mb-1.5"><span className="font-medium">{m.title}</span><span>{done}/{total} ({pct}%)</span></div>
                    <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mistakes */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-danger" />Ошибки по типам</h3>
            <div className="space-y-3">
              {catStats.order.map(key => {
                const d = catStats.stats.get(key) || { mistakes: 0, total: 0 };
                const pct = maxM > 0 ? (d.mistakes / maxM) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm text-text-muted mb-1"><span className="font-medium">{catTitle[key]}</span><span>{d.mistakes} ош. / {d.total}</span></div>
                    <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-danger transition-all" style={{ width: `${Math.max(pct, 3)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lessons */}
          {lessons.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-base font-bold text-text mb-3 flex items-center gap-2"><Calendar className="w-5 h-5 text-info" />Последние уроки</h3>
              {lessons.map((l, i) => <p key={i} className="text-sm text-text-secondary mb-1.5">• {l}</p>)}
            </div>
          )}

          {/* AI Generator */}
          <AIGenerator />

          {/* Certificate */}
          {cert?.available && <CertificateCard cert={cert} prog={prog} />}
        </div>
      </div>

      {/* Avatar modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAvatarModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text">Изменить аватар</h3>
                <button onClick={() => setShowAvatarModal(false)} className="p-1 rounded-full hover:bg-bg-secondary"><X className="w-5 h-5 text-text-muted" /></button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-bg-secondary flex items-center justify-center">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-text-muted" />}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {uploading ? 'Загрузка...' : <><Upload className="w-4 h-4" />Загрузить фото</>}
                </button>
                <p className="text-xs text-text-muted">PNG, JPG до 5MB</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function CertificateCard({ cert, prog }: { cert: any; prog: any }) {
  const [showQR, setShowQR] = useState(false);
  const certUrl = `https://zeroday.center-invest.ru/cert/${cert.certificate_id}`;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text flex items-center gap-2">
          <Award className="w-4 h-4 text-accent" />Сертификат
        </h3>
        <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-bg-secondary text-text-secondary hover:bg-surface-active transition-colors text-xs">
          <QrCode className="w-3.5 h-3.5" />{showQR ? 'Скрыть' : 'Показать QR'}
        </button>
      </div>

      {showQR && (
        <div className="flex flex-col items-center gap-3 p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={certUrl} size={160} level="H" />
          </div>
          <p className="text-xs text-text-muted text-center">{cert.message}</p>
          <p className="text-[10px] font-mono text-text-secondary">ID: {cert.certificate_id}</p>
          <div className="grid grid-cols-3 gap-3 text-center w-full">
            <div><p className="text-lg font-bold text-text">{prog.resolved_steps}</p><p className="text-[10px] text-text-muted">Сценариев</p></div>
            <div><p className="text-lg font-bold text-text">{prog.success_rate}%</p><p className="text-[10px] text-text-muted">Эффективность</p></div>
            <div><p className="text-lg font-bold text-text">{prog.league}</p><p className="text-[10px] text-text-muted">Лига</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
