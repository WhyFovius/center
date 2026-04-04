import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Play,
  ChevronRight,
  Shield,
  Target,
  User,
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import type { ScenarioTrack } from '@/types';
import logo from '@/assets/logo.png';

const scenarios: { id: ScenarioTrack; titleKey: string; badgeKey: string; focusKey: string; icon: typeof Shield; bg: string; accent: string; accentSoft: string; accentBorder: string }[] = [
  {
    id: 'network',
    titleKey: 'scenNetwork',
    badgeKey: 'scenNetworkBadge',
    focusKey: 'scenNetworkFocus',
    icon: Globe,
    bg: '#0e2a1a',
    accent: '#41aa62',
    accentSoft: 'rgba(65,170,98,0.12)',
    accentBorder: 'rgba(65,170,98,0.25)',
  },
  {
    id: 'social',
    titleKey: 'scenSocial',
    badgeKey: 'scenSocialBadge',
    focusKey: 'scenSocialFocus',
    icon: Users,
    bg: '#2a0e1a',
    accent: '#ef4444',
    accentSoft: 'rgba(239,68,68,0.12)',
    accentBorder: 'rgba(239,68,68,0.25)',
  },
  {
    id: 'mobile',
    titleKey: 'scenMobile',
    badgeKey: 'scenMobileBadge',
    focusKey: 'scenMobileFocus',
    icon: Smartphone,
    bg: '#1a0e2a',
    accent: '#8b5cf6',
    accentSoft: 'rgba(139,92,246,0.12)',
    accentBorder: 'rgba(139,92,246,0.25)',
  },
];

const TRACK_MISSIONS: Record<ScenarioTrack, string[]> = {
  network: ['office', 'home'],
  social: ['wifi', 'banking'],
  mobile: ['travel', 'remote'],
};

const CHARACTERS = [
  { id: 'analyst', nameKey: 'charAnalyst', emoji: '🔍', descKey: 'charAnalystDesc' },
  { id: 'hacker', nameKey: 'charHacker', emoji: '💻', descKey: 'charHackerDesc' },
  { id: 'manager', nameKey: 'charManager', emoji: '📋', descKey: 'charManagerDesc' },
  { id: 'agent', nameKey: 'charAgent', emoji: '🕵️', descKey: 'charAgentDesc' },
];

type MenuView = 'main' | 'scenarios' | 'docs' | 'characters';

export default function MainMenu() {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const setLang = useGS(s => s.setLang);
  const setScreen = useGS(s => s.setScreen);
  const setTrack = useGS(s => s.setTrack);
  const logout = useGS(s => s.logout);
  const user = useGS(s => s.sim?.user);
  const missions = useGS(s => s.sim?.missions ?? []);
  const prog = useGS(s => s.prog);
  const stepStates = useGS(s => s.ss);
  const [view, setView] = useState<MenuView>('main');

  const totalSteps = missions.reduce((a, m) => a + m.steps.length, 0);
  const resolvedSteps = prog?.resolved_steps ?? 0;
  const overallPct = totalSteps ? Math.round((resolvedSteps / totalSteps) * 100) : 0;

  if (view === 'main') {
    return (
      <div className="h-full flex flex-col bg-bg overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <img src={logo} alt="" className="h-9 w-auto" />
            <span className="text-lg font-bold text-text tracking-tight">{T('appName')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-3">
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                {prog?.league || T('leagueNovice')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {(['ru', 'kz', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    lang === l
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-bg-secondary'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <ToggleTheme />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-4 md:space-y-6">
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-accent/5 border border-border rounded-3xl p-8"
            >
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 bg-primary blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10 bg-accent blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-text tracking-tight">
                    {T('menuGreeting')}, <span className="text-primary">{user?.full_name?.split(' ')[0] || T('appName')}</span>
                  </h1>
                  <p className="text-base text-text-secondary mt-2">{T('menuReady')}</p>
                </div>
                <div className="text-right hidden lg:block">
                  <div className="text-4xl font-extrabold text-primary">{overallPct}%</div>
                  <div className="text-sm text-text-muted mt-1">{T('menuOverallProgress')}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-bg-secondary/50 rounded-full overflow-hidden mt-5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>

            {/* Main Action Button - ZeroOS */}
            <motion.button
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => setScreen('os')}
              className="w-full group flex items-center gap-6 p-7 rounded-3xl bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold">{T('menuStartGame')}</h3>
                <p className="text-base text-white/70 mt-1">ZeroOS — интерактивный симулятор</p>
              </div>
              <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>

            {/* Missions Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => setView('scenarios')}
              className="w-full group flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text">{T('menuMissions')}</h3>
                <p className="text-sm text-text-muted">Выбор миссий и сценариев</p>
              </div>
              <ChevronRight className="w-6 h-6 text-text-muted" />
            </motion.button>

            {/* Grid Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <button
                onClick={() => setScreen('leaderboard')}
                className="flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border hover:border-accent/30 hover:bg-surface-hover transition-all duration-200 text-left group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-text">{T('menuLeaderboard')}</div>
                  <div className="text-sm text-text-muted mt-0.5">{T('menuLeaderboardDesc')}</div>
                </div>
              </button>

              <button
                onClick={() => setScreen('profile')}
                className="flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border hover:border-info/30 hover:bg-surface-hover transition-all duration-200 text-left group"
              >
                <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-info" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-text">{T('menuProfile')}</div>
                  <div className="text-sm text-text-muted mt-0.5">{T('menuProfileDesc')}</div>
                </div>
              </button>

              <button
                onClick={() => setView('characters')}
                className="flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border hover:border-purple-500/30 hover:bg-surface-hover transition-all duration-200 text-left group"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-text">{T('menuCharacters')}</div>
                  <div className="text-sm text-text-muted mt-0.5">{T('menuCharactersDesc')}</div>
                </div>
              </button>

              <button
                onClick={() => setView('docs')}
                className="flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border hover:bg-surface-hover transition-all duration-200 text-left group"
              >
                <div className="w-14 h-14 rounded-2xl bg-bg-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-text-secondary" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-text">{T('menuDocs')}</div>
                  <div className="text-sm text-text-muted mt-0.5">{T('menuDocsDesc')}</div>
                </div>
              </button>
            </motion.div>

            {/* Logout */}
            <div className="flex justify-center pt-2">
              <button
                onClick={logout}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm text-text-muted hover:text-danger hover:bg-danger-soft transition-all"
              >
                <LogOut className="w-4.5 h-4.5" />
                {T('menuLogout')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-border/40 bg-surface/60">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-2.5">
            <Shield className="w-4 h-4 text-primary/40" />
            <span className="text-xs text-text-muted/60">{T('footerBrand')}</span>
          </div>
        </footer>
      </div>
    );
  }

  if (view === 'characters') {
    return (
      <div className="h-full flex flex-col bg-bg overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <button
            onClick={() => setView('main')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-bg-secondary transition-all"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            {T('back')}
          </button>
          <h1 className="text-lg font-bold text-text">{T('charTitle')}</h1>
          <ToggleTheme />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            <p className="text-base text-text-secondary mb-6">{T('charDesc')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CHARACTERS.map((char, i) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface border border-border rounded-2xl p-7 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="text-5xl mb-4">{char.emoji}</div>
                  <h3 className="text-xl font-bold text-text">{T(char.nameKey)}</h3>
                  <p className="text-sm text-text-secondary mt-2">{T(char.descKey)}</p>
                  <div className="mt-5 flex items-center gap-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold">{T('charSelect')}</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border/40 bg-surface/60">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-2.5">
            <Shield className="w-4 h-4 text-primary/40" />
            <span className="text-xs text-text-muted/60">{T('footerBrand')}</span>
          </div>
        </footer>
      </div>
    );
  }

  if (view === 'scenarios') {
    return (
      <div className="h-full flex flex-col bg-bg overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <button
            onClick={() => setView('main')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-bg-secondary transition-all"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            {T('back')}
          </button>
          <h1 className="text-lg font-bold text-text">{T('scenTitle')}</h1>
          <ToggleTheme />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-4 md:space-y-5">
            {scenarios.map((scenario, index) => {
              const Icon = scenario.icon;
              const missionCodes = TRACK_MISSIONS[scenario.id];
              const resolvedInTrack = missionCodes.reduce((a, code) => {
                const m = missions.find(x => x.code === code);
                return a + (m ? m.steps.filter(s => stepStates.get(s.id)?.resolved).length : 0);
              }, 0);
              const totalInTrack = missionCodes.reduce((a, code) => {
                const m = missions.find(x => x.code === code);
                return a + (m ? m.steps.length : 0);
              }, 0);
              const pct = totalInTrack ? Math.round((resolvedInTrack / totalInTrack) * 100) : 0;

              return (
                <motion.button
                  key={scenario.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => { setTrack(scenario.id); setScreen('lobby'); }}
                  className="w-full text-left"
                >
                  <div
                    className="rounded-3xl border overflow-hidden bg-surface hover:bg-surface-hover transition-all duration-200 group"
                    style={{ borderColor: scenario.accentBorder }}
                  >
                    <div className="p-6 flex items-center gap-6">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: scenario.accentSoft }}
                      >
                        <Icon className="w-8 h-8" style={{ color: scenario.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-text">{T(scenario.titleKey)}</h3>
                          <span className="text-lg font-semibold" style={{ color: scenario.accent }}>{pct}%</span>
                        </div>
                        <p className="text-base text-text-secondary mt-1">{T(scenario.focusKey)}</p>
                        <div className="w-full h-2.5 bg-bg-secondary/50 rounded-full overflow-hidden mt-4">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: scenario.accent }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-7 h-7 text-text-muted group-hover:translate-x-2 transition-transform shrink-0" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <footer className="shrink-0 border-t border-border/40 bg-surface/60">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-2.5">
            <Shield className="w-4 h-4 text-primary/40" />
            <span className="text-xs text-text-muted/60">{T('footerBrand')}</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
        <button
          onClick={() => setView('main')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-bg-secondary transition-all"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          {T('back')}
        </button>
        <h1 className="text-lg font-bold text-text">{T('docsTitle')}</h1>
        <ToggleTheme />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8 space-y-5">
          {[
            {
              title: T('docsHowToPlay'),
              desc: T('docsHowToPlayDesc'),
              icon: <Play className="w-6 h-6" />,
              content: (
                <div className="space-y-4 text-base text-text-secondary leading-relaxed">
                  <p>Zero Day — {lang === 'en' ? 'a cybersecurity simulator. You play as an employee facing real threats.' : lang === 'kz' ? 'киберқауіпсіздік симуляторы. Нақты қауіптерге тап болған қызметкер рөлін ойнайсыз.' : 'это симулятор кибербезопасности. Вы играете за сотрудника, который сталкивается с реальными угрозами.'}</p>
                  <p><strong className="text-text">{lang === 'en' ? 'Controls:' : lang === 'kz' ? 'Басқару:' : 'Управление:'}</strong> {lang === 'en' ? 'WASD or arrows to move. Approach the threat marker on the map to start a scenario.' : lang === 'kz' ? 'WASD немесе бағыттар — қозғалыс. Сценарийді бастау үшін картадағы қауіп маркеріне жақындаңыз.' : 'WASD или стрелки для перемещения. Подойдите к маркеру угрозы на карте, чтобы начать сценарий.'}</p>
                  <p><strong className="text-text">{lang === 'en' ? 'Format:' : lang === 'kz' ? 'Формат:' : 'Формат:'}</strong> {lang === 'en' ? 'Each scenario consists of training (theory + practice) and a test (decision making).' : lang === 'kz' ? 'Әр сценарий оқыту (теория + практика) және тесттен (шешім қабылдау) тұрады.' : 'Каждый сценарий состоит из обучения (теория + практика) и теста (принятие решений).'}</p>
                  <p><strong className="text-text">{lang === 'en' ? 'Progress:' : lang === 'kz' ? 'Прогресс:' : 'Прогресс:'}</strong> {lang === 'en' ? 'Correct decisions earn security and reputation points. Mistakes reduce your scores.' : lang === 'kz' ? 'Дұрыс шешімдер қауіпсіздік және бедел ұпайларын береді. Қателер көрсеткіштерді төмендетеді.' : 'За правильные решения вы получаете очки безопасности и репутации. Ошибки снижают показатели.'}</p>
                </div>
              ),
            },
            {
              title: T('docsAttackTypes'),
              desc: T('docsAttackTypesDesc'),
              icon: <Radar className="w-6 h-6" />,
              content: (
                <div className="space-y-4 text-base text-text-secondary leading-relaxed">
                  <p><strong className="text-text">{lang === 'en' ? 'Phishing:' : lang === 'kz' ? 'Фишинг:' : 'Фишинг:'}</strong> {lang === 'en' ? 'Fake emails aimed at stealing data. Check sender domain, links, and attachments.' : lang === 'kz' ? 'Деректерді ұрлауға бағытталған жалған хаттар. Жіберуші доменін, сілтемелер мен тіркемелерді тексеріңіз.' : 'Поддельные письма с целью кражи данных. Проверяйте домен отправителя, ссылки и вложения.'}</p>
                  <p><strong className="text-text">{lang === 'en' ? 'Vishing:' : lang === 'kz' ? 'Вишинг:' : 'Вишинг:'}</strong> {lang === 'en' ? 'Phone fraud. The attacker pretends to be a colleague or manager.' : lang === 'kz' ? 'Телефондық алаяқтық. Шабуылдаушы әріптес немесе басшы болып көрінеді.' : 'Телефонное мошенничество. Злоумышленник представляется коллегой или руководством.'}</p>
                  <p><strong className="text-text">{lang === 'en' ? 'Smishing:' : lang === 'kz' ? 'Смишинг:' : 'Смишинг:'}</strong> {lang === 'en' ? 'Phishing via SMS. Malicious links in messages.' : lang === 'kz' ? 'SMS арқылы фишинг. Хабарламалардағы зиянды сілтемелер.' : 'Фишинг через SMS. Вредоносные ссылки в сообщениях.'}</p>
                  <p><strong className="text-text">{lang === 'en' ? 'MITM:' : lang === 'kz' ? 'MITM:' : 'MITM:'}</strong> {lang === 'en' ? 'Traffic interception on public networks. Do not enter data on open Wi-Fi.' : lang === 'kz' ? 'Қоғамдық желілердегі трафикті ұстап алу. Ашық Wi-Fi-да деректерді енгізбеңіз.' : 'Перехват трафика в публичных сетях. Не вводите данные в открытых Wi-Fi.'}</p>
                </div>
              ),
            },
            {
              title: T('docsSecurityTips'),
              desc: T('docsSecurityTipsDesc'),
              icon: <Shield className="w-6 h-6" />,
              content: (
                <div className="space-y-4 text-base text-text-secondary leading-relaxed">
                  <p>{lang === 'en' ? 'Always verify the request source through an independent communication channel.' : lang === 'kz' ? 'Әрқашан сұраныс көзін тәуелсіз байланыс арнасы арқылы тексеріңіз.' : 'Всегда проверяйте источник запроса через независимый канал связи.'}</p>
                  <p>{lang === 'en' ? 'Urgency + link = red flag. Do not act under pressure.' : lang === 'kz' ? 'Шұғылдық + сілтеме = қызыл ту. Қысым астында әрекет етпеңіз.' : 'Срочность + ссылка = красный флаг. Не действуйте под давлением.'}</p>
                  <p>{lang === 'en' ? 'Use two-factor authentication wherever possible.' : lang === 'kz' ? 'Мүмкіндігінше екі факторлы аутентификацияны қолданыңыз.' : 'Используйте двухфакторную аутентификацию везде, где возможно.'}</p>
                  <p>{lang === 'en' ? 'Do not connect to unverified Wi-Fi networks for work tasks.' : lang === 'kz' ? 'Жұмыс тапсырмалары үшін тексерілмеген Wi-Fi желілеріне қосылмаңыз.' : 'Не подключайтесь к непроверенным Wi-Fi сетям для рабочих задач.'}</p>
                  <p>{lang === 'en' ? 'Update software and use antivirus on all devices.' : lang === 'kz' ? 'Бағдарламалық жасақтаманы жаңартыңыз және барлық құрылғыларда антивирус қолданыңыз.' : 'Обновляйте ПО и используйте антивирус на всех устройствах.'}</p>
                </div>
              ),
            },
          ].map((doc, index) => (
            <DocCard key={doc.title} doc={doc} index={index} />
          ))}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border/40 bg-surface/60">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-2.5">
          <Shield className="w-4 h-4 text-primary/40" />
          <span className="text-xs text-text-muted/60">{T('footerBrand')}</span>
        </div>
      </footer>
    </div>
  );
}

function DocCard({ doc, index }: { doc: { title: string; desc: string; icon: React.ReactNode; content: React.ReactNode }; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-5 p-6 text-left hover:bg-surface-hover transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center shrink-0 text-text-secondary">
          {doc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text">{doc.title}</h3>
          <p className="text-sm text-text-secondary mt-0.5">{doc.desc}</p>
        </div>
        <ChevronRight className={`w-6 h-6 text-text-muted transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-6 pt-2 border-t border-border/50"
          >
            {doc.content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
