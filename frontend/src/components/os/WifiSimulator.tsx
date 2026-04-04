import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Lock, Unlock, Shield, AlertTriangle, Eye, X, ArrowRight, Check, Smartphone, Laptop } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

type Phase = 'select' | 'connect' | 'browse' | 'attack' | 'result';
type Choice = 'secure' | 'risky' | null;

interface Network {
  id: string;
  name: string;
  secure: boolean;
  signal: number;
  type: string;
}

const NETWORKS: Network[] = [
  { id: 'cafe', name: 'CoffeeShop_Free', secure: false, signal: 85, type: 'Открытая' },
  { id: 'cafe2', name: 'CoffeeShop_Guest', secure: false, signal: 70, type: 'Открытая' },
  { id: 'phone', name: 'iPhone_Алексей', secure: true, signal: 45, type: 'WPA3' },
];

const PHASE_TEXTS: Record<Phase, { titleKey: string; descKey: string }> = {
  select: { titleKey: 'osWifiSelect', descKey: 'osWifiSelect' },
  connect: { titleKey: 'osWifiConnect', descKey: 'osWifiConnect' },
  browse: { titleKey: 'osWifiBrowse', descKey: 'osWifiBrowse' },
  attack: { titleKey: 'osWifiAttack', descKey: 'osWifiAttack' },
  result: { titleKey: 'osWifiResult', descKey: 'osWifiResult' },
};

export default function WifiSimulator({ onComplete }: { onComplete?: (safe: boolean) => void }) {
  const lang = useGS(s => s.lang);
  const completeTask = useGS(s => s.completeTask);
  const T = (key: string) => t(lang, key);
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [choice, setChoice] = useState<Choice>(null);
  const [attackProgress, setAttackProgress] = useState(0);
  const [intercepted, setIntercepted] = useState<string[]>([]);
  const [packetAnimation, setPacketAnimation] = useState(false);
  const attackTimerRef = useRef<number>(0);

  const selectNetwork = (net: Network) => {
    setSelectedNetwork(net);
    setPhase('connect');
  };

  const makeChoice = (c: Choice) => {
    setChoice(c);
    if (c === 'secure') {
      completeTask('wifi_vpn');
      setPhase('attack');
      startAttack(true);
    } else {
      completeTask('wifi_risky');
      setPhase('attack');
      startAttack(false);
    }
  };

  const startAttack = (isSafe: boolean) => {
    setAttackProgress(0);
    setIntercepted([]);
    setPacketAnimation(true);

    const captured = isSafe ? [] : [
      'GET /mail?token=eyJhbGci...',
      'POST /api/transfer {amount: 50000}',
      'Cookie: session_id=a3f8c2...',
      'Password: MyP@ssw0rd!',
    ];

    let step = 0;
    const total = isSafe ? 3 : captured.length;
    attackTimerRef.current = window.setInterval(() => {
      step++;
      setAttackProgress((step / total) * 100);
      if (!isSafe && step <= captured.length) {
        setIntercepted(prev => [...prev, captured[step - 1]]);
      }
      if (step >= total) {
        clearInterval(attackTimerRef.current);
        setPacketAnimation(false);
        setTimeout(() => setPhase('result'), 500);
      }
    }, 800);
  };

  useEffect(() => {
    return () => clearInterval(attackTimerRef.current);
  }, []);

  const safe = choice === 'secure';

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#0a0a12' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#1a1a2e' }}>
        <div className="flex items-center gap-3">
          <Wifi className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-bold text-white">Wi-Fi Security Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: phase === 'attack' ? 'rgba(239,68,68,0.2)' : 'rgba(63,185,80,0.2)', color: phase === 'attack' ? '#ef4444' : '#3fb950' }}>
            {phase === 'attack' ? 'АТАКА' : 'ЗАЩИЩЕНО'}
          </div>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-1 px-4 py-2 shrink-0" style={{ backgroundColor: '#0f0f1a' }}>
        {(['select', 'connect', 'browse', 'attack', 'result'] as Phase[]).map((p, i) => (
          <div key={p} className="flex items-center gap-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              p === phase ? 'bg-blue-500 text-white scale-110' :
              ['select', 'connect', 'browse', 'attack', 'result'].indexOf(p) < ['select', 'connect', 'browse', 'attack', 'result'].indexOf(phase)
                ? 'bg-green-500/30 text-green-400' : 'bg-gray-800 text-gray-600'
            }`}>
              {['select', 'connect', 'browse', 'attack', 'result'].indexOf(p) < ['select', 'connect', 'browse', 'attack', 'result'].indexOf(phase) ? '✓' : i + 1}
            </div>
            {i < 4 && <div className={`w-8 h-0.5 ${['select', 'connect', 'browse', 'attack', 'result'].indexOf(p) < ['select', 'connect', 'browse', 'attack', 'result'].indexOf(phase) ? 'bg-green-500' : 'bg-gray-800'}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {/* SELECT PHASE */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold text-white">{T(PHASE_TEXTS.select.titleKey)}</h2>
              <p className="text-sm text-gray-400">{T(PHASE_TEXTS.select.descKey)}</p>

              {/* Phone screen mockup */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4 max-w-sm mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-300">Wi-Fi сети</span>
                </div>
                <div className="space-y-2">
                  {NETWORKS.map(net => (
                    <button key={net.id} onClick={() => selectNetwork(net)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {net.secure ? <Lock className="w-4 h-4 text-green-400" /> : <Unlock className="w-4 h-4 text-yellow-400" />}
                        <div className="text-left">
                          <p className="text-sm text-white group-hover:text-blue-300 transition-colors">{net.name}</p>
                          <p className="text-[10px] text-gray-500">{net.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-4 h-4" style={{ color: net.signal > 70 ? '#3fb950' : net.signal > 40 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!selectedNetwork && (
                <div className="text-center p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                  <p className="text-xs text-yellow-400">💡 Подсказка: открытые сети без пароля — небезопасны</p>
                </div>
              )}
            </motion.div>
          )}

          {/* CONNECT PHASE */}
          {phase === 'connect' && selectedNetwork && (
            <motion.div key="connect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold text-white">{T(PHASE_TEXTS.connect.titleKey)}</h2>
              <p className="text-sm text-gray-400">{T(PHASE_TEXTS.connect.descKey)}</p>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 max-w-sm mx-auto text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: selectedNetwork.secure ? 'rgba(63,185,80,0.2)' : 'rgba(245,158,11,0.2)' }}>
                  {selectedNetwork.secure ? <Lock className="w-8 h-8 text-green-400" /> : <Unlock className="w-8 h-8 text-yellow-400" />}
                </motion.div>
                <p className="text-white font-bold mb-1">{selectedNetwork.name}</p>
                <p className="text-xs text-gray-500 mb-4">
                  {selectedNetwork.secure ? 'Защищённое соединение (WPA3)' : '⚠️ Открытая сеть — без шифрования!'}
                </p>

                {!selectedNetwork.secure && (
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Трафик не шифруется</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Любой в сети может видеть ваши данные</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 max-w-sm mx-auto">
                <button onClick={() => makeChoice('risky')}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  Продолжить без защиты
                </button>
                <button onClick={() => makeChoice('secure')}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                >
                  Включить VPN
                </button>
              </div>
            </motion.div>
          )}

          {/* BROWSE PHASE */}
          {phase === 'browse' && (
            <motion.div key="browse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold text-white">{T(PHASE_TEXTS.browse.titleKey)}</h2>
              <p className="text-sm text-gray-400">{T(PHASE_TEXTS.browse.descKey)}</p>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {[
                  { icon: '📧', label: 'Открыть почту', action: () => makeChoice('risky') },
                  { icon: '🏦', label: 'Онлайн-банк', action: () => makeChoice('risky') },
                  { icon: '🔒', label: 'Включить VPN', action: () => makeChoice('secure') },
                  { icon: '📱', label: 'Мобильный интернет', action: () => makeChoice('secure') },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="p-4 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 transition-all text-center"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-xs text-white">{item.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ATTACK PHASE */}
          {phase === 'attack' && (
            <motion.div key="attack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </motion.div>
                <h2 className="text-xl font-bold text-red-400">{T(PHASE_TEXTS.attack.titleKey)}</h2>
                <p className="text-sm text-gray-400 mt-2">{T(PHASE_TEXTS.attack.descKey)}</p>
              </div>

              {/* Visualization */}
              <div className="relative h-40 rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
                {/* Your device */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <Laptop className="w-8 h-8 text-blue-400" />
                  <span className="text-[9px] text-gray-500 mt-1">Вы</span>
                </div>

                {/* Attacker */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1">Атакующий</span>
                </div>

                {/* WiFi router */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Wifi className="w-6 h-6 text-yellow-400" />
                </div>

                {/* Packets animation */}
                {packetAnimation && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i}
                        initial={{ left: '15%', opacity: 0 }}
                        animate={{ left: '85%', opacity: safe ? 0.3 : 1 }}
                        transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: safe ? '#3fb950' : '#ef4444' }}
                      />
                    ))}
                    {/* Blocking shield if safe */}
                    {safe && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Shield className="w-12 h-12 text-green-400" />
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Перехвачено данных</span>
                  <span className={safe ? 'text-green-400' : 'text-red-400'}>{Math.round(attackProgress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: safe ? '#22c55e' : '#ef4444', width: `${attackProgress}%` }} />
                </div>
              </div>

              {/* Intercepted data */}
              <AnimatePresence>
                {intercepted.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-1"
                  >
                    <p className="text-[10px] font-bold text-red-400 uppercase">Перехваченные данные:</p>
                    {intercepted.map((data, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="font-mono text-[10px] text-red-300"
                      >
                        › {data}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {safe && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                  <p className="text-xs text-green-400">✅ VPN шифрует трафик. Атакующий видит только зашифрованные данные.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* RESULT PHASE */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: safe ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }}>
                  {safe ? <Check className="w-10 h-10 text-green-400" /> : <X className="w-10 h-10 text-red-400" />}
                </motion.div>
                <h2 className="text-xl font-bold" style={{ color: safe ? '#22c55e' : '#ef4444' }}>
                  {safe ? T('osDataProtected') : T('osWifiAttack')}
                </h2>
              </div>

              {safe ? (
                <div className="space-y-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <p className="text-sm text-green-300 font-semibold">✅ Вы использовали VPN — трафик зашифрован</p>
                  <p className="text-xs text-gray-400">Атакующий в той же сети не смог прочитать ваши данные. Даже в открытой Wi-Fi сети VPN создаёт защищённый туннель.</p>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm text-red-300 font-semibold">❌ Атакующий перехватил:</p>
                  <ul className="text-xs text-red-200 space-y-1 font-mono">
                    <li>• Токены авторизации почты</li>
                    <li>• Данные банковского перевода</li>
                    <li>• Session cookies</li>
                    <li>• Пароль в открытом виде</li>
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-xs font-bold text-blue-300 mb-2">📚 Правила безопасности:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Никогда не используйте открытые Wi-Fi без VPN</li>
                  <li>• Проверяйте HTTPS (замок в браузере)</li>
                  <li>• Отключите автоподключение к Wi-Fi</li>
                  <li>• Для важных операций используйте мобильный интернет</li>
                </ul>
              </div>

              <button onClick={() => onComplete?.(safe)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: '#3fb950' }}
              >
                {T('osContinue')} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
