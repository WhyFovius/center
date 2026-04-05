import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Send, AlertTriangle, Shield, Mail, Star, Trash2, Archive,
  RefreshCw, Search, Reply, Forward, CheckCircle, Plus, X, Target,
  FileWarning, Eye, EyeOff, Info, Check, AlertOctagon, MailOpen
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { EmailData, EmailHeaders, PhishingIndicator } from '../types';

interface Props {
  onCompleteTask?: (taskId: string) => void;
}

const PHISHING_INDICATORS: PhishingIndicator[] = [
  {
    type: 'domain_mismatch',
    severity: 'high',
    description: 'Домен отправителя не совпадает с заявленной организацией',
    checkFn: (email) => {
      const from = email.headers?.from || email.from;
      const replyTo = email.headers?.['reply-to'];
      if (replyTo && !replyTo.includes(from.split('@')[1])) return true;
      return false;
    }
  },
  {
    type: 'spf_fail',
    severity: 'critical',
    description: 'SPF проверка не пройдена - письмо отправлено не с официального сервера',
    checkFn: (email) => email.headers?.spf === 'FAIL'
  },
  {
    type: 'dkim_fail',
    severity: 'critical',
    description: 'DKIM подпись отсутствует или неверна - письмо могло быть изменено',
    checkFn: (email) => email.headers?.dkim === 'FAIL' || email.headers?.dkim === 'NONE'
  },
  {
    type: 'urgent_deadline',
    severity: 'high',
    description: 'Письмо создаёт искусственную срочность для давления на получателя',
    checkFn: (email) => {
      const urgentWords = ['срочно', 'немедленно', 'до 10:00', 'иначе заблокирован', 'последнее предупреждение', 'важное'];
      return urgentWords.some(w => email.subject.toLowerCase().includes(w) || email.body.toLowerCase().includes(w));
    }
  },
  {
    type: 'reply_to_mismatch',
    severity: 'high',
    description: 'Reply-To адрес отличается от адреса отправителя',
    checkFn: (email) => {
      const fromDomain = email.from.split('@')[1];
      const replyTo = email.headers?.['reply-to'];
      return replyTo && !replyTo.includes(fromDomain);
    }
  }
];

const INITIAL_EMAILS: Record<string, EmailData[]> = {
  inbox: [
    {
      id: 1,
      from: 'payroll-security@center-invest.ru',
      subject: '⚠️ Ваш аккаунт будет заблокирован',
      preview: 'Для продолжения работы подтвердите ваши данные до 10:00...',
      time: '09:45',
      body: `Здравствуйте.

ВНИМАНИЕ: Ваш аккаунт будет заблокирован через 15 минут, если вы не подтвердите свои реквизиты.

Для разблокировки нажмите кнопку ниже и введите ваш логин и пароль:

👉 ПЕРЕЙТИ К ПОДТВЕРЖДЕНИЮ

Ссылка: https://center-invest-verify.secure-portal.work/login

⚠️ Бездействие приведёт к блокировке доступа.

С уважением,
Служба безопасности`,
      headers: {
        from: 'payroll-security@center-invest.ru',
        'reply-to': 'secure-portal@protonmail.com',
        'return-path': 'bounce@center-invest-payroll.verify-secure.work',
        'x-originating-ip': '185.234.71.15',
        spf: 'FAIL',
        dkim: 'NONE',
        dmarc: 'NONE'
      },
      isPhishing: true,
    },
    {
      id: 2,
      from: 'it-support@company.ru',
      subject: 'Плановое обновление ПО — 15 апреля',
      time: '08:30',
      preview: 'Уважаемые коллеги, 15 апреля с 23:00 до 02:00 будет проводиться...',
      body: `Уважаемые коллеги,

15 апреля с 23:00 до 02:00 будет проводиться плановое обновление программного обеспечения.

В это время могут быть недоступны:
• Корпоративная почта
• Внутренний портал
• Файловое хранилище

Заранее сохраните все важные данные.

IT Department`,
      headers: {
        from: 'it-support@company.ru',
        'x-originating-ip': '10.0.15.45',
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS'
      },
    },
    {
      id: 3,
      from: 'security@company.ru',
      subject: 'Новые правила безопасности',
      time: 'Вчера',
      preview: 'Обновлены требования к паролям и двухфакторной аутентификации...',
      body: `Коллеги,

С 1 мая вступают в силу новые правила безопасности:

1. Минимальная длина пароля — 12 символов
2. Обязательная двухфакторная аутентификация
3. Запрет на использование личных устройств без MDM
4. Обязательное обучение по фишингу

Подробности во внутреннем портале.

Отдел информационной безопасности`,
      headers: {
        from: 'security@company.ru',
        'x-originating-ip': '10.0.15.30',
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS'
      },
    },
  ],
  spam: [
    {
      id: 4,
      from: 'winner@lottery-intl.com',
      subject: 'ВЫ ВЫИГРАЛИ $1,000,000!',
      time: 'Вчера',
      preview: 'Поздравляем! Ваш email был выбран случайным образом...',
      body: `ПОЗДРАВЛЯЕМ!!!

Ваш email был выбран для получения приза в размере $1,000,000.

Для получения приза отправьте:
• Ваше полное имя
• Номер банковского счёта
• Копию паспорта

Не упустите свой шанс!`,
      headers: {
        from: 'winner@lottery-intl.com',
        spf: 'FAIL',
        dkim: 'NONE'
      },
      isPhishing: true,
    },
  ],
  soc: [
    {
      id: 5,
      from: 'soc-alert@company.ru',
      subject: 'Обнаружена подозрительная активность',
      time: '10:15',
      preview: 'Зафиксированы множественные неудачные попытки входа...',
      body: `ВНИМАНИЕ

Зафиксированы множественные неудачные попытки входа в вашу учётную запись.

Рекомендуем:
1. Сменить пароль
2. Включить двухфакторную аутентификацию
3. Проверить устройства в настройках

SOC Team`,
      headers: {
        from: 'soc-alert@company.ru',
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS'
      },
    },
  ],
};

function analyzePhishingIndicators(email: EmailData): PhishingIndicator[] {
  return PHISHING_INDICATORS.filter(indicator => indicator.checkFn(email));
}

function getSeverityColor(severity: PhishingIndicator['severity']): string {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#ca8a04';
    case 'low': return '#65a30d';
  }
}

function getSeverityLabel(severity: PhishingIndicator['severity']): string {
  switch (severity) {
    case 'critical': return 'КРИТИЧЕСКИ';
    case 'high': return 'ВЫСОКИЙ';
    case 'medium': return 'СРЕДНИЙ';
    case 'low': return 'НИЗКИЙ';
  }
}

export default function MailApp({ onCompleteTask }: Props) {
  const lang = useGS(s => s.lang);
  const completeTask = useGS(s => s.completeTask);
  const T = (key: string) => t(lang, key);

  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showPhishingAnalysis, setShowPhishingAnalysis] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [readEmails, setReadEmails] = useState<Set<number>>(new Set());

  const handleSelectEmail = (emailId: number) => {
    setSelectedEmail(emailId);
    setShowHeaders(false);
    setShowPhishingAnalysis(false);
    setReadEmails(prev => new Set([...prev, emailId]));
  };

  const emailsList = emails[selectedFolder] || [];
  const email = emailsList.find(e => e.id === selectedEmail);
  const phishingIndicators = email ? analyzePhishingIndicators(email) : [];
  const isPhishing = email?.isPhishing || phishingIndicators.length > 0;

  const filteredEmails = searchQuery
    ? emailsList.filter(e =>
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : emailsList;

  const handleReportSOC = () => {
    if (isPhishing) {
      completeTask('mail_phishing_detected');
      onCompleteTask?.('mail_phishing_detected');
      alert('✅ Жалоба отправлена в SOC.\n\nИнцидент зарегистрирован. Другие сотрудники будут предупреждены.');
    }
  };

  const handleDelete = () => {
    if (selectedEmail) {
      setEmails(prev => ({
        ...prev,
        [selectedFolder]: prev[selectedFolder].filter(e => e.id !== selectedEmail)
      }));
      setSelectedEmail(null);
    }
  };

  const FOLDERS = [
    { id: 'inbox', label: 'Входящие', icon: Inbox, count: INITIAL_EMAILS.inbox.length },
    { id: 'sent', label: 'Отправленные', icon: Send },
    { id: 'spam', label: 'Спам', icon: AlertTriangle, count: INITIAL_EMAILS.spam?.length || 0 },
    { id: 'soc', label: 'SOC', icon: Shield, count: INITIAL_EMAILS.soc?.length || 0 },
    { id: 'starred', label: 'Избранное', icon: Star },
    { id: 'archive', label: 'Архив', icon: Archive },
    { id: 'trash', label: 'Корзина', icon: Trash2 },
  ];

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-52 border-r flex flex-col shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#2563eb' }}>
              ЦИ
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>osMail</span>
          </div>
        </div>

        <button
          onClick={() => setShowCompose(true)}
          className="mx-2 mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white"
          style={{ backgroundColor: '#3b82f6' }}
        >
          <Plus className="w-3.5 h-3.5" /> Новое письмо
        </button>

        <div className="flex-1 overflow-y-auto py-2">
          {FOLDERS.map(folder => {
            const Icon = folder.icon;
            const unreadCount = folder.id === 'inbox' ? emails.inbox.filter(e => !readEmails.has(e.id)).length : 0;
            return (
              <button
                key={folder.id}
                onClick={() => { setSelectedFolder(folder.id); setSelectedEmail(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  selectedFolder === folder.id ? 'bg-accent/10' : 'hover:bg-accent/5'
                }`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{folder.label}</span>
                </div>
                {folder.count !== undefined && folder.count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                    backgroundColor: 'rgba(59,130,246,0.2)',
                    color: '#3b82f6',
                  }}>
                    {folder.id === 'inbox' ? unreadCount : folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-80 border-r flex flex-col shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск писем..."
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: 'var(--color-text)' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map(e => {
            const isUnread = !readEmails.has(e.id);
            const isSelected = selectedEmail === e.id;
            const indicators = analyzePhishingIndicators(e);
            const hasCritical = indicators.some(i => i.severity === 'critical' || i.severity === 'high');

            return (
              <button
                key={e.id}
                onClick={() => handleSelectEmail(e.id)}
                className={`w-full text-left px-3 py-3 border-b transition-colors ${
                  isSelected ? 'bg-accent/10' : 'hover:bg-accent/5'
                }`}
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    <span className={`text-xs font-medium truncate ${isUnread ? 'font-semibold' : ''}`}
                      style={{ color: hasCritical ? '#ef4444' : 'var(--color-text-secondary)' }}>
                      {e.from}
                    </span>
                  </div>
                  <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--color-text-muted)' }}>{e.time}</span>
                </div>
                <p className={`text-xs truncate ${isUnread ? 'font-semibold' : ''}`} style={{ color: 'var(--color-text)' }}>{e.subject}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{e.preview}</p>
                {hasCritical && !isPhishing && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                  }}>
                    <AlertTriangle className="w-2.5 h-2.5" /> Требует проверки
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-w-0">
        {email ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{
                    backgroundColor: isPhishing ? 'rgba(239,68,68,0.15)' : 'var(--color-surface)',
                    color: isPhishing ? '#ef4444' : 'var(--color-text-secondary)',
                  }}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{email.from}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{email.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHeaders(!showHeaders)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
                  >
                    {showHeaders ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    Заголовки
                  </button>
                  {isPhishing && (
                    <button
                      onClick={() => setShowPhishingAnalysis(!showPhishingAnalysis)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                    >
                      <FileWarning className="w-3.5 h-3.5" />
                      Анализ
                    </button>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold mt-4 mb-2" style={{ color: 'var(--color-text)' }}>{email.subject}</h2>
            </div>

            {showHeaders && email.headers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-4 rounded-xl border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>Заголовки безопасности</h4>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <p className="text-[10px] text-gray-500 mb-1">SPF</p>
                    <div className="flex items-center gap-2">
                      {email.headers.spf === 'PASS' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-bold ${
                        email.headers.spf === 'PASS' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {email.headers.spf}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {email.headers.spf === 'PASS' ? 'Отправлено с разрешённого сервера' : 'Источник не подтверждён'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <p className="text-[10px] text-gray-500 mb-1">DKIM</p>
                    <div className="flex items-center gap-2">
                      {email.headers.dkim === 'PASS' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-bold ${
                        email.headers.dkim === 'PASS' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {email.headers.dkim}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {email.headers.dkim === 'PASS' ? 'Подпись верифицирована' : 'Подпись отсутствует или неверна'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <p className="text-[10px] text-gray-500 mb-1">DMARC</p>
                    <div className="flex items-center gap-2">
                      {email.headers.dmarc === 'PASS' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`text-sm font-bold ${
                        email.headers.dmarc === 'PASS' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {email.headers.dmarc || 'NONE'}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {email.headers.dmarc === 'PASS' ? 'Политика домена соблюдена' : 'Проверка невозможна'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] text-gray-500 mb-2">Дополнительные заголовки</p>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--color-text-muted)' }}>From:</span>
                      <span style={{ color: 'var(--color-text)' }}>{email.headers.from}</span>
                    </div>
                    {email.headers['reply-to'] && (
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--color-text-muted)' }}>Reply-To:</span>
                        <span style={{ color: '#ef4444' }}>{email.headers['reply-to']}</span>
                        {email.headers['reply-to'] !== email.from && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            ⚠️ Не совпадает с From
                          </span>
                        )}
                      </div>
                    )}
                    {email.headers['x-originating-ip'] && (
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--color-text-muted)' }}>X-Originating-IP:</span>
                        <span style={{ color: 'var(--color-text)' }}>{email.headers['x-originating-ip']}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {showPhishingAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-4 rounded-xl border"
                style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <h4 className="text-sm font-bold text-red-500">Анализ признаков фишинга</h4>
                </div>

                <div className="space-y-2">
                  {phishingIndicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: getSeverityColor(indicator.severity) }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase" style={{ color: getSeverityColor(indicator.severity) }}>
                            {getSeverityLabel(indicator.severity)}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--color-text)' }}>{indicator.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Рекомендации</span>
                  </div>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <li>• Не переходите по ссылкам из подозрительных писем</li>
                    <li>• Проверьте SPF/DKIM/DMARC заголовки</li>
                    <li>• Сверьте адрес Reply-To с доменом отправителя</li>
                    <li>• Сообщите о письме в SOC</li>
                  </ul>
                </div>
              </motion.div>
            )}

            <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {email.body}
            </div>

            {isPhishing && (
              <div className="mt-6 p-4 rounded-xl border" style={{
                backgroundColor: 'rgba(239,68,68,0.05)',
                borderColor: 'rgba(239,68,68,0.2)',
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-bold text-red-500">⚠️ Подозрительное письмо</span>
                </div>
                <p className="text-xs text-red-400/80 mb-4">
                  Обнаружено {phishingIndicators.length} признаков фишинга. Рекомендуется проверить заголовки безопасности.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleReportSOC}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Сообщить в SOC
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border"
                    style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MailOpen className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Выберите письмо для просмотра</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
