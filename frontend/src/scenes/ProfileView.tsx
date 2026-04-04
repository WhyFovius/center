import { useMemo, useState, useRef, useEffect } from 'react';
import { Shield, Trophy, Target, Award, User, CheckCircle, TrendingUp, QrCode, Camera, Upload, X, Star, Zap, Crown, Medal, Gem, Clock, AlertTriangle, BarChart2, Award as AwardIcon, ChevronRight } from 'lucide-react';
import { useGS, ssFor } from '@/store/useGS';
import { t } from '@/lib/i18n';
import type { Mission } from '@/types';
import { AIGenerator } from '@/components/layout/AIGenerator';
import Footer from '@/components/layout/Footer';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export function ProfileView() {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const user = useGS(s => s.sim?.user);
  const prog = useGS(s => s.prog);
  const missions = useGS(s => s.sim?.missions ?? []);
  const totalSteps = useGS(s => s.sim?.total_steps ?? 0);
  const ss = useGS(s => s.ss);
  const cert = useGS(s => s.cert);
  const setScreen = useGS(s => s.setScreen);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'missions'>('overview');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('zd_token');
    if (user) {
      fetch(`/api/v1/avatar/list?user_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (data && data.filename) setAvatarUrl(`/api/v1/avatar/${data.filename}?t=${Date.now()}`);
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
      const resp = await fetch('/api/v1/avatar/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!resp.ok) throw new Error('Upload failed');
      const data = await resp.json();
      setAvatarUrl(`/api/v1/avatar/${data.avatar_url.split('/').pop()}?t=${Date.now()}`);
      setShowAvatarModal(false);
    } catch (err: any) { alert(err.message); }
    finally { setUploading(false); }
  };

  const firstTryCount = useMemo(() => missions.reduce((a, m) => a + m.steps.filter(s => ssFor(ss, s.id).first_try_success).length, 0), [missions, ss]);
  const totalMistakes = useMemo(() => missions.reduce((a, m) => a + m.steps.reduce((b, s) => b + (ssFor(ss, s.id).mistakes_count || 0), 0), 0), [missions, ss]);
  const allComplete = prog ? prog.resolved_steps >= totalSteps : false;
  const totalAttempts = useMemo(() => missions.reduce((a, m) => a + m.steps.reduce((b, s) => b + (ssFor(ss, s.id).attempts_count || 0), 0), 0), [missions, ss]);

  const badges = useMemo(() => [
    { id: 'first_blood', name: T('achFirstTry'), icon: <Zap className="w-5 h-5" />, unlocked: firstTryCount > 0, color: '#f59e0b', desc: T('achFirstTryDesc'), rarity: 'common' },
    { id: 'flawless', name: T('achNoMistakes'), icon: <Gem className="w-5 h-5" />, unlocked: totalMistakes === 0 && prog && prog.resolved_steps > 0, color: '#10b981', desc: T('achNoMistakesDesc'), rarity: 'rare' },
    { id: 'survivor', name: T('achSurvivor'), icon: <Shield className="w-5 h-5" />, unlocked: prog ? prog.security_level >= 50 : false, color: '#ef4444', desc: T('achSurvivorDesc'), rarity: 'common' },
    { id: 'expert', name: T('leagueExpert'), icon: <Star className="w-5 h-5" />, unlocked: prog ? prog.success_rate >= 80 : false, color: '#a855f7', desc: '80%+ эффективности', rarity: 'rare' },
    { id: 'master', name: T('achComplete'), icon: <Crown className="w-5 h-5" />, unlocked: allComplete, color: '#e5b66a', desc: T('achCompleteDesc'), rarity: 'legendary' },
    { id: 'certified', name: T('certificate'), icon: <Award className="w-5 h-5" />, unlocked: cert?.available || false, color: '#06b6d4', desc: T('certAvailable'), rarity: 'epic' },
    { id: 'persistent', name: T('achExplorer'), icon: <Target className="w-5 h-5" />, unlocked: totalAttempts >= 20, color: '#f97316', desc: '20+ попыток', rarity: 'common' },
    { id: 'rookie', name: T('leagueNovice'), icon: <User className="w-5 h-5" />, unlocked: prog ? prog.resolved_steps >= 1 : false, color: '#6b7280', desc: T('profileFirstTryDesc'), rarity: 'common' },
    { id: 'analyst', name: T('leagueAnalyst'), icon: <BarChart2 className="w-5 h-5" />, unlocked: prog ? prog.resolved_steps >= 6 : false, color: '#3b82f6', desc: '6+ сценариев', rarity: 'rare' },
  ], [firstTryCount, totalMistakes, prog, totalSteps, cert, allComplete, totalAttempts, lang]);

  const unlockedBadges = badges.filter(b => b.unlocked).length;

  if (!user || !prog) return <div className="flex items-center justify-center h-full text-text-muted">{T('lbNoData')}</div>;

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen('menu')} className="text-sm text-text-secondary hover:text-text transition-colors">{T('profileBack')}</button>
          <h1 className="text-base font-bold text-text">{T('profile')}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-5">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer shrink-0" onClick={() => setShowAvatarModal(true)}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border bg-bg-secondary flex items-center justify-center">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={() => setAvatarUrl(null)} /> : <User className="w-9 h-9 text-text-muted" />}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-text">{user.full_name}</h2>
                <p className="text-sm text-text-muted">@{user.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">{prog.league}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">{prog.resolved_steps}/{totalSteps} {T('profileMissions')}</span>
                  {cert?.available && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success-soft text-success border border-success/30">{T('profileCertReady')}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-primary">{prog.success_rate}%</div>
                <div className="text-xs text-text-muted">{T('effectiveness')}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Shield className="w-5 h-5" />, value: `${prog.security_level}%`, label: T('hudShield'), color: 'text-primary', bg: 'bg-primary/10' },
              { icon: <Trophy className="w-5 h-5" />, value: String(prog.reputation), label: T('reputation'), color: 'text-accent', bg: 'bg-accent/10' },
              { icon: <Target className="w-5 h-5" />, value: `${prog.resolved_steps}/${totalSteps}`, label: T('profileMissionsTab'), color: 'text-info', bg: 'bg-info/10' },
              { icon: <Clock className="w-5 h-5" />, value: String(totalAttempts), label: T('profileAttempts'), color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((s, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4">
                <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-2`}>{s.icon}</div>
                <div className="text-xl font-bold text-text">{s.value}</div>
                <div className="text-xs text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-1 bg-bg-secondary rounded-xl p-1">
            {[
              { id: 'overview' as const, label: T('profileOverview'), icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'badges' as const, label: `${T('profileBadges')} (${unlockedBadges}/${badges.length})`, icon: <Medal className="w-4 h-4" /> },
              { id: 'missions' as const, label: T('profileMissionsTab'), icon: <TrendingUp className="w-4 h-4" /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-warning" />
                    <h3 className="text-sm font-bold text-text">{T('profileFirstTry')}</h3>
                  </div>
                  <p className="text-2xl font-bold text-text">{firstTryCount}</p>
                  <p className="text-xs text-text-muted mt-1">{T('profileFirstTryDesc')}</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    <h3 className="text-sm font-bold text-text">{T('mistakes')}</h3>
                  </div>
                  <p className="text-2xl font-bold text-text">{totalMistakes}</p>
                  <p className="text-xs text-text-muted mt-1">{T('profileTotalMistakesDesc')}</p>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-text flex items-center gap-2"><Medal className="w-4 h-4 text-accent" />{T('profileRecentBadges')}</h3>
                  <button onClick={() => setActiveTab('badges')} className="text-xs text-text-secondary hover:text-text flex items-center gap-1">{T('profileAll')} <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {badges.filter(b => b.unlocked).slice(-6).map(b => (
                    <div key={b.id} className="p-3 rounded-lg border border-border bg-bg-secondary text-center" title={b.desc}>
                      <div style={{ color: b.color }}>{b.icon}</div>
                      <p className="text-[10px] font-medium text-text mt-1 truncate">{b.name}</p>
                    </div>
                  ))}
                  {badges.filter(b => b.unlocked).length === 0 && (
                    <p className="col-span-full text-xs text-text-muted text-center py-4">{T('profileNoBadges')}</p>
                  )}
                </div>
              </div>

              <AIGenerator />

              {cert?.available && <CertificateCard cert={cert} T={T} />}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map(b => (
                <div key={b.id} className={`p-4 rounded-xl border transition-all ${b.unlocked ? 'border-border bg-surface' : 'border-border/20 opacity-40'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: b.unlocked ? `${b.color}15` : 'transparent', color: b.unlocked ? b.color : '#9ca3af' }}>
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{b.name}</p>
                      <p className="text-[10px] text-text-muted capitalize">{b.rarity}</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">{b.desc}</p>
                  {b.unlocked && <CheckCircle className="w-4 h-4 text-success mt-2 ml-auto" />}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="space-y-3">
              {missions.map((m: Mission) => {
                const done = m.steps.filter(s => ssFor(ss, s.id).resolved).length;
                const total = m.steps.length;
                const pct = total ? Math.round(done / total * 100) : 0;
                const firstTry = m.steps.filter(s => ssFor(ss, s.id).first_try_success).length;
                return (
                  <div key={m.id} className="bg-surface border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-text">{m.title}</h3>
                        <p className="text-xs text-text-secondary">{m.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-text">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span>{done}/{total} {T('profileCompleted')}</span>
                      <span>{firstTry} {T('profileFirstTryCount')}</span>
                      <span>{m.steps.length} {T('profileSteps')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAvatarModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAvatarModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text">{T('profileChangeAvatar')}</h3>
                <button onClick={() => setShowAvatarModal(false)} className="p-1 rounded-full hover:bg-bg-secondary"><X className="w-5 h-5 text-text-muted" /></button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border bg-bg-secondary flex items-center justify-center">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={() => setAvatarUrl(null)} /> : <User className="w-12 h-12 text-text-muted" />}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {uploading ? T('aiGenerating') : <><Upload className="w-4 h-4" />{T('profileUploadPhoto')}</>}
                </button>
                <p className="text-xs text-text-muted">{T('profilePhotoFormatHint')}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function CertificateCard({ cert, T }: { cert: any; T: (key: string) => string }) {
  const [showQR, setShowQR] = useState(false);
  const certUrl = `https://zeroday.center-invest.ru/cert/${cert.certificate_id}`;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-text flex items-center gap-2"><AwardIcon className="w-5 h-5 text-accent" />{T('certificate')}</h3>
        <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-bg-secondary text-text-secondary hover:bg-surface-active transition-colors text-xs">
          <QrCode className="w-3.5 h-3.5" />{showQR ? T('profileHide') : T('profileQr')}
        </button>
      </div>
      {showQR && (
        <div className="flex flex-col items-center gap-3 p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="bg-white p-3 rounded-lg"><QRCodeSVG value={certUrl} size={140} level="H" /></div>
          <p className="text-xs text-text-muted text-center">{cert.message}</p>
          <p className="text-[10px] font-mono text-text-secondary">ID: {cert.certificate_id}</p>
        </div>
      )}
    </div>
  );
}
