import type { ComponentType } from 'react';
import { Shield, BatteryCharging, Target, ArrowLeft, RotateCcw } from 'lucide-react';
import type { Progress } from '@/types';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import SkyToggle from '@/components/ui/sky-toggle';
import { api } from '@/lib/api';

type MetricCardProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  helper: string;
  value: string;
  colorClass: string;
  fillClass: string;
  percent?: number;
  isDark: boolean;
};

function MetricCard({ icon: Icon, label, helper, value, colorClass, fillClass, percent, isDark }: MetricCardProps) {
  return (
    <div className="relative group pointer-events-auto">
      <div
        className="flex items-center gap-3 px-4 py-3 backdrop-blur-xl rounded-2xl border border-border shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
        style={{ backgroundColor: isDark ? 'rgba(28,33,40,0.95)' : 'rgba(255,255,255,0.95)' }}
      >
        <Icon className={`w-5 h-5 ${colorClass}`} />
        {typeof percent === 'number' && (
          <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--color-bg-secondary)' }}>
            <div className={`h-full rounded-full transition-all duration-500 ${fillClass}`} style={{ width: `${percent}%` }} />
          </div>
        )}
        <span className="text-sm font-bold text-text">{value}</span>
      </div>
      <div className="pointer-events-none absolute left-0 top-full mt-3 min-w-60 rounded-2xl border border-border px-4 py-3 shadow-2xl opacity-0 translate-y-1 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100"
        style={{ backgroundColor: isDark ? 'rgba(28,33,40,0.98)' : 'rgba(255,255,255,0.98)' }}
      >
        <p className="text-sm font-bold text-text">{label}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{helper}</p>
      </div>
    </div>
  );
}

export function GameHUD({
  energy,
  shield,
  progress,
  totalSteps,
  missionResolvedSteps,
  missionCode,
}: {
  energy: number;
  shield: number;
  progress: Progress | null;
  totalSteps: number;
  missionResolvedSteps: number;
  missionCode?: string;
}) {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const setScreen = useGS(s => s.setScreen);
  const setFb = useGS(s => s.setFb);
  const setEncTrig = useGS(s => s.setEncTrig);
  const setEncStep = useGS(s => s.setEncStep);
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark';
  const currentMissionIndex = useGS(s => s.mi);
  const sim = useGS(s => s.sim);
  const ss = useGS(s => s.ss);
  const load = useGS(s => s.load);

  const code = missionCode || sim?.missions?.[currentMissionIndex]?.code;

  const handleReset = async () => {
    if (!code) return;
    try {
      // Reset on backend
      await api.sim.resetMission(code);
      // Reload full state from backend
      await load();
      // Navigate to lobby so user can re-select the mission fresh
      setScreen('lobby');
    } catch (e: any) {
      console.error('Reset failed:', e);
      // If backend fails, try to reset locally
      try {
        const currentMission = sim?.missions?.[currentMissionIndex];
        if (!currentMission) return;
        // Clear step states for this mission
        const newSs = new Map(ss);
        currentMission.steps.forEach(step => {
          newSs.delete(step.id);
        });
        useGS.setState({
          ss: newSs,
          si: 0,
          gp: 'explore',
          encTriggered: false,
          encStep: null,
          fb: null,
          selOpt: null,
          px: 640,
          py: 430,
        });
      } catch (localErr) {
        console.error('Local reset also failed:', localErr);
      }
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-5 pointer-events-none">
      <div className="flex items-center gap-3">
        <MetricCard
          icon={Shield}
          label={T('hudShield')}
          helper={T('hudShieldHelper')}
          value={`${shield}%`}
          percent={shield}
          colorClass="text-primary"
          fillClass="bg-primary"
          isDark={isDark}
        />
        <MetricCard
          icon={BatteryCharging}
          label={T('hudEnergy')}
          helper={T('hudEnergyHelper')}
          value={`${energy}%`}
          percent={energy}
          colorClass="text-accent"
          fillClass="bg-accent"
          isDark={isDark}
        />
        {progress && (
          <MetricCard
            icon={Target}
            label={T('progress')}
            helper={T('hudProgressHelper')}
            value={`${missionResolvedSteps}/${totalSteps}`}
            colorClass="text-text-muted"
            fillClass="bg-text-muted"
            isDark={isDark}
          />
        )}
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        {missionResolvedSteps > 0 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-muted shadow-lg backdrop-blur-xl transition-all hover:text-text hover:-translate-y-0.5 hover:shadow-xl"
            style={{ backgroundColor: isDark ? 'rgba(28,33,40,0.95)' : 'rgba(255,255,255,0.95)' }}
            title={T('hudReset')}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{T('hudResetShort')}</span>
          </button>
        )}
        <button
          onClick={() => {
            setFb(null);
            setEncTrig(false);
            setEncStep(null);
            setScreen('lobby');
          }}
          className="inline-flex items-center gap-3 rounded-2xl border border-border px-5 py-3 text-base font-bold text-text shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{ backgroundColor: isDark ? 'rgba(28,33,40,0.95)' : 'rgba(255,255,255,0.95)' }}
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
          {T('hudBackToLevels')}
        </button>
        <SkyToggle />
      </div>
    </div>
  );
}
