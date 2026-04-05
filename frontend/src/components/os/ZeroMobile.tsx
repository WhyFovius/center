import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Globe, MessageSquare, FolderOpen, Terminal, Shield, Settings, Home, Wifi, Signal, LogOut, ArrowLeft } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import MailApp from './MailApp';
import BrowserApp from './BrowserApp';
import XamMessenger from './XamMessenger';
import FileManager from './FileManager';
import TerminalApp from './TerminalApp';
import SecurityCenter from './SecurityCenter';
import SettingsApp from './SettingsApp';
import OSTutorial from './OSTutorial';
import { NotificationProvider } from './Notifications';

const MOBILE_APPS = [
  { id: 'mail', label: 'osMail', icon: Mail, color: '#ef4444' },
  { id: 'browser', label: 'osBrowser', icon: Globe, color: '#007AFF' },
  { id: 'messenger', label: 'osMessenger', icon: MessageSquare, color: '#5856D6' },
  { id: 'files', label: 'osFiles', icon: FolderOpen, color: '#FF9500' },
  { id: 'terminal', label: 'osTerminal', icon: Terminal, color: '#34C759' },
  { id: 'security', label: 'osSecurity', icon: Shield, color: '#FF2D55' },
  { id: 'settings', label: 'osSettings', icon: Settings, color: '#8E8E93' },
];

const APP_COMPONENTS: Record<string, React.FC> = {
  mail: MailApp,
  browser: BrowserApp,
  messenger: XamMessenger,
  files: FileManager,
  terminal: TerminalApp,
  security: SecurityCenter,
  settings: SettingsApp,
};

export default function ZeroMobile() {
  const theme = useGS(s => s.theme);
  const setScreen = useGS(s => s.setScreen);
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const isDark = theme === 'dark' || theme === 'bw';
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('zd_os_tutorial_seen'));
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleOpenApp = useCallback((id: string) => {
    setOpenApp(id);
  }, []);

  const handleBack = useCallback(() => {
    if (openApp) {
      setOpenApp(null);
    } else {
      setScreen('menu');
    }
  }, [openApp, setScreen]);

  const handleHome = useCallback(() => {
    setOpenApp(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!openApp) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (deltaY > 80 && touchStartY.current > window.innerHeight * 0.7) {
      setOpenApp(null);
    }
  }, [openApp]);

  const handleBackToMenu = useCallback(() => {
    setScreen('menu');
  }, [setScreen]);

  const AppIcon = ({ app }: { app: typeof MOBILE_APPS[0] }) => {
    const Icon = app.icon;
    return (
      <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleOpenApp(app.id)}
        className="flex flex-col items-center gap-1.5"
      >
        <div className="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center shadow-lg" style={{ backgroundColor: app.color }}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className="text-[11px] drop-shadow-md font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }}>{T(app.label)}</span>
      </motion.button>
    );
  };

  const ActiveApp = openApp ? APP_COMPONENTS[openApp] : null;
  const timeStr = time.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : lang === 'kz' ? 'kk-KZ' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'kz' ? 'kk-KZ' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <NotificationProvider>
      <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Tutorial */}
        <AnimatePresence>
          {showTutorial && (
            <OSTutorial onComplete={() => { localStorage.setItem('zd_os_tutorial_seen', '1'); setShowTutorial(false); }} />
          )}
        </AnimatePresence>

        {/* iPhone Frame */}
        <div className="absolute inset-0 flex flex-col">
          {/* iOS Status Bar — no Dynamic Island */}
          <div className="relative z-50 flex items-center justify-between px-6 py-1 text-[11px] font-semibold text-white"
            style={{ height: '44px' }}
          >
            <span>{timeStr}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center">
                <div className="w-[22px] h-[10px] rounded-sm border border-white/50 flex items-center p-[1px]">
                  <div className="w-[70%] h-full rounded-[1px]" style={{ backgroundColor: '#34C759' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Lock Screen / Home Screen */}
          <AnimatePresence>
            {!openApp && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
                style={{ background: isDark
                  ? 'linear-gradient(180deg, #0d1117 0%, #161b22 40%, #1c2128 100%)'
                  : 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)'
                }}
              >
                {/* Time & Date */}
                <div className="text-center pt-12 pb-8">
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[72px] font-extralight tabular-nums tracking-tight leading-none"
                    style={{ color: 'rgba(255,255,255,0.9)' }}
                  >
                    {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}
                  </motion.p>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-base mt-3 font-medium"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {dateStr}
                  </motion.p>
                </div>

                {/* Цент Инвест Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#2d8b4d' }}>
                    ЦИ
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Центр Инвест</span>
                </div>

                {/* App Grid — 4 columns, iOS style */}
                <div className="flex-1 px-8">
                  <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {MOBILE_APPS.map(app => (
                      <AppIcon key={app.id} app={app} />
                    ))}
                  </div>
                </div>

                {/* Page Dots */}
                <div className="flex items-center justify-center gap-1.5 pb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                </div>

                {/* Home Indicator — iOS style white bar + back to menu */}
                <div className="flex flex-col items-center justify-center pb-3">
                  <button onClick={handleBackToMenu}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-1.5 transition-colors hover:bg-white/10"
                  >
                    <LogOut className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{T('osBack')}</span>
                  </button>
                  <div className="w-[134px] h-[5px] rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active App — iOS style slide in with swipe up to close */}
          <AnimatePresence>
            {openApp && ActiveApp && (
              <motion.div key="app" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 250 }}
                className="absolute inset-0 z-40" style={{ top: 0 }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* iOS Navigation Bar with blur */}
                <div className="flex items-center justify-between px-4 py-3 border-b"
                  style={{
                    backgroundColor: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(248,248,252,0.95)',
                    borderColor: isDark ? 'rgba(56,56,58,0.6)' : 'rgba(198,198,200,0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Back button */}
                  <button onClick={handleBack} className="flex items-center gap-0.5 text-[17px]" style={{ color: '#007AFF' }}>
                    <ArrowLeft className="w-5 h-5" />
                    <span>{T('osHome')}</span>
                  </button>
                  <span className="text-[17px] font-semibold" style={{ color: isDark ? 'var(--color-text)' : 'var(--color-text)' }}>
                    {T(MOBILE_APPS.find(a => a.id === openApp)?.label || '')}
                  </span>
                  {/* Home button */}
                  <button onClick={handleHome} className="p-1">
                    <Home className="w-5 h-5" style={{ color: '#007AFF' }} />
                  </button>
                </div>

                {/* App Content */}
                <div className="absolute inset-0" style={{ top: '56px' }}>
                  <ActiveApp />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </NotificationProvider>
  );
}
