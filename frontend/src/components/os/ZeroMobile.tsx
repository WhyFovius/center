import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Globe, MessageSquare, FolderOpen, Terminal, Shield, Settings, Home, Battery, Wifi, Signal, ChevronRight } from 'lucide-react';
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

  const AppIcon = ({ app }: { app: typeof MOBILE_APPS[0] }) => {
    const Icon = app.icon;
    return (
      <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleOpenApp(app.id)}
        className="flex flex-col items-center gap-1.5"
      >
        <div className="w-[56px] h-[56px] rounded-[14px] flex items-center justify-center shadow-lg" style={{ backgroundColor: app.color }}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className="text-[11px] text-white/90 drop-shadow-md font-medium">{T(app.label)}</span>
      </motion.button>
    );
  };

  const ActiveApp = openApp ? APP_COMPONENTS[openApp] : null;

  return (
    <NotificationProvider>
      <div className="relative w-full h-full overflow-hidden bg-black">
        {/* Tutorial */}
        <AnimatePresence>
          {showTutorial && (
            <OSTutorial onComplete={() => { localStorage.setItem('zd_os_tutorial_seen', '1'); setShowTutorial(false); }} />
          )}
        </AnimatePresence>

        {/* iPhone Frame */}
        <div className="absolute inset-0 flex flex-col">
          {/* Dynamic Island / Notch */}
          <div className="relative z-50 flex items-center justify-center py-2">
            <div className="w-[120px] h-[32px] bg-black rounded-full flex items-center justify-center">
              <div className="w-[80px] h-[26px] bg-[#1a1a1a] rounded-full" />
            </div>
          </div>

          {/* Lock Screen */}
          <AnimatePresence>
            {!openApp && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
                style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-1 text-[11px] font-semibold text-white/80">
                  <span>{time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => alert('Сигнал: Отлично')} className="hover:opacity-70 transition-opacity">
                      <Signal className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => alert('Wi-Fi: CoffeeShop_Free (подключено)')} className="hover:opacity-70 transition-opacity">
                      <Wifi className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => alert('Батарея: 87%')} className="hover:opacity-70 transition-opacity flex items-center">
                        <div className="w-[22px] h-[10px] rounded-sm border border-white/50 flex items-center p-[1px]">
                          <div className="w-[70%] h-full rounded-[1px]" style={{ backgroundColor: '#34C759' }} />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Time & Date */}
                <div className="text-center pt-12 pb-8">
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[72px] font-extralight text-white/90 tabular-nums tracking-tight leading-none">
                    {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}
                  </motion.p>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-base text-white/60 mt-3 font-medium"
                  >
                    {time.toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'kz' ? 'kk-KZ' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </motion.p>
                </div>

                {/* Цент Инвест Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#2d8b4d' }}>
                    ЦИ
                  </div>
                  <span className="text-[11px] text-white/50 font-medium">Центр Инвест</span>
                </div>

                {/* App Grid */}
                <div className="flex-1 px-8">
                  <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {MOBILE_APPS.map(app => (
                      <AppIcon key={app.id} app={app} />
                    ))}
                  </div>
                </div>

                {/* Page Dots */}
                <div className="flex items-center justify-center gap-1.5 pb-2">
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                </div>

                {/* Home Indicator */}
                <div className="flex justify-center pb-3">
                  <div className="w-[134px] h-[5px] rounded-full bg-white/40" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active App — iOS style slide in */}
          <AnimatePresence>
            {openApp && ActiveApp && (
              <motion.div key="app" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 250 }}
                className="absolute inset-0 z-40 bg-white" style={{ top: 0 }}
              >
                {/* iOS Navigation Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: isDark ? '#1c1c1e' : '#f8f8f8', borderColor: isDark ? '#38383a' : '#c6c6c8' }}>
                  <button onClick={handleBack} className="flex items-center gap-0.5 text-[17px]" style={{ color: '#007AFF' }}>
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    <span>{openApp === 'settings' ? T('osSettings') : T('osBack')}</span>
                  </button>
                  <span className="text-[17px] font-semibold" style={{ color: isDark ? '#fff' : '#000' }}>
                    {T(MOBILE_APPS.find(a => a.id === openApp)?.label || '')}
                  </span>
                  <button onClick={() => setOpenApp(null)} className="p-1">
                    <Home className="w-5 h-5" style={{ color: '#007AFF' }} />
                  </button>
                </div>

                {/* Status bar overlay */}
                <div className="flex items-center justify-between px-6 py-1 text-[11px] font-semibold" style={{ backgroundColor: isDark ? '#1c1c1e' : '#f8f8f8', color: isDark ? '#fff' : '#000' }}>
                  <span>{time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* App Content */}
                <div className="absolute inset-0" style={{ top: '92px' }}>
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
