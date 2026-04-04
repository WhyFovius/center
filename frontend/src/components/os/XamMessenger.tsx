import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Smile, Paperclip } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { askAI } from './DesktopOS';

interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
}

interface ChatData {
  name: string;
  avatar: string;
  online: boolean;
  lastMsg: string;
  time: string;
  isAI: boolean;
  systemPrompt: string;
  messages: Message[];
}

const INITIAL_CHATS: Record<string, ChatData> = {
  alexey: {
    name: 'Алексей Петров', avatar: '👨‍💻', online: true,
    lastMsg: 'Привет! Ты видел новый отчёт?', time: '10:42', isAI: true,
    systemPrompt: 'Ты Алексей, коллега-аналитик ИБ. Общайся неформально, используй сленг. Короткие сообщения.',
    messages: [
      { id: 1, text: 'Привет! Ты видел новый отчёт по безопасности?', fromMe: false, time: '10:30' },
      { id: 2, text: 'Да, там много интересного про фишинг', fromMe: true, time: '10:35' },
      { id: 3, text: 'Привет! Ты видел новый отчёт?', fromMe: false, time: '10:42' },
    ],
  },
  maria: {
    name: 'Мария Иванова', avatar: '👩‍💼', online: true,
    lastMsg: 'Отправила логи', time: '09:15', isAI: true,
    systemPrompt: 'Ты Мария, руководитель SOC. Общайся профессионально, кратко.',
    messages: [
      { id: 1, text: 'Мария, можешь прислать логи с сервера?', fromMe: true, time: '09:00' },
      { id: 2, text: 'Отправила логи', fromMe: false, time: '09:15' },
    ],
  },
  dmitry: {
    name: 'Дмитрий Козлов', avatar: '🧑‍🔬', online: false,
    lastMsg: 'Подозрительная активность в сети', time: 'Вчера', isAI: true,
    systemPrompt: 'Ты Дмитрий, сетевой инженер. Говоришь о сетях, портах, фаерволах.',
    messages: [
      { id: 1, text: 'Нашёл подозрительную активность в сети', fromMe: false, time: 'Вчера' },
    ],
  },
  soc: {
    name: 'SOC Team', avatar: '🛡️', online: true,
    lastMsg: 'Обновлены правила файрвола', time: 'Вчера', isAI: false,
    systemPrompt: '',
    messages: [
      { id: 1, text: 'Обновлены правила файрвола', fromMe: false, time: 'Вчера' },
    ],
  },
  it: {
    name: 'IT Support', avatar: '🔧', online: false,
    lastMsg: 'Обновление в 23:00', time: 'Пн', isAI: false,
    systemPrompt: '',
    messages: [
      { id: 1, text: 'Плановое обновление в 23:00', fromMe: false, time: 'Пн' },
    ],
  },
};

function getNow() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function XamMessenger() {
  const theme = useGS(s => s.theme);
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const isDark = theme === 'dark' || theme === 'bw';
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedChat, chats]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    const msg: Message = { id: Date.now(), text: newMsg.trim(), fromMe: true, time: getNow() };

    const chat = chats[selectedChat];
    const updatedMessages = [...chat.messages, msg];
    const updatedChats = {
      ...chats,
      [selectedChat]: { ...chat, messages: updatedMessages, lastMsg: msg.text, time: msg.time },
    };
    setChats(updatedChats);
    setNewMsg('');

    // AI reply
    if (chat.isAI) {
      setAiTyping(true);
      try {
        const aiResp = await askAI(msg.text, chat.systemPrompt);
        const aiMsg: Message = { id: Date.now() + 1, text: aiResp.trim(), fromMe: false, time: getNow() };
        setChats(prev => ({
          ...prev,
          [selectedChat]: {
            ...prev[selectedChat],
            messages: [...prev[selectedChat].messages, aiMsg],
            lastMsg: aiMsg.text,
            time: aiMsg.time,
          },
        }));
      } catch {
        // silent
      } finally {
        setAiTyping(false);
      }
    }
  };

  const filteredContacts = Object.entries(chats)
    .filter(([_, c]) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b[1].time.localeCompare(a[1].time));

  return (
    <div className="flex h-full" style={{ backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }}>
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col shrink-0" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#7c3aed' }}>
            X
          </div>
          <span className="text-sm font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Xam</span>
        </div>

        <div className="px-2 py-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: isDark ? '#252525' : '#f0f0f0' }}>
            <Search className="w-3.5 h-3.5" style={{ color: isDark ? '#888' : '#999' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={T('osXamSearch')}
              className="flex-1 bg-transparent text-xs outline-none" style={{ color: isDark ? '#e0e0e0' : '#333' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(([id, contact]) => (
            <button key={id} onClick={() => setSelectedChat(id)}
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
                <p className="text-[11px] truncate" style={{ color: isDark ? '#888' : '#666' }}>{contact.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat && chats[selectedChat] ? (
          <>
            {(() => {
              const contact = chats[selectedChat];
              return (
                <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }}>{contact.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{contact.name}</p>
                      <p className="text-[10px]" style={{ color: contact.online ? '#22c55e' : (isDark ? '#666' : '#999') }}>{contact.online ? T('osXamOnline') : T('osXamOffline')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => alert('Звонки пока недоступны в демо-режиме')} className="p-1.5 rounded-lg hover:bg-black/10"><Phone className="w-3.5 h-3.5" style={{ color: isDark ? '#aaa' : '#666' }} /></button>
                    <button onClick={() => alert('Видеозвонки пока недоступны в демо-режиме')} className="p-1.5 rounded-lg hover:bg-black/10"><Video className="w-3.5 h-3.5" style={{ color: isDark ? '#aaa' : '#666' }} /></button>
                    <button onClick={() => alert('Меню контакта')} className="p-1.5 rounded-lg hover:bg-black/10"><MoreVertical className="w-3.5 h-3.5" style={{ color: isDark ? '#aaa' : '#666' }} /></button>
                  </div>
                </div>
              );
            })()}

            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ backgroundColor: isDark ? '#121212' : '#fafafa' }}>
              {chats[selectedChat].messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.fromMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
                    style={{
                      backgroundColor: msg.fromMe ? (isDark ? '#7c3aed' : '#8b5cf6') : (isDark ? '#2a2a2a' : '#fff'),
                      color: msg.fromMe ? '#fff' : (isDark ? '#e0e0e0' : '#333'),
                    }}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] mt-0.5 text-right ${msg.fromMe ? 'text-white/50' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
              {aiTyping && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-2xl rounded-bl-md text-sm" style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
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

            <div className="flex items-center gap-1.5 px-3 py-2 border-t shrink-0" style={{ backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: isDark ? '#333' : '#e5e5e5' }}>
              <button onClick={() => alert('Прикрепление файлов пока недоступно')} className="p-1.5 rounded-lg hover:bg-black/10"><Paperclip className="w-4 h-4" style={{ color: isDark ? '#888' : '#666' }} /></button>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={T('osXamMsgPlaceholder')}
                className="flex-1 px-3 py-1.5 rounded-full text-sm outline-none"
                style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#e0e0e0' : '#333' }}
              />
              <button onClick={() => alert('Эмодзи пока недоступны')} className="p-1.5 rounded-lg hover:bg-black/10"><Smile className="w-4 h-4" style={{ color: isDark ? '#888' : '#666' }} /></button>
              <button onClick={sendMessage} disabled={!newMsg.trim()}
                className="p-2 rounded-full disabled:opacity-30 transition-all"
                style={{ backgroundColor: newMsg.trim() ? '#7c3aed' : 'transparent' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3" style={{ backgroundColor: '#7c3aed' }}>X</div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{T('osMessenger')}</h3>
              <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>{T('osXamSearch')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
