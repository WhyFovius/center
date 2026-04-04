import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, Trophy, User } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { api } from '@/lib/api';
import AuthForm from '@/components/layout/AuthForm';
import MainMenu from '@/components/layout/MainMenu';
import Lobby from '@/components/layout/Lobby';
import { GameCanvas } from '@/scenes/GameCanvas';
import { ProfileView } from '@/scenes/ProfileView';

export default function App() {
  const authed = useGS(s => s.authed);
  const loading = useGS(s => s.loading);
  const error = useGS(s => s.error);
  const screen = useGS(s => s.screen);
  const load = useGS(s => s.load);
  const setAuthed = useGS(s => s.setAuthed);
  const logout = useGS(s => s.logout);

  useEffect(() => {
    const t = api.getToken();
    if (t) { setAuthed(true); load().catch(() => logout()); }
  }, []);

  if (!authed) return <AuthForm />;

  return (
    <div className="w-screen h-screen overflow-hidden bg-bg flex flex-col">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full">
            <div className="text-center"><Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" /><p className="text-sm text-text-muted">Загрузка...</p></div>
          </motion.div>
        ) : error ? (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full">
            <div className="text-center"><AlertTriangle className="w-10 h-10 text-danger mx-auto mb-4" /><p className="text-sm text-danger mb-4">{error}</p>
              <button onClick={() => load().catch(() => logout())} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg text-sm">Повторить</button></div>
          </motion.div>
        ) : screen === 'menu' ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><MainMenu /></motion.div>
        ) : screen === 'lobby' ? (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><Lobby /></motion.div>
        ) : screen === 'game' ? (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><GameCanvas /></motion.div>
        ) : screen === 'profile' ? (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><ProfileView /></motion.div>
        ) : screen === 'leaderboard' ? (
          <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><LeaderboardView /></motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LeaderboardView() {
  const setScreen = useGS(s => s.setScreen);
  const [entries, setEntries] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    api.lb.get().then(r => { setEntries(r.entries || []); setLbLoading(false); }).catch(() => setLbLoading(false));
  }, []);

  const leagueColors: Record<string, string> = { 'Новичок': '#9ca3af', 'Аналитик': '#60a5fa', 'Охотник за угрозами': '#a78bfa', 'Эксперт': '#fbbf24' };

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-surface">
        <button onClick={() => setScreen('menu')} className="text-sm text-text-secondary hover:text-text transition-colors">← Назад</button>
        <h1 className="text-base font-bold text-text flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" />Лидерборд</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {lbLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 text-text-muted">Нет данных</div>
          ) : (
            <div className="space-y-2">
              {entries.map((e: any) => (
                <div key={e.user_id} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
                  <span className="text-lg font-bold text-text-muted w-8 text-center">#{e.rank}</span>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text">{e.full_name || e.username}</p>
                    <p className="text-xs text-text-muted">@{e.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text">{e.reputation} реп.</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: (leagueColors[e.league || 'Новичок'] || '#9ca3af') + '20',
                      color: leagueColors[e.league || 'Новичок'] || '#9ca3af'
                    }}>{e.league || 'Новичок'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
