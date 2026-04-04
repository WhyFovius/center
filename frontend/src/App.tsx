import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { api } from '@/lib/api';
import AuthForm from '@/components/layout/AuthForm';

const MainMenu = lazy(() => import('@/components/layout/MainMenu'));
const Lobby = lazy(() => import('@/components/layout/Lobby'));
const GameCanvas = lazy(async () => {
  const mod = await import('@/scenes/GameCanvas');
  return { default: mod.GameCanvas };
});
const DesktopOS = lazy(async () => {
  const mod = await import('@/components/os/DesktopOS');
  return { default: mod.default };
});
const ZeroMobile = lazy(async () => {
  const mod = await import('@/components/os/ZeroMobile');
  return { default: mod.default };
});
const ProfileView = lazy(async () => {
  const mod = await import('@/scenes/ProfileView');
  return { default: mod.ProfileView };
});
const LeaderboardView = lazy(() => import('@/scenes/LeaderboardView'));
const CorporateDashboard = lazy(async () => {
  const mod = await import('@/scenes/CorporateDashboard');
  return { default: mod.default };
});

export default function App() {
  const authed = useGS(s => s.authed);
  const loading = useGS(s => s.loading);
  const error = useGS(s => s.error);
  const screen = useGS(s => s.screen);
  const theme = useGS(s => s.theme);
  const setTheme = useGS(s => s.setTheme);
  const load = useGS(s => s.load);
  const setAuthed = useGS(s => s.setAuthed);
  const logout = useGS(s => s.logout);

  useEffect(() => {
    const t = api.getToken();
    if (t) { setAuthed(true); load().catch(() => logout()); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('zd_theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      setTheme(saved as 'light' | 'dark' | 'bw');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
          <motion.div key="menu" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="h-full"><ScreenLoader><MainMenu /></ScreenLoader></motion.div>
        ) : screen === 'lobby' ? (
          <motion.div key="lobby" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="h-full"><ScreenLoader><Lobby /></ScreenLoader></motion.div>
        ) : screen === 'game' ? (
          <motion.div key="game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="h-full"><ScreenLoader><GameCanvas /></ScreenLoader></motion.div>
        ) : screen === 'os' ? (
          <motion.div key="os" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full"><ScreenLoader><DesktopOS /></ScreenLoader></motion.div>
        ) : screen === 'mobile' ? (
          <motion.div key="mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full"><ScreenLoader><ZeroMobile /></ScreenLoader></motion.div>
        ) : screen === 'profile' ? (
          <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="h-full"><ScreenLoader><ProfileView /></ScreenLoader></motion.div>
        ) : screen === 'leaderboard' ? (
          <motion.div key="lb" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="h-full"><ScreenLoader><LeaderboardView /></ScreenLoader></motion.div>
        ) : screen === 'corporate' ? (
          <motion.div key="corporate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="h-full"><ScreenLoader><CorporateDashboard /></ScreenLoader></motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
function ScreenLoader({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
