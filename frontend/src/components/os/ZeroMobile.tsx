import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Globe, MessageSquare, FolderOpen, Terminal, Shield, Settings, ArrowLeft, Home, Battery, Wifi, Signal } from 'lucide-react';
import { useGS } from '@/store/useGS';
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
  { id: 'mail', label: 'Почта', icon: Mail, color: '#ef4444' },
  { id: 'browser', label: 'Браузер', icon: Globe, color: '#3b82f6' },
  { id: 'messenger', label: 'Xam', icon: MessageSquare, color: '#7c3aed' },
  { id: 'files', label: 'Файлы', icon: FolderOpen, color: '#f59e0b' },
  { id: 'terminal', label: 'Терминал', icon: Terminal, color: '#22c55e' },
  { id: 'security', label: 'Защита', icon: Shield, color: '#ec4899' },
  { id: 'settings', label: 'Настройки', icon: Settings, color: '#6b7280' },
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
  const isDark = theme === 'dark' || theme === 'bw';
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('zd_os_tutorial_seen'));
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleOpenApp = useCallback((id: string) => {
    setOpenApp(id);
  }, []);

  const handleBack = useCallback(() => {
    if (openApp) setOpenApp(null);
    else setScreen('menu');
  }, [openApp, setScreen]);

  const AppIcon = ({ app, size = 'normal' }: { app: typeof MOBILE_APPS[0]; size?: 'normal' | 'large' }) => {
    const Icon = app.icon;
    const w = size === 'large' ? 'w-14 h-14' : 'w-12 h-12';
    const iconW = size === 'large' ? 'w-7 h-7' : 'w-6 h-6';
    return (
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleOpenApp(app.id)}
        className="flex flex-col items-center gap-1.5"
      >
        <div className={`${w} rounded-2xl flex items-center justify-center shadow-lg`} style={{ backgroundColor: app.color }}>
          <Icon className={`${iconW} text-white`} />
        </div>
        <span className="text-[10px] text-white/80 drop-shadow-lg">{app.label}</span>
      </motion.button>
    );
  };

  const ActiveApp = openApp ? APP_COMPONENTS[openApp] : null;

  return (
    <NotificationProvider>
      <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        {/* Tutorial */}
        <AnimatePresence>
          {showTutorial && (
            <OSTutorial onComplete={() => { localStorage.setItem('zd_os_tutorial_seen', '1'); setShowTutorial(false); }} />
          )}
        </AnimatePresence>

        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-1.5 text-[10px] text-white/70" style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
          <span>{time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3 h-3" />
          </div>
        </div>

        {/* Home Screen */}
        <AnimatePresence>
          {!openApp && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex flex-col" style={{ paddingTop: '36px', paddingBottom: '80px' }}
            >
              {/* Time & Date */}
              <div className="text-center pt-8 pb-6">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-light text-white/90 tabular-nums">
                  {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-sm text-white/50 mt-1"
                >
                  {time.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </motion.p>
              </div>

              {/* App Grid */}
              <div className="flex-1 px-6">
                <div className="grid grid-cols-4 gap-y-5 gap-x-3">
                  {MOBILE_APPS.map(app => (
                    <AppIcon key={app.id} app={app} />
                  ))}
                </div>
              </div>

              {/* Bottom hint */}
              <div className="text-center pb-4">
                <button onClick={() => setScreen('menu')} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  ← Вернуться в меню
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active App */}
        <AnimatePresence>
          {openApp && ActiveApp && (
            <motion.div key="app" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-40" style={{ paddingTop: '36px' }}
            >
              {/* App Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b" style={{ backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderColor: isDark ? '#333' : '#e5e5e5' }}>
                <button onClick={handleBack} className="flex items-center gap-1 text-sm" style={{ color: isDark ? '#e0e0e0' : '#333' }}>
                  <ArrowLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-sm font-semibold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>
                  {MOBILE_APPS.find(a => a.id === openApp)?.label}
                </span>
                <button onClick={() => { setOpenApp(null); }} className="p-1.5 rounded-full hover:bg-black/10">
                  <Home className="w-4 h-4" style={{ color: isDark ? '#e0e0e0' : '#333' }} />
                </button>
              </div>

              {/* App Content */}
              <div className="absolute inset-0" style={{ top: '84px' }}>
                <ActiveApp />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationProvider>
  );
}
