export interface AttackStep {
  id: number;
  title: string;
  description: string;
  playerAction: string;
  consequence: string;
  isCorrect: boolean;
}

export interface AttackScenario {
  id: string;
  type: 'phishing' | 'ransomware' | 'ddos' | 'data_breach' | 'social_engineering' | 'mitm';
  title: string;
  description: string;
  steps: AttackStep[];
}

export interface StoryMission {
  id: string;
  title: string;
  briefing: string;
  objectives: string[];
  attacks: AttackScenario[];
  completed: boolean;
}

export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  missions: StoryMission[];
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chapter-1',
    title: 'Первый день',
    description: 'Вы — новый сотрудник компании. Сегодня ваш первый день, и вас уже ждут первые испытания.',
    missions: [
      {
        id: 'm1-1',
        title: 'Добро пожаловать в ZeroCorp',
        briefing: 'Вы устролись в компанию ZeroCorp на позицию младшего аналитика. Ваш руководитель Алексей отправил вам приветственное письмо. Но что это? Одновременно пришло странное письмо от "IT-отдела" с просьбой срочно сменить пароль.',
        objectives: [
          'Проверить входящую почту',
          'Распознать фишинговое письмо',
          'Сообщить в отдел безопасности',
        ],
        attacks: [
          {
            id: 'atk-phishing-1',
            type: 'phishing',
            title: 'Поддельное письмо от IT',
            description: 'На вашу рабочую почту пришло письмо якобы от IT-отдела с требованием срочно сменить пароль.',
            steps: [
              {
                id: 1,
                title: 'Письмо получено',
                description: 'Тема: "СРОЧНО: Ваш пароль будет заблокирован через 2 часа". Отправитель: it-support@zeroc0rp.com (обратите внимание — ноль вместо O).',
                playerAction: 'Проверить домен отправителя',
                consequence: 'Вы заметили подмену: настоящий домен компании — zerocorp.com, а не zeroc0rp.com.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'Анализ ссылки',
                description: 'В письме есть кнопка "Сменить пароль сейчас". При наведении курсора видно: ссылка ведёт на http://bit.ly/3xK9pLm.',
                playerAction: 'Не переходить по ссылке, сообщить в ИБ',
                consequence: 'Правильное решение! Ссылка ведёт на фишинговый сайт для кражи учётных данных.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Действие',
                description: 'Что вы сделаете?',
                playerAction: 'Перейти по ссылке и ввести данные',
                consequence: 'Критическая ошибка! Вы перешли на фишинговый сайт и ввели свои учётные данные. Злоумышленники получили доступ к корпоративной почте.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
      {
        id: 'm1-2',
        title: 'Публичный Wi-Fi',
        briefing: 'Вы вышли в кафе на обед и решили подключиться к бесплатному Wi-Fi, чтобы проверить рабочую почту. Точка доступа называется "CafeFree_WiFi".',
        objectives: [
          'Оценить безопасность публичной сети',
          'Не вводить корпоративные данные без VPN',
        ],
        attacks: [
          {
            id: 'atk-mitm-1',
            type: 'mitm',
            title: 'Поддельная точка доступа',
            description: 'Злоумышленник создал точку доступа с похожим названием для перехвата данных.',
            steps: [
              {
                id: 1,
                title: 'Подключение к сети',
                description: 'Две сети с похожими именами: "CafeFree_WiFi" и "CafeFree_Official". Какая настоящая?',
                playerAction: 'Уточнить у персонала кафе официальное название сети',
                consequence: 'Верно! Официальная сеть — "CafeFree_Official". Поддельная сеть создана для перехвата трафика.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'Вход в почту',
                description: 'Вы подключились к сети. Стоит ли заходить в рабочую почту?',
                playerAction: 'Включить VPN перед входом в корпоративные сервисы',
                consequence: 'Правильно! VPN шифрует трафик и защищает данные даже в публичной сети.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Опасное действие',
                description: 'В сети появилось перенаправление на страницу авторизации Google.',
                playerAction: 'Ввести логин и пароль',
                consequence: 'Ошибка! Это могла быть поддельная страница авторизации. Всегда проверяйте URL и используйте VPN.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
    ],
  },
  {
    id: 'chapter-2',
    title: 'Эскалация',
    description: 'Прошёл месяц. Компания стала целью целевой атаки. Злоумышленники используют всё более изощрённые методы.',
    missions: [
      {
        id: 'm2-1',
        title: 'Целевой фишинг',
        briefing: 'Вам пришло письмо от генерального директора с просьбой срочно перевести деньги на счёт нового подрядчика. Письмо выглядит убедительно — подпись, стиль общения, даже упоминание реального проекта.',
        objectives: [
          'Распознать CEO Fraud',
          'Проверить запрос через независимый канал',
          'Не выполнять финансовую операцию без подтверждения',
        ],
        attacks: [
          {
            id: 'atk-phishing-2',
            type: 'social_engineering',
            title: 'CEO Fraud — письмо от директора',
            description: 'Злоумышленник подделал email генерального директора и просит срочный перевод средств.',
            steps: [
              {
                id: 1,
                title: 'Анализ отправителя',
                description: 'Письмо от: director@zerоcorp.com (буква "о" — кириллическая). Тема: "Срочный перевод — конфиденциально".',
                playerAction: 'Проверить домен и заметить кириллическую подмену',
                consequence: 'Отлично! Кириллическая "о" вместо латинской — классический приём IDN-homograph атаки.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'Давление срочностью',
                description: 'В письме: "Это конфиденциально, никому не говорите. Переведите 500 000₽ сегодня до 18:00."',
                playerAction: 'Позвонить директору по известному номеру для подтверждения',
                consequence: 'Верно! Давление срочностью и секретности — красный флаг. Независимое подтверждение — ключевое правило.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Финансовая операция',
                description: 'Вам кажется, что это может быть важно. Что делать?',
                playerAction: 'Выполнить перевод — директор же просит',
                consequence: 'Критическая ошибка! Вы перевели деньги мошенникам. CEO Fraud — одна из самых дорогостоящих атак.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
      {
        id: 'm2-2',
        title: 'Ransomware',
        briefing: 'Коллега жалуется, что все его файлы зашифрованы. На экране сообщение: "Ваши файлы заблокированы. Заплатите 2 BTC для расшифровки." Антивирус показывает множественные срабатывания.',
        objectives: [
          'Немедленно отключить заражённый компьютер от сети',
          'Сообщить в отдел ИБ',
          'Не платить выкуп',
        ],
        attacks: [
          {
            id: 'atk-ransomware-1',
            type: 'ransomware',
            title: 'Ransomware-атака на компанию',
            description: 'Вирус-шифровальщик поразил компьютер коллеги и может распространиться по сети.',
            steps: [
              {
                id: 1,
                title: 'Первые признаки',
                description: 'Коллега сообщает: все файлы имеют расширение .locked, на рабочем столе файл README_DECRYPT.txt.',
                playerAction: 'Немедленно отключить компьютер от сети (выдернуть кабель/отключить Wi-Fi)',
                consequence: 'Правильно! Изоляция заражённого устройства предотвращает распространение ransomware.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'Реагирование',
                description: 'Коллега предлагает заплатить выкуп — "это быстрее, чем восстанавливать из бэкапа".',
                playerAction: 'Отказать, сообщить в ИБ, начать восстановление из бэкапа',
                consequence: 'Верно! Нет гарантий, что после оплаты файлы расшифруют. Кроме того, оплата финансирует преступников.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Паника',
                description: 'Начальник требует "решить вопрос как можно быстрее".',
                playerAction: 'Заплатить выкуп, чтобы не рисковать',
                consequence: 'Ошибка! Оплата не гарантирует расшифровку. По статистике, только 65% заплативших получают рабочий дешифратор.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
      {
        id: 'm2-3',
        title: 'Социальная инженерия по телефону',
        briefing: 'Вам звонит человек, представляющийся сотрудником банка. Он говорит, что на ваше имя пытаются оформить кредит, и просит подтвердить данные для "блокировки мошеннической операции".',
        objectives: [
          'Распознать вишинг-атаку',
          'Не сообщать персональные данные по телефону',
          'Перезвонить в банк по официальному номеру',
        ],
        attacks: [
          {
            id: 'atk-vishing-1',
            type: 'social_engineering',
            title: 'Вишинг — звонок от "банка"',
            description: 'Злоумышленник звонит по телефону, представляется сотрудником безопасности банка.',
            steps: [
              {
                id: 1,
                title: 'Звонок',
                description: '"Здравствуйте, это служба безопасности Сбербанка. На ваше имя оформляется кредит. Для блокировки назовите номер карты и код с обратной стороны."',
                playerAction: 'Положить трубку и перезвонить в банк по номеру с официального сайта',
                consequence: 'Верно! Настоящие сотрудники банка никогда не просят полный номер карты и CVV.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'Давление',
                description: '"У вас 5 минут, иначе кредит будет оформлен! Не кладите трубку!"',
                playerAction: 'Не поддаваться панике, завершить звонок',
                consequence: 'Правильно! Давление времени — классический приём социальной инженерии.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Поддавшись давлению',
                description: 'Вы начинаете нервничать и хотите сообщить данные.',
                playerAction: 'Продиктовать номер карты и CVV-код',
                consequence: 'Критическая ошибка! Вы передали данные мошенникам. Они могут совершить несанкционированные операции.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
    ],
  },
  {
    id: 'chapter-3',
    title: 'Финальная битва',
    description: 'Компания подверглась APT-атаке (Advanced Persistent Threat). Группа хакеров месяцами готовила вторжение. Это финальное испытание.',
    missions: [
      {
        id: 'm3-1',
        title: 'APT:第一阶段 — Разведка',
        briefing: 'Вы замечаете необычную активность: незнакомые процессы в диспетчере задач, странные DNS-запросы. Похоже, кто-то уже получил доступ к системе и собирает информацию.',
        objectives: [
          'Обнаружить аномальную активность',
          'Собрать артефакты для расследования',
          'Изолировать скомпрометированные системы',
        ],
        attacks: [
          {
            id: 'atk-apt-recon',
            type: 'data_breach',
            title: 'APT-разведка — скрытое присутствие',
            description: 'Злоумышленники уже внутри сети и собирают конфиденциальные данные.',
            steps: [
              {
                id: 1,
                title: 'Обнаружение аномалии',
                description: 'В диспетчере задач: процесс "svch0st.exe" (через ноль) потребляет 40% CPU. Настоящий svchost.exe пишется через "o".',
                playerAction: 'Завершить подозрительный процесс и проверить автозагрузку',
                consequence: 'Верно! Вредонос маскируется под системный процесс, используя визуальную подмену символов.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'DNS-запросы',
                description: 'В логах: частые DNS-запросы к d4t4.exfiltrate-server.xyz. Похоже на DNS-туннелирование для утечки данных.',
                playerAction: 'Заблокировать домен на DNS-сервере, сообщить в ИБ',
                consequence: 'Отлично! DNS-туннелирование — метод скрытой передачи данных через DNS-запросы.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Игнорирование',
                description: '"Может, это просто обновление системы? Не стоит паниковать."',
                playerAction: 'Не обращать внимания, продолжить работу',
                consequence: 'Ошибка! Игнорирование индикаторов компрометации позволило злоумышленникам выграть критически важные данные.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
      {
        id: 'm3-2',
        title: 'DDoS-атака',
        briefing: 'Сайт компании и внутренние сервисы стали недоступны. Система мониторинга показывает аномальный трафик: более 50 Гбит/с из тысяч источников. Это DDoS.',
        objectives: [
          'Активировать DDoS-протекцию',
          'Переключить трафик на CDN',
          'Сохранить работоспособность критических сервисов',
        ],
        attacks: [
          {
            id: 'atk-ddos-1',
            type: 'ddos',
            title: 'Массированная DDoS-атака',
            description: 'Распределённая атака на отказ в обслуживании из ботнета мощностью 50+ Гбит/с.',
            steps: [
              {
                id: 1,
                title: 'Обнаружение',
                description: 'Мониторинг: входящий трафик превысил 50 Гбит/с. Серверы не справляются. Сайт недоступен.',
                playerAction: 'Активировать DDoS-протекцию через CDN-провайдера',
                consequence: 'Верно! CDN фильтрует malicious-трафик и пропускает только легитимные запросы.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'Эскалация',
                description: 'Атака усиливается: 80 Гбит/с. Начинает страдать внутренняя почта.',
                playerAction: 'Приоритезировать критичные сервисы, ограничить внешние API',
                consequence: 'Правильно! Приоритизация обеспечивает работу критических сервисов даже под атакой.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Паника',
                description: 'Начальство требует "немедленно всё починить".',
                playerAction: 'Выключить серверы — "лучше ничего, чем под атакой"',
                consequence: 'Ошибка! Полное отключение — это именно то, чего добиваются атакующие. DDoS-протекция справляется.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
      {
        id: 'm3-3',
        title: 'Финал: Защита критических данных',
        briefing: 'Все атаки оказались отвлекающим манёвром. Пока вы боролись с DDoS, злоумышленники через бэкдор получили доступ к базе данных с персональными данными клиентов. Нужно действовать быстро.',
        objectives: [
          'Обнаружить бэкдор',
          'Изолировать базу данных',
          'Сменить все учётные данные',
          'Уведомить клиентов о потенциальной утечке',
        ],
        attacks: [
          {
            id: 'atk-final-breach',
            type: 'data_breach',
            title: 'Утечка персональных данных',
            description: 'Злоумышленники получили доступ к базе данных клиентов через бэкдор.',
            steps: [
              {
                id: 1,
                title: 'Обнаружение бэкдора',
                description: 'В логах авторизации: учётная запись service-account входит в систему в 3:47 AM из неизвестной IP-сети.',
                playerAction: 'Немедленно заблокировать учётную запись, начать расследование',
                consequence: 'Верно! Несвоевременная авторизация служебной записи — индикатор компрометации.',
                isCorrect: true,
              },
              {
                id: 2,
                title: 'Изоляция БД',
                description: 'База данных клиентов всё ещё доступна извне. Нужно ограничить доступ.',
                playerAction: 'Перевести БД в изолированный сегмент сети, сменить все пароли и ключи',
                consequence: 'Отлично! Сегментация сети и ротация учётных данных — ключевые меры.',
                isCorrect: true,
              },
              {
                id: 3,
                title: 'Прозрачность',
                description: 'Нужно ли сообщать клиентам о потенциальной утечке?',
                playerAction: 'Уведомить клиентов и регуляторов в соответствии с 152-ФЗ',
                consequence: 'Правильно! Прозрачность и соблюдение законодательства о защите персональных данных.',
                isCorrect: true,
              },
              {
                id: 4,
                title: 'Сокрытие',
                description: 'Может, не стоит сообщать клиентам? Чтобы не портить репутацию...',
                playerAction: 'Скрыть инцидент, надеясь, что никто не узнает',
                consequence: 'Критическая ошибка! Сокрытие утечки нарушает законодательство и подрывает доверие ещё сильнее.',
                isCorrect: false,
              },
            ],
          },
        ],
        completed: false,
      },
    ],
  },
];

// Helper functions
export function getAllChapters(): StoryChapter[] {
  return STORY_CHAPTERS;
}

export function getChapter(id: string): StoryChapter | undefined {
  return STORY_CHAPTERS.find(c => c.id === id);
}

export function getMission(chapterId: string, missionId: string): StoryMission | undefined {
  const chapter = getChapter(chapterId);
  return chapter?.missions.find(m => m.id === missionId);
}

export function getTotalMissions(): number {
  return STORY_CHAPTERS.reduce((sum, ch) => sum + ch.missions.length, 0);
}

export function getCompletedMissions(chapterStates: Record<string, Set<string>>): number {
  let count = 0;
  for (const chapter of STORY_CHAPTERS) {
    const completed = chapterStates[chapter.id] || new Set<string>();
    for (const mission of chapter.missions) {
      if (completed.has(mission.id)) count++;
    }
  }
  return count;
}

export function isChapterComplete(chapterId: string, completedMissions: Set<string>): boolean {
  const chapter = getChapter(chapterId);
  if (!chapter) return false;
  return chapter.missions.every(m => completedMissions.has(m.id));
}

export function isAllChaptersComplete(completedMissions: Set<string>): boolean {
  return STORY_CHAPTERS.every(ch => isChapterComplete(ch.id, completedMissions));
}

export function getAttackTypeLabel(type: AttackScenario['type']): string {
  const labels: Record<AttackScenario['type'], string> = {
    phishing: 'Фишинг',
    ransomware: 'Ransomware',
    ddos: 'DDoS',
    data_breach: 'Утечка данных',
    social_engineering: 'Социальная инженерия',
    mitm: 'MITM-атака',
  };
  return labels[type];
}

export function getAttackTypeColor(type: AttackScenario['type']): string {
  const colors: Record<AttackScenario['type'], string> = {
    phishing: '#f59e0b',
    ransomware: '#ef4444',
    ddos: '#8b5cf6',
    data_breach: '#ec4899',
    social_engineering: '#f97316',
    mitm: '#06b6d4',
  };
  return colors[type];
}
