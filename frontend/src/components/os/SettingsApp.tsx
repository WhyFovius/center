import { useGS } from '@/store/useGS';
import type { Theme, Lang } from '@/types';
import { t } from '@/lib/i18n';
import { Palette, Volume2, VolumeX, Globe, Cpu, HardDrive, Wifi, Monitor } from 'lucide-react';

export default function SettingsApp() {
  const theme = useGS(s => s.theme);
  const setTheme = useGS(s => s.setTheme);
  const lang = useGS(s => s.lang);
  const setLang = useGS(s => s.setLang);
  const muted = useGS(s => s.muted);
  const toggleMute = useGS(s => s.toggleMute);
  const T = (key: string) => t(lang, key);
  const isDark = theme === 'dark' || theme === 'bw';

  return (
    <div className="h-full flex overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <div className="w-48 border-r flex flex-col shrink-0" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{T('osSettings')}</h2>
        </div>
        <div className="flex-1 py-2 space-y-0.5 overflow-y-auto">
          {[
            { id: 'system', label: T('osSettingsSystem'), icon: Monitor },
            { id: 'appearance', label: T('osSettingsAppearance'), icon: Palette },
            { id: 'sound', label: T('osSettingsSound'), icon: muted ? VolumeX : Volume2 },
            { id: 'language', label: T('osSettingsLang'), icon: Globe },
          ].map(item => (
            <button key={item.id}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
              }`}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <item.icon className="w-3.5 h-3.5" />{item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* System */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>{T('osSettingsSystem')}</h3>
          <div className="space-y-2">
            {[
              { icon: Monitor, label: T('osSettingsOS'), value: 'ZeroOS v1.0.0' },
              { icon: Cpu, label: T('osSettingsCPU'), value: 'Virtual Core @ 2.4GHz' },
              { icon: HardDrive, label: T('osSettingsRAM'), value: '2.4 GB / 8 GB' },
              { icon: Wifi, label: T('osSettingsNetwork'), value: 'Connected' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>{T('osSettingsAppearance')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'light' as Theme, label: T('osSettingsLight'), bg: '#f8f6ee' },
              { value: 'dark' as Theme, label: T('osSettingsDark'), bg: '#0d1117' },
              { value: 'bw' as Theme, label: T('osSettingsBw'), bg: '#0a0a0a' },
            ]).map(t => (
              <button key={t.value} onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === t.value ? 'border-green-500' : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="w-12 h-12 rounded-lg shadow-inner" style={{ backgroundColor: t.bg }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>{T('osSettingsSound')}</h3>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center gap-3">
              {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{muted ? T('osSettingsMuted') : T('osSettingsUnmuted')}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Звуковые эффекты интерфейса</p>
              </div>
            </div>
            <button onClick={toggleMute}
              className={`relative w-11 h-6 rounded-full transition-colors ${muted ? 'bg-gray-600' : 'bg-green-500'}`}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: muted ? '2px' : '22px' }} />
            </button>
          </div>
        </div>

        {/* Language */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>Язык</h3>
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
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <span className="text-2xl">{l.flag}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
