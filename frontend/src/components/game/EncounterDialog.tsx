import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import type { ScenarioStep } from '@/types';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { sfx } from '@/lib/sfx';

type FeedbackState = 'idle' | 'success' | 'error';

type AnswerItem = {
  id: number;
  optionId: number;
  label: string;
  details: string;
  isCorrect: boolean;
};

function buildQuestion(step: ScenarioStep) {
  return step.brief || `${step.title}. Какое действие безопаснее?`;
}

function buildChecklistKeys(step: ScenarioStep): string[] {
  const family = [step.attack_type, step.location, step.title, step.code].join(' ').toLowerCase();
  if (family.includes('wifi') || family.includes('кафе')) {
    return ['clWifi1', 'clWifi2', 'clWifi3', 'clWifi4'];
  }
  if (family.includes('sms') || family.includes('qr') || family.includes('смартф')) {
    return ['clMobile1', 'clMobile2', 'clMobile3', 'clMobile4'];
  }
  if (family.includes('звонок') || family.includes('соц') || family.includes('otp')) {
    return ['clSocial1', 'clSocial2', 'clSocial3', 'clSocial4'];
  }
  return ['clGeneric1', 'clGeneric2', 'clGeneric3', 'clGeneric4'];
}

function buildAnswers(step: ScenarioStep): AnswerItem[] {
  return step.options.map((option, index) => ({
    id: index + 1,
    optionId: option.id,
    label: option.label,
    details: option.details,
    isCorrect: option.is_correct,
  }));
}

export function EncounterDialog({ step, onClose }: { step: ScenarioStep; onClose: () => void }) {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const submit = useGS(s => s.submit);
  const getHints = useGS(s => s.getHints);
  const submitting = useGS(s => s.submitting);

  const answers = useMemo(() => buildAnswers(step), [step]);
  const checklistKeys = useMemo(() => buildChecklistKeys(step), [step]);
  const question = useMemo(() => buildQuestion(step), [step]);
  const canInstantCheck = useMemo(() => answers.some(answer => answer.isCorrect), [answers]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [shakeAnswerId, setShakeAnswerId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedAnswerId(null);
    setFeedback('idle');
    setShakeAnswerId(null);
  }, [step.id]);

  const selectedAnswer = answers.find(answer => answer.id === selectedAnswerId) ?? null;

  const message = useMemo(() => {
    if (feedback === 'success') return T('encounterSuccess');
    if (feedback === 'error') return T('encounterError');
    return '';
  }, [feedback, step.attack_type]);

  const handleSelect = (answer: AnswerItem) => {
    if (submitting) return;
    setSelectedAnswerId(answer.id);
    if (!canInstantCheck) {
      setFeedback('idle');
      setShakeAnswerId(null);
      return;
    }
    if (answer.isCorrect) {
      sfx.success();
      setFeedback('success');
      setShakeAnswerId(null);
      return;
    }
    sfx.fatal();
    setFeedback('error');
    setShakeAnswerId(answer.id);
    window.setTimeout(() => setShakeAnswerId(null), 360);
  };

  const continueWithResult = () => {
    if (!selectedAnswer || submitting) return;
    sfx.click();
    submit(step.id, selectedAnswer.optionId, getHints(step.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-6xl rounded-[28px] border border-border bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={event => event.stopPropagation()}
      >
        <div className="relative border-b border-border px-6 py-5 bg-[linear-gradient(180deg,rgba(45,139,77,0.08),rgba(45,139,77,0.02))]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-bold text-text">{T('encounterTitle')}: {step.attack_type}</h2>
          <p className="mt-2 text-sm text-text-secondary">{T('encounterSubtitle')}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-[24px] border border-border bg-white p-5"
            >
              <h3 className="text-sm uppercase tracking-[0.14em] text-primary font-semibold">{T('encounterChecklist')}</h3>
              <div className="mt-4 space-y-3">
                {checklistKeys.map((itemKey, index) => (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.1 + index * 0.08 }}
                    className="rounded-2xl border border-border bg-bg-secondary/45 px-4 py-3 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 mt-0.5 text-success shrink-0" />
                    <p className="text-sm leading-relaxed text-text">{T(itemKey)}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="rounded-[24px] border border-border bg-bg-secondary/45 p-5"
            >
              <h3 className="text-sm uppercase tracking-[0.14em] text-info font-semibold">{T('encounterReadiness')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {T('encounterReadinessDesc')}
              </p>
              <div className="mt-5 rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-text-secondary">
                    {T('encounterPrinciple')}
                  </p>
                </div>
              </div>
            </motion.section>
          </div>

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="mt-6 rounded-[24px] border border-border bg-white p-5"
          >
            <p className="text-base md:text-lg font-semibold text-text">
              {question}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {answers.map((answer, index) => {
                const isSelected = selectedAnswerId === answer.id;
                const isSuccess = isSelected && feedback === 'success';
                const isError = isSelected && feedback === 'error';
                const paletteClass = isSuccess
                  ? 'border-success/40 bg-success-soft text-success'
                  : isError
                    ? 'border-danger/40 bg-danger-soft text-danger'
                    : 'border-border bg-bg-secondary/45 text-text';

                return (
                  <motion.button
                    key={answer.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      x: shakeAnswerId === answer.id ? [0, -8, 8, -6, 6, 0] : 0,
                    }}
                    transition={{
                      opacity: { duration: 0.25, delay: 0.24 + index * 0.08 },
                      y: { duration: 0.25, delay: 0.24 + index * 0.08 },
                      x: { duration: 0.34, ease: 'easeInOut' },
                    }}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => handleSelect(answer)}
                    disabled={submitting}
                    className={`w-full text-left rounded-2xl border px-4 py-4 shadow-sm transition-all duration-200 hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] ${paletteClass}`}
                  >
                    <span className="text-sm md:text-base font-semibold">{answer.label}</span>
                    {answer.details && (
                      <span className="mt-1 block text-xs text-current/70">{answer.details}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {feedback !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26 }}
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium flex items-start gap-2 ${
                  feedback === 'success'
                    ? 'border-success/35 bg-success-soft text-success'
                    : 'border-danger/35 bg-danger-soft text-danger'
                }`}
              >
                {feedback === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{message}</span>
              </motion.div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-hover transition-colors"
              >
                {T('encounterClose')}
              </button>
              <button
                onClick={continueWithResult}
                disabled={!selectedAnswer || submitting}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-45"
              >
                {T('encounterContinue')}
              </button>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  );
}
