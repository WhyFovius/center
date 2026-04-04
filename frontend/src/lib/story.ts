export interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  missions: StoryMission[];
}

export interface StoryMission {
  id: string;
  chapterId: string;
  title: string;
  briefing: string;
  objective: string;
  scenarioType: 'email' | 'wifi' | 'social' | 'mobile' | 'banking' | 'remote';
  attackTypes: string[];
  difficulty: number; // 1-5
  xpReward: number;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chapter1',
    title: 'Глава 1: Первый день',
    subtitle: 'Завязка',
    description: 'Вы — новый сотрудник компании «Центр Инвест». Сегодня ваш первый день. Вам выдают рабочий ноутбук и доступ к корпоративной системе ZeroOS. Но кто-то уже охотится на новичков...',
    color: '#3fb950',
    missions: [
      {
        id: 'office',
        chapterId: 'chapter1',
        title: 'Рабочая почта',
        briefing: 'Вы получили первое письмо от «отдела кадров» — срочно подтвердите реквизиты для зарплаты. Звучит подозрительно? Проверьте заголовки SPF и DKIM.',
        objective: 'Распознать фишинговое письмо и не перейти по ссылке',
        scenarioType: 'email',
        attackTypes: ['Фишинг', 'Payroll Fraud'],
        difficulty: 1,
        xpReward: 100,
      },
      {
        id: 'home',
        chapterId: 'chapter1',
        title: 'Личный смартфон',
        briefing: 'Вечером приходит SMS: «Ваша карта заблокирована. Установите приложение для разблокировки». Кто-то пытается установить вредоносное ПО.',
        objective: 'Распознать smishing-атаку и не устанавливать APK',
        scenarioType: 'mobile',
        attackTypes: ['Smishing', 'Malware'],
        difficulty: 2,
        xpReward: 150,
      },
    ],
  },
  {
    id: 'chapter2',
    title: 'Глава 2: Эскалация',
    subtitle: 'Нарастание угрозы',
    description: 'Неделя прошла. Вы заметили подозрительную активность в сети. Кто-то сканирует порты, а коллега получил звонок от «руководства» с требованием OTP. Атака усиливается...',
    color: '#f59e0b',
    missions: [
      {
        id: 'wifi',
        chapterId: 'chapter2',
        title: 'Публичный Wi-Fi',
        briefing: 'Вы в кофейне. Подключаетесь к «CoffeeShop_Free» — но это поддельная точка. Злоумышленник перехватывает весь трафик.',
        objective: 'Обнаружить Evil Twin и не вводить данные',
        scenarioType: 'wifi',
        attackTypes: ['Evil Twin', 'MITM', 'Sniffing'],
        difficulty: 3,
        xpReward: 200,
      },
      {
        id: 'banking',
        chapterId: 'chapter2',
        title: 'Банковская операция',
        briefing: 'Звонок из «банка»: подозрительная операция, нужен OTP для отмены. Но банк никогда не просит коды по телефону.',
        objective: 'Распознать vishing-атаку и не сообщить OTP',
        scenarioType: 'banking',
        attackTypes: ['Vishing', 'Social Engineering'],
        difficulty: 4,
        xpReward: 250,
      },
    ],
  },
  {
    id: 'chapter3',
    title: 'Глава 3: Финальная битва',
    subtitle: 'Кульминация',
    description: 'APT-группировка «ShadowNet» начала целевую атаку на «Центр Инвест». Фишинг + социальная инженерия + эксплуатация уязвимостей. Вся компания под угрозой. Только вы можете остановить их.',
    color: '#ef4444',
    missions: [
      {
        id: 'travel',
        chapterId: 'chapter3',
        title: 'Командировка',
        briefing: 'Вы в аэропорту. Поддельный портал Wi-Fi + фишинговая страница оплаты. Атакующие знают, что в поездках бдительность ниже.',
        objective: 'Защитить данные в публичной сети',
        scenarioType: 'mobile',
        attackTypes: ['Evil Portal', 'Credential Theft'],
        difficulty: 4,
        xpReward: 300,
      },
      {
        id: 'remote',
        chapterId: 'chapter3',
        title: 'Удалённый доступ',
        briefing: 'Финальная атака: поддельное обновление VPN + социальная инженерия через мессенджер + доступ к корпоративной сети. Всё одновременно.',
        objective: 'Отразить комплексную APT-атаку',
        scenarioType: 'remote',
        attackTypes: ['APT', 'Supply Chain', 'Insider Threat'],
        difficulty: 5,
        xpReward: 500,
      },
    ],
  },
];

export function getChapterByMission(missionId: string): StoryChapter | undefined {
  return STORY_CHAPTERS.find(ch => ch.missions.some(m => m.id === missionId));
}

export function getMissionById(missionId: string): StoryMission | undefined {
  return STORY_CHAPTERS.flatMap(ch => ch.missions).find(m => m.id === missionId);
}

export function getMissionOrder(): string[] {
  return STORY_CHAPTERS.flatMap(ch => ch.missions.map(m => m.id));
}

export function getChapterProgress(chapterId: string, completedMissions: string[]): number {
  const chapter = STORY_CHAPTERS.find(ch => ch.id === chapterId);
  if (!chapter) return 0;
  const done = chapter.missions.filter(m => completedMissions.includes(m.id)).length;
  return Math.round((done / chapter.missions.length) * 100);
}

export function getTotalProgress(completedMissions: string[]): number {
  const all = getMissionOrder();
  const done = all.filter(id => completedMissions.includes(id)).length;
  return all.length ? Math.round((done / all.length) * 100) : 0;
}

export function getCurrentChapter(completedMissions: string[]): StoryChapter | undefined {
  for (const chapter of STORY_CHAPTERS) {
    const progress = getChapterProgress(chapter.id, completedMissions);
    if (progress < 100) return chapter;
  }
  return STORY_CHAPTERS[STORY_CHAPTERS.length - 1];
}
