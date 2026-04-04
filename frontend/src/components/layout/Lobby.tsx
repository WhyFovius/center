import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle2, Lock, BookOpen, MapPinned, ShieldCheck, ChevronRight } from 'lucide-react';
import { useGS, ssFor } from '@/store/useGS';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';
import type { Mission, ScenarioTrack } from '@/types';

const TRACK_MISSIONS: Record<ScenarioTrack, string[]> = {
  network: ['office', 'home'],
  social: ['wifi', 'banking'],
  mobile: ['travel', 'remote'],
};

const TRACK_TITLES: Record<ScenarioTrack, string> = {
  network: 'Сценарий: Сетевые атаки',
  social: 'Сценарий: Социальная инженерия',
  mobile: 'Сценарий: Мобильные угрозы',
};

const missionThemes: Record<string, { gradient: string; soft: string; border: string; accent: string; chips: string[] }> = {
  office: {
    gradient: 'linear-gradient(135deg, #0f5c7b, #2a9bc0)',
    soft: '#e4f7ff',
    border: '#8cd7f0',
    accent: '#14789e',
    chips: ['Почта', 'Мессенджер', 'Проверка отправителя'],
  },
  home: {
    gradient: 'linear-gradient(135deg, #6f2053, #d6538e)',
    soft: '#fff0f6',
    border: '#f1a3c5',
    accent: '#9e2b65',
    chips: ['Смартфон', 'Личные аккаунты', 'SMS и APK'],
  },
  wifi: {
    gradient: 'linear-gradient(135deg, #886000, #e6ae21)',
    soft: '#fff7da',
    border: '#f0d06c',
    accent: '#af7b00',
    chips: ['Кафе', 'Платежные данные', 'Поддельные сети'],
  },
  banking: {
    gradient: 'linear-gradient(135deg, #7a2434, #da5f76)',
    soft: '#fff0f2',
    border: '#f1acb8',
    accent: '#a53349',
    chips: ['Платежи', 'Переводы', 'Фальшивые звонки'],
  },
  travel: {
    gradient: 'linear-gradient(135deg, #4c398a, #7b6bd7)',
    soft: '#f4f1ff',
    border: '#bdb1f0',
    accent: '#5f48b0',
    chips: ['Отели', 'Аэропорт', 'Публичные пространства'],
  },
  remote: {
    gradient: 'linear-gradient(135deg, #0d744f, #36b678)',
    soft: '#e6fff3',
    border: '#94e1bd',
    accent: '#1c8e61',
    chips: ['VPN', 'Личный ноутбук', 'Корпоративный доступ'],
  },
};

function getMissionTheme(code: string) {
  return (
    missionThemes[code] ?? {
      gradient: 'linear-gradient(135deg, #2c5b51, #4ea08f)',
      soft: '#edf9f6',
      border: '#aadfd2',
      accent: '#2c7b67',
      chips: ['Практика', 'Навыки', 'Разбор'],
    }
  );
}

function trainingPreview(mission: Mission) {
  const attackTypes = Array.from(new Set(mission.steps.map(step => step.attack_type))).slice(0, 2);
  return attackTypes.join(' • ');
}

export default function Lobby() {
  const setScreen = useGS(s => s.setScreen);
  const track = useGS(s => s.track);
  const allMissions = useGS(s => s.sim?.missions ?? []);
  const stepStates = useGS(s => s.ss);
  const selectMission = useGS(s => s.selectMission);
  const progress = useGS(s => s.prog);

  const missionCodes = TRACK_MISSIONS[track];
  const filtered = allMissions
    .map((mission, globalIndex) => ({ mission, globalIndex }))
    .filter(item => missionCodes.includes(item.mission.code));

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-16 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #2d8b4d, transparent)' }} />
        <div className="absolute bottom-16 left-16 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #d3a53f, transparent)' }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(45,139,77,0.06) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
      </div>

      <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-surface/95 backdrop-blur">
        <Button variant="ghost" size="sm" onClick={() => setScreen('menu')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад
        </Button>
        <div>
          <h1 className="text-base font-bold text-text">{TRACK_TITLES[track]}</h1>
          <p className="text-xs text-text-muted">Уровни распределены по трекам. Сначала обучение, затем тест и последствия.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filtered.map(({ mission, globalIndex }, index) => {
              const done = mission.steps.filter(step => ssFor(stepStates, step.id).resolved).length;
              const total = mission.steps.length;
              const progressValue = total ? Math.round((done / total) * 100) : 0;
              const theme = getMissionTheme(mission.code);
              const locked = progress ? globalIndex > progress.unlocked_mission_index : true;

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-[28px] border bg-surface shadow-[0_18px_45px_rgba(26,26,26,0.08)] overflow-hidden"
                  style={{ borderColor: theme.border }}
                >
                  <div className="relative px-6 py-5 text-white overflow-hidden" style={{ background: theme.gradient }}>
                    <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at right top, ${theme.border}55, transparent 55%)` }} />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                          <MapPinned className="w-3.5 h-3.5" />
                          Уровень {index + 1}
                        </div>
                        <h2 className="mt-4 text-[30px] leading-none font-bold">{mission.title}</h2>
                        <p className="mt-2 text-sm text-white/78 max-w-md">{mission.subtitle}</p>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-right min-w-30">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Прогресс</p>
                        <p className="text-2xl font-bold">{progressValue}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4">
                      <div className="rounded-2xl border border-border bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          <span>Обучение перед тестом</span>
                        </div>
                        <p className="mt-2 text-sm text-text leading-relaxed">{mission.description}</p>
                        <p className="mt-2 text-xs text-text-muted">Темы: {trainingPreview(mission)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {theme.chips.map(chip => (
                            <span key={chip} className="rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs text-text-secondary">
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl p-4" style={{ background: theme.soft }}>
                        <div className="flex items-center gap-2 text-xs" style={{ color: theme.accent }}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Структура</span>
                        </div>
                        <div className="mt-3 space-y-3">
                          <div>
                            <p className="text-xs text-text-muted">Эпизоды</p>
                            <p className="text-lg font-semibold text-text">{total}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Завершено</p>
                            <p className="text-lg font-semibold text-text">{done} из {total}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Формат</p>
                            <p className="text-sm font-medium text-text">Обучение → тест → последствия</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-text-muted mb-2">
                        <span>Готовность уровня</span>
                        <span>{done}/{total}</span>
                      </div>
                      <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressValue}%`, background: theme.gradient }} />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <div className="text-sm text-text-secondary">
                        {locked ? 'Уровень откроется после завершения предыдущего.' : 'Внутри уровня: обучение, практика и тестирование решений.'}
                      </div>
                      {locked ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm font-medium text-text-muted">
                          <Lock className="w-4 h-4" />
                          Заблокировано
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            selectMission(globalIndex);
                            setScreen('game');
                          }}
                          className="rounded-full px-5"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Открыть уровень
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>

                    {done === total && total > 0 && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success-soft px-4 py-2 text-sm font-semibold text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        Уровень завершен
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
  );
}
