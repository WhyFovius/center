import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Users,
  Smartphone,
  ArrowRight,
  LogOut,
  Trophy,
  BarChart3,
  Radar,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';
import type { ScenarioTrack } from '@/types';
import logo from '@/assets/logo.png';

const scenarios = [
  {
    id: 'network',
    key: 'networkAttacks',
    descKey: 'networkAttacksDesc',
    icon: Globe,
    gradient: 'linear-gradient(135deg, #0f4570, #2577b4)',
    glow: 'rgba(37, 119, 180, 0.3)',
    badge: 'Сети и инфраструктура',
    focus: 'Фишинг, MITM, поддельные сети',
    level: 'Средний',
    learning: 'Разбор индикаторов компрометации и безопасной проверки доменов',
    accent: '#2f86c7',
    border: '#6aaedf',
  },
  {
    id: 'social',
    key: 'socialEngineering',
    descKey: 'socialEngineeringDesc',
    icon: Users,
    gradient: 'linear-gradient(135deg, #47206b, #7a38af)',
    glow: 'rgba(122, 56, 175, 0.32)',
    badge: 'Люди и манипуляции',
    focus: 'Звонки, дипфейки, давление срочностью',
    level: 'Высокий',
    learning: 'Обучение перед тестом и разбор красных флагов по шагам',
    accent: '#7a38af',
    border: '#d5b5eb',
  },
  {
    id: 'mobile',
    key: 'mobileThreats',
    descKey: 'mobileThreatsDesc',
    icon: Smartphone,
    gradient: 'linear-gradient(135deg, #7a1f49, #c23d74)',
    glow: 'rgba(194, 61, 116, 0.32)',
    badge: 'Мобильные устройства',
    focus: 'Смишинг, QR, APK, публичные точки доступа',
    level: 'Средний',
    learning: 'Практика проверки уведомлений только через доверенные каналы',
    accent: '#b93b70',
    border: '#e8b2c7',
  },
] as const;

const TRACK_MISSIONS: Record<ScenarioTrack, string[]> = {
  network: ['office', 'home'],
  social: ['wifi', 'banking'],
  mobile: ['travel', 'remote'],
};

export default function MainMenu() {
  const T = (key: string) => t('ru', key);
  const setScreen = useGS(s => s.setScreen);
  const setTrack = useGS(s => s.setTrack);
  const logout = useGS(s => s.logout);
  const user = useGS(s => s.sim?.user);
  const missions = useGS(s => s.sim?.missions ?? []);

  const trackCounts = useMemo(() => {
    const codes = new Set(missions.map(m => m.code));
    return {
      network: TRACK_MISSIONS.network.filter(code => codes.has(code)).length,
      social: TRACK_MISSIONS.social.filter(code => codes.has(code)).length,
      mobile: TRACK_MISSIONS.mobile.filter(code => codes.has(code)).length,
    };
  }, [missions]);

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #2d8b4d, transparent)' }} />
        <div className="absolute bottom-10 left-20 w-56 h-56 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #d3a53f, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #2d8b4d, transparent)' }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(45,139,77,0.075) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
      </div>

      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Логотип Центр Инвест" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-base font-bold text-text">{T('appName')}</h1>
            <p className="text-[11px] text-text-muted">{user?.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setScreen('leaderboard')} className="text-text-secondary">
            <Trophy className="w-4 h-4 mr-1" />
            <span className="text-xs">{T('leaderboard')}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setScreen('profile')} className="text-text-secondary">
            <BarChart3 className="w-4 h-4 mr-1" />
            <span className="text-xs">{T('profile')}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="text-text-muted">
            <LogOut className="w-4 h-4 mr-1" />
            <span className="text-xs">Выйти</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-6xl w-full mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">{T('selectScenario')}</h2>
              <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
                Выберите направление и перейдите к миссиям с обучением, тестом и разбором.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {scenarios.map((scenario, index) => {
                const Icon = scenario.icon;
                return (
                  <motion.button
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setTrack(scenario.id as ScenarioTrack);
                      setScreen('lobby');
                    }}
                    className="group block w-full appearance-none p-0 text-left rounded-[28px] overflow-hidden border bg-surface hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_22px_50px_rgba(26,26,26,0.12)]"
                    style={{ borderColor: scenario.border }}
                  >
                    <div className="relative block w-full p-6 text-white overflow-hidden min-h-[220px]" style={{ background: scenario.gradient }}>
                      <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at top right, ${scenario.glow}, transparent 55%)` }} />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/12 border border-white/20 flex items-center justify-center shadow-inner">
                          <Icon className="w-7 h-7" />
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90">
                          {scenario.badge}
                        </span>
                      </div>
                      <div className="relative mt-7">
                        <h3 className="text-[30px] leading-[1.02] font-bold max-w-[11ch]">{T(scenario.key)}</h3>
                        <p className="text-sm text-white/78 mt-2 max-w-xs">{T(scenario.descKey)}</p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl border border-border bg-bg-secondary/60 p-3">
                          <div className="flex items-center gap-2 text-text-muted">
                            <Radar className="w-3.5 h-3.5" />
                            <span>Фокус</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-text leading-snug">{scenario.focus}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-bg-secondary/60 p-3">
                          <div className="flex items-center gap-2 text-text-muted">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Сложность</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-text">{scenario.level}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-white p-3.5">
                        <div className="flex items-center gap-2 text-text-secondary text-xs">
                        <BookOpen className="w-3.5 h-3.5" style={{ color: scenario.accent }} />
                        <span>Обучение</span>
                      </div>
                      <p className="mt-1 text-sm text-text leading-relaxed">{scenario.learning}</p>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-secondary/60 px-4 py-3">
                        <div>
                          <p className="text-xs text-text-muted">Уровни трека</p>
                          <p className="text-sm font-semibold text-text">{trackCounts[scenario.id as ScenarioTrack]} уровня</p>
                        </div>
                        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: scenario.accent }}>
                          Открыть
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
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
