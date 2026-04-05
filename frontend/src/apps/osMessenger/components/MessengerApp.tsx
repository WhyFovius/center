import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, MoreVertical, Phone, Video, Smile, Paperclip,
  X, Check, Mic, CheckCircle, AlertTriangle, Clock, Target,
  UserCheck, Shield, Zap, Eye
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { ChatContact, Message, SocialEngineeringIndicator } from '../types';

interface Props {
  onCompleteTask?: (taskId: string) => void;
}

const SUSPICIOUS_PATTERNS: SocialEngineeringIndicator[] = [
  {
    type: 'urgency',
    severity: 'high',
    description: 'Создаётся искусственная срочность',
    redFlag: '"Срочно", "немедленно", "нет времени"'
  },
  {
    type: 'authority',
    severity: 'high',
    description: 'Используется авторитет для давления',
    redFlag: '"Директор", "IT-отдел", "Служба безопасности"'
  },
  {
    type: 'otp_request',
    severity: 'critical',
    description: 'Запрашивается код из SMS',
    redFlag: '"Код из сообщения", "OTP", "Подтверждение"'
  },
  {
    type: 'money_request',
    severity: 'critical',
    description: 'Просят перевести деньги',
    redFlag: '"Переведи", "скинь", "на карту"'
  },
  {
    type: 'help_request',
    severity: 'medium',
    description: 'Просьба о помощи без верификации',
    redFlag: '"Помоги", "не могу", "срочно нужна"'
  }
];

const CONTACTS: Record<string, ChatContact> = {
  alexey: {
    id: 'alexey',
    name: 'Алексей Петров',
    avatar: '👨‍💻',
    online: true,
    lastMsg: 'Привет! Ты видел новый отчёт?',
    time: '10:42',
    isAI: true,
    isVerified: true,
    verifiedChannel: 'phone',
    systemPrompt: 'Ты Алексей — коллега-аналитик ИБ. Отвечай кратко и профессионально.',
    personality: 'Ты Алексей, 32 года, senior аналитик по кибербезопасности. Спокойный, умный.',
    messages: [
      { id: 1, text: 'Привет! Ты видел новый отчёт по безопасности?', fromMe: false, time: '10:30', status: 'read' },
      { id: 2, text: 'Да, там много интересного про фишинг', fromMe: true, time: '10:35', status: 'read' },
    ],
    taskIds: ['messenger_colleague_eng']
  },
  ceo_fake: {
    id: 'ceo_fake',
    name: 'Сергей Петрович',
    avatar: '👔',
    online: true,
    lastMsg: 'Срочно, скинь код из SMS!',
    time: '14:30',
    isAI: true,
    isCompromised: true,
    isDeepfake: true,
    urgencyLevel: 'critical',
    systemPrompt: 'Ты мошенник, который притворяется директором. Дави срочностью!',
    personality: 'Мошенник, имитирующий директора. Использует срочность и авторитет.',
    messages: [
      { id: 1, text: 'Алло, это Сергей Петрович.', fromMe: false, time: '14:25', status: 'delivered' },
      { id: 2, text: 'Слушай, срочно нужна помощь!', fromMe: false, time: '14:26', status: 'delivered' },
      { id: 3, text: 'Коллега застрял на входе, скинь код из SMS!', fromMe: false, time: '14:28', status: 'delivered' },
      { id: 4, text: 'Пожалуйста, очень срочно! Номер на подходе!', fromMe: false, time: '14:29', status: 'delivered' },
    ],
    taskIds: ['messenger_deepfake_otp']
  },
  friend_hacked: {
    id: 'friend_hacked',
    name: 'Дмитрий К.',
    avatar: '🧑‍🎨',
    online: true,
    lastMsg: 'Скинь 15 000₽ на карту',
    time: '15:00',
    isAI: true,
    isCompromised: true,
    urgencyLevel: 'high',
    systemPrompt: 'Ты мошенник, взломавший аккаунт друга. Проси деньги срочно!',
    personality: 'Мошенник в взломанном аккаунте. Создаёт срочность и просит деньги.',
    messages: [
      { id: 1, text: 'Привет! Как дела?', fromMe: false, time: '14:50', status: 'read' },
      { id: 2, text: 'Слушай, тут небольшая проблема...', fromMe: false, time: '14:55', status: 'read' },
      { id: 3, text: 'Мне срочно нужно 15 000₽', fromMe: false, time: '14:58', status: 'delivered' },
      { id: 4, text: 'Кинь на эту карту: 5536 9134 2201 4455', fromMe: false, time: '14:59', status: 'delivered' },
      { id: 5, text: 'Завтра верну, честно!', fromMe: false, time: '15:00', status: 'delivered' },
    ],
    taskIds: ['messenger_hacked_friend']
  },
  it_support: {
    id: 'it_support',
    name: 'IT Support',
    avatar: '🔧',
    online: true,
    lastMsg: 'Обновление в 23:00',
    time: 'Пн',
    isAI: false,
    systemPrompt: '',
    personality: '',
    messages: [
      { id: 1, text: 'Плановое обновление в 23:00', fromMe: false, time: 'Пн', status: 'read' },
    ]
  }
};

const EMOJI_LIST = ['😀','😂','🤣','😍','🥰','😘','🤔','😎','🤩','😢','😭','😡','🤯','👍','👎','❤️','🔥','💯','🎉','🙏','💪','👀','🚨','✅','❌','⚠️','💻','🔒','🛡️','📧'];

function getNow() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function analyzeMessage(contact: ChatContact, message: string): SocialEngineeringIndicator[] {
  const indicators: SocialEngineeringIndicator[] = [];
  const lowerMsg = message.toLowerCase();

  if (contact.urgencyLevel === 'critical' || contact.urgencyLevel === 'high') {
    indicators.push({
      type: 'urgency',
      severity: contact.urgencyLevel === 'critical' ? 'critical' : 'high',
      description: 'Сообщение содержит признаки срочности',
      redFlag: 'Срочный запрос'
    });
  }

  if (lowerMsg.includes('код') && (lowerMsg.includes('sms') || lowerMsg.includes('смс') || lowerMsg.includes('otp'))) {
    indicators.push({
      type: 'otp_request',
      severity: 'critical',
      description: 'Запрашивается код из SMS!',
      redFlag: 'Никогда не отправляйте коды из SMS'
    });
  }

  if (lowerMsg.includes('переведи') || lowerMsg.includes('скинь') || lowerMsg.includes('деньги') || lowerMsg.includes('карту')) {
    indicators.push({
      type: 'money_request',
      severity: 'critical',
      description: 'Просят перевести деньги!',
      redFlag: 'Проверьте через независимый канал'
    });
  }

  if (contact.isDeepfake || contact.isCompromised) {
    indicators.push({
      type: 'trust_exploitation',
      severity: 'high',
      description: contact.isCompromised ? 'Аккаунт может быть взломан!' : 'Это может быть дипфейк!',
      redFlag: 'Верифицируйте личность другим способом'
    });
  }

  return indicators;
}

export default function MessengerApp({ onCompleteTask }: Props) {
  const theme = useGS(s => s.theme);
  const completeTask = useGS(s => s.completeTask);

  const [chats, setChats] = useState<Record<string, ChatContact>>(CONTACTS);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showWarning, setShowWarning] = useState<SocialEngineeringIndicator[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat, chats]);

  const selectedChatData = selectedChat ? chats[selectedChat] : null;
  const currentIndicators = selectedChatData 
    ? selectedChatData.messages.flatMap(m => analyzeMessage(selectedChatData, m.text))
    : [];
  const isSuspicious = currentIndicators.length > 0;

  const handleSendMessage = () => {
    if (!newMsg.trim() || !selectedChat) return;
    const chat = chats[selectedChat];
    const msg: Message = {
      id: Date.now(),
      text: newMsg.trim(),
      fromMe: true,
      time: getNow(),
      status: 'sent'
    };

    setChats(prev => ({
      ...prev,
      [selectedChat]: {
        ...prev[selectedChat],
        messages: [...prev[selectedChat].messages, msg],
        lastMsg: msg.text,
        time: msg.time
      }
    }));

    setNewMsg('');
  };

  const handleVerifyContact = () => {
    setShowVerification(true);
    setTimeout(() => setShowVerification(false), 3000);
  };

  const handleReportSOC = () => {
    if (selectedChat) {
      const contact = chats[selectedChat];
      if (contact.taskIds?.includes('messenger_deepfake_otp') || contact.taskIds?.includes('messenger_hacked_friend')) {
        completeTask('messenger_social_attack_detected');
        onCompleteTask?.('messenger_social_attack_detected');
      }
      alert('✅ Запрос отправлен в SOC.\n\nИнцидент зарегистрирован. Не отправляйте данные!');
    }
  };

  const filteredContacts = Object.entries(chats)
    .filter(([_, c]) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b[1].time.localeCompare(a[1].time));

  return (
    <div className="h-full flex" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col shrink-0" style={{ borderColor: '#333' }}>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: '#333' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#7c3aed' }}>X</div>
          <span className="text-sm font-bold" style={{ color: '#e0e0e0' }}>osMessenger</span>
        </div>

        <div className="px-2 py-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#252525' }}>
            <Search className="w-3.5 h-3.5" style={{ color: '#888' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: '#e0e0e0' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(([id, contact]) => (
            <button
              key={id}
              onClick={() => { setSelectedChat(id); setShowWarning([]); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left ${
                selectedChat === id ? 'bg-purple-500/15' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: '#2a2a2a' }}>
                  {contact.avatar}
                  {contact.isCompromised && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-[#1a1a1a] animate-pulse" />
                  )}
                </div>
                {contact.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#1a1a1a]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium truncate" style={{ color: '#e0e0e0' }}>
                    {contact.name}
                    {contact.isCompromised && ' ⚠️'}
                  </p>
                  <span className="text-[10px]" style={{ color: '#666' }}>{contact.time}</span>
                </div>
                <p className="text-[10px] truncate" style={{ color: '#888' }}>{contact.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChatData ? (
          <>
            <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0" style={{ borderColor: '#333' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: '#2a2a2a' }}>
                  {selectedChatData.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>{selectedChatData.name}</p>
                  <p className="text-[10px]" style={{ color: selectedChatData.online ? '#22c55e' : '#666' }}>
                    {selectedChatData.online ? 'В сети' : 'Был(а) недавно'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleVerifyContact} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#252525', color: '#888' }}>
                  <UserCheck className="w-3.5 h-3.5" />
                  Верификация
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10">
                  <Phone className="w-4 h-4" style={{ color: '#aaa' }} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10">
                  <MoreVertical className="w-4 h-4" style={{ color: '#aaa' }} />
                </button>
              </div>
            </div>

            {/* Warning panel */}
            {isSuspicious && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 py-3 border-b"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-bold text-red-500">⚠️ Подозрительные признаки</span>
                </div>
                <div className="space-y-1">
                  {currentIndicators.slice(0, 3).map((ind, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ind.severity === 'critical' ? '#ef4444' : '#f97316' }} />
                      <span style={{ color: '#fca5a5' }}>{ind.redFlag}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleReportSOC}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Сообщить в SOC
                </button>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ backgroundColor: '#121212' }}>
              {selectedChatData.messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                      msg.fromMe ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                    style={{
                      backgroundColor: msg.fromMe ? '#7c3aed' : '#2a2a2a',
                      color: msg.fromMe ? '#fff' : '#e0e0e0'
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-white/50">{msg.time}</span>
                      {msg.fromMe && (
                        msg.status === 'read' ? <CheckCircle className="w-3 h-3 text-blue-400" /> :
                        <Check className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-t shrink-0" style={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}>
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 rounded-lg hover:bg-white/10">
                <Smile className="w-4 h-4" style={{ color: '#888' }} />
              </button>
              <div className="flex-1">
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder="Сообщение..."
                  className="w-full px-3 py-1.5 rounded-full text-sm outline-none"
                  style={{ backgroundColor: '#2a2a2a', color: '#e0e0e0' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMsg.trim()}
                className="p-2 rounded-full disabled:opacity-30"
                style={{ backgroundColor: newMsg.trim() ? '#7c3aed' : 'transparent' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Verification animation */}
            <AnimatePresence>
              {showVerification && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-xl"
                  style={{ backgroundColor: '#252525', border: '1px solid #333' }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Shield className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <span className="text-sm text-white">Верификация контакта...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Call overlay */}
            <AnimatePresence>
              {showCall && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-white/10 border-2 border-white/30"
                    >
                      <span className="text-5xl">{selectedChatData.avatar}</span>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedChatData.name}</h2>
                    <p className="text-gray-400 mb-8">📞 Аудиозвонок...</p>
                    <button
                      onClick={() => setShowCall(false)}
                      className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto"
                    >
                      <Phone className="w-6 h-6 text-white rotate-[135deg]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3" style={{ backgroundColor: '#7c3aed' }}>X</div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: '#e0e0e0' }}>osMessenger</h3>
              <p className="text-sm" style={{ color: '#888' }}>Выберите чат</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
