import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Send, AlertTriangle, Shield, Mail, Star, Trash2, Archive, RefreshCw, Search, Reply, Forward, CheckCircle, Plus, X, Target } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import AttackScenarioPlayer from './AttackScenarioPlayer';
import { getScenarioById } from '@/lib/attackScenarios';

interface EmailData {
  id: number;
  from: string;
  subject: string;
  preview: string;
  time: string;
  body: string;
  headers?: Record<string, string>;
  isPhishing?: boolean;
  read?: boolean;
}

interface ComposeData {
  to: string;
  subject: string;
  body: string;
  isReply: boolean;
  replyTo?: EmailData;
  isForward: boolean;
  forwardFrom?: EmailData;
}

const INITIAL_EMAILS: Record<string, EmailData[]> = {
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
  const lang = useGS(s => s.lang);
  const completeTask = useGS(s => s.completeTask);
  const osTasks = useGS(s => s.osTasks);
  const T = (key: string) => t(lang, key);
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

  const FOLDERS = [
    { id: 'inbox', label: T('osMailInbox'), icon: Inbox, count: 3 },
    { id: 'sent', label: T('osMailSent'), icon: Send },
    { id: 'spam', label: T('osMailSpam'), icon: AlertTriangle, count: 1 },
    { id: 'soc', label: T('osMailSOC'), icon: Shield, count: 2 },
    { id: 'starred', label: T('osMailStarred'), icon: Star },
    { id: 'archive', label: T('osMailArchive'), icon: Archive },
    { id: 'trash', label: T('osMailTrash'), icon: Trash2 },
  ];

  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState<ComposeData>({ to: '', subject: '', body: '', isReply: false, isForward: false });

  const emailsList = emails[selectedFolder] || [];
  const email = emailsList.find(e => e.id === selectedEmail);

  const filteredEmails = searchQuery
    ? emailsList.filter(e => e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || e.from.toLowerCase().includes(searchQuery.toLowerCase()))
    : emailsList;

  const handleReportSOC = () => {
    if (email?.isPhishing) {
      completeTask('mail_phishing');
      if (email.subject.includes('реквизиты') || email.subject.includes('зарплат')) {
        completeTask('mail_payroll');
      }
    }
    alert('Жалоба отправлена в SOC. Письмо будет проанализировано.');
  };

  const handleDelete = () => {
    setSelectedEmail(null);
    setSelectedFolder('trash');
  };

  const handleReply = () => {
    if (!email) return;
    setComposeData({
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.from}\n${email.body}`,
      isReply: true,
      replyTo: email,
      isForward: false,
    });
    setShowCompose(true);
  };

  const handleForward = () => {
    if (!email) return;
    setComposeData({
      to: '',
      subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.from}\n${email.body}`,
      isReply: false,
      isForward: true,
      forwardFrom: email,
    });
    setShowCompose(true);
  };

  const handleNewCompose = () => {
    setComposeData({ to: '', subject: '', body: '', isReply: false, isForward: false });
    setShowCompose(true);
  };

  const handleSendEmail = () => {
    if (!composeData.to || !composeData.subject) {
      alert('Заполните поля "Кому" и "Тема"');
      return;
    }
    const newEmail: EmailData = {
      id: Date.now(),
      from: 'me@company.ru',
      subject: composeData.subject,
      preview: composeData.body.slice(0, 80) + '...',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      body: composeData.body,
      headers: { 'SPF': 'PASS', 'DKIM': 'pass', 'From': 'me@company.ru' },
    };
    setEmails(prev => ({
      ...prev,
      sent: [newEmail, ...(prev.sent || [])],
    }));
    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '', isReply: false, isForward: false });
    alert('Письмо отправлено!');
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Folders sidebar */}
      <div className="w-48 border-r flex flex-col shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#2d8b4d' }}>
              ЦИ
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{T('osMail')}</span>
          </div>
        </div>

        <button onClick={handleNewCompose}
          className="mx-2 mt-2 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-white"
          style={{ backgroundColor: '#3fb950' }}
        >
          <Plus className="w-3.5 h-3.5" /> {T('osMailCompose')}
        </button>

        {/* Scenario buttons */}
        <div className="mx-2 mt-2 space-y-1">
          {!osTasks.scenario_mail_phishing_payroll && (
            <button onClick={() => handleStartScenario('mail_phishing_payroll')}
              className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
              style={{ borderColor: 'rgba(124,58,237,0.3)', color: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.05)' }}
            >
              <Target className="w-3.5 h-3.5" /> Сценарий: Фишинг
            </button>
          )}
          {!osTasks.scenario_mail_ceo_fraud && (
            <button onClick={() => handleStartScenario('mail_ceo_fraud')}
              className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
              style={{ borderColor: 'rgba(124,58,237,0.3)', color: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.05)' }}
            >
              <Target className="w-3.5 h-3.5" /> Сценарий: CEO Fraud
            </button>
          )}
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
                    ? 'bg-accent/10'
                    : 'hover:bg-accent/5'
                }`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{folder.label}</span>
                </div>
                {folder.count && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                    backgroundColor: 'rgba(63,185,80,0.2)',
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
      <div className="w-72 border-r flex flex-col shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{
            backgroundColor: 'var(--color-surface)',
          }}>
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={T('osMailSearch')}
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: 'var(--color-text)' }}
            />
            <button className="p-1 rounded hover:bg-black/10">
              <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
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
                  ? 'bg-accent/10 border-accent/20'
                  : 'hover:bg-accent/5'
              }`}
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium truncate" style={{ color: e.isPhishing ? '#ef4444' : 'var(--color-text-secondary)' }}>{e.from}</span>
                <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--color-text-muted)' }}>{e.time}</span>
              </div>
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{e.subject}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{e.preview}</p>
              {e.isPhishing && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                }}>
                  <AlertTriangle className="w-2.5 h-2.5" /> {T('osMailSuspicious')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {email ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{email.subject}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{
                    backgroundColor: email.isPhishing ? 'rgba(239,68,68,0.15)' : 'var(--color-surface)',
                    color: email.isPhishing ? '#ef4444' : 'var(--color-text-secondary)',
                  }}>
                    {email.from[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{email.from}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{email.time}</p>
                  </div>
                </div>
                {email.headers && (
                  <button
                    onClick={() => setShowHeaders(!showHeaders)}
                    className="text-xs px-3 py-1.5 rounded-lg hover:bg-black/10 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {showHeaders ? T('osMailHideHeaders') : T('osMailShowHeaders')}
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
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <h4 className="text-xs font-bold mb-2 uppercase" style={{ color: 'var(--color-text-muted)' }}>{T('osMailSOC')}</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  {Object.entries(email.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span style={{ color: 'var(--color-text-muted)' }}>{key}:</span>
                      <span style={{
                        color: value === 'PASS' || value === 'pass' ? '#22c55e' : value === 'FAIL' || value === 'none' ? '#ef4444' : 'var(--color-text-secondary)',
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
            <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {email.body}
            </div>

            {/* Actions for phishing */}
            {email.isPhishing && (
              <div className="mt-6 p-4 rounded-xl border" style={{
                backgroundColor: 'rgba(239,68,68,0.05)',
                borderColor: 'rgba(239,68,68,0.2)',
              }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-bold text-red-500">{T('osMailSuspicious')}</span>
                  </div>
                  {(osTasks.mail_phishing || osTasks.mail_payroll) && (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">{T('osTasksCompleted')}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-red-400/80 mb-3">
                  {T('osMailSuspicious')}: Reply-To, SPF FAIL, DKIM none
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleReportSOC} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
                    {T('osMailReportSOC')}
                  </button>
                  <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
                    {T('osMailDelete')}
                  </button>
                  <button onClick={handleReply} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1">
                    <Reply className="w-3 h-3" /> Reply
                  </button>
                  <button onClick={handleForward} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1">
                    <Forward className="w-3 h-3" /> Forward
                  </button>
                </div>
              </div>
            )}

            {/* Actions for non-phishing emails */}
            {!email.isPhishing && (
              <div className="mt-6 flex gap-2 flex-wrap">
                <button onClick={handleReply} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1">
                  <Reply className="w-3 h-3" /> Reply
                </button>
                <button onClick={handleForward} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1">
                  <Forward className="w-3 h-3" /> Forward
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{T('osMailSearch')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCompose(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                {composeData.isReply ? 'Reply' : composeData.isForward ? 'Forward' : T('osMailCompose')}
              </h3>
              <button onClick={() => setShowCompose(false)} className="p-1 rounded hover:bg-black/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Кому:</label>
                <input
                  value={composeData.to}
                  onChange={e => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  placeholder="recipient@company.ru"
                />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Тема:</label>
                <input
                  value={composeData.subject}
                  onChange={e => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Текст:</label>
                <textarea
                  value={composeData.body}
                  onChange={e => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', minHeight: '150px' }}
                />
              </div>
              <button
                onClick={handleSendEmail}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: '#3fb950' }}
              >
                <Send className="w-4 h-4" /> Отправить
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
