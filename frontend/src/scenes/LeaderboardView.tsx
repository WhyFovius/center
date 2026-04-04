import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trophy, User, Crown, Medal, Sparkles } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { api } from '@/lib/api';

export default function LeaderboardView() {
  const setScreen = useGS(s => s.setScreen);
  const [entries, setEntries] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    api.lb.get().then(r => { setEntries(r.entries || []); setLbLoading(false); }).catch(() => setLbLoading(false));
  }, []);

  const leagueFallback = 'Новичок';
  const leagueColors: Record<string, string> = {
    [leagueFallback]: '#9ca3af',
    'Аналитик': '#60a5fa',
    'Охотник за угрозами': '#a78bfa',
    'Эксперт': '#fbbf24',
  };

  const podium = entries.slice(0, 3).map((entry, index) => ({ ...entry, podiumPlace: index + 1 }));
  const others = entries.slice(3);

  const getPodiumStyle = (place: number) => {
    if (place === 1) {
      return {
        title: 'Чемпион',
        icon: <Crown className="w-5 h-5 text-[#f3c74d]" />,
        card: 'border-[#d3a53f] bg-gradient-to-br from-[#fff8df] via-[#ffefbf] to-[#f5dea0]',
        glow: 'rgba(211, 165, 63, 0.45)',
      };
    }

    if (place === 2) {
      return {
        title: 'Серебро',
        icon: <Medal className="w-5 h-5 text-[#8ea0b8]" />,
        card: 'border-[#b8c4d4] bg-gradient-to-br from-[#f5f8fd] via-[#ebf0f7] to-[#dfe7f2]',
        glow: 'rgba(162, 180, 204, 0.4)',
      };
    }

    return {
      title: 'Медь',
      icon: <Medal className="w-5 h-5 text-[#b86b3c]" />,
      card: 'border-[#c67f52] bg-gradient-to-br from-[#f8e0d3] via-[#efc2a9] to-[#d79a76]',
      glow: 'rgba(198, 127, 82, 0.38)',
    };
  };

  return (
    <div
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(1000px 520px at 12% -10%, rgba(211,165,63,0.34), transparent 62%), radial-gradient(820px 460px at 88% 0%, rgba(45,139,77,0.22), transparent 58%), linear-gradient(180deg, #fcf8ea 0%, #f6efdd 48%, #efe6d1 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(205,191,157,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(205,191,157,0.28) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-[#f4d98c]/45 blur-3xl" />

      <header className="relative flex items-center gap-3 px-6 py-3 border-b border-[#d7c292] bg-white/70 backdrop-blur-md">
        <button onClick={() => setScreen('menu')} className="text-sm text-text-secondary hover:text-text transition-colors">← Назад</button>
        <h1 className="text-base font-bold text-text flex items-center gap-2"><Trophy className="w-5 h-5 text-[#b88217]" />Лидерборд</h1>
      </header>

      <div className="relative flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {lbLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 text-text-muted">Нет данных</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#d8c79a] bg-white/75 backdrop-blur-md p-4 md:p-5 shadow-[0_16px_50px_-36px_rgba(90,64,0,0.5)]">
                <p className="text-[11px] tracking-[0.24em] uppercase text-text-secondary mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#b88217]" />
                  Зал славы
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-text">Лучшие игроки</h2>
              </div>

              <div className="space-y-3">
                {podium[0] ? (
                  <PodiumCard
                    entry={podium[0]}
                    leagueColors={leagueColors}
                    leagueFallback={leagueFallback}
                    styleMeta={getPodiumStyle(1)}
                    isChampion
                  />
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {podium[1] ? (
                    <PodiumCard
                      entry={podium[1]}
                      leagueColors={leagueColors}
                      leagueFallback={leagueFallback}
                      styleMeta={getPodiumStyle(2)}
                    />
                  ) : null}

                  {podium[2] ? (
                    <PodiumCard
                      entry={podium[2]}
                      leagueColors={leagueColors}
                      leagueFallback={leagueFallback}
                      styleMeta={getPodiumStyle(3)}
                    />
                  ) : null}
                </div>
              </div>

              {others.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {others.map((e: any) => (
                    <div key={e.user_id} className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm border border-[#d9cfb5] rounded-xl shadow-[0_14px_34px_-26px_rgba(60,40,0,0.45)]">
                      <span className="text-base font-bold text-text-muted w-8 text-center">#{e.rank}</span>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{e.full_name || e.username}</p>
                        <p className="text-xs text-text-muted truncate">@{e.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-text">{e.reputation} реп.</p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: (leagueColors[e.league || leagueFallback] || '#9ca3af') + '20',
                            color: leagueColors[e.league || leagueFallback] || '#9ca3af',
                          }}
                        >
                          {e.league || leagueFallback}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  leagueColors,
  leagueFallback,
  styleMeta,
  isChampion = false,
}: {
  entry: any;
  leagueColors: Record<string, string>;
  leagueFallback: string;
  styleMeta: { title: string; icon: any; card: string; glow: string };
  isChampion?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-2xl border p-4 md:p-5 ${styleMeta.card} ${isChampion ? 'shadow-[0_18px_45px_-28px_rgba(150,110,20,0.6)]' : 'shadow-[0_15px_34px_-28px_rgba(60,40,0,0.45)]'}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl" style={{ background: styleMeta.glow }} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-white/70 border border-white/75 flex items-center justify-center">{styleMeta.icon}</span>
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-text-secondary">{styleMeta.title}</p>
            <p className="text-sm font-bold text-text">#{entry.rank}</p>
          </div>
        </div>
        {isChampion ? <Sparkles className="w-5 h-5 text-[#b88217]" /> : null}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className={`rounded-full flex items-center justify-center ${isChampion ? 'w-12 h-12 bg-white/75' : 'w-11 h-11 bg-white/70'}`}>
          <User className={`${isChampion ? 'w-6 h-6' : 'w-5 h-5'} text-primary`} />
        </div>
        <div className="min-w-0">
          <p className={`font-semibold text-text truncate ${isChampion ? 'text-base' : 'text-sm'}`}>{entry.full_name || entry.username}</p>
          <p className="text-xs text-text-muted truncate">@{entry.username}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className={`font-bold text-text ${isChampion ? 'text-base md:text-lg' : 'text-base'}`}>{entry.reputation} реп.</p>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: (leagueColors[entry.league || leagueFallback] || '#9ca3af') + '24',
            color: leagueColors[entry.league || leagueFallback] || '#9ca3af',
          }}
        >
          {entry.league || leagueFallback}
        </span>
      </div>
    </motion.div>
  );
}
