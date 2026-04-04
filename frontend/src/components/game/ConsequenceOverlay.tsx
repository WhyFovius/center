import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, RotateCcw, Skull, Volume2, VolumeX } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { sfx } from '@/lib/sfx';

export function ConsequenceOverlay() {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const fb = useGS(s => s.fb);
  const next = useGS(s => s.next);
  const setFb = useGS(s => s.setFb);
  const setGp = useGS(s => s.setGp);
  const resetMission = useGS(s => s.resetCurrentMission);
  const prog = useGS(s => s.prog);
  const sim = useGS(s => s.sim);
  const mi = useGS(s => s.mi);
  const si = useGS(s => s.si);
  const muted = useGS(s => s.muted);
  const toggleMuteState = useGS(s => s.toggleMute);
  const setScreen = useGS(s => s.setScreen);

  if (!fb || !fb.consequence) return null;

  const ok = fb.kind === 'success';
  const consequence = fb.consequence;
  const mission = sim?.missions[mi];
  const isLastStep = mission ? si >= mission.steps.length - 1 : false;
  const isLastMission = sim ? mi >= sim.missions.length - 1 : false;
  const allMissionsComplete = ok && isLastStep && (!prog || (isLastMission && prog.unlocked_mission_index >= mi));

  useEffect(() => {
    if (ok) sfx.success();
    else sfx.fatal();
  }, [ok]);

  const handleNext = async () => {
    sfx.click();
    if (allMissionsComplete) {
      // All done — go to lobby
      await resetMission();
      setScreen('lobby');
    } else {
      next();
    }
  };

  const handleRetry = async () => {
    sfx.click();
    await resetMission();
    setFb(null);
    setGp('explore');
  };

  const handleBackToTraining = async () => {
    sfx.click();
    await resetMission();
    setFb(null);
    setGp('explore');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center p-4 z-40"
      style={{ background: ok ? 'rgba(0,0,0,0.54)' : 'rgba(128,10,24,0.76)', backdropFilter: 'blur(5px)' }}
    >
      {/* Mute button */}
      <button
        onClick={() => toggleMuteState()}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/30 backdrop-blur text-white/70 hover:text-white hover:bg-black/50 transition-all"
        title={muted ? 'Включить звук' : 'Выключить звук'}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        className={`w-full max-w-3xl rounded-[28px] overflow-hidden border shadow-[0_28px_90px_rgba(0,0,0,0.35)] ${ok ? 'bg-white border-green-200' : 'bg-[#330912] border-red-500'}`}
      >
        <div className={`px-6 py-5 flex items-start gap-4 ${ok ? 'bg-green-50' : 'bg-red-950/80'}`}>
          {ok ? <CheckCircle2 className="w-9 h-9 text-green-600 shrink-0" /> : <Skull className="w-9 h-9 text-red-400 shrink-0 animate-pulse" />}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${ok ? 'text-green-700' : 'text-red-300'}`}>{consequence.badge}</span>
              <span className={`rounded-full px-3 py-1 text-xs ${ok ? 'bg-white text-green-700 border border-green-200' : 'bg-red-900 text-red-100 border border-red-700'}`}>
                {ok ? T('consequenceEpisodeDone') : T('consequenceReplayNeeded')}
              </span>
            </div>
            <h3 className={`mt-2 text-2xl font-bold ${ok ? 'text-gray-900' : 'text-red-100'}`}>{fb.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${ok ? 'text-gray-700' : 'text-red-200'}`}>{consequence.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-0">
          <div className="p-6 space-y-4">
            <div className={`rounded-[24px] border p-4 ${ok ? 'border-green-200 bg-green-50/70' : 'border-red-800 bg-red-950/40'}`}>
              <p className={`text-xs uppercase tracking-[0.14em] font-semibold ${ok ? 'text-green-700' : 'text-red-300'}`}>{T('consequenceEmotionalResult')}</p>
              <p className={`mt-2 text-sm leading-relaxed ${ok ? 'text-gray-800' : 'text-red-100'}`}>{consequence.emotionalOutcome}</p>
            </div>

            <div className={`rounded-[24px] border p-4 ${ok ? 'border-border bg-bg-secondary/45' : 'border-red-800 bg-red-950/30'}`}>
              <p className={`text-xs uppercase tracking-[0.14em] font-semibold ${ok ? 'text-text-muted' : 'text-red-300'}`}>{ok ? T('consequenceWhatWorked') : T('consequenceWhereError')}</p>
              <p className={`mt-2 text-sm leading-relaxed ${ok ? 'text-text-secondary' : 'text-red-100'}`}>{consequence.missedSignal}</p>
            </div>

            <div className={`rounded-[24px] border p-4 ${ok ? 'border-primary/20 bg-primary-container/25' : 'border-red-800 bg-red-950/20'}`}>
              <div className="flex items-start gap-3">
                <BookOpen className={`w-5 h-5 mt-0.5 shrink-0 ${ok ? 'text-primary' : 'text-red-300'}`} />
                <div>
                  <p className={`text-xs uppercase tracking-[0.14em] font-semibold ${ok ? 'text-primary' : 'text-red-300'}`}>{T('consequenceRule')}</p>
                  <p className={`mt-2 text-sm leading-relaxed ${ok ? 'text-text' : 'text-red-100'}`}>{consequence.inductiveRule}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 border-t xl:border-t-0 xl:border-l ${ok ? 'border-border bg-white' : 'border-red-900 bg-[#26060d]'}`}>
            <p className={`text-xs uppercase tracking-[0.14em] font-semibold ${ok ? 'text-text-muted' : 'text-red-300'}`}>{T('consequenceEpisodeDevelopment')}</p>
            <div className="mt-4 space-y-3">
              {consequence.timeline.map(item => (
                <div key={item.stage} className={`rounded-[22px] border p-4 ${ok ? 'border-border bg-bg-secondary/45' : 'border-red-900 bg-red-950/35'}`}>
                  <p className={`text-sm font-semibold ${ok ? 'text-text' : 'text-red-100'}`}>{item.stage}</p>
                  <p className={`mt-1 text-sm leading-relaxed ${ok ? 'text-text-secondary' : 'text-red-200'}`}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {consequence.metrics.map(metric => (
                <span
                  key={`${metric.label}-${metric.value}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    metric.tone === 'positive'
                      ? 'text-green-700 border-green-200 bg-green-50'
                      : metric.tone === 'negative'
                        ? ok
                          ? 'text-red-500 border-red-200 bg-red-50'
                          : 'text-red-200 border-red-800 bg-red-950/45'
                        : ok
                          ? 'text-text-secondary border-border bg-bg-secondary/45'
                          : 'text-red-100 border-red-900 bg-red-950/30'
                  }`}
                >
                  {metric.label}: {metric.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/70 flex flex-wrap justify-end gap-3 bg-surface">
          {!ok && (
            <button
              onClick={handleBackToTraining}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-300 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {T('consequenceRetryTest')}
            </button>
          )}

          {ok ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              {allMissionsComplete ? T('consequenceToMissionMenu') : T('consequenceNextEpisode')}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {T('hudReset')}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
