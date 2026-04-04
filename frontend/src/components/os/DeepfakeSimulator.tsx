import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, PhoneCall, AlertTriangle, Check, ArrowRight, Shield, Mic, User, Clock } from 'lucide-react';

type Phase = 'ringing' | 'conversation' | 'decision' | 'result';

export default function DeepfakeSimulator({ onComplete }: { onComplete?: (safe: boolean) => void }) {
  const [phase, setPhase] = useState<Phase>('ringing');
  const [msgIndex, setMsgIndex] = useState(0);
  const [choice, setChoice] = useState<'transfer' | 'callback' | 'ignore' | null>(null);
  const [transferAnim, setTransferAnim] = useState(false);

  const MESSAGES = [
    { role: 'caller' as const, text: 'Алло, это Сергей Петрович. Слушай, срочно нужна помощь.' },
    { role: 'caller' as const, text: 'Я на встрече с клиентами, не могу говорить долго. Нужно срочно перевести 280 тысяч на счёт партнёра.' },
    { role: 'caller' as const, text: 'Реквизиты уже отправил тебе в мессенджер. Переведи прямо сейчас, иначе сорвётся контракт.' },
    { role: 'caller' as const, text: 'Давай быстрее, времени нет. Это наш ключевой клиент, на кону всё.' },
  ];

  const nextMsg = () => {
    if (msgIndex < MESSAGES.length - 1) {
      setMsgIndex(msgIndex + 1);
    } else {
      setPhase('decision');
    }
  };

  const makeChoice = (c: 'transfer' | 'callback' | 'ignore') => {
    setChoice(c);
    if (c === 'transfer') {
      setTransferAnim(true);
      setTimeout(() => setPhase('result'), 3000);
    } else {
      setPhase('result');
    }
  };

  const safe = choice === 'callback' || choice === 'ignore';

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#0a0a12' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#1a1a2e' }}>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-bold text-white">Deepfake Call Simulator</span>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
          {phase === 'ringing' ? 'ВХОДЯЩИЙ' : phase === 'conversation' ? 'РАЗГОВОР' : phase === 'decision' ? 'РЕШЕНИЕ' : 'РЕЗУЛЬТАТ'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {/* RINGING */}
          {phase === 'ringing' && (
            <motion.div key="ringing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-purple-500/10 border-2 border-purple-500/30"
              >
                <PhoneCall className="w-12 h-12 text-purple-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Входящий звонок</h2>
              <p className="text-lg text-purple-300 mb-1">Сергей Петрович</p>
              <p className="text-xs text-gray-500 mb-8">Генеральный директор</p>

              <div className="flex gap-4 justify-center">
                <button onClick={() => setPhase('conversation')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                >
                  <Phone className="w-6 h-6 text-green-400" />
                  <span className="text-xs text-green-300">Ответить</span>
                </button>
                <button onClick={() => makeChoice('ignore')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  <PhoneOff className="w-6 h-6 text-red-400" />
                  <span className="text-xs text-red-300">Отклонить</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* CONVERSATION */}
          {phase === 'conversation' && (
            <motion.div key="conv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Сергей Петрович</p>
                  <div className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-red-400" />
                    <p className="text-[10px] text-gray-500">Голос (подозрительные артефакты)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {MESSAGES.slice(0, msgIndex + 1).map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i === msgIndex ? 0.3 : 0 }}
                    className="bg-gray-800/50 rounded-2xl rounded-tl-md p-3 max-w-sm"
                  >
                    <p className="text-sm text-gray-200">{msg.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Red flags */}
              <AnimatePresence>
                {msgIndex >= 1 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-1"
                  >
                    <p className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Подозрительные признаки:
                    </p>
                    {msgIndex >= 1 && <p className="text-[10px] text-gray-400">• Срочность + давление ("сейчас", "нет времени")</p>}
                    {msgIndex >= 2 && <p className="text-[10px] text-gray-400">• Просит перевести деньги по сообщению</p>}
                    {msgIndex >= 3 && <p className="text-[10px] text-gray-400">• Невербальные артефакты в голосе</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {msgIndex < MESSAGES.length - 1 ? (
                <button onClick={nextMsg} className="w-full py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
                  <Clock className="w-4 h-4 inline mr-1" /> Далее...
                </button>
              ) : (
                <button onClick={nextMsg} className="w-full py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#7c3aed' }}>
                  Что вы решите? →
                </button>
              )}
            </motion.div>
          )}

          {/* DECISION */}
          {phase === 'decision' && (
            <motion.div key="decision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-white text-center">Ваше решение?</h2>

              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => makeChoice('transfer')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors text-left"
                >
                  <div className="text-2xl">💸</div>
                  <div>
                    <p className="text-sm font-bold text-red-300">Перевести деньги</p>
                    <p className="text-[10px] text-gray-500">Отправить 280,000₽ по реквизитам</p>
                  </div>
                </button>

                <button onClick={() => makeChoice('callback')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors text-left"
                >
                  <Shield className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-green-300">Перезвонить по известному номеру</p>
                    <p className="text-[10px] text-gray-500">Проверить через официальный контакт</p>
                  </div>
                </button>

                <button onClick={() => makeChoice('ignore')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
                >
                  <PhoneOff className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-300">Завершить звонок</p>
                    <p className="text-[10px] text-gray-500">Сообщить в отдел безопасности</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-lg mx-auto">
              {choice === 'transfer' ? (
                <>
                  <div className="text-center">
                    <motion.div animate={transferAnim ? { y: [0, -100], opacity: [1, 0] } : {}}
                      className="text-6xl mb-4">💸</motion.div>
                    <h2 className="text-xl font-bold text-red-400">Деньги отправлены!</h2>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                    <p className="text-sm text-red-300 font-bold">❌ Это был дипфейк!</p>
                    <p className="text-xs text-gray-400">Голос был сгенерирован нейросетью. Настоящий Сергей Петрович был на совещании и ничего не переводил.</p>
                    <p className="text-xs text-gray-400">280,000₽ ушли на счёт мошенников. Возврат маловероятен.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-500/10 border border-green-500/30">
                      <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-green-400">Правильное решение!</h2>
                  </div>
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
                    <p className="text-sm text-green-300 font-bold">✅ Вы распознали дипфейк!</p>
                    <p className="text-xs text-gray-400">Перезвонив по известному номеру, вы обнаружили что это мошенники.</p>
                    <p className="text-xs text-gray-400">Инцидент передан в отдел безопасности.</p>
                  </div>
                </>
              )}

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-xs font-bold text-blue-300 mb-2">📚 Как распознать дипфейк:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Неестественные паузы и артефакты в голосе</li>
                  <li>• Чрезмерная срочность и давление</li>
                  <li>• Просьбы о переводе денег через мессенджер</li>
                  <li>• Всегда перезванивайте по известному номеру</li>
                  <li>• Сообщите в отдел безопасности</li>
                </ul>
              </div>

              <button onClick={() => onComplete?.(safe)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: '#3fb950' }}
              >
                Продолжить <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
