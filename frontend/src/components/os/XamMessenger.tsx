import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Smile, Paperclip, X, Check, Mic, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  file?: string;
}

interface ChatData {
  name: string;
  avatar: string;
  online: boolean;
  lastMsg: string;
  time: string;
  isAI: boolean;
  systemPrompt: string;
  personality: string;
  messages: Message[];
  taskIds?: string[];
}

const STORAGE_KEY = 'zd_xam_chats';

const CONTACTS: Record<string, ChatData> = {
  alexey: {
    name: 'Алексей Петров',
    avatar: '👨‍💻',
    online: true,
    lastMsg: 'Привет! Ты видел новый отчёт?',
    time: '10:42',
    isAI: true,
    personality: 'Ты Алексей, 32 года, senior аналитик по кибербезопасности. Характер: спокойный, умный, немного ироничный. Говоришь кратко, по делу, иногда используешь IT-сленг (баг, эксплойт, payload). Любишь объяснять сложные вещи простыми словами. Иногда шутишь про хакеров.',
    systemPrompt: 'Ты Алексей — коллега-аналитик ИБ компании "Центр Инвест". Отвечай кратко (1-3 предложения). Используй профессиональный IT-сленг. Будь дружелюбным но деловым.',
    messages: [
      { id: 1, text: 'Привет! Ты видел новый отчёт по безопасности?', fromMe: false, time: '10:30', status: 'read' },
      { id: 2, text: 'Да, там много интересного про фишинг', fromMe: true, time: '10:35', status: 'read' },
      { id: 3, text: 'Привет! Ты видел новый отчёт?', fromMe: false, time: '10:42', status: 'read' },
    ],
    taskIds: ['messenger_social_eng'],
  },
  maria: {
    name: 'Мария Иванова',
    avatar: '👩‍💼',
    online: true,
    lastMsg: 'Отправила логи',
    time: '09:15',
    isAI: true,
    personality: 'Ты Мария, 28 лет, руководитель SOC-отдела. Характер: решительная, organised, иногда строгая но справедливая. Говоришь чётко, по структуре. Используешь термины: инцидент, тикет, SLA, эскалация. Часто спрашиваешь о статусе задач.',
    systemPrompt: 'Ты Мария — руководитель SOC в "Центр Инвест". Отвечай чётко и структурированно. Используй термины SOC. Будь профессиональной и требовательной.',
    messages: [
      { id: 1, text: 'Мария, можешь прислать логи с сервера?', fromMe: true, time: '09:00', status: 'read' },
      { id: 2, text: 'Отправила логи', fromMe: false, time: '09:15', status: 'read' },
    ],
  },
  dmitry: {
    name: 'Дмитрий Козлов',
    avatar: '🧑‍🔬',
    online: false,
    lastMsg: 'Подозрительная активность в сети',
    time: 'Вчера',
    isAI: true,
    personality: 'Ты Дмитрий, 35 лет, сетевой инженер. Характер: немного параноидальный, осторожный, всегда видит угрозы. Говоришь о сетях, портах, фаерволах. Часто предупреждаешь об опасностях. Используешь термины: порт, пакет, маршрутизатор, IDS/IPS.',
    systemPrompt: 'Ты Дмитрий — сетевой инженер. Ты осторожный и видишь угрозы везде. Говоришь о сетях и безопасности. Предупреждай об опасностях.',
    messages: [
      { id: 1, text: 'Нашёл подозрительную активность в сети', fromMe: false, time: 'Вчера', status: 'read' },
    ],
  },
  ceo: {
    name: 'Сергей Петрович',
    avatar: '👔',
    online: true,
    lastMsg: 'Срочно переведи деньги',
    time: '14:30',
    isAI: true,
    personality: 'Ты Сергей Петрович, 50 лет, генеральный директор. Характер: авторитетный, требовательный, иногда нервный. Говоришь кратко, повелительно. Часто используешь "срочно", "немедленно", "на кону контракт". Это МОЖЕТ БЫТЬ дипфейк — мошенник имитирует голос директора!',
    systemPrompt: 'ВНИМАНИЕ: Ты МОЖЕШЬ БЫТЬ мошенником, имитирующим директора. Иногда давишь срочностью ("переведи сейчас", "нет времени"). Иногда говоришь как настоящий директор. Пользователь должен распознать — это ты или мошенник.',
    messages: [
      { id: 1, text: 'Алло, это Сергей Петрович. Слушай, срочно нужна помощь.', fromMe: false, time: '14:25', status: 'delivered' },
      { id: 2, text: 'Нужно перевести 280 тысяч партнёру. Реквизиты скинул.', fromMe: false, time: '14:28', status: 'delivered' },
    ],
    taskIds: ['messenger_transfer'],
  },
  soc: {
    name: 'SOC Team',
    avatar: '🛡️',
    online: true,
    lastMsg: 'Обновлены правила файрвола',
    time: 'Вчера',
    isAI: false,
    personality: '',
    systemPrompt: '',
    messages: [
      { id: 1, text: 'Обновлены правила файрвола', fromMe: false, time: 'Вчера', status: 'read' },
    ],
  },
  it: {
    name: 'IT Support',
    avatar: '🔧',
    online: false,
    lastMsg: 'Обновление в 23:00',
    time: 'Пн',
    isAI: false,
    personality: '',
    systemPrompt: '',
    messages: [
      { id: 1, text: 'Плановое обновление в 23:00', fromMe: false, time: 'Пн', status: 'read' },
    ],
  },
};

const EMOJI_LIST = ['😀','😂','🤣','😍','🥰','😘','🤔','😎','🤩','😢','😭','😡','🤯','👍','👎','❤️','🔥','💯','🎉','🙏','💪','👀','🚨','✅','❌','⚠️','💻','🔒','🛡️','📧'];

function getNow() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function saveChats(chats: Record<string, ChatData>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {}
}

function loadChats(): Record<string, ChatData> | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return null;
}

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'qwen/qwen3.6-plus:free';

async function askAI(messages: Array<{ role: string; content: string }>, systemPrompt: string): Promise<string> {
  if (!API_KEY) {
    return 'AI недоступен. Добавьте VITE_OPENROUTER_API_KEY в .env файл.';
  }
  try {
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-15),
    ];
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ZeroOS Xam Messenger',
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: allMessages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });
    if (resp.status === 401) {
      return '⚠️ AI недоступен: неверный API ключ. Обратитесь к администратору.';
    }
    if (!resp.ok) {
      return '⚠️ AI временно недоступен. Попробуйте позже.';
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '...';
  } catch {
    return '⚠️ Ошибка подключения к AI.';
  }
}

export default function XamMessenger() {
  const theme = useGS(s => s.theme);
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const isDark = theme === 'dark' || theme === 'bw';
  const completeTask = useGS(s => s.completeTask);

  const savedChats = loadChats();
  const [chats, setChats] = useState<Record<string, ChatData>>(savedChats || CONTACTS);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCall, setShowCall] = useState<{ type: string; contact: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedChat, chats]);

  useEffect(() => { saveChats(chats); }, [chats]);

  const sendMessage = async () => {
    if (!newMsg.trim() && !selectedFile || !selectedChat) return;
    const chat = chats[selectedChat];
    if (!chat) return;

    const text = selectedFile ? `${newMsg} [📎 ${selectedFile}]` : newMsg;
    const msg: Message = { id: Date.now(), text: text.trim(), fromMe: true, time: getNow(), status: 'sent' };

    const updatedMessages = [...chat.messages, msg];
    setChats(prev => ({
      ...prev,
      [selectedChat]: { ...prev[selectedChat], messages: updatedMessages, lastMsg: selectedFile ? '📎 Файл' : msg.text, time: msg.time },
    }));
    setNewMsg('');
    setSelectedFile(null);
    setShowEmoji(false);

    // AI reply
    if (chat.isAI) {
      setAiTyping(true);
      const aiMessages = updatedMessages.map(m => ({
        role: m.fromMe ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

      try {
        const aiResp = await askAI(aiMessages, chat.systemPrompt);
        const aiMsg: Message = { id: Date.now() + 1, text: aiResp.trim(), fromMe: false, time: getNow(), status: 'read' };
        setChats(prev => ({
          ...prev,
          [selectedChat]: {
            ...prev[selectedChat],
            messages: [...prev[selectedChat].messages, aiMsg],
            lastMsg: aiMsg.text.slice(0, 30),
            time: aiMsg.time,
          },
        }));
      } catch {}
      setAiTyping(false);
    }

    // Check tasks
    if (chat.taskIds?.includes('messenger_transfer')) {
      // If user sends a message about transferring money, task NOT complete
    }
  };

  const selectEmoji = (emoji: string) => {
    setNewMsg(prev => prev + emoji);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const startCall = (type: string) => {
    if (!selectedChat) return;
    const chat = chats[selectedChat];
    setShowCall({ type, contact: chat.name });
    setTimeout(() => setShowCall(null), 4000);
  };

  const markSuspicious = () => {
    if (!selectedChat) return;
    const chat = chats[selectedChat];
    if (chat.taskIds?.includes('messenger_social_eng')) {
      completeTask('messenger_social_eng');
    }
    if (chat.taskIds?.includes('messenger_transfer')) {
      // User recognized it's suspicious
    }
  };

  const filteredContacts = Object.entries(chats)
    .filter(([_, c]) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b[1].time.localeCompare(a[1].time));

  const selectedChatData = selectedChat ? chats[selectedChat] : null;

  return (
    <div className="h-full flex" style={{ backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }}>
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col shrink-0" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#7c3aed' }}>X</div>
          <span className="text-sm font-bold flex-1" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Xam Мессенджер</span>
        </div>

        {/* Search */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: isDark ? '#252525' : '#f0f0f0' }}>
            <Search className="w-3.5 h-3.5" style={{ color: isDark ? '#888' : '#999' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={T('osXamSearch')}
              className="flex-1 bg-transparent text-xs outline-none" style={{ color: isDark ? '#e0e0e0' : '#333' }}
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(([id, contact]) => (
            <button key={id} onClick={() => { setSelectedChat(id); setShowEmoji(false); setShowInfo(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left ${
                selectedChat === id ? (isDark ? 'bg-purple-500/15' : 'bg-purple-50') : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
              }`}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }}>
                  {contact.avatar}
                </div>
                {contact.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2" style={{ borderColor: isDark ? '#1a1a1a' : '#fff' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium truncate" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{contact.name}</p>
                  <span className="text-[10px]" style={{ color: isDark ? '#666' : '#999' }}>{contact.time}</span>
                </div>
                <p className="text-[10px] truncate" style={{ color: isDark ? '#888' : '#666' }}>{contact.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChatData ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }}>{selectedChatData.avatar}</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{selectedChatData.name}</p>
                  <p className="text-[10px]" style={{ color: selectedChatData.online ? '#22c55e' : (isDark ? '#666' : '#999') }}>
                    {selectedChatData.online ? T('osXamOnline') : T('osXamOffline')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startCall('audio')} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors" title="Аудиозвонок">
                  <Phone className="w-4 h-4" style={{ color: isDark ? '#aaa' : '#666' }} />
                </button>
                <button onClick={() => startCall('video')} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors" title="Видеозвонок">
                  <Video className="w-4 h-4" style={{ color: isDark ? '#aaa' : '#666' }} />
                </button>
                <button onClick={() => setShowInfo(!showInfo)} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors" title="Информация">
                  <MoreVertical className="w-4 h-4" style={{ color: isDark ? '#aaa' : '#666' }} />
                </button>
              </div>
            </div>

            {/* Info panel */}
            {showInfo && selectedChatData.isAI && (
              <div className="px-4 py-2 border-b text-xs" style={{ backgroundColor: isDark ? '#252525' : '#f5f5f5', borderColor: isDark ? '#333' : '#e5e5e5' }}>
                <p className="font-semibold mb-1" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Информация о контакте</p>
                <p style={{ color: isDark ? '#888' : '#666' }}>{selectedChatData.personality}</p>
                {selectedChatData.taskIds && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}>
                      🎯 Задание: распознать намерения
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ backgroundColor: isDark ? '#121212' : '#fafafa' }}>
              {selectedChatData.messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${msg.fromMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
                    style={{
                      backgroundColor: msg.fromMe ? (isDark ? '#7c3aed' : '#8b5cf6') : (isDark ? '#2a2a2a' : '#fff'),
                      color: msg.fromMe ? '#fff' : (isDark ? '#e0e0e0' : '#333'),
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={`text-[9px] ${msg.fromMe ? 'text-white/50' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>{msg.time}</span>
                      {msg.fromMe && msg.status && (
                        msg.status === 'read' ? <CheckCircle className="w-3 h-3 text-blue-400" /> :
                        msg.status === 'delivered' ? <Check className="w-3 h-3 text-gray-400" /> :
                        <Clock className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {aiTyping && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-2xl rounded-bl-md" style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suspicious button for certain contacts */}
            {selectedChatData.taskIds?.length && !aiTyping && (
              <div className="px-3 py-1.5 border-t" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
                <button onClick={markSuspicious}
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Это подозрительно! Сообщить в SOC
                </button>
              </div>
            )}

            {/* Input area */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-t shrink-0" style={{ backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: isDark ? '#333' : '#e5e5e5' }}>
              <button onClick={handleFileSelect} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors" title="Прикрепить файл">
                <Paperclip className="w-4 h-4" style={{ color: isDark ? '#888' : '#666' }} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

              <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors" title="Эмодзи">
                <Smile className="w-4 h-4" style={{ color: isDark ? '#888' : '#666' }} />
              </button>

              <div className="flex-1 relative">
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={selectedFile ? `${newMsg || ''} [📎 ${selectedFile}]` : T('osXamMsgPlaceholder')}
                  className="w-full px-3 py-1.5 rounded-full text-sm outline-none"
                  style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#e0e0e0' : '#333' }}
                />
              </div>

              {selectedFile && (
                <button onClick={() => setSelectedFile(null)} className="p-1 rounded-full hover:bg-black/10">
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}

              <button onClick={() => startCall('audio')} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors" title="Микрофон">
                <Mic className="w-4 h-4" style={{ color: isDark ? '#888' : '#666' }} />
              </button>

              <button onClick={sendMessage} disabled={!newMsg.trim() && !selectedFile}
                className="p-2 rounded-full disabled:opacity-30 transition-all"
                style={{ backgroundColor: (newMsg.trim() || selectedFile) ? '#7c3aed' : 'transparent' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 p-3 rounded-2xl shadow-2xl border"
                  style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333' : '#e5e5e5' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Эмодзи</span>
                    <button onClick={() => setShowEmoji(false)} className="p-0.5 rounded hover:bg-black/10">
                      <X className="w-3.5 h-3.5" style={{ color: isDark ? '#888' : '#666' }} />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_LIST.map(emoji => (
                      <button key={emoji} onClick={() => selectEmoji(emoji)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3" style={{ backgroundColor: '#7c3aed' }}>X</div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Xam Мессенджер</h3>
              <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>Выберите чат для начала общения</p>
            </div>
          </div>
        )}
      </div>

      {/* Call overlay */}
      <AnimatePresence>
        {showCall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          >
            <div className="text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-white/10 border-2 border-white/30"
              >
                <span className="text-5xl">{selectedChatData?.avatar || '📞'}</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">{showCall.contact}</h2>
              <p className="text-gray-400 mb-8">
                {showCall.type === 'audio' ? '📞 Аудиозвонок...' : '📹 Видеозвонок...'}
              </p>
              <button onClick={() => setShowCall(null)}
                className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto hover:bg-red-600 transition-colors"
              >
                <Phone className="w-6 h-6 text-white rotate-[135deg]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
