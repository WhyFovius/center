import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, XCircle, Activity, Lock, RefreshCw, Target } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import AttackScenarioPlayer from './AttackScenarioPlayer';
import { getScenarioById } from '@/lib/attackScenarios';

interface Threat {
  id: number;
  type: string;
  source: string;
  target: string;
  status: 'blocked' | 'active' | 'investigating';
  severity: 'low' | 'medium' | 'high' | 'critical';
  time: string;
}

interface AttackLog {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  time: string;
}

const INITIAL_THREATS: Threat[] = [
  { id: 1, type: 'Фишинг', source: 'urgent.hr@protonmail.com', target: 'employee@company.ru', status: 'blocked', severity: 'high', time: '10:42' },
  { id: 2, type: 'Сканирование портов', source: '185.220.101.42', target: 'firewall.company.ru', status: 'blocked', severity: 'medium', time: '09:15' },
  { id: 3, type: 'Brute Force SSH', source: '91.234.99.15', target: 'server-03.company.ru', status: 'blocked', severity: 'critical', time: '08:30' },
  { id: 4, type: 'Подозрительный DNS', source: 'workstation-12', target: 'evil-c2.darknet.io', status: 'investigating', severity: 'high', time: '07:45' },
];

const ATTACK_MESSAGES: AttackLog[] = [
  { id: 1, message: 'Обнаружена входящая попытка фишинга', type: 'warning', time: '10:42:15' },
  { id: 2, message: 'Брандмауэр заблокировал IP 185.220.101.42', type: 'success', time: '10:42:16' },
  { id: 3, message: 'Сканирование портов: 1,024 попыток за 5 секунд', type: 'danger', time: '10:42:18' },
  { id: 4, message: 'IPS активировал правила блокировки', type: 'info', time: '10:42:19' },
  { id: 5, message: 'Атака отражена. Данные защищены.', type: 'success', time: '10:42:22' },
];

export default function SecurityCenter() {
  const theme = useGS(s => s.theme);
  const lang = useGS(s => s.lang);
  const completeTask = useGS(s => s.completeTask);
  const osTasks = useGS(s => s.osTasks);
  const T = (key: string) => t(lang, key);
  const isDark = theme === 'dark' || theme === 'bw';
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [showScenarioPlayer, setShowScenarioPlayer] = useState(false);

  const handleStartScenario = (sid: string) => {
    setScenarioId(sid);
    setShowScenarioPlayer(true);
  };

  const handleScenarioComplete = (success: boolean, _xpEarned: number) => {
    if (success && scenarioId) {
      completeTask(`scenario_${scenarioId}` as any);
    }
  };
  const [threats] = useState<Threat[]>(INITIAL_THREATS);
  const [logs, setLogs] = useState<AttackLog[]>(ATTACK_MESSAGES);
  const [shieldActive, setShieldActive] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [defenseLevel, setDefenseLevel] = useState(87);

  const severityColor = (s: string) => {
    switch (s) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#888';
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          completeTask('security_scan');
          setLogs(l => [...l, { id: Date.now(), message: `${T('osScanSystem')}: ${T('osProtected')}.`, type: 'success', time: new Date().toLocaleTimeString('ru-RU') }]);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const toggleShield = () => {
    const newShieldState = !shieldActive;
    setShieldActive(newShieldState);
    setDefenseLevel(newShieldState ? 100 : 45);
    if (newShieldState) {
      completeTask('security_defense');
    }
  };

  const blockedCount = threats.filter(t => t.status === 'blocked').length;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: isDark ? '#121212' : '#f8f9fa' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${shieldActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: shieldActive ? 'rgba(63,185,80,0.15)' : 'rgba(239,68,68,0.15)' }}>
            <Shield className={`w-5 h-5 ${shieldActive ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{T('osSecurity')}</h2>
            <p className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>{T('osLiveLog')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startScan} disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#ccc' : '#333' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? T('osScanning') : T('osScanSystem')}
          </button>
          {!osTasks.scenario_security_mass_attack && (
            <button onClick={() => handleStartScenario('security_mass_attack')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{ backgroundColor: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)', color: '#a78bfa' }}
            >
              <Target className="w-3.5 h-3.5" /> Сценарий
            </button>
          )}
          <button onClick={toggleShield}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${shieldActive ? 'text-green-400' : 'text-red-400'}`}
            style={{ backgroundColor: shieldActive ? 'rgba(63,185,80,0.15)' : 'rgba(239,68,68,0.15)' }}
          >
            <Lock className="w-3.5 h-3.5" />
            {shieldActive ? T('osProtected') : T('osActivateDefense')}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-2 p-3 shrink-0">
        {[
          { label: T('osDefenseLevel'), value: `${defenseLevel}%`, color: defenseLevel > 70 ? '#22c55e' : '#ef4444', icon: Shield },
          { label: T('osBlockedCount'), value: String(blockedCount), color: '#3fb950', icon: XCircle },
          { label: T('osActiveThreats'), value: String(threats.filter(t => t.status !== 'blocked').length), color: '#f59e0b', icon: AlertTriangle },
          { label: T('osScanSystem'), value: isScanning ? `${scanProgress}%` : T('osReady'), color: '#58a6ff', icon: Activity },
        ].map((stat, i) => (
          <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}>
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              <span className="text-[10px]" style={{ color: isDark ? '#888' : '#666' }}>{stat.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
            {isScanning && (
              <div className="w-full h-1 rounded-full mt-1" style={{ backgroundColor: isDark ? '#333' : '#e5e5e5' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${scanProgress}%`, backgroundColor: stat.color }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Threats table */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b shrink-0" style={{ backgroundColor: isDark ? '#1a1a1a' : '#fafafa', borderColor: isDark ? '#333' : '#e5e5e5' }}>
          <h3 className="text-xs font-bold" style={{ color: isDark ? '#ccc' : '#333' }}>Активные угрозы</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {threats.map(threat => (
              <motion.div key={threat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: severityColor(threat.severity) }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{threat.type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${severityColor(threat.severity)}20`, color: severityColor(threat.severity) }}>
                      {threat.severity}
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: isDark ? '#888' : '#666' }}>{threat.source} → {threat.target}</p>
                </div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                  threat.status === 'blocked' ? 'text-green-500' : threat.status === 'active' ? 'text-red-500' : 'text-yellow-500'
                }`} style={{ backgroundColor: threat.status === 'blocked' ? 'rgba(34,197,94,0.1)' : threat.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                  {threat.status === 'blocked' ? T('osProtected') : threat.status === 'active' ? T('osActiveThreats') : T('osScanning')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Live log */}
      <div className="border-t shrink-0" style={{ backgroundColor: isDark ? '#0c0c0c' : '#1e1e1e' }}>
        <div className="px-3 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono" style={{ color: '#888' }}>{T('osLiveLog')}</span>
        </div>
        <div className="h-24 overflow-y-auto px-3 pb-2 space-y-0.5 font-mono text-[10px]">
          {logs.map(log => (
            <div key={log.id} style={{ color: log.type === 'danger' ? '#ef4444' : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#22c55e' : '#58a6ff' }}>
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Attack Scenario Player */}
      <AnimatePresence>
        {showScenarioPlayer && scenarioId && (
          <AttackScenarioPlayer
            scenario={getScenarioById(scenarioId)!}
            onComplete={handleScenarioComplete}
            onClose={() => setShowScenarioPlayer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
