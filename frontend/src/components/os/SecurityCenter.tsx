import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Activity,
  Globe, Server, Lock, Unlock, Eye, Zap, RefreshCw, X
} from 'lucide-react';
import { useGS } from '@/store/useGS';

interface Threat {
  id: string;
  type: string;
  source: string;
  target: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  blocked: boolean;
}

const ATTACK_SOURCES = [
  { country: 'Китай', city: 'Шанхай', ip: '116.31.116.XX' },
  { country: 'Россия', city: 'Москва', ip: '95.142.34.XX' },
  { country: 'США', city: 'Нью-Йорк', ip: '104.244.72.XX' },
  { country: 'Бразилия', city: 'Сан-Паулу', ip: '177.54.12.XX' },
  { country: 'Германия', city: 'Берлин', ip: '46.101.45.XX' },
  { country: 'Нидерланды', city: 'Амстердам', ip: '188.166.78.XX' },
  { country: 'Южная Корея', city: 'Сеул', ip: '211.234.99.XX' },
  { country: 'Иран', city: 'Тегеран', ip: '5.160.234.XX' },
];

const ATTACK_TYPES = [
  'SQL Injection', 'XSS Attack', 'Brute Force', 'DDoS',
  'Phishing', 'Ransomware', 'Port Scan', 'MITM',
  'DNS Spoofing', 'Zero-Day Exploit',
];

const TARGETS = [
  'Web Server :443', 'DB Server :5432', 'Mail Server :25',
  'Auth Server :8080', 'File Server :445', 'API Gateway :3000',
];

const SEVERITY_COLORS: Record<string, string> = {
  low: 'text-blue-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-500',
};

const SEVERITY_BG: Record<string, string> = {
  low: 'bg-blue-400/20',
  medium: 'bg-yellow-400/20',
  high: 'bg-orange-400/20',
  critical: 'bg-red-500/20',
};

function generateThreat(): Threat {
  const src = ATTACK_SOURCES[Math.floor(Math.random() * ATTACK_SOURCES.length)];
  return {
    id: `threat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    source: `${src.country}, ${src.city} (${src.ip})`,
    target: TARGETS[Math.floor(Math.random() * TARGETS.length)],
    severity: (['low', 'medium', 'high', 'critical'] as const)[Math.floor(Math.random() * 10 < 2 ? 3 : Math.floor(Math.random() * 3))],
    timestamp: Date.now(),
    blocked: Math.random() > 0.25,
  };
}

export default function SecurityCenter() {
  const shield = useGS(s => s.shield);
  const energy = useGS(s => s.energy);
  const setShield = useGS(s => s.setShield);
  const setEnergy = useGS(s => s.setEnergy);

  const [threats, setThreats] = useState<Threat[]>([]);
  const [totalBlocked, setTotalBlocked] = useState(1247);
  const [protectionActive, setProtectionActive] = useState(true);
  const [networkIsolated, setNetworkIsolated] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [shieldAnim, setShieldAnim] = useState(false);
  const [recentIncidents, setRecentIncidents] = useState<Array<{ msg: string; time: string }>>([
    { msg: 'Обнаружена попытка SQL-инъекции', time: '2 мин назад' },
    { msg: 'Блокировка brute-force на SSH', time: '5 мин назад' },
    { msg: 'Подозрительный DNS-запрос', time: '12 мин назад' },
  ]);

  // Generate threats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (protectionActive) {
        const newThreat = generateThreat();
        setThreats(prev => [newThreat, ...prev].slice(0, 15));
        if (newThreat.blocked) {
          setTotalBlocked(prev => prev + 1);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [protectionActive]);

  // Initial threats
  useEffect(() => {
    const initial = Array.from({ length: 5 }, generateThreat);
    setThreats(initial);
  }, []);

  const handleActivateProtection = useCallback(() => {
    setProtectionActive(prev => !prev);
    setShieldAnim(true);
    setTimeout(() => setShieldAnim(false), 2000);
    if (!protectionActive) {
      setShield(prev => Math.min(100, prev + 15));
      setRecentIncidents(prev => [{ msg: 'Защита активирована', time: 'только что' }, ...prev].slice(0, 10));
    } else {
      setRecentIncidents(prev => [{ msg: 'Защита деактивирована', time: 'только что' }, ...prev].slice(0, 10));
    }
  }, [protectionActive, setShield]);

  const handleIsolateNetwork = useCallback(() => {
    setNetworkIsolated(prev => !prev);
    if (!networkIsolated) {
      setRecentIncidents(prev => [{ msg: 'Сеть изолирована', time: 'только что' }, ...prev].slice(0, 10));
    } else {
      setRecentIncidents(prev => [{ msg: 'Сеть подключена', time: 'только что' }, ...prev].slice(0, 10));
    }
  }, [networkIsolated]);

  const handleScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setRecentIncidents(prev => [{ msg: 'Сканирование завершено — угроз не обнаружено', time: 'только что' }, ...prev].slice(0, 10));
          return 0;
        }
        return prev + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [scanning]);

  const blockedCount = threats.filter(t => t.blocked).length;
  const activeThreats = threats.filter(t => !t.blocked).length;
  const criticalThreats = threats.filter(t => t.severity === 'critical' && !t.blocked).length;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={shieldAnim ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.6 }}
          >
            {protectionActive ? (
              <ShieldCheck className="w-7 h-7 text-green-400" />
            ) : (
              <ShieldAlert className="w-7 h-7 text-red-400" />
            )}
          </motion.div>
          <div>
            <h1 className="text-base font-bold">Центр безопасности</h1>
            <p className="text-[10px] text-white/50">ShieldOps Security Monitor v2.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${protectionActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-white/60">{protectionActive ? 'Защита активна' : 'Защита отключена'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        <StatCard icon={<Shield className="w-4 h-4" />} label="Заблокировано" value={totalBlocked.toLocaleString()} color="text-green-400" />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Активных угроз" value={activeThreats} color={activeThreats > 0 ? 'text-red-400' : 'text-green-400'} />
        <StatCard icon={<Lock className="w-4 h-4" />} label="Уровень защиты" value={`${shield}%`} color={shield > 60 ? 'text-green-400' : shield > 30 ? 'text-yellow-400' : 'text-red-400'} />
        <StatCard icon={<Zap className="w-4 h-4" />} label="Энергия" value={`${energy}%`} color={energy > 60 ? 'text-blue-400' : 'text-orange-400'} />
      </div>

      {/* Shield Progress */}
      <div className="px-4 py-2">
        <div className="flex justify-between text-[10px] text-white/50 mb-1">
          <span>Прочность щита</span>
          <span>{shield}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: shield > 60 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : shield > 30 ? 'linear-gradient(90deg, #eab308, #facc15)' : 'linear-gradient(90deg, #ef4444, #f87171)',
            }}
            animate={{ width: `${shield}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Attack Map */}
      <div className="px-4 py-2">
        <div className="text-[10px] text-white/50 mb-2 flex items-center gap-1.5">
          <Globe className="w-3 h-3" />
          Карта атак в реальном времени
        </div>
        <div className="relative h-36 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          {/* World map simplified */}
          <svg viewBox="0 0 400 150" className="w-full h-full opacity-20">
            <ellipse cx="100" cy="70" rx="40" ry="30" fill="none" stroke="white" strokeWidth="0.5" />
            <ellipse cx="200" cy="60" rx="60" ry="40" fill="none" stroke="white" strokeWidth="0.5" />
            <ellipse cx="320" cy="80" rx="30" ry="25" fill="none" stroke="white" strokeWidth="0.5" />
            <ellipse cx="280" cy="110" rx="25" ry="20" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>

          {/* Server center */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-8 h-8 bg-green-400/30 rounded-full flex items-center justify-center border border-green-400/50">
              <Server className="w-4 h-4 text-green-400" />
            </div>
          </motion.div>

          {/* Attack lines */}
          <AnimatePresence>
            {threats.slice(0, 6).map((threat, i) => {
              const angle = (i / 6) * Math.PI * 2 + Date.now() / 5000;
              const startX = 200 + Math.cos(angle) * 160;
              const startY = 75 + Math.sin(angle) * 60;
              return (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: threat.blocked ? 0.4 : 0.8 }}
                  exit={{ opacity: 0 }}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    left: startX,
                    top: startY,
                    backgroundColor: threat.blocked ? '#22c55e' : threat.severity === 'critical' ? '#ef4444' : '#f59e0b',
                  }}
                >
                  {threat.blocked && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid #22c55e' }}
                      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Shield ring */}
          {protectionActive && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-green-400/30"
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 grid grid-cols-3 gap-2">
        <ActionButton
          icon={protectionActive ? <ShieldCheck className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          label={protectionActive ? 'Защита ON' : 'Активировать'}
          active={protectionActive}
          onClick={handleActivateProtection}
          color="green"
        />
        <ActionButton
          icon={networkIsolated ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          label={networkIsolated ? 'Изолирована' : 'Изолировать сеть'}
          active={networkIsolated}
          onClick={handleIsolateNetwork}
          color="orange"
        />
        <ActionButton
          icon={<RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />}
          label={scanning ? `Сканирование ${scanProgress}%` : 'Сканировать'}
          active={scanning}
          onClick={handleScan}
          color="blue"
        />
      </div>

      {/* Scan Progress */}
      {scanning && (
        <div className="px-4 py-1">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-blue-400 rounded-full" animate={{ width: `${scanProgress}%` }} />
          </div>
        </div>
      )}

      {/* Active Threats List */}
      <div className="flex-1 px-4 py-2 min-h-0">
        <div className="text-[10px] text-white/50 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            Активные угрозы ({threats.length})
          </span>
          <span className="text-red-400">{criticalThreats > 0 && `${criticalThreats} критических`}</span>
        </div>
        <div className="space-y-1.5 overflow-y-auto max-h-40">
          <AnimatePresence>
            {threats.slice(0, 10).map(threat => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] ${SEVERITY_BG[threat.severity]} border border-white/5`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {threat.blocked ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{threat.type}</p>
                    <p className="text-[9px] text-white/40 truncate">{threat.source} → {threat.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-semibold ${SEVERITY_COLORS[threat.severity]}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-white/30">
                    {new Date(threat.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="px-4 py-2 border-t border-white/10">
        <div className="text-[10px] text-white/50 mb-2 flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          Последние инциденты
        </div>
        <div className="space-y-1">
          {recentIncidents.slice(0, 4).map((inc, i) => (
            <div key={i} className="flex justify-between text-[10px] text-white/60">
              <span className="truncate flex-1">{inc.msg}</span>
              <span className="text-white/30 ml-2 flex-shrink-0">{inc.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
      <div className={`flex items-center gap-1 mb-0.5 ${color}`}>
        {icon}
      </div>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[9px] text-white/40">{label}</p>
    </div>
  );
}

function ActionButton({ icon, label, active, onClick, color }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; color: string }) {
  const colorMap: Record<string, string> = {
    green: active ? 'bg-green-500/20 border-green-400/40 text-green-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-green-500/10',
    orange: active ? 'bg-orange-500/20 border-orange-400/40 text-orange-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-orange-500/10',
    blue: active ? 'bg-blue-500/20 border-blue-400/40 text-blue-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-blue-500/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[10px] transition-colors ${colorMap[color]}`}
    >
      {icon}
      <span className="leading-tight text-center">{label}</span>
    </motion.button>
  );
}
