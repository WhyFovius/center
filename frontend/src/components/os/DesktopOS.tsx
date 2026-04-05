import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Wifi, Battery, Volume2, VolumeX, Shield, X, Minimize2,
  Mail, Globe, MessageSquare, FolderOpen, Terminal, ChevronUp, Settings, Zap, Phone,
  Trophy, Calendar as CalendarIcon
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
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
import CertificateGenerator from './CertificateGenerator';
import { ToggleTheme } from '@/components/ui/toggle-theme';

interface OpenWindow {
  id: string;
  appId: string;
  title: string;
  icon: React.ReactNode;
  minimized: boolean;
  zIndex: number;
}

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'qwen/qwen3.6-plus:free';

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
    if (resp.status === 401) {
      return 'AI временно недоступен. Обновите API ключ в настройках.';
    }
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
  const lang = useGS(s => s.lang);
  const prevStatus = useGS(s => s.fb?.consequence?.status);
  const T = (key: string) => t(lang, key);

  const APPS = [
    { id: 'mail', label: T('osMail'), icon: <Mail className="w-4 h-4" /> },
    { id: 'browser', label: T('osBrowser'), icon: <Globe className="w-4 h-4" /> },
    { id: 'messenger', label: T('osMessenger'), icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'files', label: T('osFiles'), icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'terminal', label: T('osTerminal'), icon: <Terminal className="w-4 h-4" /> },
    { id: 'security', label: T('osSecurity'), icon: <Shield className="w-4 h-4" /> },
  ];

  const DESKTOP_ONLY_APPS = [
    { id: 'settings', label: T('osSettings'), icon: <Settings className="w-4 h-4" /> },
  ];

  const energy = useGS(s => s.energy);
  const shield = useGS(s => s.shield);
  const getTaskProgress = useGS(s => s.getTaskProgress);
  const areAllTasksComplete = useGS(s => s.areAllTasksComplete);
  const osTasks = useGS(s => s.osTasks);
  const taskProgress = getTaskProgress();
  const allTasksComplete = areAllTasksComplete();
  const completedCount = Object.values(osTasks).filter(Boolean).length;
  const totalCount = Object.keys(osTasks).length;

  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [nextZ, setNextZ] = useState(10);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [showTray, setShowTray] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showWifiPopup, setShowWifiPopup] = useState(false);
  const [showBatteryPopup, setShowBatteryPopup] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showShieldPopup, setShowShieldPopup] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
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

    const app = APPS.find(a => a.id === appId) || DESKTOP_ONLY_APPS.find(a => a.id === appId);
    if (!app) return;

    const titles: Record<string, string> = {
      mail: `${T('osMail')} — ZeroOS`,
      browser: 'ZeroBrowser',
      messenger: `${T('osMessenger')} Мессенджер`,
      files: T('osFiles'),
      terminal: T('osTerminal'),
      security: T('osSecurity'),
      settings: T('osSettings'),
    };

    const id = `w-${Date.now()}`;
    setOpenWindows(prev => [...prev, { id, appId, title: titles[appId] || app.label, icon: app.icon, minimized: false, zIndex: nextZ }]);
    setActiveWindow(id);
    setNextZ(z => z + 1);
    setStartMenuOpen(false);
  }, [openWindows, nextZ, T, APPS]);

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

        {/* Certificate Generator */}
        <AnimatePresence>
          {showCertModal && (
            <CertificateGenerator onClose={() => setShowCertModal(false)} />
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
            {/* Desktop-only apps */}
            {DESKTOP_ONLY_APPS.map(app => (
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

          {/* Центр Инвест Logo — bottom right */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-60">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#2d8b4d' }}>
              ЦИ
            </div>
            <span className="text-[10px] text-white/70 font-medium">Центр Инвест</span>
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
            {T('osAttackDetected')}
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
                <span>{T('osEmulation')}</span>
              </button>
              <button onClick={() => { setActiveSimulator('wifi'); setStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm text-yellow-400"
              >
                <span className="text-text-secondary"><Wifi className="w-4 h-4" /></span>
                <span>{T('osWifiSim')}</span>
              </button>
              <button onClick={() => { setActiveSimulator('deepfake'); setStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm text-purple-400"
              >
                <span className="text-text-secondary"><Phone className="w-4 h-4" /></span>
                <span>{T('osDeepfakeSim')}</span>
              </button>
              <button onClick={() => { setScreen('corporate'); setStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface-active transition-colors text-sm text-blue-400"
              >
                <span className="text-text-secondary"><Monitor className="w-4 h-4" /></span>
                <span>{T('osCorporate')}</span>
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-border flex justify-between">
              <button onClick={handleGoMenu}
                className="text-xs text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-active transition-colors"
              >
                {T('osHome')}
              </button>
              <button onClick={() => {
                setScreen('profile');
                setStartMenuOpen(false);
              }}
                className="text-xs text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-active transition-colors"
              >
                {T('osProfile')}
              </button>
              <button onClick={() => {
                setScreen('menu');
                setStartMenuOpen(false);
              }}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
              >
                Завершить сеанс
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
              <span className="text-xs font-semibold hidden sm:inline">{T('osStart')}</span>
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
              <button onClick={() => { setShowTray(!showTray); setShowTaskPanel(false); }} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-surface-active transition-colors">
                <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
              </button>
              <div className="flex items-center gap-2 px-2 py-1">
                <button onClick={() => { setShowShieldPopup(!showShieldPopup); setShowTaskPanel(false); setShowWifiPopup(false); setShowBatteryPopup(false); setShowVolumePopup(false); setShowCalendar(false); }} className="hover:bg-surface-active p-1 rounded transition-colors">
                  <Shield className="w-4 h-4 text-ci-green" />
                </button>
                <button onClick={() => { setShowWifiPopup(!showWifiPopup); setShowTaskPanel(false); setShowShieldPopup(false); setShowBatteryPopup(false); setShowVolumePopup(false); setShowCalendar(false); }} className="hover:bg-surface-active p-1 rounded transition-colors">
                  <Wifi className="w-4 h-4 text-text-secondary" />
                </button>
                <button onClick={() => { setShowVolumePopup(!showVolumePopup); setShowTaskPanel(false); setShowWifiPopup(false); setShowShieldPopup(false); setShowBatteryPopup(false); setShowCalendar(false); }} className="hover:bg-surface-active p-1 rounded transition-colors">
                  {muted ? <VolumeX className="w-4 h-4 text-text-muted" /> : <Volume2 className="w-4 h-4 text-text-secondary" />}
                </button>
                <button onClick={() => { setShowBatteryPopup(!showBatteryPopup); setShowTaskPanel(false); setShowWifiPopup(false); setShowShieldPopup(false); setShowVolumePopup(false); setShowCalendar(false); }} className="hover:bg-surface-active p-1 rounded transition-colors">
                  <Battery className="w-4 h-4 text-text-secondary" />
                </button>
                {/* Task progress button */}
                <button onClick={() => { setShowTaskPanel(!showTaskPanel); setShowTray(false); setShowWifiPopup(false); setShowShieldPopup(false); setShowBatteryPopup(false); setShowVolumePopup(false); setShowCalendar(false); }} className="hover:bg-surface-active p-1 rounded transition-colors relative">
                  <Trophy className={`w-4 h-4 ${allTasksComplete ? 'text-yellow-400' : 'text-text-secondary'}`} />
                  {allTasksComplete && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </button>
              </div>

              {/* WiFi Popup */}
              {showWifiPopup && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full right-8 mb-2 w-56 bg-surface border border-border rounded-lg shadow-xl p-3 z-50"
                >
                  <p className="text-xs font-semibold mb-2">{T('osWifiInfo')}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-text-secondary">SSID:</span><span>ZeroOS_Network</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Status:</span><span className="text-green-500">Connected</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Security:</span><span>WPA3</span></div>
                  </div>
                </motion.div>
              )}

              {/* Battery Popup */}
              {showBatteryPopup && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full right-8 mb-2 w-56 bg-surface border border-border rounded-lg shadow-xl p-3 z-50"
                >
                  <p className="text-xs font-semibold mb-2">{T('osBatteryInfo')}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-text-secondary">Level:</span><span className="text-green-500">87%</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Status:</span><span>Discharging</span></div>
                    <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: '87%' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Volume Popup */}
              {showVolumePopup && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full right-8 mb-2 w-56 bg-surface border border-border rounded-lg shadow-xl p-3 z-50"
                >
                  <p className="text-xs font-semibold mb-2">{T('osVolumeInfo')}</p>
                  <button onClick={toggleMute} className="w-full py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-2" style={{ backgroundColor: muted ? '#ef4444' : '#3fb950' }}>
                    {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {muted ? T('osSettingsUnmuted') : T('osSettingsMuted')}
                  </button>
                </motion.div>
              )}

              {/* Shield Popup */}
              {showShieldPopup && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full right-8 mb-2 w-56 bg-surface border border-border rounded-lg shadow-xl p-3 z-50"
                >
                  <p className="text-xs font-semibold mb-2">{T('osShieldInfo')}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-text-secondary">Level:</span><span className="text-green-500">{shield}%</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Status:</span><span className="text-green-500">Active</span></div>
                    <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${shield}%` }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Task Panel Popup */}
              {showTaskPanel && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full right-0 mb-2 w-72 bg-surface border border-border rounded-lg shadow-xl p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <p className="text-sm font-bold">{T('osTaskProgress')}</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: allTasksComplete ? '#22c55e' : 'var(--color-text-secondary)' }}>
                      {completedCount}/{totalCount} {T('osTasksCompleted')}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 rounded-full mb-3 overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${taskProgress}%`, backgroundColor: allTasksComplete ? '#22c55e' : '#3fb950' }} />
                  </div>

                  {/* Tasks list */}
                  <div className="space-y-1 max-h-48 overflow-y-auto mb-3">
                    {[
                      { id: 'mail_phishing', label: T('osTaskMail') },
                      { id: 'mail_payroll', label: T('osTaskMailPayroll') },
                      { id: 'mail_ceo_fraud', label: T('osTaskMailCeo') },
                      { id: 'browser_fake_site', label: T('osTaskBrowserFake') },
                      { id: 'browser_safe', label: T('osTaskBrowserSafe') },
                      { id: 'messenger_password', label: T('osTaskMessengerPassword') },
                      { id: 'messenger_transfer', label: T('osTaskMessengerTransfer') },
                      { id: 'messenger_link', label: T('osTaskMessengerLink') },
                      { id: 'terminal_scan', label: T('osTaskTerminalScan') },
                      { id: 'terminal_protect', label: T('osTaskTerminalProtect') },
                      { id: 'security_scan', label: T('osTaskSecurityScan') },
                      { id: 'security_defense', label: T('osTaskSecurityDefense') },
                      { id: 'wifi_vpn', label: T('osTaskWifi') },
                      { id: 'wifi_risky', label: T('osTaskWifiRisky') },
                      { id: 'deepfake_transfer', label: T('osTaskDeepfakeTransfer') },
                      { id: 'deepfake_callback', label: T('osTaskDeepfake') },
                      { id: 'settings_theme', label: T('osTaskTheme') },
                      { id: 'settings_lang', label: T('osTaskLang') },
                      { id: 'attack_emulator', label: T('osTaskAttack') },
                    ].map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${osTasks[task.id] ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                          {osTasks[task.id] ? (
                            <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                          )}
                        </div>
                        <span style={{ color: osTasks[task.id] ? 'var(--color-text)' : 'var(--color-text-muted)', textDecoration: osTasks[task.id] ? 'none' : 'none' }}>{task.label}</span>
                      </div>
                    ))}
                  </div>

                  {allTasksComplete ? (
                    <button onClick={() => { setShowCertModal(true); setShowTaskPanel(false); }}
                      className="w-full py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                      style={{ backgroundColor: '#3fb950' }}
                    >
                      <Trophy className="w-3.5 h-3.5" /> {T('osCertificate')}
                    </button>
                  ) : (
                    <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                      {T('osAllTasksPartial')?.replace('{completed}', String(completedCount)).replace('{total}', String(totalCount)) || `Выполнено ${completedCount} из ${totalCount}`}
                    </p>
                  )}
                </motion.div>
              )}

              {showTray && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full right-0 mb-2 w-64 bg-surface border border-border rounded-lg shadow-xl p-3 z-50"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">{T('osSettingsSystem')}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">{T('hudEnergy')}</span>
                      <span className="text-ci-green">{energy}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">{T('hudShield')}</span>
                      <span className="text-ci-green">{shield}%</span>
                    </div>
                    <button onClick={toggleMute} className="w-full text-xs text-text-secondary hover:text-text px-2 py-1 rounded hover:bg-surface-active transition-colors flex items-center gap-1.5">
                      {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      {muted ? T('osSettingsUnmuted') : T('osSettingsMuted')}
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
            <button onClick={() => { setShowCalendar(!showCalendar); setShowTaskPanel(false); setShowWifiPopup(false); setShowShieldPopup(false); setShowBatteryPopup(false); setShowVolumePopup(false); }} className="px-2 py-1 border-l border-border ml-0.5 flex flex-col items-end leading-tight hover:bg-surface-active rounded transition-colors">
              <span className="text-sm font-medium">{timeStr}</span>
              <span className="text-[10px] text-text-muted">{dateStr}</span>
            </button>
          </motion.div>
        </div>

        {/* Calendar Popup */}
        {showCalendar && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-12 right-2 w-64 bg-surface border border-border rounded-lg shadow-xl p-4 z-50"
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <p className="text-xs font-semibold">{time.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-center py-4">
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{time.getDate()}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{time.toLocaleDateString('ru-RU', { weekday: 'long' })}</p>
            </div>
          </motion.div>
        )}
      </div>
    </NotificationProvider>
  );
}
