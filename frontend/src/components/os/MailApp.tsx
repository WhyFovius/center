import { useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Send, AlertTriangle, Shield, Mail, Star, Trash2, Archive, RefreshCw, Search } from 'lucide-react';
import { useGS } from '@/store/useGS';

const FOLDERS = [
  { id: 'inbox', label: 'Входящие', icon: Inbox, count: 3 },
  { id: 'sent', label: 'Отправленные', icon: Send },
  { id: 'spam', label: 'Спам', icon: AlertTriangle, count: 1 },
  { id: 'soc', label: 'SOC', icon: Shield, count: 2 },
  { id: 'starred', label: 'Избранные', icon: Star },
  { id: 'archive', label: 'Архив', icon: Archive },
  { id: 'trash', label: 'Корзина', icon: Trash2 },
];

const EMAILS: Record<string, Array<{ id: number; from: string; subject: string; preview: string; time: string; body: string; headers?: Record<string, string>; isPhishing?: boolean; read?: boolean }>> = {
  inbox: [
    {
      id: 1, from: 'hr@company-mail.ru', subject: 'Срочно: подтвердите реквизиты до 10:00', time: '09:45',
      preview: 'Для выплаты зарплаты перейдите по ссылке и подтвердите данные...',
      body: 'Здравствуйте.\n\nВ связи с обновлением банковской системы просим срочно подтвердить ваши реквизиты для получения заработной платы.\n\nПерейдите по ссылке: https://company-payroll.verify-secure.work/login\n\nСрок действия ссылки — 2 часа.\n\nС уважением,\nОтдел кадров',
      headers: { 'Reply-To': 'urgent.hr@protonmail.com', 'SPF': 'FAIL', 'DKIM': 'none', 'From': 'hr@company-mail.ru <hr@company-mail.ru>' },
      isPhishing: true,
    },
    {
      id: 2, from: 'it-support@company.ru', subject: 'Плановое обновление ПО — 15 апреля', time: '08:30',
      preview: 'Уважаемые коллеги, 15 апреля с 23:00 до 02:00 будет проводиться...',
      body: 'Уважаемые коллеги,\n\n15 апреля с 23:00 до 02:00 будет проводиться плановое обновление программного обеспечения.\n\nВ это время могут быть недоступны:\n- Корпоративная почта\n- Внутренний портал\n- Файловое хранилище\n\nЗаранее сохраните все важные данные.\n\nIT Department',
      headers: { 'SPF': 'PASS', 'DKIM': 'pass', 'From': 'it-support@company.ru' },
    },
    {
      id: 3, from: 'security@company.ru', subject: 'Новые правила безопасности', time: 'Вчера',
      preview: 'Обновлены требования к паролям и двухфакторной аутентификации...',
      body: 'Коллеги,\n\nС 1 мая вступают в силу новые правила безопасности:\n\n1. Минимальная длина пароля — 12 символов\n2. Обязательная двухфакторная аутентификация\n3. Запрет на использование личных устройств без MDM\n4. Обязательное обучение по фишингу\n\nПодробности во внутреннем портале.\n\nОтдел информационной безопасности',
      headers: { 'SPF': 'PASS', 'DKIM': 'pass', 'From': 'security@company.ru' },
    },
  ],
  spam: [
    {
      id: 4, from: 'winner@lottery-intl.com', subject: 'ВЫ ВЫИГРАЛИ $1,000,000!', time: 'Вчера',
      preview: 'Поздравляем! Ваш email был выбран случайным образом...',
      body: 'ПОЗДРАВЛЯЕМ!!!\n\nВаш email был выбран для получения приза в размере $1,000,000.\n\nДля получения приза отправьте:\n- Ваше полное имя\n- Номер банковского счёта\n- Копию паспорта\n\nНе упустите свой шанс!',
      headers: { 'SPF': 'FAIL', 'DKIM': 'none', 'From': 'winner@lottery-intl.com' },
      isPhishing: true,
    },
  ],
  soc: [
    {
      id: 5, from: 'soc-alert@company.ru', subject: 'Обнаружена подозрительная активность', time: '10:15',
      preview: 'Зафиксированы множественные неудачные попытки входа в вашу учётную запись...',
      body: 'ВНИМАНИЕ\n\nЗафиксированы множественные неудачные попытки входа в вашу учётную запись из следующих IP:\n\n- 185.220.101.42 (Россия)\n- 91.234.99.15 (Нидерланды)\n\nРекомендуем:\n1. Сменить пароль\n2. Включить двухфакторную аутентификацию\n3. Проверить устройства в настройках\n\nSOC Team',
      headers: { 'SPF': 'PASS', 'DKIM': 'pass', 'From': 'soc-alert@company.ru' },
    },
    {
      id: 6, from: 'soc-report@company.ru', subject: 'Еженедельный отчёт по безопасности', time: 'Пн',
      preview: 'За неделю заблокировано 1,247 фишинговых писем...',
      body: 'Еженедельный отчёт\n\nСтатистика за неделю:\n- Заблокировано фишинговых писем: 1,247\n- Предотвращено атак: 34\n- Подозрительных подключений: 12\n- Обучено сотрудников: 89\n\nИнциденты:\n- 2 сотрудника перешли по фишинговым ссылкам\n- 1 устройство заражено malware (изолировано)\n\nРекомендации:\n- Пройти обучение по фишингу\n- Обновить антивирусные базы',
      headers: { 'SPF': 'PASS', 'DKIM': 'pass', 'From': 'soc-report@company.ru' },
    },
  ],
};

export default function MailApp() {
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark' || theme === 'bw';
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const emails = EMAILS[selectedFolder] || [];
  const email = emails.find(e => e.id === selectedEmail);

  const filteredEmails = searchQuery
    ? emails.filter(e => e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || e.from.toLowerCase().includes(searchQuery.toLowerCase()))
    : emails;

  return (
    <div className="flex h-full" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
      {/* Folders sidebar */}
      <div className="w-48 border-r flex flex-col" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="px-3 py-3 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" style={{ color: isDark ? '#e0e0e0' : '#333' }} />
            <span className="text-sm font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Почта</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {FOLDERS.map(folder => {
            const Icon = folder.icon;
            return (
              <button
                key={folder.id}
                onClick={() => { setSelectedFolder(folder.id); setSelectedEmail(null); setShowHeaders(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  selectedFolder === folder.id
                    ? (isDark ? 'bg-white/10' : 'bg-gray-100')
                    : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
                }`}
                style={{ color: isDark ? '#ccc' : '#333' }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{folder.label}</span>
                </div>
                {folder.count && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                    backgroundColor: isDark ? 'rgba(63,185,80,0.2)' : 'rgba(63,185,80,0.1)',
                    color: '#3fb950',
                  }}>
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Email list */}
      <div className="w-72 border-r flex flex-col" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="px-3 py-2 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{
            backgroundColor: isDark ? '#252525' : '#f0f0f0',
          }}>
            <Search className="w-3.5 h-3.5" style={{ color: isDark ? '#888' : '#999' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: isDark ? '#e0e0e0' : '#333' }}
            />
            <button className="p-1 rounded hover:bg-black/10">
              <RefreshCw className="w-3.5 h-3.5" style={{ color: isDark ? '#888' : '#999' }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map(e => (
            <button
              key={e.id}
              onClick={() => { setSelectedEmail(e.id); setShowHeaders(false); }}
              className={`w-full text-left px-3 py-3 border-b transition-colors ${
                selectedEmail === e.id
                  ? (isDark ? 'bg-purple-500/15 border-purple-500/20' : 'bg-purple-50 border-purple-100')
                  : (isDark ? 'hover:bg-white/5 border-gray-800' : 'hover:bg-gray-50 border-gray-100')
              }`}
              style={{ borderColor: isDark ? '#2a2a2a' : '#f0f0f0' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium truncate" style={{ color: e.isPhishing ? '#ef4444' : (isDark ? '#ccc' : '#333') }}>{e.from}</span>
                <span className="text-[10px] shrink-0 ml-2" style={{ color: isDark ? '#666' : '#999' }}>{e.time}</span>
              </div>
              <p className="text-xs font-semibold truncate" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{e.subject}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: isDark ? '#888' : '#666' }}>{e.preview}</p>
              {e.isPhishing && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                }}>
                  <AlertTriangle className="w-2.5 h-2.5" /> Подозрительное
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto">
        {email ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{email.subject}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{
                    backgroundColor: email.isPhishing ? 'rgba(239,68,68,0.15)' : (isDark ? '#2a2a2a' : '#f0f0f0'),
                    color: email.isPhishing ? '#ef4444' : (isDark ? '#ccc' : '#333'),
                  }}>
                    {email.from[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{email.from}</p>
                    <p className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>{email.time}</p>
                  </div>
                </div>
                {email.headers && (
                  <button
                    onClick={() => setShowHeaders(!showHeaders)}
                    className="text-xs px-3 py-1.5 rounded-lg hover:bg-black/10 transition-colors"
                    style={{ color: isDark ? '#aaa' : '#666' }}
                  >
                    {showHeaders ? 'Скрыть заголовки' : 'Показать заголовки'}
                  </button>
                )}
              </div>
            </div>

            {/* SPF/DKIM headers */}
            {showHeaders && email.headers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-4 rounded-xl"
                style={{ backgroundColor: isDark ? '#252525' : '#f5f5f5' }}
              >
                <h4 className="text-xs font-bold mb-2 uppercase" style={{ color: isDark ? '#888' : '#666' }}>Заголовки безопасности</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  {Object.entries(email.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span style={{ color: isDark ? '#888' : '#666' }}>{key}:</span>
                      <span style={{
                        color: value === 'PASS' || value === 'pass' ? '#22c55e' : value === 'FAIL' || value === 'none' ? '#ef4444' : (isDark ? '#ccc' : '#333'),
                        fontWeight: value === 'FAIL' || value === 'none' ? 'bold' : 'normal',
                      }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Body */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: isDark ? '#ccc' : '#444' }}>
              {email.body}
            </div>

            {/* Actions for phishing */}
            {email.isPhishing && (
              <div className="mt-6 p-4 rounded-xl border" style={{
                backgroundColor: 'rgba(239,68,68,0.05)',
                borderColor: 'rgba(239,68,68,0.2)',
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-red-500">Подозрительное письмо</span>
                </div>
                <p className="text-xs text-red-400/80 mb-3">
                  Обнаружены признаки фишинга: подозрительный Reply-To, SPF FAIL, DKIM none
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
                    Пожаловаться в SOC
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: isDark ? '#fff' : '#333' }} />
              <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>Выберите письмо для просмотра</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
