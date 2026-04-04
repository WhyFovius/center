import type { ComponentType } from 'react';
import { Shield, BatteryCharging, Target, Home } from 'lucide-react';
import type { Progress } from '@/types';
import { useGS } from '@/store/useGS';

type MetricCardProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  helper: string;
  value: string;
  colorClass: string;
  fillClass: string;
  percent?: number;
};

function MetricCard({ icon: Icon, label, helper, value, colorClass, fillClass, percent }: MetricCardProps) {
  return (
    <div className="relative group pointer-events-auto">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/92 backdrop-blur-md rounded-full border border-border shadow-sm">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        {typeof percent === 'number' && (
          <div className="w-20 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${fillClass}`} style={{ width: `${percent}%` }} />
          </div>
        )}
        <span className="text-xs font-semibold text-text">{value}</span>
      </div>
      <div className="pointer-events-none absolute left-0 top-full mt-2 min-w-52 rounded-2xl border border-border bg-white/96 px-3 py-2 shadow-xl opacity-0 translate-y-1 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
        <p className="text-xs font-semibold text-text">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{helper}</p>
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
}: {
  energy: number;
  shield: number;
  progress: Progress | null;
  totalSteps: number;
  missionResolvedSteps: number;
}) {
  const setScreen = useGS(s => s.setScreen);
  const setFb = useGS(s => s.setFb);
  const setEncTrig = useGS(s => s.setEncTrig);
  const setEncStep = useGS(s => s.setEncStep);

  return (
    <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3 pointer-events-none">
      <div className="flex items-center gap-2">
        <MetricCard
          icon={Shield}
          label="Защита"
          helper="Показывает текущий запас устойчивости. Ошибки снижают этот показатель, правильные решения восстанавливают контроль."
          value={`${shield}%`}
          percent={shield}
          colorClass="text-primary"
          fillClass="bg-primary"
        />
        <MetricCard
          icon={BatteryCharging}
          label="Ресурс"
          helper="Отражает общий запас сил и устойчивости в сессии. Чем он выше, тем безопаснее ваша траектория."
          value={`${energy}%`}
          percent={energy}
          colorClass="text-accent"
          fillClass="bg-accent"
        />
        {progress && (
          <MetricCard
            icon={Target}
            label="Прогресс"
            helper="Сколько сценариев текущей миссии уже закрыто."
            value={`${missionResolvedSteps}/${totalSteps}`}
            colorClass="text-text-muted"
            fillClass="bg-text-muted"
          />
        )}
      </div>

      <div className="pointer-events-auto">
        <button
          onClick={() => {
            setFb(null);
            setEncTrig(false);
            setEncStep(null);
            setScreen('menu');
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white/92 px-4 py-2 text-sm font-semibold text-text shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white"
        >
          <Home className="w-4 h-4 text-primary" />
          В меню
        </button>
      </div>
    </div>
  );
}
