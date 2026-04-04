import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import type { ScenarioStep, StepOption } from '@/types';
import { useGS } from '@/store/useGS';
import { sfx } from '@/lib/sfx';

type FeedbackState = 'idle' | 'success' | 'error';

type AnswerItem = {
  id: number;
  label: string;
  isCorrect: boolean;
};

const ANSWERS: AnswerItem[] = [
  { id: 1, label: 'Перейти по ссылке и подтвердить данные', isCorrect: false },
  { id: 2, label: 'Сообщить в ИБ и проверить через официальный канал', isCorrect: true },
  { id: 3, label: 'Скачать вложение и посмотреть', isCorrect: false },
  { id: 4, label: 'Ответить на письмо и уточнить', isCorrect: false },
];

const CHECKLIST = [
  'Проверь источник: адрес, номер, домен, имя отправителя.',
  'Ищи давление срочностью, страхом или авторитетом.',
  'Подтверждай действие только через независимый корпоративный канал.',
  'Помни правило кейса: не доверяй письмам с требованием срочного действия.',
];

function pickOption(stepOptions: StepOption[], isCorrect: boolean) {
  const exact = stepOptions.find(option => option.is_correct === isCorrect);
  if (exact) return exact;
  return stepOptions[0] ?? null;
}

export function EncounterDialog({ step, onClose }: { step: ScenarioStep; onClose: () => void }) {
  const submit = useGS(s => s.submit);
  const getHints = useGS(s => s.getHints);
  const submitting = useGS(s => s.submitting);

  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [shakeAnswerId, setShakeAnswerId] = useState<number | null>(null);

  const selectedAnswer = ANSWERS.find(answer => answer.id === selectedAnswerId) ?? null;

  const message = useMemo(() => {
    if (feedback === 'success') return 'Верно. Это фишинг. Всегда проверяйте через доверенные каналы.';
    if (feedback === 'error') return 'Ошибка. Это фишинговая атака.';
    return '';
  }, [feedback]);

  const handleSelect = (answer: AnswerItem) => {
    if (submitting) return;
    setSelectedAnswerId(answer.id);
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
    const mapped = pickOption(step.options, selectedAnswer.isCorrect);
    if (!mapped) return;
    sfx.click();
    submit(step.id, mapped.id, getHints(step.id));
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
          <h2 className="text-2xl font-bold text-text">Тест на фишинговую осведомлённость</h2>
          <p className="mt-2 text-sm text-text-secondary">Выберите безопасное действие. После выбора будет показана мгновенная обратная связь.</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-[24px] border border-border bg-white p-5"
            >
              <h3 className="text-sm uppercase tracking-[0.14em] text-primary font-semibold">Чеклист перед решением</h3>
              <div className="mt-4 space-y-3">
                {CHECKLIST.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.1 + index * 0.08 }}
                    className="rounded-2xl border border-border bg-bg-secondary/45 px-4 py-3 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 mt-0.5 text-success shrink-0" />
                    <p className="text-sm leading-relaxed text-text">{item}</p>
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
              <h3 className="text-sm uppercase tracking-[0.14em] text-info font-semibold">Готовность к тесту</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Вы готовы переходить к практическому решению. Оцените письмо как потенциальную угрозу и выберите действие, которое минимизирует риск.
              </p>
              <div className="mt-5 rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-text-secondary">
                    Главный принцип: не подтверждать данные из письма напрямую, пока запрос не проверен через официальный корпоративный канал.
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
              Вы получили письмо с просьбой срочно подтвердить реквизиты. Что вы сделаете?
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {ANSWERS.map((answer, index) => {
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
                Закрыть
              </button>
              <button
                onClick={continueWithResult}
                disabled={!selectedAnswer || submitting}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-45"
              >
                Продолжить
              </button>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  );
}
