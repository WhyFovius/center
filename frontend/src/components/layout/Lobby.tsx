import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle2, Lock, BookOpen, MapPinned, ShieldCheck, ChevronRight, RotateCcw, Monitor } from 'lucide-react';
import { useGS, ssFor } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import Footer from '@/components/layout/Footer';
import type { Mission, ScenarioTrack } from '@/types';
import { api } from '@/lib/api';

const TRACK_MISSIONS: Record<ScenarioTrack, string[]> = {
  network: ['office', 'home'],
  social: ['wifi', 'banking'],
  mobile: ['travel', 'remote'],
};

const TRACK_TITLES: Record<ScenarioTrack, string> = {
  network: 'lobbyNetworkTitle',
  social: 'lobbySocialTitle',
  mobile: 'lobbyMobileTitle',
};

const missionThemes: Record<string, { gradient: string; soft: string; border: string; accent: string; chips: string[] }> = {
  office: {
    gradient: 'linear-gradient(135deg, #0f5c7b, #2a9bc0)',
    soft: '#e4f7ff',
    border: '#8cd7f0',
    accent: '#14789e',
    chips: ['chipEmail', 'chipMessenger', 'chipSenderCheck'],
  },
  home: {
    gradient: 'linear-gradient(135deg, #6f2053, #d6538e)',
    soft: '#fff0f6',
    border: '#f1a3c5',
    accent: '#9e2b65',
    chips: ['chipSmartphone', 'chipPersonalAccounts', 'chipSmsAndApk'],
  },
  wifi: {
    gradient: 'linear-gradient(135deg, #886000, #e6ae21)',
    soft: '#fff7da',
    border: '#f0d06c',
    accent: '#af7b00',
    chips: ['chipCafe', 'chipPaymentData', 'chipFakeNetworks'],
  },
  banking: {
    gradient: 'linear-gradient(135deg, #7a2434, #da5f76)',
    soft: '#fff0f2',
    border: '#f1acb8',
    accent: '#a53349',
    chips: ['chipPayments', 'chipTransfers', 'chipFakeCalls'],
  },
  travel: {
    gradient: 'linear-gradient(135deg, #4c398a, #7b6bd7)',
    soft: '#f4f1ff',
    border: '#bdb1f0',
    accent: '#5f48b0',
    chips: ['chipHotels', 'chipAirport', 'chipPublicSpaces'],
  },
  remote: {
    gradient: 'linear-gradient(135deg, #0d744f, #36b678)',
    soft: '#e6fff3',
    border: '#94e1bd',
    accent: '#1c8e61',
    chips: ['chipVpn', 'chipPersonalLaptop', 'chipCorporateAccess'],
  },
};

function getMissionTheme(code: string) {
  return (
    missionThemes[code] ?? {
      gradient: 'linear-gradient(135deg, #2c5b51, #4ea08f)',
      soft: '#edf9f6',
      border: '#aadfd2',
      accent: '#2c7b67',
      chips: ['chipPractice', 'chipSkills', 'chipAnalysis'],
    }
  );
}

function trainingPreview(mission: Mission) {
  const attackTypes = Array.from(new Set(mission.steps.map(step => step.attack_type))).slice(0, 2);
  return attackTypes.join(' • ');
}

export default function Lobby() {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const setScreen = useGS(s => s.setScreen);
  const track = useGS(s => s.track);
  const allMissions = useGS(s => s.sim?.missions ?? []);
  const stepStates = useGS(s => s.ss);
  const selectMission = useGS(s => s.selectMission);
  const load = useGS(s => s.load);
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark';
  const [resetting, setResetting] = useState<string | null>(null);

  const missionCodes = TRACK_MISSIONS[track];
  const filtered = allMissions
    .map((mission, globalIndex) => ({ mission, globalIndex }))
    .filter(item => missionCodes.includes(item.mission.code));
  const trackUnlockedIndex = (() => {
    if (!filtered.length) return 0;
    let unlocked = 0;
    for (let index = 0; index < filtered.length; index += 1) {
      const missionDone = filtered[index].mission.steps.every(step => ssFor(stepStates, step.id).resolved);
      if (missionDone) {
        unlocked = Math.min(index + 1, filtered.length - 1);
      } else {
        break;
      }
    }
    return unlocked;
  })();

  const handleReset = async (missionCode: string) => {
    setResetting(missionCode);
    try {
      await api.sim.resetMission(missionCode);
      await load();
    } catch (e) {
      console.error('Reset failed:', e);
    } finally {
      setResetting(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-20 w-56 h-56 rounded-full opacity-10" style={{ background: isDark ? 'radial-gradient(circle, #3fb950, transparent)' : 'radial-gradient(circle, #2d8b4d, transparent)' }} />
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full opacity-10" style={{ background: isDark ? 'radial-gradient(circle, #d29922, transparent)' : 'radial-gradient(circle, #d3a53f, transparent)' }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle, rgba(63,185,80,0.04) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(45,139,77,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-border bg-surface/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setScreen('menu')} className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            {T('back')}
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-text tracking-tight">{T(TRACK_TITLES[track])}</h1>
            <p className="text-xs md:text-sm text-text-muted hidden sm:block">{T('lobbyTrackDesc')}</p>
          </div>
        </div>
        <ToggleTheme />
      </header>

      {/* Mission Cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {filtered.map(({ mission, globalIndex }, index) => {
                const done = mission.steps.filter(step => ssFor(stepStates, step.id).resolved).length;
                const total = mission.steps.length;
                const progressValue = total ? Math.round((done / total) * 100) : 0;
                const theme = getMissionTheme(mission.code);
                const locked = index > trackUnlockedIndex;

                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-3xl border bg-surface shadow-xl overflow-hidden"
                    style={{ borderColor: theme.border }}
                  >
                    {/* Card Header */}
                    <div className="relative px-8 py-7 text-white overflow-hidden" style={{ background: theme.gradient }}>
                      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at right top, ${theme.border}55, transparent 55%)` }} />
                      <div className="relative flex items-start justify-between gap-6">
                        <div>
                          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em]">
                            <MapPinned className="w-4 h-4" />
                            {T('lobbyLevel')} {index + 1}
                          </div>
                          <h2 className="mt-5 text-3xl leading-none font-extrabold">{mission.title}</h2>
                          <p className="mt-3 text-base text-white/78 max-w-md">{mission.subtitle}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/12 px-5 py-4 text-right min-w-32">
                          <p className="text-xs uppercase tracking-[0.14em] text-white/70">{T('progress')}</p>
                          <p className="text-3xl font-extrabold">{progressValue}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4 md:gap-5">
                        <div className="rounded-2xl border border-border p-6" style={{ backgroundColor: isDark ? 'var(--color-surface)' : '#ffffff' }}>
                          <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <span className="font-semibold">{T('lobbyTrainingBeforeTest')}</span>
                          </div>
                          <p className="mt-3 text-base text-text leading-relaxed">{mission.description}</p>
                          <p className="mt-3 text-sm text-text-muted">{T('lobbyTopics')}: {trainingPreview(mission)}</p>
                          <div className="mt-4 flex flex-wrap gap-2.5">
                            {theme.chips.map(chip => (
                              <span key={chip} className="rounded-full border border-border px-4 py-1.5 text-sm text-text-secondary" style={{ backgroundColor: isDark ? 'var(--color-bg-secondary)' : 'var(--color-bg-secondary)' }}>
                                {T(chip)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl p-6" style={{
                          background: isDark
                            ? `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}08)`
                            : theme.soft,
                          border: `1px solid ${theme.accent}30`,
                        }}>
                          <div className="flex items-center gap-2.5 text-sm" style={{ color: theme.accent }}>
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-semibold">{T('lobbyStructure')}</span>
                          </div>
                          <div className="mt-4 space-y-4">
                            <div>
                              <p className="text-sm text-text-muted">{T('lobbyEpisodes')}</p>
                              <p className="text-xl font-bold text-text">{total}</p>
                            </div>
                            <div>
                              <p className="text-sm text-text-muted">{T('lobbyCompleted')}</p>
                              <p className="text-xl font-bold text-text">{done} {T('lobbyOf')} {total}</p>
                            </div>
                            <div>
                              <p className="text-sm text-text-muted">{T('lobbyFormat')}</p>
                              <p className="text-base font-semibold text-text">{T('lobbyFormatDesc')}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm text-text-muted mb-2.5">
                          <span>{T('lobbyLevelReadiness')}</span>
                          <span>{done}/{total}</span>
                        </div>
                        <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressValue}%`, background: theme.gradient }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                        <div className="text-base text-text-secondary">
                          {locked ? T('lobbyLevelLocked') : T('lobbyLevelUnlocked')}
                        </div>
                        {locked ? (
                          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-secondary px-5 py-2.5 text-base font-medium text-text-muted">
                            <Lock className="w-5 h-5" />
                            {T('lobbyLocked')}
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                selectMission(globalIndex);
                                setScreen('os');
                              }}
                              className="rounded-full px-6 py-3 text-base font-bold"
                            >
                              <Monitor className="w-5 h-5 mr-2" />
                              Рабочий стол
                            </Button>
                            <Button
                              onClick={() => {
                                selectMission(globalIndex);
                                setScreen('game');
                              }}
                              className="rounded-full px-6 py-3 text-base font-bold"
                            >
                              <Play className="w-5 h-5 mr-2" />
                              {T('lobbyOpenLevel')}
                              <ChevronRight className="w-5 h-5 ml-1.5" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Complete Badge */}
                      {done === total && total > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="inline-flex items-center gap-2.5 rounded-full border border-success/25 bg-success-soft px-5 py-2.5 text-base font-bold text-success">
                            <CheckCircle2 className="w-5 h-5" />
                            {T('lobbyLevelComplete')}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReset(mission.code)}
                            disabled={resetting === mission.code}
                            className="text-sm text-text-muted hover:text-text"
                          >
                            <RotateCcw className="w-4 h-4 mr-1.5" />
                            {T('lobbyRetry')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
