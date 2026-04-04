import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trophy, User, Crown, Medal, Sparkles, ArrowLeft, Zap } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';
import { ToggleTheme } from '@/components/ui/toggle-theme';

export default function LeaderboardView() {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const setScreen = useGS(s => s.setScreen);
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark';
  const [entries, setEntries] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    api.lb.get().then(r => { setEntries(r.entries || []); setLbLoading(false); }).catch(() => setLbLoading(false));
  }, []);

  const leagueFallback = T('leagueNovice');

  const leagueMeta: Record<string, { color: string; bg: string; border: string; icon: string }> = {
    [T('leagueNovice')]: { color: isDark ? '#9ca3af' : '#6b7280', bg: isDark ? 'rgba(156,163,175,0.12)' : 'rgba(107,114,128,0.1)', border: isDark ? 'rgba(156,163,175,0.25)' : 'rgba(107,114,128,0.2)', icon: '🌱' },
    [T('leagueAnalyst')]: { color: isDark ? '#60a5fa' : '#2563eb', bg: isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.1)', border: isDark ? 'rgba(96,165,250,0.25)' : 'rgba(37,99,235,0.2)', icon: '🔍' },
    [T('leagueThreatHunter')]: { color: isDark ? '#a78bfa' : '#7c3aed', bg: isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.1)', border: isDark ? 'rgba(167,139,250,0.25)' : 'rgba(124,58,237,0.2)', icon: '🎯' },
    [T('leagueExpert')]: { color: isDark ? '#fbbf24' : '#d97706', bg: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.1)', border: isDark ? 'rgba(251,191,36,0.25)' : 'rgba(217,119,6,0.2)', icon: '👑' },
  };

  const getLeagueStyle = (league: string) => {
    return leagueMeta[league] || leagueMeta[leagueFallback];
  };

  const topThree = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('menu')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-bg-secondary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            {T('back')}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-text tracking-tight">{T('leaderboard')}</h1>
              <p className="text-xs text-text-muted">{T('lbHallOfFame')}</p>
            </div>
          </div>
        </div>
        <ToggleTheme />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {lbLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-sm text-text-muted">{T('lbLoading')}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Trophy className="w-16 h-16 text-text-muted/30 mb-4" />
              <p className="text-lg font-semibold text-text">{T('lbNoData')}</p>
              <p className="text-sm text-text-muted mt-1">{T('lbNoDataDesc')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Podium */}
              {topThree.length > 0 && <PodiumSection entries={topThree} getLeagueStyle={getLeagueStyle} T={T} isDark={isDark} />}

              {/* Rest of the leaderboard */}
              {restEntries.length > 0 && (
                <div className="space-y-2">
                  {restEntries.map((entry: any, index: number) => {
                    const leagueStyle = getLeagueStyle(entry.league || leagueFallback);
                    return (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-border-strong transition-all duration-200 group"
                      >
                        <span className="text-base font-bold text-text-muted w-10 text-center">#{entry.rank}</span>
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: leagueStyle.bg }}
                        >
                          <User className="w-5 h-5" style={{ color: leagueStyle.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-text truncate">{entry.full_name || entry.username}</p>
                          <p className="text-xs text-text-muted truncate">@{entry.username}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-accent" />
                              <p className="text-base font-bold text-text">{entry.reputation}</p>
                            </div>
                            <p className="text-xs text-text-muted">{T('lbRep')}</p>
                          </div>
                          <span
                            className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                            style={{
                              backgroundColor: leagueStyle.bg,
                              color: leagueStyle.color,
                              borderColor: leagueStyle.border,
                            }}
                          >
                            {leagueStyle.icon} {entry.league || leagueFallback}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumSection({
  entries,
  getLeagueStyle,
  T,
  isDark,
}: {
  entries: any[];
  getLeagueStyle: (league: string) => { color: string; bg: string; border: string; icon: string };
  T: (key: string) => string;
  isDark: boolean;
}) {
  const first = entries[0] || null;
  const second = entries[1] || null;
  const third = entries[2] || null;

  const podiumStyles = [
    {
      title: T('lbChampion'),
      icon: <Crown className="w-6 h-6" />,
      iconColor: '#fbbf24',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))'
        : 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.08))',
      border: isDark ? 'rgba(251,191,36,0.3)' : 'rgba(217,169,18,0.3)',
      glow: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.2)',
      avatarSize: 'w-16 h-16',
      textSize: 'text-xl',
    },
    {
      title: T('lbSilver'),
      icon: <Medal className="w-5 h-5" />,
      iconColor: isDark ? '#94a3b8' : '#64748b',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(148,163,184,0.04))'
        : 'linear-gradient(135deg, rgba(148,163,184,0.15), rgba(148,163,184,0.06))',
      border: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.2)',
      glow: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.15)',
      avatarSize: 'w-14 h-14',
      textSize: 'text-lg',
    },
    {
      title: T('lbBronze'),
      icon: <Medal className="w-5 h-5" />,
      iconColor: isDark ? '#d97706' : '#b45309',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(217,119,6,0.12), rgba(217,119,6,0.04))'
        : 'linear-gradient(135deg, rgba(217,119,6,0.15), rgba(217,119,6,0.06))',
      border: isDark ? 'rgba(217,119,6,0.25)' : 'rgba(180,83,9,0.2)',
      glow: isDark ? 'rgba(217,119,6,0.1)' : 'rgba(217,119,6,0.15)',
      avatarSize: 'w-14 h-14',
      textSize: 'text-lg',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Champion - full width */}
      {first && (
        <PodiumCard entry={first} style={podiumStyles[0]} getLeagueStyle={getLeagueStyle} T={T} />
      )}

      {/* Silver & Bronze - side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {second && <PodiumCard entry={second} style={podiumStyles[1]} getLeagueStyle={getLeagueStyle} T={T} />}
        {third && <PodiumCard entry={third} style={podiumStyles[2]} getLeagueStyle={getLeagueStyle} T={T} />}
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  style,
  getLeagueStyle,
  T,
}: {
  entry: any;
  style: {
    title: string;
    icon: React.ReactNode;
    iconColor: string;
    gradient: string;
    border: string;
    glow: string;
    avatarSize: string;
    textSize: string;
  };
  getLeagueStyle: (league: string) => { color: string; bg: string; border: string; icon: string };
  T: (key: string) => string;
}) {
  const leagueStyle = getLeagueStyle(entry.league || T('leagueNovice'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border p-6"
      style={{
        background: style.gradient,
        borderColor: style.border,
        boxShadow: `0 8px 32px -16px ${style.glow}`,
      }}
    >
      {/* Glow effect */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: style.glow }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: style.glow }}
          >
            <span style={{ color: style.iconColor }}>{style.icon}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-text-secondary font-semibold">{style.title}</p>
            <p className="text-lg font-extrabold text-text">#{entry.rank}</p>
          </div>
        </div>
        {entry.rank === 1 && <Sparkles className="w-6 h-6 text-[#fbbf24]" />}
      </div>

      {/* Player info */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`${style.avatarSize} rounded-2xl flex items-center justify-center`}
          style={{ backgroundColor: leagueStyle.bg }}
        >
          <User className="w-8 h-8" style={{ color: leagueStyle.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${style.textSize} font-bold text-text truncate`}>{entry.full_name || entry.username}</p>
          <p className="text-sm text-text-muted truncate">@{entry.username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          <p className="text-lg font-extrabold text-text">{entry.reputation}</p>
          <p className="text-sm text-text-muted">{T('lbRep')}</p>
        </div>
        <span
          className="px-3 py-1.5 rounded-full text-sm font-semibold border"
          style={{
            backgroundColor: leagueStyle.bg,
            color: leagueStyle.color,
            borderColor: leagueStyle.border,
          }}
        >
          {leagueStyle.icon} {entry.league || T('leagueNovice')}
        </span>
      </div>
    </motion.div>
  );
}
