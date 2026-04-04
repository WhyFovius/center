import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Server, Lock, CheckCircle, XCircle,
  Activity, Zap, Globe, Terminal
} from 'lucide-react';
import { useGS } from '@/store/useGS';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'attack' | 'block' | 'info' | 'warning' | 'success';
}

interface AttackParticle {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  blocked: boolean;
  progress: number;
}

const ATTACK_MESSAGES = {
  attack: [
    'Обнаружена попытка SQL-инъекции на порт 443',
    'XSS-атака выявлена на веб-сервере',
    'Brute Force подбор пароля к SSH',
    'DDoS-трафик превышает 10 Гбит/с',
    'Попытка эксплуатации уязвимости CVE-2024-XXXX',
    'Фишинговая рассылка на адреса сотрудников',
    'Сканирование портов из внешней сети',
    'Подозрительная активность на DNS-сервере',
  ],
  block: [
    'Брандмауэр заблокировал входящее соединение',
    'IPS предотвратил попытку эксплуатации',
    'WASP-фильтр отбросил вредоносный запрос',
    'Антивирус обезвредил вредоносный файл',
    'Правило IDS: атака перехвачена',
  ],
  success: [
    'Данные защищены шифрованием AES-256',
    'Сертификаты TLS обновлены',
    'Бэкап критических данных создан',
    'Все системы работают штатно',
  ],
  warning: [
    'Повышенная нагрузка на сервер авторизации',
    'Аномальный трафик из подсети 10.0.3.X',
    'Истечение срока SSL-сертификата через 3 дня',
  ],
  info: [
    'Сканирование завершено: угроз не обнаружено',
    'Обновление сигнатур антивируса установлено',
    'Мониторинг активности запущен',
  ],
};

export default function AttackEmulator() {
  const shield = useGS(s => s.shield);
  const energy = useGS(s => s.energy);
  const setShield = useGS(s => s.setShield);
  const setEnergy = useGS(s => s.setEnergy);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [particles, setParticles] = useState<AttackParticle[]>([]);
  const [attacksBlocked, setAttacksBlocked] = useState(0);
  const [attacksTotal, setAttacksTotal] = useState(0);
  const [shieldPulse, setShieldPulse] = useState(false);
  const [currentAttack, setCurrentAttack] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type,
    };
    setLogs(prev => [...prev.slice(-50), entry]);
  }, []);

  const spawnAttack = useCallback(() => {
    const id = `atk-${Date.now()}`;
    const blocked = Math.random() < (shield / 100);
    const particle: AttackParticle = {
      id,
      startX: Math.random() * 80 + 10,
      startY: Math.random() * 30 + 5,
      targetX: 50,
      targetY: 70,
      blocked,
      progress: 0,
    };

    setParticles(prev => [...prev, particle]);
    setAttacksTotal(prev => prev + 1);

    const attackMsg = ATTACK_MESSAGES.attack[Math.floor(Math.random() * ATTACK_MESSAGES.attack.length)];
    setCurrentAttack(attackMsg);

    // Animate particle
    const animInterval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        if (p.id !== id) return p;
        const newProgress = p.progress + 5;
        if (newProgress >= 100) {
          clearInterval(animInterval);
          if (p.blocked) {
            setAttacksBlocked(prev => prev + 1);
            const blockMsg = ATTACK_MESSAGES.block[Math.floor(Math.random() * ATTACK_MESSAGES.block.length)];
            addLog('block', blockMsg);
            setShieldPulse(true);
            setTimeout(() => setShieldPulse(false), 1000);
            setShield(prev => Math.min(100, prev + 1));
          } else {
            addLog('attack', `АТАКА УСПЕШНА: ${attackMsg}`);
            setEnergy(prev => Math.max(0, prev - 3));
            setShield(prev => Math.max(0, prev - 5));
          }
          setCurrentAttack(null);
          return { ...p, progress: 100 };
        }
        return { ...p, progress: newProgress };
      }).filter(p => p.progress < 100));
    }, 80);
  }, [shield, addLog, setShield, setEnergy]);

  const startEmulation = useCallback(() => {
    setRunning(true);
    setLogs([]);
    setParticles([]);
    setAttacksBlocked(0);
    setAttacksTotal(0);
    addLog('info', 'Эмуляция атаки запущена');
    addLog('info', 'Мониторинг всех каналов связи активен');

    intervalRef.current = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.5) {
        spawnAttack();
      } else if (rand < 0.7) {
        const msg = ATTACK_MESSAGES.info[Math.floor(Math.random() * ATTACK_MESSAGES.info.length)];
        addLog('info', msg);
      } else if (rand < 0.85) {
        const msg = ATTACK_MESSAGES.warning[Math.floor(Math.random() * ATTACK_MESSAGES.warning.length)];
        addLog('warning', msg);
      } else {
        const msg = ATTACK_MESSAGES.success[Math.floor(Math.random() * ATTACK_MESSAGES.success.length)];
        addLog('success', msg);
        setShield(prev => Math.min(100, prev + 2));
      }
    }, 1500);
  }, [addLog, spawnAttack, setShield]);

  const stopEmulation = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addLog('info', `Эмуляция остановлена. Заблокировано: ${attacksBlocked}/${attacksTotal}`);
  }, [attacksBlocked, attacksTotal, addLog]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const blockRate = attacksTotal > 0 ? Math.round((attacksBlocked / attacksTotal) * 100) : 100;

  return (
    <div className="h-full flex flex-col bg-[#06060b] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${running ? 'text-red-400 animate-pulse' : 'text-white/40'}`} />
          <h1 className="text-sm font-bold">Эмуляция атак</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={running ? stopEmulation : startEmulation}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            running
              ? 'bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
          }`}
        >
          {running ? 'Остановить' : 'Запустить'}
        </motion.button>
      </div>

      {/* Visualization Area */}
      <div className="relative h-48 mx-4 mt-3 mb-2 border border-white/10 rounded-lg overflow-hidden bg-gradient-to-b from-[#0a0a15] to-[#06060b]">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        {/* Server center */}
        <motion.div
          className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 z-10"
          animate={shieldPulse ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            {/* Shield ring */}
            <motion.div
              className="absolute inset-0 -m-4 rounded-full border-2"
              style={{ borderColor: shield > 50 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Server className="w-7 h-7 text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Attack sources */}
        <div className="absolute top-3 left-3 flex items-center gap-1 text-[9px] text-white/40">
          <Globe className="w-3 h-3" />
          <span>Источники атак</span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-white/40">
          <Shield className="w-3 h-3 text-green-400" />
          <span>Цель: ZeroCorp Server</span>
        </div>

        {/* Source points */}
        {[15, 35, 65, 85].map((x, i) => (
          <motion.div
            key={i}
            className="absolute top-8 w-2 h-2 rounded-full bg-red-400/60"
            style={{ left: `${x}%` }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}
          />
        ))}

        {/* Attack particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 rounded-full z-20"
              style={{
                left: `${p.startX}%`,
                top: `${p.startY}%`,
              }}
              animate={{
                left: `${p.startX + (p.targetX - p.startX) * (p.progress / 100)}%`,
                top: `${p.startY + (p.targetY - p.startY) * (p.progress / 100)}%`,
                backgroundColor: p.blocked ? '#22c55e' : '#ef4444',
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.05 }}
            >
              {p.blocked && (
                <motion.div
                  className="absolute inset-0 -m-1 rounded-full"
                  style={{ border: '1px solid #22c55e' }}
                  animate={{ scale: [1, 3], opacity: [0.8, 0] }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Connection lines */}
        {running && particles.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
            {particles.map(p => (
              <line
                key={`line-${p.id}`}
                x1={`${p.startX}%`}
                y1={`${p.startY}%`}
                x2={`${p.startX + (p.targetX - p.startX) * (p.progress / 100)}%`}
                y2={`${p.startY + (p.targetY - p.startY) * (p.progress / 100)}%`}
                stroke={p.blocked ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            ))}
          </svg>
        )}

        {/* Current attack display */}
        <AnimatePresence>
          {currentAttack && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-2 left-2 right-2 bg-red-500/10 border border-red-400/20 rounded px-2 py-1 text-[10px]"
            >
              <span className="text-red-400 font-semibold">⚠ Атака: </span>
              <span className="text-white/70">{currentAttack}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2">
        <div className="bg-white/5 rounded-md p-2 text-center border border-white/10">
          <p className="text-lg font-bold text-white">{attacksTotal}</p>
          <p className="text-[9px] text-white/40">Всего атак</p>
        </div>
        <div className="bg-white/5 rounded-md p-2 text-center border border-white/10">
          <p className="text-lg font-bold text-green-400">{attacksBlocked}</p>
          <p className="text-[9px] text-white/40">Заблокировано</p>
        </div>
        <div className="bg-white/5 rounded-md p-2 text-center border border-white/10">
          <p className="text-lg font-bold text-blue-400">{blockRate}%</p>
          <p className="text-[9px] text-white/40">Эффективность</p>
        </div>
        <div className="bg-white/5 rounded-md p-2 text-center border border-white/10">
          <p className="text-lg font-bold text-ci-green">{shield}%</p>
          <p className="text-[9px] text-white/40">Щит</p>
        </div>
      </div>

      {/* Protection Progress Bar */}
      <div className="px-4 py-1">
        <div className="flex justify-between text-[9px] text-white/40 mb-0.5">
          <span>Прогресс защиты</span>
          <span>{blockRate}% заблокировано</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}
            animate={{ width: `${blockRate}%` }}
          />
        </div>
      </div>

      {/* Event Log */}
      <div className="flex-1 mx-4 mt-2 mb-3 min-h-0 flex flex-col">
        <div className="flex items-center gap-1.5 text-[10px] text-white/40 mb-1">
          <Terminal className="w-3 h-3" />
          <span>Лог событий</span>
        </div>
        <div
          ref={logRef}
          className="flex-1 overflow-y-auto font-mono text-[10px] bg-black/40 rounded-lg border border-white/5 p-2 space-y-0.5"
        >
          {logs.length === 0 && (
            <p className="text-white/20 text-center py-4">Нажмите "Запустить" для начала эмуляции</p>
          )}
          <AnimatePresence>
            {logs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2"
              >
                <span className="text-white/20 flex-shrink-0">[{log.timestamp}]</span>
                {log.type === 'attack' && <XCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />}
                {log.type === 'block' && <Shield className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />}
                {log.type === 'success' && <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />}
                {log.type === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />}
                {log.type === 'info' && <Zap className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5" />}
                <span className={
                  log.type === 'attack' ? 'text-red-300' :
                  log.type === 'block' ? 'text-green-300' :
                  log.type === 'success' ? 'text-blue-300' :
                  log.type === 'warning' ? 'text-yellow-300' :
                  'text-white/50'
                }>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
