import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, GripVertical, MailWarning, ShieldCheck, X } from 'lucide-react';
import type { ScenarioStep } from '@/types';
import { useGS } from '@/store/useGS';
import { sfx } from '@/lib/sfx';

type PracticeCard = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  target: 'flags' | 'verify';
};

function parsePayload(step: ScenarioStep) {
  const lines = step.payload.split('\n').map(line => line.trim()).filter(Boolean);
  const map: Record<string, string> = {};
  lines.forEach(line => {
    const [left, ...rest] = line.split(':');
    if (!left || rest.length === 0) return;
    map[left.toLowerCase()] = rest.join(':').trim();
  });
  return map;
}

function buildPracticeCards(step: ScenarioStep): PracticeCard[] {
  const payload = parsePayload(step);
  const from = payload.from || payload.sender || 'security@company-mail.ru';
  const replyTo = payload['reply-to'] || 'urgent.helpdesk@protonmail.com';
  const link = payload.link || 'https://center-invest-payroll.verify-secure.work/login';

  return [
    {
      id: 'mail-1',
      from,
      subject: 'Срочно: подтвердите реквизиты до 10:00',
      preview: `Для выплаты зарплаты перейдите по ссылке: ${link}`,
      target: 'flags',
    },
    {
      id: 'mail-2',
      from: `noreply@${step.location.toLowerCase().replace(/\s+/g, '')}.support`,
      subject: 'Обновление безопасности учетной записи',
      preview: 'Ваш аккаунт ограничен. Подтверждение требуется в течение 15 минут.',
      target: 'flags',
    },
    {
      id: 'mail-3',
      from: 'security@center-invest.ru',
      subject: 'Плановое уведомление SOC',
      preview: 'Откройте тикет в корпоративном портале и подтвердите операцию через внутренний канал.',
      target: 'verify',
    },
    {
      id: 'mail-4',
      from: replyTo,
      subject: 'Проверка по запросу руководителя',
      preview: 'Нужен код подтверждения прямо сейчас. Не разглашайте это сообщение.',
      target: 'flags',
    },
  ];
}

function buildTrainingBlocks(step: ScenarioStep) {
  return [
    {
      title: 'Как распознать атаку',
      text: step.why_dangerous,
    },
    {
      title: 'Что делать правильно',
      text: step.explanation,
    },
    {
      title: 'Быстрый алгоритм',
      text: '1) Проверить источник и домен. 2) Не реагировать на срочность. 3) Подтвердить запрос через отдельный корпоративный канал.',
    },
  ];
}

export function LessonDialog({ step, onClose }: { step: ScenarioStep; onClose: () => void }) {
  const setGp = useGS(s => s.setGp);
  const [page, setPage] = useState<'training' | 'practice'>('training');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const practiceCards = useMemo(() => buildPracticeCards(step), [step]);
  const trainingBlocks = useMemo(() => buildTrainingBlocks(step), [step]);
  const [placements, setPlacements] = useState<Record<string, 'flags' | 'verify' | null>>({});

  useEffect(() => {
    setPage('training');
    setDraggingId(null);
    setPlacements(Object.fromEntries(practiceCards.map(card => [card.id, null])));
  }, [practiceCards, step.id]);

  const correctlyPlaced = practiceCards.filter(card => placements[card.id] === card.target).length;

  const moveCard = (cardId: string, target: 'flags' | 'verify') => {
    setPlacements(current => ({ ...current, [cardId]: target }));
    setDraggingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-30"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-6xl bg-surface border border-border rounded-[30px] overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.32)]"
        onClick={event => event.stopPropagation()}
      >
        <div className="relative px-6 py-5 border-b border-border bg-[linear-gradient(180deg,rgba(31,120,207,0.11),rgba(31,120,207,0.03))]">
          <button
            onClick={() => {
              sfx.click();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>

          <div className="flex flex-wrap items-center gap-3 pr-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/85 px-3 py-1 text-xs font-semibold text-info">
              <BookOpen className="w-3.5 h-3.5" />
              Обучение перед тестом
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-text-secondary">
              {step.attack_type}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-text-secondary">
              {step.location}
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-bold text-text max-w-4xl">{step.title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-text-secondary">
            Обучение отдельно от теста: сначала разбираем правила и примеры, потом принимаем решение.
          </p>
        </div>

        <div className="px-6 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPage('training')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                page === 'training' ? 'bg-primary text-white' : 'bg-bg-secondary text-text-secondary hover:bg-surface-active'
              }`}
            >
              1. Обучение
            </button>
            <button
              onClick={() => setPage('practice')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                page === 'practice' ? 'bg-primary text-white' : 'bg-bg-secondary text-text-secondary hover:bg-surface-active'
              }`}
            >
              2. Практика писем
            </button>
          </div>
        </div>

        <div className="p-6 min-h-[540px]">
          {page === 'training' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
              <div className="rounded-[28px] border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-info font-semibold">Учебный разбор</p>
                <div className="mt-4 space-y-4">
                  {trainingBlocks.map((block, index) => (
                    <div key={block.title} className="relative rounded-3xl border border-border bg-bg-secondary/45 p-4 pl-14">
                      <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-info-soft text-info font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm font-semibold text-text">{block.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{block.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-[#0e1726] text-[#dfe9ff] p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#89aaff] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Исходные данные кейса
                </div>
                <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 font-mono m-0">{step.payload}</pre>
              </div>
            </div>
          )}

          {page === 'practice' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-[28px] border border-border bg-bg-secondary/45 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold">Практика</p>
                  <h3 className="mt-2 text-xl font-bold text-text">Распределите примеры писем</h3>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-border text-right min-w-40">
                  <p className="text-xs text-text-muted">Точность</p>
                  <p className="text-2xl font-bold text-text">{correctlyPlaced}/{practiceCards.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-5">
                <div className="rounded-[28px] border border-dashed border-border-strong bg-white p-5">
                  <div className="space-y-3">
                    {practiceCards.filter(card => !placements[card.id]).map(card => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => setDraggingId(card.id)}
                        onDragEnd={() => setDraggingId(null)}
                        className="rounded-2xl border border-border bg-bg-secondary/45 p-4 cursor-grab active:cursor-grabbing shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-4 h-4 mt-0.5 text-text-muted shrink-0" />
                          <div className="text-sm leading-relaxed text-text">
                            <p><span className="text-text-muted">From:</span> {card.from}</p>
                            <p className="font-semibold mt-1">{card.subject}</p>
                            <p className="mt-1">{card.preview}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!practiceCards.some(card => !placements[card.id]) && (
                      <div className="rounded-2xl border border-success/25 bg-success-soft p-4 text-sm text-success font-medium">
                        Все примеры распределены. Можно переходить к тесту.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'flags' as const, title: 'Сомнительные письма', tone: 'danger' },
                    { id: 'verify' as const, title: 'Проверить отдельно', tone: 'info' },
                  ].map(zone => (
                    <div
                      key={zone.id}
                      onDragOver={event => event.preventDefault()}
                      onDrop={event => {
                        event.preventDefault();
                        if (draggingId) moveCard(draggingId, zone.id);
                      }}
                      className={`rounded-[28px] border-2 border-dashed p-5 min-h-[340px] transition-colors ${
                        zone.tone === 'danger' ? 'border-danger/30 bg-danger-soft/40' : 'border-info/30 bg-info-soft/45'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <MailWarning className={`w-4 h-4 ${zone.tone === 'danger' ? 'text-danger' : 'text-info'}`} />
                        <p className="text-sm font-semibold text-text">{zone.title}</p>
                      </div>
                      <div className="space-y-3">
                        {practiceCards.filter(card => placements[card.id] === zone.id).map(card => (
                          <button
                            key={card.id}
                            onClick={() => setPlacements(current => ({ ...current, [card.id]: null }))}
                            className="w-full text-left rounded-2xl border border-white/70 bg-white p-4 shadow-sm text-sm leading-relaxed text-text"
                          >
                            <p><span className="text-text-muted">From:</span> {card.from}</p>
                            <p className="font-semibold mt-1">{card.subject}</p>
                            <p className="mt-1">{card.preview}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 bg-surface">
          <div className="text-sm text-text-secondary">
            {page === 'practice' ? 'Перетаскивайте карточки писем между колонками, чтобы закрепить признаки атаки.' : 'Сначала изучите правила, затем переходите к практике.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage('training')}
              disabled={page === 'training'}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-45"
            >
              Назад
            </button>

            {page === 'training' ? (
              <button
                onClick={() => setPage('practice')}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Далее
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sfx.click();
                  setGp('decision');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Перейти к тесту
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
