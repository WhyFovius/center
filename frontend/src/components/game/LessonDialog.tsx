import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Inbox, MailOpen, ShieldCheck, X } from 'lucide-react';
import type { ScenarioStep } from '@/types';
import { useGS } from '@/store/useGS';
import { sfx } from '@/lib/sfx';

type PracticeCard = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body?: string;
  target: 'flags' | 'verify';
};

type TrainingBlock = {
  title: string;
  text: string;
};

const STEP_TRAINING_GUIDES: Record<string, TrainingBlock[]> = {
  'office-phishing': [
    {
      title: 'Что происходит в этом кейсе',
      text: 'Вы получили письмо о срочной выплате. Это классический payroll-фишинг: вас торопят дедлайном, чтобы вы не проверяли отправителя и ссылку.',
    },
    {
      title: 'Как распознать подделку за 30 секунд',
      text: 'Сравните домен отправителя с корпоративным, проверьте Reply-To и адрес ссылки. Если есть несоответствие, это инцидент, а не «рабочая спешка».',
    },
    {
      title: 'Правильный порядок действий',
      text: '1) Не открывать ссылку и вложение. 2) Переслать письмо в ИБ/SOC как подозрительное. 3) Подтвердить запрос через официальный внутренний канал.',
    },
    {
      title: 'Типичная ошибка и её цена',
      text: 'Переход по ссылке может привести к краже логина и пароля. Одна ошибка сотрудника часто превращается в атаку на всю команду.',
    },
  ],
  'office-deepfake': [
    {
      title: 'Сценарий атаки',
      text: 'Звонящий имитирует руководителя и требует OTP «прямо сейчас». Это социальная инженерия с давлением авторитетом и срочностью.',
    },
    {
      title: 'Главное правило',
      text: 'Одноразовые коды, пароли и подтверждения не передаются никому, даже если голос кажется знакомым.',
    },
    {
      title: 'Безопасный ответ',
      text: 'Прервите разговор, создайте/проверьте тикет, перезвоните по официальному номеру из корпоративного справочника.',
    },
    {
      title: 'Как не попасться снова',
      text: 'Любой «срочный» запрос на коды = красный флаг. При сомнении эскалируйте в ИБ до выполнения действия.',
    },
  ],
  'home-smishing': [
    {
      title: 'Схема мошенничества',
      text: 'SMS сообщает о «блокировке карты» и предлагает установить APK. Цель — заставить вас установить вредоносное приложение.',
    },
    {
      title: 'Что проверяем первым',
      text: 'Банк не просит ставить APK по ссылке из SMS. Любые обновления — только через официальный магазин приложений.',
    },
    {
      title: 'Безопасный алгоритм',
      text: 'Откройте официальное приложение банка или позвоните по номеру с официального сайта, а не из сообщения.',
    },
    {
      title: 'К чему приводит ошибка',
      text: 'После установки APK злоумышленник может перехватывать SMS, push-коды и управлять доступом к счетам.',
    },
  ],
  'home-credential': [
    {
      title: 'Что означает этот инцидент',
      text: 'Серия неуспешных входов и один успешный вход из чужой географии — признак credential stuffing и возможного захвата аккаунта.',
    },
    {
      title: 'Что делать немедленно',
      text: 'Завершите все активные сессии, смените пароль на уникальный и включите MFA. Не откладывайте реакцию «на потом».',
    },
    {
      title: 'Как выбрать новый пароль',
      text: 'Не меняйте только цифру в старом пароле. Нужен полностью новый, уникальный пароль, который не используется в других сервисах.',
    },
    {
      title: 'Контроль после восстановления',
      text: 'Проверьте резервную почту, номера телефона, правила пересылки писем и неизвестные устройства в настройках аккаунта.',
    },
  ],
  'wifi-evil-twin': [
    {
      title: 'Как работает атака Evil Twin',
      text: 'Злоумышленник поднимает сеть с похожим названием и поддельным порталом входа. Вы вводите данные, и они сразу уходят атакующему.',
    },
    {
      title: 'Признаки опасной сети',
      text: 'Неожиданный запрос корпоративного логина в публичном Wi-Fi, странный URL портала и отсутствие подтверждения от площадки.',
    },
    {
      title: 'Правильное решение',
      text: 'Сверьте SSID с официальной табличкой, для рабочих задач используйте VPN или мобильный интернет.',
    },
    {
      title: 'Почему это важно',
      text: 'Даже «удобный» вход в публичной сети может закончиться кражей сессии и доступом к корпоративным сервисам.',
    },
  ],
  'wifi-qr': [
    {
      title: 'Суть QR-атаки',
      text: 'Вам предлагают отсканировать «полезный» QR, который ведет на фишинговую страницу оплаты или авторизации.',
    },
    {
      title: 'Чеклист перед сканом',
      text: 'Проверьте источник QR, контекст объявления и домен после открытия. Если домен неофициальный — сразу закрывайте.',
    },
    {
      title: 'Безопасное поведение',
      text: 'Оплачивайте и авторизуйтесь только через официальное приложение или вручную введенный проверенный адрес.',
    },
    {
      title: 'Типичный провал',
      text: 'Пользователь видит «удобный QR» и не проверяет адрес сайта. Это часто приводит к краже карт и учетных данных.',
    },
  ],
  'banking-transfer': [
    {
      title: 'Что здесь пытаются сделать',
      text: 'Вас подталкивают к срочному переводу по поддельному запросу. Основной рычаг — страх ошибки и давление временем.',
    },
    {
      title: 'Как проверять платежные запросы',
      text: 'Сверяйте реквизиты с утвержденным источником, подтверждайте операцию через независимый канал и процедуру 4-eyes.',
    },
    {
      title: 'Безопасный маршрут решения',
      text: 'Приостановите операцию, передайте кейс в ИБ/финконтроль, затем подтвердите легитимность у ответственного лица.',
    },
    {
      title: 'Риск неверного шага',
      text: 'Ошибочный перевод обычно трудно вернуть, а инцидент может повлиять на компанию, клиентов и вашу репутацию.',
    },
  ],
  'banking-otp': [
    {
      title: 'Опасный паттерн',
      text: 'У вас просят OTP под видом «подтверждения операции». На практике это попытка обойти второй фактор защиты.',
    },
    {
      title: 'Что нельзя делать никогда',
      text: 'Не диктуйте OTP по телефону, в чате и в письмах. OTP — это ключ к доступу, а не «служебная формальность».',
    },
    {
      title: 'Как отвечать безопасно',
      text: 'Откажите в передаче кода, зафиксируйте запрос и проверьте операцию через официальный кабинет/горячую линию.',
    },
    {
      title: 'Признак мошенничества',
      text: 'Если просят код «срочно» и без официальной верификации личности, это почти всегда атака.',
    },
  ],
  'travel-wifi': [
    {
      title: 'Сценарий в поездке',
      text: 'В аэропорту легко подключиться к поддельной сети из-за спешки. Атакующий использует похожий SSID и фальшивый портал.',
    },
    {
      title: 'Проверка до подключения',
      text: 'Сверяйте название сети с официальной информацией аэропорта и избегайте ввода персональных данных в порталах.',
    },
    {
      title: 'Безопасная альтернатива',
      text: 'Для рабочих задач лучше использовать мобильный интернет или заранее настроенный VPN-профиль.',
    },
    {
      title: 'Почему это критично',
      text: 'В поездках бдительность падает, а цена ошибки выше: утечка персональных данных и перехват сессий.',
    },
  ],
  'travel-hotel': [
    {
      title: 'Как выглядит обман',
      text: '«Ресепшн» просит по телефону номер карты и CVV. Это частая схема в отелях, особенно вечером и в день заселения.',
    },
    {
      title: 'Жёсткое правило',
      text: 'CVV и полный номер карты не сообщаются по телефону. Легитимный персонал не должен это запрашивать.',
    },
    {
      title: 'Правильное действие',
      text: 'Проверьте вопрос лично на стойке ресепшн или через официальный внутренний номер отеля.',
    },
    {
      title: 'Чем заканчивается ошибка',
      text: 'Передача реквизитов ведет к быстрым несанкционированным списаниям и сложному процессу оспаривания.',
    },
  ],
  'remote-vpn': [
    {
      title: 'Что это за риск',
      text: 'Поддельное окно обновления VPN может быть поставкой вредоносного ПО под видом «критического патча».',
    },
    {
      title: 'Проверка обновлений',
      text: 'Сверяйте домен, сертификат и источник установки. Обновления ставятся только из корпоративного официального канала.',
    },
    {
      title: 'Алгоритм безопасной реакции',
      text: 'Не устанавливайте файл сразу, откройте тикет в IT/ИБ и дождитесь подтверждения легитимности обновления.',
    },
    {
      title: 'Почему это важно для компании',
      text: 'Компрометация одного удаленного устройства может стать входной точкой в корпоративную сеть.',
    },
  ],
  'remote-share': [
    {
      title: 'Где здесь ловушка',
      text: 'Вас просят отправить рабочий файл на личную почту из-за «срочного дедлайна». Это нарушение политики и риск утечки.',
    },
    {
      title: 'Принцип принятия решения',
      text: 'Срочность не отменяет правила защиты данных. Канал должен быть корпоративным и контролируемым.',
    },
    {
      title: 'Безопасный вариант',
      text: 'Используйте утвержденный корпоративный инструмент обмена или согласуйте альтернативу с ИБ/IT.',
    },
    {
      title: 'Чего избегать',
      text: 'Не отправляйте даже «обезличенные» версии через личные каналы без официального согласования.',
    },
  ],
};

function detectFamily(step: ScenarioStep) {
  const fingerprint = [step.attack_type, step.location, step.title, step.code].join(' ').toLowerCase();
  if (fingerprint.includes('wifi') || fingerprint.includes('wi-fi') || fingerprint.includes('кафе')) return 'wifi';
  if (fingerprint.includes('sms') || fingerprint.includes('смартф') || fingerprint.includes('qr') || fingerprint.includes('smishing')) return 'mobile';
  if (fingerprint.includes('парол') || fingerprint.includes('credential') || fingerprint.includes('otp')) return 'identity';
  if (fingerprint.includes('чат') || fingerprint.includes('звонок') || fingerprint.includes('соц')) return 'social';
  if (fingerprint.includes('почт') || fingerprint.includes('email') || fingerprint.includes('фиш')) return 'email';
  return 'generic';
}

function parsePayload(step: ScenarioStep) {
  const lines = step.payload.split('\n').map(line => line.trim()).filter(Boolean);
  const map: Record<string, string> = {};
  lines.forEach(line => {
    const [left, ...rest] = line.split(':');
    if (!left || rest.length === 0) return;
    map[left.toLowerCase()] = rest.join(':').trim();
  });
  return map;
}

function buildPracticeCards(step: ScenarioStep): PracticeCard[] {
  const payload = parsePayload(step);
  const family = detectFamily(step);
  const from = payload.from || payload.sender || 'security@company-mail.ru';
  const replyTo = payload['reply-to'] || 'urgent.helpdesk@protonmail.com';
  const link = payload.link || 'https://center-invest-payroll.verify-secure.work/login';
  const suspiciousByFamily: Record<string, PracticeCard[]> = {
    email: [
      { id: 'e-1', from, subject: 'Срочно: подтвердите реквизиты до 10:00', preview: `Для выплаты перейдите по ссылке: ${link}`, target: 'flags' },
      { id: 'e-2', from: replyTo, subject: 'Реестр будет заблокирован', preview: 'Если не подтвердите данные за 15 минут, выплаты остановятся.', target: 'flags' },
    ],
    social: [
      { id: 's-1', from: 'ceo-support@urgent-help.info', subject: 'Код подтверждения от директора', preview: 'Нужен OTP прямо сейчас, времени нет. Не сообщайте никому.', target: 'flags' },
      { id: 's-2', from: replyTo, subject: 'Проверка личности руководителя', preview: 'Запрос пришел с непроверенного номера и давит срочностью.', target: 'flags' },
    ],
    mobile: [
      { id: 'm-1', from: 'BANK_NOTIFY', subject: 'Срочное обновление APK', preview: 'Скачайте app-secure-update.apk для разблокировки карты.', target: 'flags' },
      { id: 'm-2', from: 'notify@quick-pay.help', subject: 'QR для подтверждения платежа', preview: 'Сканируйте код из сообщения, иначе перевод отменится.', target: 'flags' },
    ],
    wifi: [
      { id: 'w-1', from: 'wifi-portal@free5g.help', subject: 'Вход в сеть кафе', preview: 'Введите корпоративный логин и пароль для доступа к Wi-Fi.', target: 'flags' },
      { id: 'w-2', from: 'noreply@public-hotspot.io', subject: 'Повторная верификация в сети', preview: 'Подтвердите личные данные для продолжения сессии.', target: 'flags' },
    ],
    identity: [
      { id: 'i-1', from: 'security-alert@auth-center.net', subject: '17 входов в аккаунт', preview: 'Подтвердите пароль и код, чтобы сохранить доступ.', target: 'flags' },
      { id: 'i-2', from: replyTo, subject: 'Сброс пароля из неизвестного региона', preview: 'Запрос пришел не из вашего профиля, но давит дедлайном.', target: 'flags' },
    ],
    generic: [
      { id: 'g-1', from, subject: 'Срочная проверка учетной записи', preview: `Подтвердите данные через внешний ресурс: ${link}`, target: 'flags' },
      { id: 'g-2', from: replyTo, subject: 'Неотложный служебный запрос', preview: 'Сообщение требует действие без верификации источника.', target: 'flags' },
    ],
  };
  const safeExamplesByFamily: Record<string, PracticeCard[]> = {
    email: [
      { id: 'e-3', from: 'security@center-invest.ru', subject: 'Официальный тикет SOC', preview: 'Проверьте инцидент только через внутренний портал и номер тикета.', target: 'verify' },
      { id: 'e-4', from: 'it-service@center-invest.ru', subject: 'Плановое уведомление', preview: 'Подтвердите задачу через корпоративный сервис заявок.', target: 'verify' },
    ],
    social: [
      { id: 's-3', from: 'it-service@center-invest.ru', subject: 'Проверка запроса руководителя', preview: 'Подтверждение личности только через официальный канал и тикет.', target: 'verify' },
      { id: 's-4', from: 'soc@center-invest.ru', subject: 'Регламент по звонкам', preview: 'Коды и пароли не передаются даже руководителю.', target: 'verify' },
    ],
    mobile: [
      { id: 'm-3', from: 'security@bank.ru', subject: 'Проверка уведомления', preview: 'Откройте только официальное приложение банка, не ссылку из SMS.', target: 'verify' },
      { id: 'm-4', from: 'soc-mobile@center-invest.ru', subject: 'Инструкция по мобильным угрозам', preview: 'Подтверждение операции через доверенный канал ИБ.', target: 'verify' },
    ],
    wifi: [
      { id: 'w-3', from: 'it-security@center-invest.ru', subject: 'Безопасность публичных сетей', preview: 'Используйте мобильный интернет или VPN из корпоративного профиля.', target: 'verify' },
      { id: 'w-4', from: 'soc@center-invest.ru', subject: 'Проверка SSID', preview: 'Сверяйте название сети с официальной табличкой.', target: 'verify' },
    ],
    identity: [
      { id: 'i-3', from: 'security@center-invest.ru', subject: 'Реакция на компрометацию', preview: 'Завершите сессии, смените пароль и включите MFA.', target: 'verify' },
      { id: 'i-4', from: 'soc@center-invest.ru', subject: 'Проверка активности входов', preview: 'Эскалируйте инцидент через ИБ-портал.', target: 'verify' },
    ],
    generic: [
      { id: 'g-3', from: 'security@center-invest.ru', subject: 'Официальный канал проверки', preview: 'Любой срочный запрос подтверждайте через внутренний канал.', target: 'verify' },
      { id: 'g-4', from: 'soc@center-invest.ru', subject: 'Процедура верификации', preview: 'Не переходите по ссылкам из сообщений без проверки источника.', target: 'verify' },
    ],
  };
  return [...(suspiciousByFamily[family] ?? suspiciousByFamily.generic), ...(safeExamplesByFamily[family] ?? safeExamplesByFamily.generic)];
}

function buildTrainingBlocks(step: ScenarioStep) {
  const stepGuide = STEP_TRAINING_GUIDES[step.code];
  if (stepGuide?.length) {
    return stepGuide;
  }

  const payload = parsePayload(step);
  const indicators = Object.entries(payload)
    .slice(0, 3)
    .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
    .join(' • ');

  return [
    {
      title: 'Ключевой риск сценария',
      text: step.why_dangerous,
    },
    {
      title: 'Безопасный алгоритм действий',
      text: step.explanation,
    },
    {
      title: 'Что обязательно проверить',
      text: indicators || 'Проверьте источник, ссылку, канал связи и контекст запроса перед действием.',
    },
    {
      title: 'Правило уровня',
      text: 'Не выполнять срочные требования из сообщения до подтверждения через независимый корпоративный канал.',
    },
  ];
}

function decisionLabel(target: 'flags' | 'verify' | null) {
  if (target === 'flags') return 'Подозрительно';
  if (target === 'verify') return 'Безопасно';
  return 'Не проверено';
}

export function LessonDialog({ step, onClose }: { step: ScenarioStep; onClose: () => void }) {
  const setGp = useGS(s => s.setGp);
  const [page, setPage] = useState<'training' | 'practice'>('training');
  const practiceCards = useMemo(() => buildPracticeCards(step), [step]);
  const trainingBlocks = useMemo(() => buildTrainingBlocks(step), [step]);
  const [decisions, setDecisions] = useState<Record<string, 'flags' | 'verify' | null>>({});
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  useEffect(() => {
    setPage('training');
    setDecisions(Object.fromEntries(practiceCards.map(card => [card.id, null])));
    setSelectedMessageId(practiceCards[0]?.id ?? null);
  }, [practiceCards, step.id]);

  const checkedCount = practiceCards.filter(card => decisions[card.id]).length;
  const correctlyPlaced = practiceCards.filter(card => decisions[card.id] === card.target).length;
  const isPracticeComplete = practiceCards.length > 0 && checkedCount === practiceCards.length;
  const selectedCard = practiceCards.find(card => card.id === selectedMessageId) ?? practiceCards[0] ?? null;

  const markMessage = (target: 'flags' | 'verify') => {
    if (!selectedCard) return;
    const updated = { ...decisions, [selectedCard.id]: target };
    setDecisions(updated);
    const nextUnchecked = practiceCards.find(card => !updated[card.id]);
    if (nextUnchecked) {
      setSelectedMessageId(nextUnchecked.id);
    }
  };

  const selectedDecision = selectedCard ? decisions[selectedCard.id] : null;
  const selectedIsCorrect = selectedCard ? selectedDecision === selectedCard.target : false;

  const selectedMessageBody = selectedCard
    ? selectedCard.body ??
      `Здравствуйте.\n\n${selectedCard.preview}\n\nКонтекст кейса: ${step.brief}\n\nЕсли сообщение требует срочного действия — сначала подтвердите запрос через официальный канал.\n\nС уважением,\n${selectedCard.from}`
    : '';

  const progressPercent = practiceCards.length ? Math.round((checkedCount / practiceCards.length) * 100) : 0;

  const decisionToneClass = (card: PracticeCard) => {
    const userDecision = decisions[card.id];
    if (!userDecision) return 'border-border bg-white hover:bg-bg-secondary/40';
    if (userDecision === card.target) return 'border-success/35 bg-success-soft';
    return 'border-danger/35 bg-danger-soft';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-30"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-5xl max-h-[92vh] bg-surface border border-border rounded-[30px] overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.32)] flex flex-col"
        onClick={event => event.stopPropagation()}
      >
        <div className="relative px-6 py-5 border-b border-border bg-[linear-gradient(180deg,rgba(31,120,207,0.11),rgba(31,120,207,0.03))]">
          <button
            onClick={() => {
              sfx.click();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>

          <div className="flex flex-wrap items-center gap-3 pr-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/85 px-3 py-1 text-xs font-semibold text-info">
              <BookOpen className="w-3.5 h-3.5" />
              Обучение перед тестом
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-text-secondary">
              {step.attack_type}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-text-secondary">
              {step.location}
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-bold text-text max-w-4xl">{step.title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-text-secondary">
            Обучение отдельно от теста: сначала разбираем правила и примеры, потом принимаем решение.
          </p>
        </div>

        <div className="px-6 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPage('training')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                page === 'training' ? 'bg-primary text-white' : 'bg-bg-secondary text-text-secondary hover:bg-surface-active'
              }`}
            >
              1. Обучение
            </button>
            <button
              onClick={() => setPage('practice')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                page === 'practice' ? 'bg-primary text-white' : 'bg-bg-secondary text-text-secondary hover:bg-surface-active'
              }`}
            >
              2. Входящие
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto">
          {page === 'training' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
              <div className="rounded-[28px] border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-info font-semibold">Учебный разбор</p>
                <div className="mt-4 space-y-4">
                  {trainingBlocks.map((block, index) => (
                    <div key={block.title} className="relative rounded-3xl border border-border bg-bg-secondary/45 p-4 pl-14">
                      <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-info-soft text-info font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm font-semibold text-text">{block.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{block.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-[#0e1726] text-[#dfe9ff] p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#89aaff] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Реальные примеры сообщений
                </div>
                <div className="mt-4 space-y-3">
                  {practiceCards.filter(card => card.target === 'flags').slice(0, 3).map(card => (
                    <div key={card.id} className="rounded-2xl border border-white/12 bg-white/5 p-3">
                      <p className="text-[12px] text-[#9bb6ff]">From: {card.from}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{card.subject}</p>
                      <p className="mt-1 text-sm text-[#d3def8] leading-relaxed">{card.preview}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {page === 'practice' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-[28px] border border-border bg-bg-secondary/45 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold">Практика</p>
                  <h3 className="mt-2 text-xl font-bold text-text">Проверьте входящие сообщения</h3>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-border text-right min-w-40">
                  <p className="text-xs text-text-muted">Прогресс</p>
                  <p className="text-2xl font-bold text-text">{checkedCount}/{practiceCards.length}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-border bg-white shadow-[0_18px_45px_rgba(26,26,26,0.08)] overflow-hidden">
                <div className="border-b border-border bg-surface px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-text">
                      <Inbox className="w-4 h-4 text-primary" />
                      Входящие
                    </div>
                    <div className="text-xs text-text-muted">{checkedCount} из {practiceCards.length}</div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[0.82fr_1.18fr] min-h-[350px]">
                  <aside className="border-r border-border bg-[#fbfbfd]">
                    <div className="max-h-[350px] overflow-y-auto p-2.5 space-y-2">
                      {practiceCards.map(card => {
                        const isActive = selectedCard?.id === card.id;
                        const userDecision = decisions[card.id];
                        const isDone = !!userDecision;
                        const statusIcon = !isDone
                          ? <MailOpen className="w-3.5 h-3.5 text-text-muted" />
                          : userDecision === card.target
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            : <AlertTriangle className="w-3.5 h-3.5 text-danger" />;
                        return (
                          <button
                            key={card.id}
                            onClick={() => setSelectedMessageId(card.id)}
                            className={`w-full text-left rounded-2xl border px-3 py-3 transition-all ${decisionToneClass(card)} ${isActive ? 'ring-2 ring-primary/25' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs text-text-muted truncate">{card.from}</p>
                              {statusIcon}
                            </div>
                            <p className="mt-1 text-sm font-semibold text-text line-clamp-1">{card.subject}</p>
                            <p className="mt-1 text-xs text-text-secondary line-clamp-2 leading-relaxed">{card.preview}</p>
                          </button>
                        );
                      })}
                    </div>
                  </aside>

                  <section className="p-5 flex flex-col">
                    {selectedCard ? (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedCard.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-2xl border border-border bg-white p-4 shadow-sm"
                          >
                            <p className="text-xs text-text-muted">From: {selectedCard.from}</p>
                            <p className="mt-1 text-lg font-bold text-text">{selectedCard.subject}</p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{selectedMessageBody}</p>
                          </motion.div>
                        </AnimatePresence>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => markMessage('verify')}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                              selectedDecision === 'verify' ? 'border-success/40 bg-success-soft text-success' : 'border-border bg-white hover:bg-success-soft/40'
                            }`}
                          >
                            <p className="text-sm font-semibold">✅ Безопасно</p>
                            <p className="mt-1 text-xs opacity-80">Сообщение выглядит легитимным</p>
                          </button>
                          <button
                            onClick={() => markMessage('flags')}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                              selectedDecision === 'flags' ? 'border-danger/40 bg-danger-soft text-danger' : 'border-border bg-white hover:bg-danger-soft/45'
                            }`}
                          >
                            <p className="text-sm font-semibold">⚠️ Подозрительно</p>
                            <p className="mt-1 text-xs opacity-80">Есть признаки фишинга или обмана</p>
                          </button>
                        </div>

                        {selectedDecision && (
                          <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${
                            selectedIsCorrect ? 'border-success/30 bg-success-soft text-success' : 'border-danger/30 bg-danger-soft text-danger'
                          }`}>
                            {selectedIsCorrect ? 'Отметка верная. Можно идти к следующему сообщению.' : 'Здесь ошибка в оценке. Пересмотрите письмо и исправьте отметку.'}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-text-muted">Нет сообщений для проверки.</div>
                    )}
                  </section>
                </div>
              </div>

              {isPracticeComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[24px] border border-border bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold">Итог проверки</p>
                      <p className="mt-1 text-lg font-bold text-text">Результат: {correctlyPlaced}/{practiceCards.length}</p>
                    </div>
                    <div className="text-sm text-text-secondary">Можно кликнуть сообщение и изменить решение.</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {practiceCards.map(card => {
                      const userDecision = decisions[card.id];
                      const isCorrect = userDecision === card.target;
                      return (
                        <button
                          key={`review-${card.id}`}
                          onClick={() => setSelectedMessageId(card.id)}
                          className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition-colors ${
                            isCorrect ? 'border-success/30 bg-success-soft/60' : 'border-danger/30 bg-danger-soft/60'
                          }`}
                        >
                          <span className="font-semibold">{card.subject}</span>
                          <span className="ml-2 text-text-secondary">Ваш ответ: {decisionLabel(userDecision)} • Верно: {decisionLabel(card.target)}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 bg-surface">
          <div className="text-sm text-text-secondary">
            {page === 'practice' ? 'Откройте сообщение, отметьте его как безопасное или подозрительное, затем проверьте итог.' : 'Сначала изучите правила, затем переходите к практике.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage('training')}
              disabled={page === 'training'}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-45"
            >
              Назад
            </button>

            {page === 'training' ? (
              <button
                onClick={() => setPage('practice')}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Далее
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sfx.click();
                  setGp('decision');
                }}
                disabled={!isPracticeComplete}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-45"
              >
                Перейти к тесту
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
