import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, RotateCcw, Home, Search, Lock, Unlock,
  ExternalLink, X, Plus, Globe, AlertTriangle, Shield, CheckCircle,
  Info, Link2, Globe2, Skull, Terminal, Zap, Bug
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { BrowserTab, UrlAnalysis, UrlIssue, InfectionLevel, InfectionEffect, BrowserState } from '../types';

interface Props {
  onCompleteTask?: (taskId: string) => void;
  onInfect?: () => void;
}

const KNOWN_SAFE_DOMAINS = [
  'google.com', 'wikipedia.org', 'habr.com', 'github.com',
  'youtube.com', 'reddit.com', 'duckduckgo.com', 'stackoverflow.com',
  'vk.com', 'telegram.org', 'yandex.ru', 'mail.ru'
];

const SUSPICIOUS_PATTERNS = [
  { pattern: /verify-secure/i, issue: 'Содержит "verify-secure" - типичный паттерн фишинга' },
  { pattern: /secure-portal/i, issue: 'Содержит "secure-portal" - подозрительный домен' },
  { pattern: /bank-secure/i, issue: 'Содержит "bank-secure" - имитация банковского сайта' },
  { pattern: /\.work$/i, issue: 'Домен .work часто используется мошенниками' },
  { pattern: /\-{2,}/, issue: 'Множественные дефисы - признак поддельного домена' },
];

const FAKE_SITES = {
  'bank-secure-login.com': {
    name: 'SecureBank',
    logo: '🏦',
    fakeFields: ['Логин', 'Пароль', 'Код из SMS'],
    phishingMessage: 'Введите данные для подтверждения личности',
    realUrl: 'sberbank.ru'
  },
  'center-invest-verify.secure-portal.work': {
    name: 'Центр Инвест',
    logo: '🏛️',
    fakeFields: ['Email', 'Пароль'],
    phishingMessage: 'Срочно подтвердите ваш аккаунт',
    realUrl: 'center-invest.ru'
  }
};

const INFECTION_EFFECTS: InfectionEffect[] = [
  // Level 1 - "Что-то не так"
  { id: 'lag_1', level: 1, type: 'glitch', title: 'Задержка', message: 'Система немного подвисает...', delay: 8000 },
  { id: 'tab_1', level: 1, type: 'tab_open', title: 'Новая вкладка', message: 'security-check-update.com', delay: 15000 },
  
  // Level 2 - "Подозрительно"
  { id: 'popup_1', level: 2, type: 'popup', title: '⚠️ Сессия истекла', message: 'Ваша сессия истекла. Введите пароль повторно.', delay: 5000 },
  { id: 'redirect_1', level: 2, type: 'redirect', title: 'Редирект', message: 'Перенаправление на другую страницу...', delay: 10000 },
  
  // Level 3 - "Взлом"
  { id: 'autofill_1', level: 3, type: 'autofill', title: 'Автозаполнение', message: 'Система вводит данные автоматически...', delay: 5000 },
  { id: 'autosubmit_1', level: 3, type: 'autosubmit', title: '⚠️ Форма отправлена', message: 'Данные отправлены без вашего участия!', delay: 12000 },
  
  // Level 4 - "Полная компрометация"
  { id: 'tabs_4', level: 4, type: 'tab_open', title: 'Множественные вкладки', message: 'Открываются подозрительные сайты', delay: 3000 },
  { id: 'popup_4', level: 4, type: 'popup', title: '🛡️ Антивирус', message: 'Обнаружено 47 вирусов! Отправьте SMS для активации.', delay: 8000 },
  { id: 'terminal_4', level: 4, type: 'tab_open', title: 'Терминал', message: 'cmd.exe -hacking_in_progress', delay: 15000 },
];

const PHISHING_URLS = [
  'system-check-security.net',
  'security-check-update.com',
  'free-wifi-portal.work',
  'bank-verification-urgent.com',
  'password-reset-require.net',
];

function analyzeUrl(url: string): UrlAnalysis {
  const issues: UrlIssue[] = [];
  let domain = '';
  let subdomain = '';
  let tld = '';

  try {
    const urlObj = new URL(url);
    const hostParts = urlObj.hostname.split('.');
    tld = hostParts.slice(-1)[0] || '';
    domain = hostParts.slice(-2, -1)[0] || '';
    subdomain = hostParts.slice(0, -2).join('.');
  } catch {
    return {
      isSecure: false,
      isFake: false,
      domain: url,
      tld: '',
      subdomain: '',
      issues: [{ type: 'suspicious_tld', severity: 'high', description: 'Некорректный URL' }],
      recommendation: 'Проверьте правильность адреса'
    };
  }

  if (!url.startsWith('https://')) {
    issues.push({
      type: 'http_used',
      severity: 'medium',
      description: 'Используется HTTP вместо HTTPS - данные могут быть перехвачены'
    });
  }

  for (const { pattern, issue } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      issues.push({
        type: 'typosquatting',
        severity: 'critical',
        description: issue
      });
    }
  }

  const fullDomain = subdomain ? `${subdomain}.${domain}.${tld}` : `${domain}.${tld}`;
  const isKnownSafe = KNOWN_SAFE_DOMAINS.some(d => fullDomain.includes(d));
  const isFake = url.includes('verify-secure') || url.includes('secure-portal') || url.includes('bank-secure');

  return {
    isSecure: url.startsWith('https://') && !isFake,
    isFake,
    domain: `${domain}.${tld}`,
    tld,
    subdomain,
    issues,
    recommendation: isFake
      ? '⚠️ Это поддельный сайт! Не вводите данные.'
      : isKnownSafe
        ? '✅ Сайт из доверенного списка'
        : issues.length > 0
          ? '⚠️ Будьте осторожны, проверьте сайт вручную'
          : '✅ Сайт выглядит безопасным'
  };
}

function getInfectionLevelIcon(level: InfectionLevel): React.ReactNode {
  switch (level) {
    case 1: return <Shield className="w-4 h-4 text-yellow-500" />;
    case 2: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 3: return <Bug className="w-4 h-4 text-red-500" />;
    case 4: return <Skull className="w-4 h-4 text-red-700 animate-pulse" />;
    default: return null;
  }
}

function InfectionStatusBar({ state, effects }: { state: BrowserState; effects: InfectionEffect[] }) {
  if (!state.isInfected) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="px-4 py-2 border-b flex items-center justify-between"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)'
      }}
    >
      <div className="flex items-center gap-3">
        {getInfectionLevelIcon(state.infectionLevel)}
        <div>
          <p className="text-xs font-bold text-red-500">
            {state.infectionLevel === 1 && '🟢 УРОВЕНЬ 1: Лёгкая компрометация'}
            {state.infectionLevel === 2 && '🟡 УРОВЕНЬ 2: Подозрительная активность'}
            {state.infectionLevel === 3 && '🔴 УРОВЕНЬ 3: Активный взлом'}
            {state.infectionLevel === 4 && '☠️ УРОВЕНЬ 4: Полная компрометация'}
          </p>
          <p className="text-[10px] text-red-400">
            Браузер ведёт себя странно... Возможно заражение.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {state.cursorLag && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
            ⚠️ Задержка курсора
          </span>
        )}
        <span className="text-[10px] text-red-400">
          Активных эффектов: {effects.length}
        </span>
      </div>
    </motion.div>
  );
}

function FakePopup({ effect, onClose }: { effect: InfectionEffect; onClose: () => void }) {
  const isAntivirus = effect.id.includes('popup_4');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
    >
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
          isAntivirus ? 'bg-green-900' : 'bg-red-900'
        }`}
      >
        <div className={`p-4 flex items-center gap-3 ${isAntivirus ? 'bg-green-800' : 'bg-red-800'}`}>
          {isAntivirus ? (
            <Shield className="w-8 h-8 text-green-300" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-300" />
          )}
          <div>
            <h3 className="font-bold text-white">{effect.title}</h3>
            <p className="text-sm text-white/80">{effect.message}</p>
          </div>
        </div>

        {isAntivirus ? (
          <div className="p-6">
            <div className="space-y-3 mb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <div className="flex-1 h-6 rounded bg-red-500/30" />
                  <span className="text-red-300 text-xs">TR:Ojan-{i}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 mb-4">
              <p className="text-yellow-300 text-sm text-center">
                ⚠️ Для активации защиты отправьте SMS на номер 8-800
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-600 text-white font-medium"
              >
                Отмена
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-green-500 text-white font-medium"
              >
                Отправить SMS
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-gray-600 text-white font-medium"
            >
              Закрыть
            </button>
            <button className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium">
              Войти
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function FakeTerminal() {
  const commands = [
    'C:\\> ipconfig',
    '   IPv4: 192.168.1.105',
    '   Subnet: 255.255.255.0',
    '',
    'C:\\> net user administrator /active:yes',
    'Команда выполнена успешно.',
    '',
    'C:\\> extract passwords...',
    '[████████████████████] 100%',
    '',
    'C:\\> sending_data_to_server.exe',
    '>>> Uploading: credentials.db',
    '>>> Uploading: cookies.json',
    '>>> Status: COMPLETE',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#333' }}>
        <span className="text-sm font-bold text-green-400">cmd.exe - hacking_in_progress</span>
        <span className="text-xs text-red-500 animate-pulse">● АКТИВЕН</span>
      </div>
      <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
        {commands.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={line.startsWith('>>>') ? 'text-yellow-400' : 'text-green-400'}
          >
            {line}
          </motion.p>
        ))}
        <motion.div
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-green-400 ml-1"
        />
      </div>
    </motion.div>
  );
}

function FakeSiteSimulator({ 
  siteKey, 
  url, 
  onCredentialsSubmitted 
}: { 
  siteKey: string; 
  url: string; 
  onCredentialsSubmitted?: () => void;
}) {
  const site = FAKE_SITES[siteKey as keyof typeof FAKE_SITES];
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [showWarning, setShowWarning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!site) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    onCredentialsSubmitted?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div className="p-3 flex items-center justify-between" style={{ backgroundColor: '#2d5a27' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{site.logo}</span>
          <span className="text-white font-bold">{site.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-300" />
          <span className="text-green-300 text-sm">Безопасное соединение</span>
        </div>
      </div>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-4 p-4 rounded-xl border-2 border-red-500 bg-red-50"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-600 mb-1">⚠️ Предупреждение безопасности</h3>
                <p className="text-sm text-red-700">
                  Этот сайт <strong>НЕ ЯВЛЯЕТСЯ</strong> официальным сайтом {site.name}.
                  Настоящий адрес: <strong>{site.realUrl}</strong>
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Введённые вами данные могли быть отправлены злоумышленникам.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-4 rounded-xl border-2 border-yellow-500 bg-yellow-50"
          >
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-600 mb-1">⚡ Данные перехвачены!</h3>
                <p className="text-sm text-yellow-700">
                  Ваши учётные данные отправлены злоумышленникам.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl">{site.logo}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{site.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{site.phishingMessage}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">https://{url.split('://')[1]?.split('/')[0]}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{site.fakeFields[0]}</label>
                <input
                  type="text"
                  value={credentials.login}
                  onChange={e => setCredentials(prev => ({ ...prev, login: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="Введите..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{site.fakeFields[1]}</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              {site.fakeFields[2] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{site.fakeFields[2]}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="000000"
                  />
                </div>
              )}
              <button
                className="w-full py-3 rounded-xl text-white font-medium transition"
                style={{ backgroundColor: '#2d5a27' }}
                onClick={handleSubmit}
                disabled={submitted}
              >
                {submitted ? 'Отправка...' : 'Войти'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Защищено SSL шифрованием</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BrowserApp({ onCompleteTask, onInfect }: Props) {
  const theme = useGS(s => s.theme);
  const lang = useGS(s => s.lang);
  const completeTask = useGS(s => s.completeTask);
  const isDark = theme === 'dark' || theme === 'bw';

  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab-1', title: 'Новая вкладка', url: '', loading: false, error: null }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlAnalysis, setShowUrlAnalysis] = useState(false);
  const [urlAnalysis, setUrlAnalysis] = useState<UrlAnalysis | null>(null);

  // Infection state
  const [infectionState, setInfectionState] = useState<BrowserState>({
    isInfected: false,
    infectionLevel: 0,
    infectionTime: 0,
    activeEffects: [],
    cursorLag: false,
    isGlitching: false
  });
  const [triggeredEffects, setTriggeredEffects] = useState<Set<string>>(new Set());
  const [activePopups, setActivePopups] = useState<InfectionEffect[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  
  const infectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const effectTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Start infection sequence
  const triggerInfection = useCallback((level: InfectionLevel = 1) => {
    if (infectionState.isInfected) return;

    setInfectionState(prev => ({
      ...prev,
      isInfected: true,
      infectionLevel: level,
      infectionTime: Date.now()
    }));
    onInfect?.();

    // Start effect timers
    const effectsForLevel = INFECTION_EFFECTS.filter(e => e.level <= level);
    effectsForLevel.forEach(effect => {
      const timer = setTimeout(() => {
        setTriggeredEffects(prev => {
          if (prev.has(effect.id)) return prev;
          const newSet = new Set(prev);
          newSet.add(effect.id);
          return newSet;
        });

        setInfectionState(prev => ({
          ...prev,
          infectionLevel: Math.max(prev.infectionLevel, effect.level),
          cursorLag: effect.level >= 2 || prev.cursorLag,
          isGlitching: effect.level >= 3 || prev.isGlitching
        }));

        switch (effect.type) {
          case 'tab_open':
            if (effect.id === 'terminal_4') {
              setShowTerminal(true);
              const newTabId = `tab-${Date.now()}`;
              setTabs(prev => [...prev, {
                id: newTabId,
                title: 'cmd.exe - АКТИВЕН',
                url: 'internal://terminal',
                loading: false,
                error: null,
                isFakeSite: true
              }]);
              setActiveTabId(newTabId);
            } else {
              const phishingUrl = PHISHING_URLS[Math.floor(Math.random() * PHISHING_URLS.length)];
              const newTabId = `tab-${Date.now()}`;
              setTabs(prev => [...prev, {
                id: newTabId,
                title: effect.message,
                url: `https://${phishingUrl}`,
                loading: false,
                error: null,
                isFakeSite: true
              }]);
            }
            break;
          case 'popup':
            setActivePopups(prev => [...prev, effect]);
            break;
          case 'autofill':
            // Auto-fill effect - just show notification
            break;
          case 'autosubmit':
            // Form auto-submit effect
            break;
        }
      }, effect.delay);

      effectTimersRef.current.set(effect.id, timer);
    });
  }, [infectionState.isInfected, onInfect]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      effectTimersRef.current.forEach(timer => clearTimeout(timer));
      if (infectionTimerRef.current) clearInterval(infectionTimerRef.current);
    };
  }, []);

  const createTab = () => {
    const id = `tab-${Date.now()}`;
    const newTab: BrowserTab = { id, title: 'Новая вкладка', url: '', loading: false, error: null };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
    setUrlInput('');
    setUrlAnalysis(null);
    setShowUrlAnalysis(false);
  };

  const closeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.url === 'internal://terminal') {
      setShowTerminal(false);
    }
    const newTabs = tabs.filter(t => t.id !== tabId);
    if (newTabs.length === 0) {
      createTab();
      return;
    }
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
      setUrlInput(newTabs[0].url);
    }
    setTabs(newTabs);
  };

  const navigate = useCallback((targetUrl: string, tabId?: string) => {
    const tid = tabId || activeTabId;
    let finalUrl = targetUrl.trim();
    if (!finalUrl) return;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(finalUrl);
      }
    }

    const analysis = analyzeUrl(finalUrl);
    setUrlAnalysis(analysis);

    if (analysis.isFake) {
      completeTask('browser_fake_site');
      onCompleteTask?.('browser_fake_site');
    }

    setTabs(prev => prev.map(t => t.id === tid ? {
      ...t,
      url: finalUrl,
      title: finalUrl,
      loading: false,
      error: null,
      isFakeSite: analysis.isFake
    } : t));
    setUrlInput(finalUrl);
  }, [activeTabId, completeTask, onCompleteTask]);

  const goHome = () => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      url: '',
      title: 'Новая вкладка',
      loading: false,
      error: null,
      isFakeSite: false
    } : t));
    setUrlInput('');
    setUrlAnalysis(null);
  };

  const isFakeSiteKey = activeTab.url
    ? Object.keys(FAKE_SITES).find(key => activeTab.url.includes(key))
    : null;

  const activeEffects = INFECTION_EFFECTS.filter(e => triggeredEffects.has(e.id));

  return (
    <div 
      className="flex flex-col h-full"
      style={{ 
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        filter: infectionState.isGlitching ? 'hue-rotate(5deg)' : 'none',
        transition: 'filter 0.3s'
      }}
    >
      {/* Tab bar */}
      <div className="flex items-end gap-0.5 px-2 pt-1.5 pb-0 overflow-x-auto"
        style={{ backgroundColor: isDark ? '#2a2a2a' : '#e8e8e8' }}
      >
        <AnimatePresence>
          {tabs.map(tab => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer min-w-0 max-w-48 text-xs ${
                tab.id === activeTabId
                  ? (isDark ? 'bg-[#1e1e1e]' : 'bg-white')
                  : (isDark ? 'bg-[#333] hover:bg-[#3a3a3a]' : 'bg-[#d8d8d8] hover:bg-[#d0d0d0]')
              } ${tab.url === 'internal://terminal' ? 'border-b-2 border-red-500' : ''}`}
              onClick={() => { setActiveTabId(tab.id); setUrlInput(tab.url); }}
            >
              {tab.isFakeSite ? (
                <AlertTriangle className="w-3 h-3 shrink-0 text-yellow-500" />
              ) : tab.loading ? (
                <RotateCcw className="w-3 h-3 animate-spin shrink-0" style={{ color: isDark ? '#ccc' : '#666' }} />
              ) : tab.url === 'internal://terminal' ? (
                <Terminal className="w-3 h-3 shrink-0 text-red-500" />
              ) : (
                <Globe className="w-3 h-3 shrink-0" style={{ color: isDark ? '#ccc' : '#666' }} />
              )}
              <span className={`truncate flex-1 ${
                tab.url === 'internal://terminal' ? 'text-red-400 font-bold' : ''
              }`} style={{ color: isDark ? '#e0e0e0' : '#333' }}>
                {tab.title}
              </span>
              <button onClick={e => { e.stopPropagation(); closeTab(tab.id); }} className="p-0.5 rounded hover:bg-black/10 shrink-0">
                <X className="w-3 h-3" style={{ color: isDark ? '#999' : '#666' }} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={createTab} className="p-1.5 rounded hover:bg-black/10 transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" style={{ color: isDark ? '#ccc' : '#666' }} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b"
        style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333' : '#e0e0e0' }}
      >
        <button className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30">
          <ArrowLeft className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30">
          <ArrowRight className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={goHome} className="p-1.5 rounded hover:bg-black/10">
          <Home className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button className="p-1.5 rounded hover:bg-black/10">
          <RotateCcw className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>

        <div className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ 
            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', 
            border: `1px solid ${isDark ? '#444' : '#ddd'}`,
            animation: infectionState.cursorLag ? 'cursorLag 0.5s infinite' : 'none'
          }}
        >
          {activeTab.url && (
            activeTab.url.startsWith('https://') && !activeTab.isFakeSite
              ? <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
              : activeTab.url.startsWith('https://')
                ? <Lock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                : <Unlock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          )}
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(urlInput); }}
            placeholder="Введите URL или поисковый запрос..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: isDark ? '#e0e0e0' : '#333' }}
          />
          {activeTab.url && (
            <button
              onClick={() => setShowUrlAnalysis(!showUrlAnalysis)}
              className="p-0.5 rounded hover:bg-black/10"
              title="Анализ URL"
            >
              <Link2 className={`w-3.5 h-3.5 ${urlAnalysis?.isFake ? 'text-red-500' : 'text-gray-400'}`} />
            </button>
          )}
        </div>

        <button className="p-1.5 rounded hover:bg-black/10" title="Открыть в новом окне">
          <ExternalLink className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>

        {/* Dev controls for testing infection */}
        {!infectionState.isInfected && (
          <button
            onClick={() => triggerInfection(1)}
            className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
            title="Тест: Запустить заражение (уровень 1)"
          >
            <Bug className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>

      {/* Infection status bar */}
      <InfectionStatusBar state={infectionState} effects={activeEffects} />

      {/* URL Analysis panel */}
      <AnimatePresence>
        {showUrlAnalysis && urlAnalysis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b"
            style={{ backgroundColor: isDark ? '#252525' : '#fafafa', borderColor: isDark ? '#333' : '#e0e0e0' }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {urlAnalysis.isFake ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : urlAnalysis.isSecure ? (
                  <Shield className="w-5 h-5 text-green-500" />
                ) : (
                  <Info className="w-5 h-5 text-yellow-500" />
                )}
                <span className={`font-bold ${urlAnalysis.isFake ? 'text-red-500' : urlAnalysis.isSecure ? 'text-green-500' : 'text-yellow-500'}`}>
                  {urlAnalysis.recommendation}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? '#333' : '#fff' }}>
                  <p className="text-[10px] text-gray-500 mb-1">Домен</p>
                  <p className="text-sm font-mono" style={{ color: urlAnalysis.isFake ? '#ef4444' : 'inherit' }}>
                    {urlAnalysis.domain}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? '#333' : '#fff' }}>
                  <p className="text-[10px] text-gray-500 mb-1">Поддомен</p>
                  <p className="text-sm font-mono text-gray-400">
                    {urlAnalysis.subdomain || '(нет)'}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: isDark ? '#333' : '#fff' }}>
                  <p className="text-[10px] text-gray-500 mb-1">TLD</p>
                  <p className="text-sm font-mono">.{urlAnalysis.tld}</p>
                </div>
              </div>

              {urlAnalysis.issues.length > 0 && (
                <div className="space-y-2">
                  {urlAnalysis.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg" style={{
                      backgroundColor: isDark ? '#333' : '#fff',
                      borderLeft: `3px solid ${
                        issue.severity === 'critical' ? '#ef4444' :
                        issue.severity === 'high' ? '#f97316' :
                        issue.severity === 'medium' ? '#eab308' : '#22c55e'
                      }`
                    }}>
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        {!activeTab.url ? (
          <div className="flex flex-col items-center justify-center h-full p-6"
            style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg w-full">
              <h1 className="text-4xl font-bold mb-2" style={{ color: isDark ? '#e0e0e0' : '#333' }}>
                os<span style={{ color: infectionState.isInfected ? '#ef4444' : '#3b82f6' }}>Browser</span>
              </h1>
              <p className="text-sm mb-6" style={{ color: isDark ? '#888' : '#666' }}>
                {infectionState.isInfected ? '⚠️ Браузер скомпрометирован' : 'Безопасный браузинг'}
              </p>

              <div className="flex items-center gap-2 px-4 py-3 rounded-full mb-6"
                style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', border: `1px solid ${isDark ? '#444' : '#ddd'}` }}
              >
                <Search className="w-4 h-4" style={{ color: isDark ? '#888' : '#999' }} />
                <input
                  placeholder="Поиск или URL..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: isDark ? '#e0e0e0' : '#333' }}
                  onKeyDown={e => { if (e.key === 'Enter') navigate((e.target as HTMLInputElement).value); }}
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-blue-400">osBrowser автоматически анализирует URL на признаки фишинга</span>
              </div>

              {infectionState.isInfected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 rounded-xl border-2 border-red-500/50 bg-red-500/10"
                >
                  <p className="text-sm text-red-400 font-medium">
                    🚨 ВНИМАНИЕ: Обнаружена подозрительная активность
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    Браузер начал проявлять несанкционированное поведение
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : activeTab.url === 'internal://terminal' ? (
          <FakeTerminal />
        ) : activeTab.isFakeSite && isFakeSiteKey ? (
          <FakeSiteSimulator 
            siteKey={isFakeSiteKey} 
            url={activeTab.url}
            onCredentialsSubmitted={() => triggerInfection(2)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
            <Globe2 className="w-16 h-16 mb-4 opacity-50" style={{ color: isDark ? '#666' : '#999' }} />
            <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>
              Содержимое не может быть отображено во встроенном режиме
            </p>
            <p className="text-xs mt-1" style={{ color: isDark ? '#666' : '#999' }}>
              URL: {activeTab.url}
            </p>
          </div>
        )}
      </div>

      {/* Active popups */}
      <AnimatePresence>
        {activePopups.map((popup) => (
          <FakePopup
            key={popup.id}
            effect={popup}
            onClose={() => {
              setActivePopups(prev => prev.filter(p => p.id !== popup.id));
              if (popup.level >= 3) {
                triggerInfection(popup.level);
              }
            }}
          />
        ))}
      </AnimatePresence>

      <style>{`
        @keyframes cursorLag {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
