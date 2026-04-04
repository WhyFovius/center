import { useGS } from '@/store/useGS';
import type { Theme, Lang } from '@/types';
import { Palette, Volume2, VolumeX, Globe, Shield, Info, Wifi, Battery, Cpu, HardDrive } from 'lucide-react';

export default function SettingsApp() {
  const theme = useGS(s => s.theme);
  const setTheme = useGS(s => s.setTheme);
  const lang = useGS(s => s.lang);
  const setLang = useGS(s => s.setLang);
  const muted = useGS(s => s.muted);
  const toggleMute = useGS(s => s.toggleMute);
  const isDark = theme === 'dark' || theme === 'bw';
  const prog = useGS(s => s.prog);

  return (
    <div className="h-full flex overflow-hidden" style={{ backgroundColor: isDark ? '#121212' : '#f8f9fa' }}>
      {/* Sidebar */}
      <div className="w-48 border-r flex flex-col" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="px-3 py-3 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
          <h2 className="text-sm font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Настройки</h2>
        </div>
        <div className="flex-1 py-2 space-y-0.5">
          {[
            { id: 'appearance', label: 'Оформление', icon: Palette },
            { id: 'language', label: 'Язык', icon: Globe },
            { id: 'sound', label: 'Звук', icon: muted ? VolumeX : Volume2 },
            { id: 'security', label: 'Безопасность', icon: Shield },
            { id: 'about', label: 'О системе', icon: Info },
          ].map(item => (
            <button key={item.id}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
              }`}
              style={{ color: isDark ? '#ccc' : '#333' }}
            >
              <item.icon className="w-3.5 h-3.5" />{item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Appearance */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Оформление</h3>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'light' as Theme, label: 'Светлая', bg: '#f8f6ee' },
              { value: 'dark' as Theme, label: 'Тёмная', bg: '#0d1117' },
              { value: 'bw' as Theme, label: 'Чёрно-белая', bg: '#0a0a0a' },
            ]).map(t => (
              <button key={t.value} onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === t.value ? 'border-green-500' : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}
              >
                <div className="w-12 h-12 rounded-lg shadow-inner" style={{ backgroundColor: t.bg }} />
                <span className="text-xs" style={{ color: isDark ? '#ccc' : '#333' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Язык</h3>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'ru' as Lang, label: 'Русский', flag: '🇷🇺' },
              { value: 'kz' as Lang, label: 'Қазақша', flag: '🇰🇿' },
              { value: 'en' as Lang, label: 'English', flag: '🇬🇧' },
            ]).map(l => (
              <button key={l.value} onClick={() => setLang(l.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  lang === l.value ? 'border-green-500' : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}
              >
                <span className="text-2xl">{l.flag}</span>
                <span className="text-xs" style={{ color: isDark ? '#ccc' : '#333' }}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Звук</h3>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
            <div className="flex items-center gap-3">
              {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
              <div>
                <p className="text-xs font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{muted ? 'Звук выключен' : 'Звук включён'}</p>
                <p className="text-[10px]" style={{ color: isDark ? '#888' : '#666' }}>Звуковые эффекты интерфейса</p>
              </div>
            </div>
            <button onClick={toggleMute}
              className={`relative w-11 h-6 rounded-full transition-colors ${muted ? 'bg-gray-600' : 'bg-green-500'}`}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: muted ? '2px' : '22px' }} />
            </button>
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Безопасность</h3>
          <div className="space-y-2">
            {[
              { label: 'Фаервол', status: 'Активен', color: '#22c55e' },
              { label: 'Антивирус', status: 'Обновлён', color: '#22c55e' },
              { label: 'IPS/IDS', status: 'Мониторинг', color: '#f59e0b' },
              { label: '2FA', status: 'Включена', color: '#22c55e' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
                <span className="text-xs" style={{ color: isDark ? '#ccc' : '#333' }}>{item.label}</span>
                <span className="text-xs font-medium" style={{ color: item.color }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? '#e0e0e0' : '#333' }}>О системе</h3>
          <div className="space-y-2">
            {[
              { icon: Info, label: 'ОС', value: 'ZeroOS v1.0.0' },
              { icon: Cpu, label: 'Процессор', value: 'Virtual Core @ 2.4GHz' },
              { icon: HardDrive, label: 'Память', value: '2.4 GB / 8 GB' },
              { icon: Wifi, label: 'Сеть', value: 'Connected' },
              { icon: Battery, label: 'Питание', value: '100%' },
              { icon: Shield, label: 'Защита', value: `${prog?.security_level ?? 100}%` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
                <div className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5" style={{ color: isDark ? '#888' : '#666' }} />
                  <span className="text-xs" style={{ color: isDark ? '#ccc' : '#333' }}>{item.label}</span>
                </div>
                <span className="text-xs font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
