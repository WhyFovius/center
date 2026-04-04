import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Wifi, Battery, Volume2, VolumeX, Shield, X, Minimize2,
  Mail, Globe, MessageSquare, FolderOpen, Terminal, ChevronUp, Settings, Zap, Phone
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import OSWindow from './OSWindow';
import MailApp from './MailApp';
import BrowserApp from './BrowserApp';
import XamMessenger from './XamMessenger';
import FileManager from './FileManager';
import TerminalApp from './TerminalApp';
import SecurityCenter from './SecurityCenter';
import SettingsApp from './SettingsApp';
import AttackEmulator from './AttackEmulator';
import WifiSimulator from './WifiSimulator';
import DeepfakeSimulator from './DeepfakeSimulator';
import OSTutorial from './OSTutorial';
import Notifications, { NotificationProvider } from './Notifications';
import GlitchEffect from './GlitchEffect';
import { ToggleTheme } from '@/components/ui/toggle-theme';

interface OpenWindow {
  id: string;
  appId: string;
  title: string;
  icon: React.ReactNode;
  minimized: boolean;
  zIndex: number;
}

const APPS = [
  { id: 'mail', label: 'Почта', icon: <Mail className="w-4 h-4" /> },
  { id: 'browser', label: 'Браузер', icon: <Globe className="w-4 h-4" /> },
  { id: 'messenger', label: 'Xam', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'files', label: 'Файлы', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'terminal', label: 'Терминал', icon: <Terminal className="w-4 h-4" /> },
  { id: 'security', label: 'Безопасность', icon: <Shield className="w-4 h-4" /> },
  { id: 'settings', label: 'Настройки', icon: <Settings className="w-4 h-4" /> },
];

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'qwen/qwen3-coder-plus:free';

export async function askAI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!API_KEY) {
    return 'AI не настроен. Укажите VITE_OPENROUTER_API_KEY в .env файле.';
  }
  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ZeroOS',
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || 'Не удалось получить ответ.';
  } catch {
    return 'Ошибка подключения к AI.';
  }
}

export default function DesktopOS() {
  const setScreen = useGS(s => s.setScreen);
  const muted = useGS(s => s.muted);
  const toggleMute = useGS(s => s.toggleMute);
  const prevStatus = useGS(s => s.fb?.consequence?.status);

  const energy = useGS(s => s.energy);
  const shield = useGS(s => s.shield);
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [nextZ, setNextZ] = useState(10);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [showTray, setShowTray] = useState(false);
  const [showCompromised, setCompromised] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('zd_os_tutorial_seen'));
  const [showAttackEmulator, setShowAttackEmulator] = useState(false);
  const [activeSimulator, setActiveSimulator] = useState<'wifi' | 'deepfake' | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prevStatus === 'breach') {
      setShowGlitch(true);
      setCompromised(true);
      const t = setTimeout(() => setShowGlitch(false), 3000);
      return () => clearTimeout(t);
    }
  }, [prevStatus]);

  const handleOpenApp = useCallback((appId: string) => {
    const existing = openWindows.find(w => w.appId === appId);
    if (existing) {
      if (existing.minimized) {
        setOpenWindows(prev => prev.map(w => w.id === existing.id ? { ...w, minimized: false, zIndex: nextZ } : w));
        setActiveWindow(existing.id);
        setNextZ(z => z + 1);
      } else {
        setActiveWindow(existing.id);
        setOpenWindows(prev => prev.map(w => w.id === existing.id ? { ...w, zIndex: nextZ } : w));
        setNextZ(z => z + 1);
      }
      setStartMenuOpen(false);
      return;
    }

    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    const titles: Record<string, string> = {
      mail: 'Почта — ZeroOS',
      browser: 'ZeroBrowser',
      messenger: 'Xam Мессенджер',
      files: 'Файлы',
      terminal: 'Терминал',
      security: 'Центр безопасности',
      settings: 'Настройки',
    };

    const id = `w-${Date.now()}`;
    setOpenWindows(prev => [...prev, { id, appId, title: titles[appId] || app.label, icon: app.icon, minimized: false, zIndex: nextZ }]);
    setActiveWindow(id);
    setNextZ(z => z + 1);
    setStartMenuOpen(false);
  }, [openWindows, nextZ]);

  const handleClose = useCallback((id: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindow(prev => prev === id ? null : prev);
  }, []);

  const handleMinimize = useCallback((id: string) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
    setActiveWindow(prev => prev === id ? null : prev);
  }, []);

  const handleFocus = useCallback((id: string) => {
    setActiveWindow(id);
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZ } : w));
    setNextZ(z => z + 1);
  }, [nextZ]);

  const handleGoMenu = useCallback(() => {
    setOpenWindows([]);
    setActiveWindow(null);
    setScreen('menu');
  }, [setScreen]);

  const timeStr = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <NotificationProvider>
      <div className="relative w-full h-full overflow-hidden select-none">
        {/* Tutorial — shown only once */}
        <AnimatePresence>
          {showTutorial && (
            <OSTutorial onComplete={() => { localStorage.setItem('zd_os_tutorial_seen', '1'); setShowTutorial(false); }} />
          )}
        </AnimatePresence>

        {/* Attack Emulator */}
        <AnimatePresence>
          {showAttackEmulator && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[150]" onClick={() => setShowAttackEmulator(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="absolute inset-8 md:inset-16 rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
                onClick={e => e.stopPropagation()}
              >
                <AttackEmulator onClose={() => setShowAttackEmulator(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulators */}
        <AnimatePresence>
          {activeSimulator && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[150]" onClick={() => setActiveSimulator(null)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="absolute inset-8 md:inset-16 rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
                onClick={e => e.stopPropagation()}
              >
                {activeSimulator === 'wifi' && <WifiSimulator onComplete={() => setActiveSimulator(null)} />}
                {activeSimulator === 'deepfake' && <DeepfakeSimulator onComplete={() => setActiveSimulator(null)} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop background */}
        <div className="absolute inset-0" style={{ paddingBottom: '44px' }}
          onClick={() => { setStartMenuOpen(false); setShowTray(false); }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          {/* Desktop icons — single click to open */}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            {APPS.map(app => (
              <motion.button key={app.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenApp(app.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors w-20 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors shadow-lg">
                  {app.icon}
                </div>
                <span className="text-[10px] text-white/90 text-center leading-tight drop-shadow-lg">{app.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Windows */}
        <AnimatePresence>
          {openWindows.map(win => !win.minimized && (
            <OSWindow
              key={win.id} id={win.id} title={win.title} icon={win.icon}
              isActive={activeWindow === win.id} zIndex={win.zIndex}
              onClose={() => handleClose(win.id)}
              onMinimize={() => handleMinimize(win.id)}
              onFocus={() => handleFocus(win.id)}
            >
              {win.appId === 'mail' && <MailApp />}
              {win.appId === 'browser' && <BrowserApp />}
              {win.appId === 'messenger' && <XamMessenger />}
              {win.appId === 'files' && <FileManager />}
              {win.appId === 'terminal' && <TerminalApp />}
              {win.appId === 'security' && <SecurityCenter />}
              {win.appId === 'settings' && <SettingsApp />}
            </OSWindow>
          ))}
        </AnimatePresence>

        {/* Notifications */}
        <Notifications />
        <GlitchEffect active={showGlitch} onDone={() => setShowGlitch(false)} />

        {showCompromised && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-danger/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold"
          >
            <Shield className="w-4 h-4" />
            СИСТЕМА СКОМПРОМЕТИРОВАНА
            <button onClick={() => setCompromised(false)} className="ml-2 p-0.5 hover:bg-white/20 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Start menu */}
        {startMenuOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-12 left-2 w-72 bg-surface/98 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 p-3"
          >
            <div className="space-y-1">
              {APPS.map(item => (
                <button key={item.id} onClick={() => handleOpenApp(item.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm"
                >
                  <span className="text-text-secondary">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button onClick={() => { setShowAttackEmulator(true); setStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm text-red-400"
              >
                <span className="text-text-secondary"><Zap className="w-4 h-4" /></span>
                <span>Эмуляция атаки</span>
              </button>
              <button onClick={() => { setActiveSimulator('wifi'); setStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm text-yellow-400"
              >
                <span className="text-text-secondary"><Wifi className="w-4 h-4" /></span>
                <span>Wi-Fi симулятор</span>
              </button>
              <button onClick={() => { setActiveSimulator('deepfake'); setStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm text-purple-400"
              >
                <span className="text-text-secondary"><Phone className="w-4 h-4" /></span>
                <span>Дипфейк симулятор</span>
              </button>
              <button onClick={() => { setScreen('corporate'); setStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm text-blue-400"
              >
                <span className="text-text-secondary"><Monitor className="w-4 h-4" /></span>
                <span>Corporate Dashboard</span>
              </button>
              <button onClick={() => handleOpenApp('settings')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm"
              >
                <span className="text-text-secondary"><Settings className="w-4 h-4" /></span>
                <span>Настройки</span>
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-border flex justify-between">
              <button onClick={handleGoMenu}
                className="text-xs text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-active transition-colors"
              >
                Главное меню
              </button>
              <button onClick={() => {
                setScreen('profile');
                setStartMenuOpen(false);
              }}
                className="text-xs text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-active transition-colors"
              >
                Профиль
              </button>
            </div>
          </motion.div>
        )}

        {/* Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <motion.div initial={{ y: 40 }} animate={{ y: 0 }}
            className="h-10 bg-surface/95 backdrop-blur border-t border-border flex items-center px-1 gap-1 z-50 relative"
          >
            {/* Start button */}
            <button onClick={() => { setStartMenuOpen(!startMenuOpen); setShowTray(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-surface-active transition-colors group"
            >
              <Monitor className="w-4 h-4 text-ci-green group-hover:text-ci-green-light transition-colors" />
              <span className="text-xs font-semibold hidden sm:inline">Пуск</span>
            </button>

            <div className="w-px h-5 bg-border mx-0.5" />

            {/* Open windows */}
            <div className="flex-1 flex items-center gap-0.5 overflow-x-auto">
              {openWindows.map(win => (
                <div key={win.id}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded min-w-0 max-w-40 cursor-pointer transition-all group ${
                    win.minimized ? 'bg-bg-secondary opacity-60 hover:opacity-100'
                      : activeWindow === win.id ? 'bg-surface-active border-b-2 border-ci-green' : 'hover:bg-surface-active'
                  }`}
                  onClick={() => win.minimized ? handleOpenApp(win.appId) : (activeWindow === win.id ? handleMinimize(win.id) : handleFocus(win.id))}
                >
                  <span className="w-4 h-4 flex-shrink-0 text-text-secondary">{win.icon}</span>
                  <span className="text-xs truncate flex-1">{win.title}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); handleMinimize(win.id); }} className="p-0.5 hover:bg-bg-secondary rounded">
                      <Minimize2 className="w-3 h-3 text-text-muted" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleClose(win.id); }} className="p-0.5 hover:bg-danger/20 rounded">
                      <X className="w-3 h-3 text-danger" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-px h-5 bg-border mx-0.5" />

            {/* System tray */}
            <div className="relative flex items-center gap-1">
              <button onClick={() => setShowTray(!showTray)} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-surface-active transition-colors">
                <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
              </button>
              <div className="flex items-center gap-2 px-2 py-1">
                <Shield className="w-4 h-4 text-ci-green" />
                <Wifi className="w-4 h-4 text-text-secondary" />
                {muted ? <VolumeX className="w-4 h-4 text-text-muted" /> : <Volume2 className="w-4 h-4 text-text-secondary" />}
                <Battery className="w-4 h-4 text-text-secondary" />
              </div>

              {showTray && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full right-0 mb-2 w-64 bg-surface border border-border rounded-lg shadow-xl p-3"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Состояние системы</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">Энергия</span>
                      <span className="text-ci-green">{energy}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">Щит</span>
                      <span className="text-ci-green">{shield}%</span>
                    </div>
                    <button onClick={toggleMute} className="w-full text-xs text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-active transition-colors flex items-center gap-1.5">
                      {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      {muted ? 'Включить звук' : 'Выключить звук'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Theme toggle */}
            <div className="px-1 py-1 border-l border-border mx-0.5">
              <ToggleTheme />
            </div>

            {/* Clock */}
            <div className="px-2 py-1 border-l border-border ml-0.5 flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{timeStr}</span>
              <span className="text-[10px] text-text-muted">{dateStr}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </NotificationProvider>
  );
}
