import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, Activity, Terminal, Wifi } from 'lucide-react';
import { useGS } from '@/store/useGS';

interface AttackNode {
  id: number;
  x: number;
  y: number;
  type: 'attacker' | 'firewall' | 'server' | 'database';
  label: string;
  status: 'safe' | 'under_attack' | 'blocked' | 'compromised';
}

interface AttackLine {
  from: number;
  to: number;
  active: boolean;
  blocked: boolean;
}

interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

const INITIAL_NODES: AttackNode[] = [
  { id: 0, x: 60, y: 200, type: 'attacker', label: '185.220.101.42', status: 'safe' },
  { id: 1, x: 60, y: 350, type: 'attacker', label: '91.234.99.15', status: 'safe' },
  { id: 2, x: 280, y: 275, type: 'firewall', label: 'Firewall', status: 'safe' },
  { id: 3, x: 500, y: 150, type: 'server', label: 'Web Server', status: 'safe' },
  { id: 4, x: 500, y: 275, type: 'server', label: 'Mail Server', status: 'safe' },
  { id: 5, x: 500, y: 400, type: 'database', label: 'Database', status: 'safe' },
];

const INITIAL_LINES: AttackLine[] = [
  { from: 0, to: 2, active: false, blocked: false },
  { from: 1, to: 2, active: false, blocked: false },
  { from: 2, to: 3, active: false, blocked: false },
  { from: 2, to: 4, active: false, blocked: false },
  { from: 2, to: 5, active: false, blocked: false },
];

const ATTACK_SEQUENCE: LogEntry[] = [
  { id: 1, time: '10:42:01', message: 'Обнаружено сканирование портов с 185.220.101.42', type: 'warning' },
  { id: 2, time: '10:42:03', message: 'Firewall: заблокировано 1,024 входящих подключений', type: 'success' },
  { id: 3, time: '10:42:05', message: 'Входящий фишинг: urgent.hr@protonmail.com → employee@company.ru', type: 'danger' },
  { id: 4, time: '10:42:07', message: 'SPF: FAIL | DKIM: none — письмо заблокировано', type: 'success' },
  { id: 5, time: '10:42:09', message: 'Brute Force SSH с 91.234.99.15 — 50 попыток/сек', type: 'danger' },
  { id: 6, time: '10:42:11', message: 'IPS активировал: IP добавлен в чёрный список', type: 'success' },
  { id: 7, time: '10:42:13', message: 'Все серверы проверены — данные защищены', type: 'success' },
  { id: 8, time: '10:42:15', message: 'Атака отражена. Уровень защиты: 94%', type: 'info' },
];

export default function AttackEmulator({ onClose }: { onClose?: () => void }) {
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark' || theme === 'bw';
  const [nodes, setNodes] = useState<AttackNode[]>(INITIAL_NODES);
  const [lines, setLines] = useState<AttackLine[]>(INITIAL_LINES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'attacking' | 'defending' | 'done'>('idle');
  const [defenseLevel, setDefenseLevel] = useState(100);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'idle') return;
    const t = setTimeout(() => startAttack(), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startAttack = () => {
    setPhase('scanning');
    setNodes(prev => prev.map(n => n.id === 0 || n.id === 1 ? { ...n, status: 'under_attack' } : n));
    setLines(prev => prev.map(l => (l.from === 0 || l.from === 1) ? { ...l, active: true } : l));

    setTimeout(() => {
      setPhase('attacking');
      setNodes(prev => prev.map(n => n.id === 2 ? { ...n, status: 'under_attack' } : n));
      setDefenseLevel(87);

      ATTACK_SEQUENCE.forEach((log, i) => {
        setTimeout(() => {
          setLogs(prev => [...prev, log]);

          if (i === 0) {
            setLines(prev => prev.map(l => l.from === 0 ? { ...l, active: true } : l));
          } else if (i === 1) {
            setLines(prev => prev.map(l => l.from === 0 ? { ...l, blocked: true } : l));
            setNodes(prev => prev.map(n => n.id === 0 ? { ...n, status: 'blocked' } : n));
          } else if (i === 2) {
            setLines(prev => prev.map(l => l.from === 1 && l.to === 2 ? { ...l, active: true } : l));
            setDefenseLevel(72);
          } else if (i === 3) {
            setNodes(prev => prev.map(n => n.id === 1 ? { ...n, status: 'blocked' } : n));
            setLines(prev => prev.map(l => l.from === 1 ? { ...l, blocked: true } : l));
            setDefenseLevel(85);
          } else if (i === 5) {
            setDefenseLevel(94);
          } else if (i === 7) {
            setPhase('done');
            setNodes(prev => prev.map(n => ({ ...n, status: n.id === 0 || n.id === 1 ? 'blocked' : 'safe' })));
            setTimeout(() => onClose?.(), 2000);
          }
        }, i * 1200);
      });
    }, 1500);
  };

  const nodeColor = (node: AttackNode) => {
    switch (node.status) {
      case 'under_attack': return '#ef4444';
      case 'blocked': return '#22c55e';
      case 'compromised': return '#dc2626';
      default: return node.type === 'attacker' ? '#f59e0b' : node.type === 'firewall' ? '#3b82f6' : '#8b5cf6';
    }
  };

  const nodeIcon = (type: string) => {
    switch (type) {
      case 'attacker': return <Wifi className="w-4 h-4" />;
      case 'firewall': return <Shield className="w-4 h-4" />;
      case 'server': return <Server className="w-4 h-4" />;
      case 'database': return <Terminal className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: isDark ? '#0a0a0f' : '#0c1222' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ borderColor: '#1a1a2e' }}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Attack Simulator — Live</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: defenseLevel > 70 ? '#22c55e' : '#ef4444' }}>Защита: {defenseLevel}%</span>
          <span className="text-gray-400">Фаза: {phase === 'idle' ? 'Ожидание' : phase === 'scanning' ? 'Сканирование' : phase === 'attacking' ? 'Атака' : phase === 'defending' ? 'Защита' : 'Отражена'}</span>
        </div>
      </div>

      {/* Visualization */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />

        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full">
          {lines.map((line, i) => {
            const from = nodes.find(n => n.id === line.from)!;
            const to = nodes.find(n => n.id === line.to)!;
            const xPercent = (val: number, max: number) => `${(val / max) * 100}%`;
            return (
              <g key={i}>
                <line
                  x1={xPercent(from.x, 620)} y1={`${(from.y / 500) * 100}%`}
                  x2={xPercent(to.x, 620)} y2={`${(to.y / 500) * 100}%`}
                  stroke={line.blocked ? '#22c55e' : line.active ? '#ef4444' : '#333'}
                  strokeWidth={line.active ? 2 : 1}
                  strokeDasharray={line.active ? 'none' : '4 4'}
                  opacity={line.active ? 0.8 : 0.3}
                />
                {line.active && !line.blocked && (
                  <circle r="3" fill="#ef4444">
                    <animateMotion dur="1s" repeatCount="indefinite"
                      path={`M${(from.x / 620) * 100}%,${(from.y / 500) * 100}% L${(to.x / 620) * 100}%,${(to.y / 500) * 100}%`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <motion.div
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute flex flex-col items-center"
            style={{
              left: `${(node.x / 620) * 100}%`,
              top: `${(node.y / 500) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
              node.status === 'under_attack' ? 'animate-pulse border-red-500 shadow-lg shadow-red-500/30' :
              node.status === 'blocked' ? 'border-green-500 shadow-lg shadow-green-500/20' :
              'border-gray-600'
            }`} style={{ backgroundColor: `${nodeColor(node)}20` }}>
              <span style={{ color: nodeColor(node) }}>{nodeIcon(node.type)}</span>
            </div>
            <span className="text-[9px] mt-1 text-gray-400 whitespace-nowrap">{node.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Log */}
      <div className="border-t shrink-0" style={{ backgroundColor: '#050510', borderColor: '#1a1a2e' }}>
        <div className="px-3 py-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono text-gray-500">LIVE LOG</span>
        </div>
        <div className="h-28 overflow-y-auto px-3 pb-2 font-mono text-[10px] space-y-0.5">
          {logs.map(log => (
            <div key={log.id} style={{ color: log.type === 'danger' ? '#ef4444' : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#22c55e' : '#58a6ff' }}>
              [{log.time}] {log.message}
            </div>
          ))}
          {phase === 'idle' && (
            <div className="text-gray-600">Ожидание атаки...</div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
