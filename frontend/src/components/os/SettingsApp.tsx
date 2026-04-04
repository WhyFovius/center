import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Monitor, Globe, Volume2, VolumeX, Bell, BellOff,
  Shield, Info, Check, Moon, Sun, Palette, HardDrive, Cpu, MemoryStick
} from 'lucide-react';
import { useGS } from '@/store/useGS';

type SettingsTab = 'appearance' | 'language' | 'sound' | 'notifications' | 'system';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance', label: 'Внешний вид', icon: <Palette className="w-4 h-4" /> },
  { id: 'language', label: 'Язык', icon: <Globe className="w-4 h-4" /> },
  { id: 'sound', label: 'Звук', icon: <Volume2 className="w-4 h-4" /> },
  { id: 'notifications', label: 'Уведомления', icon: <Bell className="w-4 h-4" /> },
  { id: 'system', label: 'О системе', icon: <Info className="w-4 h-4" /> },
];

export default function SettingsApp() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const theme = useGS(s => s.theme);
  const setTheme = useGS(s => s.setTheme);
  const lang = useGS(s => s.lang);
  const setLang = useGS(s => s.setLang);
  const muted = useGS(s => s.muted);
  const setMuted = useGS(s => s.setMuted);
  const shield = useGS(s => s.shield);
  const energy = useGS(s => s.energy);

  return (
    <div className="h-full flex flex-col bg-[#0f0f14] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
        <Settings className="w-5 h-5 text-white/60" />
        <h1 className="text-sm font-bold">Настройки</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-white/5 bg-white/[0.02] overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'appearance' && (
          <AppearanceSettings theme={theme} setTheme={setTheme} />
        )}
        {activeTab === 'language' && (
          <LanguageSettings lang={lang} setLang={setLang} />
        )}
        {activeTab === 'sound' && (
          <SoundSettings muted={muted} setMuted={setMuted} />
        )}
        {activeTab === 'notifications' && (
          <NotificationSettings />
        )}
        {activeTab === 'system' && (
          <SystemSettings shield={shield} energy={energy} theme={theme} lang={lang} />
        )}
      </div>
    </div>
  );
}

function AppearanceSettings({ theme, setTheme }: { theme: string; setTheme: (t: 'light' | 'dark' | 'bw') => void }) {
  const themes = [
    { id: 'dark' as const, label: 'Тёмная', icon: <Moon className="w-5 h-5" />, preview: 'bg-gray-900' },
    { id: 'light' as const, label: 'Светлая', icon: <Sun className="w-5 h-5" />, preview: 'bg-gray-100' },
    { id: 'bw' as const, label: 'Ч/Б', icon: <Palette className="w-5 h-5" />, preview: 'bg-gradient-to-r from-black to-white' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-1">Тема оформления</h2>
        <p className="text-[10px] text-white/40 mb-3">Выберите цветовую схему интерфейса</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themes.map(t => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTheme(t.id)}
            className={`relative p-3 rounded-lg border-2 transition-colors ${
              theme === t.id ? 'border-ci-green bg-white/5' : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`w-full h-12 rounded-md mb-2 ${t.preview} border border-white/10`} />
            <div className="flex items-center justify-center gap-1.5">
              {t.icon}
              <span className="text-xs">{t.label}</span>
            </div>
            {theme === t.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-ci-green rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-black" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-[10px] text-white/50">
          Тема применяется ко всему интерфейсу ZeroOS, включая окна приложений и панели.
        </p>
      </div>
    </div>
  );
}

function LanguageSettings({ lang, setLang }: { lang: string; setLang: (l: 'ru' | 'kz' | 'en') => void }) {
  const languages = [
    { id: 'ru' as const, label: 'Русский', flag: '🇷🇺', native: 'Русский' },
    { id: 'kz' as const, label: 'Қазақша', flag: '🇰🇿', native: 'Қазақша' },
    { id: 'en' as const, label: 'English', flag: '🇬🇧', native: 'English' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-1">Язык интерфейса</h2>
        <p className="text-[10px] text-white/40 mb-3">Выбранный язык применяется ко всему интерфейсу</p>
      </div>

      <div className="space-y-2">
        {languages.map(l => (
          <motion.button
            key={l.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setLang(l.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
              lang === l.id ? 'border-ci-green bg-ci-green/5' : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{l.flag}</span>
              <div className="text-left">
                <p className="text-sm">{l.native}</p>
                <p className="text-[10px] text-white/40">{l.label}</p>
              </div>
            </div>
            {lang === l.id && (
              <div className="flex items-center gap-1 text-ci-green">
                <Check className="w-4 h-4" />
                <span className="text-xs">Активен</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SoundSettings({ muted, setMuted }: { muted: boolean; setMuted: (v: boolean) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-1">Звук</h2>
        <p className="text-[10px] text-white/40 mb-3">Управление звуковыми эффектами</p>
      </div>

      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {muted ? <VolumeX className="w-5 h-5 text-white/30" /> : <Volume2 className="w-5 h-5 text-ci-green" />}
            <div>
              <p className="text-sm">Звуковые эффекты</p>
              <p className="text-[10px] text-white/40">Уведомления и системные звуки</p>
            </div>
          </div>
          <button
            onClick={() => setMuted(!muted)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              muted ? 'bg-white/10' : 'bg-ci-green'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
              animate={{ left: muted ? 2 : 22 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Статус</span>
            <span className={muted ? 'text-white/30' : 'text-ci-green'}>
              {muted ? 'Выключен' : 'Включён'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
        <p className="text-[10px] text-blue-300">
          Звуковые эффекты включают уведомления об атаках, системные события и подтверждение действий.
        </p>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [attackAlerts, setAttackAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors ${
        value ? 'bg-ci-green' : 'bg-white/10'
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
        animate={{ left: value ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-1">Уведомления</h2>
        <p className="text-[10px] text-white/40 mb-3">Настройка оповещений системы</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            {enabled ? <Bell className="w-4 h-4 text-ci-green" /> : <BellOff className="w-4 h-4 text-white/30" />}
            <div>
              <p className="text-xs">Все уведомления</p>
              <p className="text-[10px] text-white/40">Главный переключатель</p>
            </div>
          </div>
          <Toggle value={enabled} onChange={() => setEnabled(!enabled)} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-xs">Оповещения об атаках</p>
              <p className="text-[10px] text-white/40">Критические уведомления</p>
            </div>
          </div>
          <Toggle value={attackAlerts} onChange={() => setAttackAlerts(!attackAlerts)} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs">Обновления системы</p>
              <p className="text-[10px] text-white/40">Информационные уведомления</p>
            </div>
          </div>
          <Toggle value={systemUpdates} onChange={() => setSystemUpdates(!systemUpdates)} />
        </div>
      </div>

      {!enabled && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
          <p className="text-[10px] text-yellow-300">
            ⚠ При отключении всех уведомлений вы можете пропустить важные оповещения об атаках.
          </p>
        </div>
      )}
    </div>
  );
}

function SystemSettings({ shield, energy, theme, lang }: { shield: number; energy: number; theme: string; lang: string }) {
  const systemInfo = [
    { label: 'Операционная система', value: 'ZeroOS 1.0.0', icon: <Monitor className="w-4 h-4" /> },
    { label: 'Ядро', value: 'ShieldOS 6.1.0', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Архитектура', value: 'x86_64', icon: <HardDrive className="w-4 h-4" /> },
    { label: 'Память', value: '16 GB DDR5', icon: <MemoryStick className="w-4 h-4" /> },
    { label: 'Тема', value: theme === 'dark' ? 'Тёмная' : theme === 'light' ? 'Светлая' : 'Ч/Б', icon: <Palette className="w-4 h-4" /> },
    { label: 'Язык', value: lang === 'ru' ? 'Русский' : lang === 'kz' ? 'Қазақша' : 'English', icon: <Globe className="w-4 h-4" /> },
    { label: 'Щит безопасности', value: `${shield}%`, icon: <Shield className="w-4 h-4" /> },
    { label: 'Энергия системы', value: `${energy}%`, icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-1">О системе</h2>
        <p className="text-[10px] text-white/40 mb-3">Информация о системе и конфигурации</p>
      </div>

      {/* Logo / Brand */}
      <div className="flex flex-col items-center py-4">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ci-green/20 to-ci-green/5 flex items-center justify-center border border-ci-green/30 mb-3"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Shield className="w-8 h-8 text-ci-green" />
        </motion.div>
        <p className="text-sm font-bold">ZeroOS</p>
        <p className="text-[10px] text-white/40">ShieldOS Security Platform</p>
        <p className="text-[10px] text-white/30 mt-0.5">Version 1.0.0 (Build 20260404)</p>
      </div>

      {/* System Info */}
      <div className="space-y-1">
        {systemInfo.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/5"
          >
            <div className="flex items-center gap-2">
              <span className="text-white/30">{item.icon}</span>
              <span className="text-xs text-white/60">{item.label}</span>
            </div>
            <span className="text-xs font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="text-center pt-2 border-t border-white/10">
        <p className="text-[10px] text-white/20">© 2026 ZeroDay • Центр Инвест</p>
        <p className="text-[10px] text-white/20 mt-0.5">Все права защищены</p>
      </div>
    </div>
  );
}
