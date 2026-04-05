export interface AttackScenario {
  id: string;
  title: string;
  titleEn: string;
  titleKz: string;
  description: string;
  type: 'phishing' | 'malware' | 'social_engineering' | 'wifi_attack' | 'deepfake' | 'credential_theft' | 'ransomware';
  difficulty: 1 | 2 | 3 | 4 | 5;
  steps: AttackStep[];
  xpReward: number;
  appId: string;
}

export interface AttackStep {
  id: number;
  title: string;
  titleEn: string;
  titleKz: string;
  description: string;
  descriptionEn: string;
  descriptionKz: string;
  choices: AttackChoice[];
}

export interface AttackChoice {
  text: string;
  textEn: string;
  textKz: string;
  correct: boolean;
  consequence: string;
  consequenceEn: string;
  consequenceKz: string;
}

export const ATTACK_SCENARIOS: AttackScenario[] = [
  // ===== MAIL APP (2 сценария) =====
  {
    id: 'mail_phishing_payroll',
    title: 'Фишинг «Срочная выплата»',
    titleEn: 'Phishing "Urgent Payout"',
    titleKz: 'Фишинг "Шұғыл төлем"',
    description: 'Вам пришло письмо от payroll@company-urgent.ru с просьбой срочно подтвердить банковские реквизиты для получения зарплаты. Перейдите по ссылке или проверьте заголовки письма.',
    type: 'phishing',
    difficulty: 2,
    xpReward: 150,
    appId: 'mail',
    steps: [
      {
        id: 1,
        title: 'Получено подозрительное письмо',
        titleEn: 'Suspicious email received',
        titleKz: 'Күмәнді хат алынды',
        description: 'Вам пришло письмо: «Срочно: подтвердите реквизиты до 10:00» от hr@company-mail.ru. В письме ссылка на «подтверждение данных карты». Что вы сделаете?',
        descriptionEn: 'You received an email: "Urgent: confirm bank details by 10:00" from hr@company-mail.ru. The email contains a link to "confirm card details". What will you do?',
        descriptionKz: 'Сізге хат келді: "Шұғыл: 10:00-ге дейін банк деректерін растаңыз" hr@company-mail.ru мекенжайынан. Хатта "карта деректерін растау" сілтемесі бар. Не істейсіз?',
        choices: [
          {
            text: 'Перейти по ссылке и подтвердить данные',
            textEn: 'Click the link and confirm details',
            textKz: 'Сілтемені басып, деректерді растау',
            correct: false,
            consequence: 'Вы перешли на поддельный сайт. Ваши банковские реквизиты украдены! Деньги сняты с вашего счёта.',
            consequenceEn: 'You visited a fake website. Your bank details have been stolen! Money has been withdrawn from your account.',
            consequenceKz: 'Сіз жалған сайтқа кірдіңіз. Банк деректеріңіз ұрланды! Шотыңыздан ақша шешіліп алынды.',
          },
          {
            text: 'Проверить заголовки письма (SPF, DKIM, Reply-To)',
            textEn: 'Check email headers (SPF, DKIM, Reply-To)',
            textKz: 'Хат тақырыптарын тексеру (SPF, DKIM, Reply-To)',
            correct: true,
            consequence: 'Отлично! SPF: FAIL, DKIM: none, Reply-To: urgent.hr@protonmail.com — это фишинг!',
            consequenceEn: 'Great! SPF: FAIL, DKIM: none, Reply-To: urgent.hr@protonmail.com — this is phishing!',
            consequenceKz: 'Керемет! SPF: FAIL, DKIM: none, Reply-To: urgent.hr@protonmail.com — бұл фишинг!',
          },
          {
            text: 'Удалить письмо без проверки',
            textEn: 'Delete the email without checking',
            textKz: 'Тексермей хатты жою',
            correct: false,
            consequence: 'Вы удалили письмо, но не сообщили в SOC. Мошенники могут отправить его другим сотрудникам.',
            consequenceEn: 'You deleted the email but did not report to SOC. Attackers may send it to other employees.',
            consequenceKz: 'Сіз хатты жойдыңыз, бірақ SOC-қа хабарламадыңыз. Шабуылшылар басқа қызметкерлерге жібере алады.',
          },
        ],
      },
      {
        id: 2,
        title: 'Анализ заголовков',
        titleEn: 'Header analysis',
        titleKz: 'Тақырыптарды талдау',
        description: 'Вы открыли заголовки. SPF: FAIL, DKIM: none, Reply-To ведёт на protonmail.com. Ваше действие?',
        descriptionEn: 'You opened the headers. SPF: FAIL, DKIM: none, Reply-To points to protonmail.com. Your action?',
        descriptionKz: 'Сіз тақырыптарды аштыңыз. SPF: FAIL, DKIM: none, Reply-To protonmail.com-ға бағытталған. Әрекетіңіз?',
        choices: [
          {
            text: 'Сообщить в SOC как фишинг',
            textEn: 'Report to SOC as phishing',
            textKz: 'SOC-қа фишинг ретінде хабарлау',
            correct: true,
            consequence: 'SOC заблокировал домен и предупредил всех сотрудников. Задание выполнено!',
            consequenceEn: 'SOC blocked the domain and warned all employees. Task completed!',
            consequenceKz: 'SOC доменді бұғаттап, барлық қызметкерлерді ескертті. Тапсырма орындалды!',
          },
          {
            text: 'Ответить отправителю с вопросом',
            textEn: 'Reply to the sender with a question',
            textKz: 'Жіберушіге сұрақпен жауап беру',
            correct: false,
            consequence: 'Вы подтвердили мошенникам, что ваш email активен. Теперь вы в их списке целей.',
            consequenceEn: 'You confirmed to scammers that your email is active. You are now on their target list.',
            consequenceKz: 'Сіз алаяқшыларға email-ыңыздың белсенді екенін растадыңыз. Енді сіз олардың нысана тізіміндесіз.',
          },
        ],
      },
    ],
  },
  {
    id: 'mail_ceo_fraud',
    title: 'CEO Fraud — «Директор» просит перевести деньги',
    titleEn: 'CEO Fraud — "Director" Asks to Transfer Money',
    titleKz: 'CEO Fraud — "Директор" ақша аударуды сұрайды',
    description: 'Письмо от «генерального директора» с просьбой срочно перевести 500,000₽ партнёру. Реквизиты вложены. Время ограничено.',
    type: 'social_engineering',
    difficulty: 3,
    xpReward: 200,
    appId: 'mail',
    steps: [
      {
        id: 1,
        title: 'Срочное письмо от директора',
        titleEn: 'Urgent email from the director',
        titleKz: 'Директордан шұғыл хат',
        description: 'Письмо от director@company-ceo.ru: «Срочно переведи 500,000₽ на счёт ООО «Партнёр». Реквизиты во вложении. Это конфиденциально, никому не говори. Время до конца дня.» Что вы сделаете?',
        descriptionEn: 'Email from director@company-ceo.ru: "Urgently transfer 500,000₽ to ООО Partner. Details attached. This is confidential, do not tell anyone. Deadline is end of day." What will you do?',
        descriptionKz: 'director@company-ceo.ru хаты: "Шұғыл 500,000₽ ООО Партнёр шотына аудар. Деректер тіркеуде. Бұл құпия, ешкімге айтпа. Мерзім — күн соңы." Не істейсіз?',
        choices: [
          {
            text: 'Перевести деньги по реквизитам',
            textEn: 'Transfer money to the provided details',
            textKz: 'Көрсетілген деректер бойынша ақша аудару',
            correct: false,
            consequence: 'Деньги ушли мошенникам! Это был CEO Fraud — директор не отправлял это письмо.',
            consequenceEn: 'Money went to scammers! This was CEO Fraud — the director did not send this email.',
            consequenceKz: 'Ақша алаяқшыларға кетті! Бұл CEO Fraud — директор бұл хатты жіберген жоқ.',
          },
          {
            text: 'Перезвонить директору по известному номеру',
            textEn: 'Call the director on the known number',
            textKz: 'Директорға белгілі нөмірге қоңырау шалу',
            correct: true,
            consequence: 'Директор подтвердил: «Я не отправлял никаких писем!» Это мошенничество.',
            consequenceEn: 'The director confirmed: "I did not send any emails!" This is fraud.',
            consequenceKz: 'Директор растады: "Мен ешқандай хат жіберген жоқпын!" Бұл алаяқтық.',
          },
          {
            text: 'Сообщить в SOC и отдел безопасности',
            textEn: 'Report to SOC and security department',
            textKz: 'SOC-қа және қауіпсіздік бөліміне хабарлау',
            correct: true,
            consequence: 'SOC зафиксировал инцидент, подделка email-адреса обнаружена. Задание выполнено!',
            consequenceEn: 'SOC recorded the incident, email address forgery detected. Task completed!',
            consequenceKz: 'SOC инцидентті тіркеді, email мекенжайын жалғандығы анықталды. Тапсырма орындалды!',
          },
        ],
      },
      {
        id: 2,
        title: 'Проверка через независимый канал',
        titleEn: 'Verification through independent channel',
        titleKz: 'Тәуелсіз арна арқылы тексеру',
        description: 'Вы перезвонили директору. Он говорит: «Я не отправлял никаких писем с реквизитами!» Что вы сделаете дальше?',
        descriptionEn: 'You called the director. He says: "I did not send any emails with details!" What will you do next?',
        descriptionKz: 'Сіз директорға қоңырау шалдыңыз. Ол: "Мен деректермен ешқандай хат жіберген жоқпын!" Келесі әрекетіңіз?',
        choices: [
          {
            text: 'Заблокировать отправителя и сообщить в SOC',
            textEn: 'Block the sender and report to SOC',
            textKz: 'Жіберушіні бұғаттап, SOC-қа хабарлау',
            correct: true,
            consequence: 'Инцидент зарегистрирован. SOC начал расследование. Вы действовали правильно!',
            consequenceEn: 'Incident registered. SOC started investigation. You acted correctly!',
            consequenceKz: 'Инцидент тіркелді. SOC тергеуді бастады. Сіз дұрыс әрекет еттіңіз!',
          },
          {
            text: 'Проигнорировать — может, директор забыл',
            textEn: 'Ignore — maybe the director forgot',
            textKz: 'Елемеу — мүмкін директор ұмытқан шығар',
            correct: false,
            consequence: 'Письмо осталось в системе. Другой сотрудник может перевести деньги.',
            consequenceEn: 'The email remained in the system. Another employee might transfer the money.',
            consequenceKz: 'Хат жүйеде қалды. Басқа қызметкер ақша аударуы мүмкін.',
          },
        ],
      },
    ],
  },

  // ===== BROWSER APP (2 сценария) =====
  {
    id: 'browser_fake_bank',
    title: 'Поддельный сайт банка',
    titleEn: 'Fake Bank Website',
    titleKz: 'Жалған банк сайты',
    description: 'Вы получили ссылку на «банк» для проверки счёта. URL: secure-bank-login.verify-secure.work. Это не настоящий домен банка.',
    type: 'phishing',
    difficulty: 2,
    xpReward: 150,
    appId: 'browser',
    steps: [
      {
        id: 1,
        title: 'Получена ссылка на «банк»',
        titleEn: 'Received a link to the "bank"',
        titleKz: '"Банкке" сілтеме алынды',
        description: 'В письме ссылка: https://secure-bank-login.verify-secure.work/auth — якобы страница онлайн-банка. Ваши действия?',
        descriptionEn: 'The email contains a link: https://secure-bank-login.verify-secure.work/auth — supposedly an online banking page. What will you do?',
        descriptionKz: 'Хатта сілтеме: https://secure-bank-login.verify-secure.work/auth — онлайн-банк парағы сияқты. Не істейсіз?',
        choices: [
          {
            text: 'Перейти по ссылке и ввести логин/пароль',
            textEn: 'Follow the link and enter login/password',
            textKz: 'Сілтемеге кіріп, логин/құпиясөзді енгізу',
            correct: false,
            consequence: 'Вы ввели учётные данные на фишинговом сайте. Cookies и пароли перехвачены! Аккаунт скомпрометирован.',
            consequenceEn: 'You entered credentials on a phishing site. Cookies and passwords intercepted! Account compromised.',
            consequenceKz: 'Сіз фишинг сайтында тіркелу деректерін енгіздіңіз. Cookies және құпиясөздер ұсталды! Аккаунт бұзылды.',
          },
          {
            text: 'Проверить URL — домен не совпадает с bank.ru',
            textEn: 'Check the URL — domain does not match bank.ru',
            textKz: 'URL тексеру — домен bank.ru-мен сәйкес келмейді',
            correct: true,
            consequence: 'Правильно! Настоящий банк — bank.ru, а verify-secure.work — подделка.',
            consequenceEn: 'Correct! The real bank is bank.ru, and verify-secure.work is a fake.',
            consequenceKz: 'Дұрыс! Нақты банк — bank.ru, ал verify-secure.work — жалған.',
          },
          {
            text: 'Закрыть страницу без проверки',
            textEn: 'Close the page without checking',
            textKz: 'Тексермей бетті жабу',
            correct: false,
            consequence: 'Вы закрыли страницу, но не сообщили об инциденте. Ссылка может прийти другим.',
            consequenceEn: 'You closed the page but did not report the incident. The link may reach others.',
            consequenceKz: 'Сіз бетті жаптыңыз, бірақ инцидентті хабарламадыңыз. Сілтеме басқаларға келуі мүмкін.',
          },
        ],
      },
      {
        id: 2,
        title: 'Обнаружен фишинговый домен',
        titleEn: 'Phishing domain detected',
        titleKz: 'Фишинг домені анықталды',
        description: 'Домен verify-secure.work не принадлежит банку. Как вы поступите?',
        descriptionEn: 'The domain verify-secure.work does not belong to the bank. What will you do?',
        descriptionKz: 'verify-secure.work домені банкке тиесілі емес. Қалай әрекет етесіз?',
        choices: [
          {
            text: 'Сообщить в SOC и IT-отдел',
            textEn: 'Report to SOC and IT department',
            textKz: 'SOC-қа және IT бөліміне хабарлау',
            correct: true,
            consequence: 'SOC заблокировал фишинговый домен. Все сотрудники защищены!',
            consequenceEn: 'SOC blocked the phishing domain. All employees are protected!',
            consequenceKz: 'SOC фишинг доменін бұғаттады. Барлық қызметкерлер қорғалды!',
          },
          {
            text: 'Попробовать узнать, кто владелец домена',
            textEn: 'Try to find out who owns the domain',
            textKz: 'Домен иесін анықтап көру',
            correct: false,
            consequence: 'Whois-запрос показал приватную регистрацию. Вы потратили время, но не обезопасили коллег.',
            consequenceEn: 'Whois query showed private registration. You wasted time but did not protect colleagues.',
            consequenceKz: 'Whois сұранысы жеке тіркеуді көрсетті. Уақытты босқа жұмсадыңыз, әріптестерді қорғамадыңыз.',
          },
        ],
      },
    ],
  },
  {
    id: 'browser_drive_by',
    title: 'Drive-by Download — автоматическое скачивание',
    titleEn: 'Drive-by Download — Automatic Download',
    titleKz: 'Drive-by Download — Автоматты жүктеу',
    description: 'Вы открыли сайт, и внезапно появляется сообщение: «Ваш ПК заражён! Скачайте антивирус». Это malware.',
    type: 'malware',
    difficulty: 3,
    xpReward: 200,
    appId: 'browser',
    steps: [
      {
        id: 1,
        title: 'Подозрительное всплывающее окно',
        titleEn: 'Suspicious pop-up window',
        titleKz: 'Күмәнді қалқымалы терезе',
        description: 'На сайте появилось окно: «⚠️ ОБНАРУЖЕНО 7 ВИРУСОВ! Скачайте SecurityCleaner.exe бесплатно!» Файл начинает скачиваться автоматически. Ваши действия?',
        descriptionEn: 'A pop-up appears on the site: "⚠️ 7 VIRUSES DETECTED! Download SecurityCleaner.exe for free!" The file starts downloading automatically. What will you do?',
        descriptionKz: 'Сайтта хабарлама шықты: "⚠️ 7 ВИРУС ТАБЫЛДЫ! SecurityCleaner.exe тегін жүктеңіз!" Файл автоматты түрде жүктеле бастады. Не істейсіз?',
        choices: [
          {
            text: 'Скачать и запустить «антивирус»',
            textEn: 'Download and run the "antivirus"',
            textKz: '"Антивирусты" жүктеп, іске қосу',
            correct: false,
            consequence: 'SecurityCleaner.exe — это троян! Он установил кейлоггер и получил доступ ко всем вашим данным.',
            consequenceEn: 'SecurityCleaner.exe is a trojan! It installed a keylogger and gained access to all your data.',
            consequenceKz: 'SecurityCleaner.exe — троян! Ол кейлоггер орнатып, барлық деректеріңізге қол жеткізді.',
          },
          {
            text: 'Закрыть вкладку и отменить загрузку',
            textEn: 'Close the tab and cancel the download',
            textKz: 'Қойындыны жауып, жүктеуді болдырмау',
            correct: true,
            consequence: 'Правильно! Это был drive-by download. Загрузка отменена, угроза предотвращена.',
            consequenceEn: 'Correct! This was a drive-by download. Download cancelled, threat prevented.',
            consequenceKz: 'Дұрыс! Бұл drive-by download болды. Жүктеу болдырмады, қауіп алдын алды.',
          },
          {
            text: 'Проверить сертификат сайта',
            textEn: 'Check the site certificate',
            textKz: 'Сайт сертификатын тексеру',
            correct: true,
            consequence: 'Сертификат self-signed, выдан неизвестным CA. Сайт подозрительный — закройте его.',
            consequenceEn: 'Certificate is self-signed, issued by an unknown CA. The site is suspicious — close it.',
            consequenceKz: 'Сертификат өзін-өзі имзалаған, белгісіз CA берген. Сайт күмәнді — оны жабыңыз.',
          },
        ],
      },
      {
        id: 2,
        title: 'Очистка после инцидента',
        titleEn: 'Post-incident cleanup',
        titleKz: 'Инциденттен кейінгі тазалау',
        description: 'Вы отменили загрузку, но файл мог частично сохраниться. Что нужно сделать?',
        descriptionEn: 'You cancelled the download, but the file might have been partially saved. What should you do?',
        descriptionKz: 'Сіз жүктеуді болдырмадыңыз, бірақ файл ішінара сақталған болуы мүмкін. Не істеу керек?',
        choices: [
          {
            text: 'Проверить папку загрузок и запустить антивирус',
            textEn: 'Check downloads folder and run antivirus',
            textKz: 'Жүктеулер қалтасын тексеріп, антивирусты іске қосу',
            correct: true,
            consequence: 'Файл найден в загрузках и удалён. Антивирус подтвердил: система чиста. Отличная работа!',
            consequenceEn: 'File found in downloads and deleted. Antivirus confirmed: system is clean. Great job!',
            consequenceKz: 'Файл жүктеулерден тауылып, жойылды. Антивирус растады: жүйе таза. Керемет жұмыс!',
          },
          {
            text: 'Ничего — загрузка же отменена',
            textEn: 'Nothing — the download was cancelled',
            textKz: 'Ештеңе — жүктеу болдырмады ғой',
            correct: false,
            consequence: 'Файл остался в папке Temp. Позже он был активирован и заразил систему.',
            consequenceEn: 'The file remained in the Temp folder. Later it was activated and infected the system.',
            consequenceKz: 'Файл Temp қалтасында қалды. Кейін ол іске қосылып, жүйені жұқтырды.',
          },
        ],
      },
    ],
  },

  // ===== XAM MESSENGER (2 сценария) =====
  {
    id: 'messenger_colleague_password',
    title: 'Соц. инженерия от «коллеги»',
    titleEn: 'Social Engineering from "Colleague"',
    titleKz: '"Әріптестен" әлеуметтік инженерия',
    description: '«Коллега» пишет в мессенджере: «Привет, забыл пароль от Wi-Fi офиса, скинь плиз». Это попытка получить учётные данные.',
    type: 'social_engineering',
    difficulty: 1,
    xpReward: 100,
    appId: 'messenger',
    steps: [
      {
        id: 1,
        title: 'Запрос пароля от «коллеги»',
        titleEn: 'Password request from "colleague"',
        titleKz: '"Әріптестен" құпиясөз сұрау',
        description: 'Сообщение от «Алексей»: «Привет! Забыл пароль от корпоративного Wi-Fi, скинь плиз. Срочно нужно подключиться.» Ваши действия?',
        descriptionEn: 'Message from "Alexey": "Hi! Forgot the corporate Wi-Fi password, please send it. Need to connect urgently." What will you do?',
        descriptionKz: '"Алексейден" хабарлама: "Сәлем! Корпоративті Wi-Fi құпиясөзін ұмытып қалдым, жіберші. Шұғыл қосылу керек." Не істейсіз?',
        choices: [
          {
            text: 'Скинуть пароль — коллега же',
            textEn: 'Send the password — it is a colleague',
            textKz: 'Құпиясөзді жіберу — әріптес қой',
            correct: false,
            consequence: 'Это был не Алексей! Его аккаунт взломан. Мошенники получили пароль корпоративной сети.',
            consequenceEn: 'It was not Alexey! His account was hacked. Scammers got the corporate network password.',
            consequenceKz: 'Бұл Алексей емес еді! Оның аккаунты бұзылған. Алаяқшылар корпоративті желі құпиясөзін алды.',
          },
          {
            text: 'Отказать — пароль нельзя передавать',
            textEn: 'Refuse — password should not be shared',
            textKz: 'Бас тарту — құпиясөзді беруге болмайды',
            correct: true,
            consequence: 'Правильно! Корпоративные пароли не передаются через мессенджер. Коллега должен обратиться в IT.',
            consequenceEn: 'Correct! Corporate passwords are not shared via messenger. The colleague should contact IT.',
            consequenceKz: 'Дұрыс! Корпоративті құпиясөздер мессенджер арқылы берілмейді. Әріптес IT-ге жүгінуі керек.',
          },
          {
            text: 'Сообщить в SOC — аккаунт взломан',
            textEn: 'Report to SOC — account is compromised',
            textKz: 'SOC-қа хабарлау — аккаунт бұзылған',
            correct: true,
            consequence: 'SOC подтвердил: аккаунт Алексея скомпрометирован. Инцидент зарегистрирован. Отличная работа!',
            consequenceEn: 'SOC confirmed: Alexey account is compromised. Incident registered. Great job!',
            consequenceKz: 'SOC растады: Алексей аккаунты бұзылған. Инцидент тіркелді. Керемет жұмыс!',
          },
        ],
      },
    ],
  },
  {
    id: 'messenger_deepfake_call',
    title: 'Дипфейк-звонок от «директора»',
    titleEn: 'Deepfake Call from "Director"',
    titleKz: '"Директордан" дипфейк-қоңырау',
    description: 'Вам звонит «Сергей Петрович» (директор) и просит срочно перевести 280,000₽. Голос звучит как настоящий, но есть подозрительные артефакты.',
    type: 'deepfake',
    difficulty: 4,
    xpReward: 250,
    appId: 'messenger',
    steps: [
      {
        id: 1,
        title: 'Входящий звонок от «директора»',
        titleEn: 'Incoming call from the "director"',
        titleKz: '"Директордан" кіріс қоңырау',
        description: 'Звонок от «Сергей Петрович»: «Переведи 280 тысяч на счёт партнёра прямо сейчас, нет времени объяснять. Реквизиты скинул в мессенджер.» Голос звучит похоже, но с металлическим оттенком. Что вы сделаете?',
        descriptionEn: 'Call from "Sergey Petrovich": "Transfer 280 thousand to the partner account right now, no time to explain. Details sent to messenger." Voice sounds similar but with a metallic tone. What will you do?',
        descriptionKz: '"Сергей Петрович" қоңырауы: "280 мыңды партнёр шотына дәл қазір аудар, түсіндіруге уақыт жоқ. Деректер мессенджерге жіберілді." Дауыс ұқсас, бірақ металл реңкі бар. Не істейсіз?',
        choices: [
          {
            text: 'Перевести деньги — директор же просит',
            textEn: 'Transfer money — the director is asking',
            textKz: 'Ақша аудару — директор сұрап тұр ғой',
            correct: false,
            consequence: 'Это был дипфейк! 280,000₽ ушли мошенникам. Голос был сгенерирован AI.',
            consequenceEn: 'It was a deepfake! 280,000₽ went to scammers. The voice was AI-generated.',
            consequenceKz: 'Бұл дипфейк болды! 280,000₽ алаяқшыларға кетті. Дауыс AI арқылы жасалған.',
          },
          {
            text: 'Перезвонить по известному номеру директора',
            textEn: 'Call back on the director known number',
            textKz: 'Директордың белгілі нөміріне қайта қоңырау шалу',
            correct: true,
            consequence: 'Настоящий директор: «Я не звонил!» Это дипфейк. Инцидент предотвращён!',
            consequenceEn: 'The real director: "I did not call!" This is a deepfake. Incident prevented!',
            consequenceKz: 'Нақты директор: "Мен қоңырау шалған жоқпын!" Бұл дипфейк. Инцидент алдын алды!',
          },
          {
            text: 'Завершить звонок и сообщить в SOC',
            textEn: 'End the call and report to SOC',
            textKz: 'Қоңырауды аяқтап, SOC-қа хабарлау',
            correct: true,
            consequence: 'SOC зафиксировал попытку дипфейк-атаки. Номер заблокирован.',
            consequenceEn: 'SOC recorded a deepfake attack attempt. Number blocked.',
            consequenceKz: 'SOC дипфейк-шабуыл әрекетін тіркеді. Нөмір бұғатталды.',
          },
        ],
      },
      {
        id: 2,
        title: 'Распознавание дипфейка',
        titleEn: 'Deepfake detection',
        titleKz: 'Дипфейкті анықтау',
        description: 'Вы заподозрили неладное. Какие признаки дипфейка вы можете назвать?',
        descriptionEn: 'You suspected something. What signs of a deepfake can you identify?',
        descriptionKz: 'Сіз күдіктендіңіз. Дипфейктің қандай белгілерін атай аласыз?',
        choices: [
          {
            text: 'Металлический оттенок голоса + чрезмерная срочность',
            textEn: 'Metallic voice tone + excessive urgency',
            textKz: 'Дауыстың металл реңкі + шамадан тыс шұғылдық',
            correct: true,
            consequence: 'Верно! Металлический голос и давление срочностью — ключевые признаки дипфейка.',
            consequenceEn: 'Correct! Metallic voice and urgency pressure are key signs of a deepfake.',
            consequenceKz: 'Дұрыс! Металл дауыс және шұғылдық қысымы — дипфейктің негізгі белгілері.',
          },
          {
            text: 'Это точно директор, просто связь плохая',
            textEn: 'It is definitely the director, just bad connection',
            textKz: 'Бұл нақты директор, байланыс нашар ғой',
            correct: false,
            consequence: 'Вы списали на плохую связь. Это был дипфейк — мошенники использовали срочность как тактику.',
            consequenceEn: 'You blamed bad connection. It was a deepfake — scammers used urgency as a tactic.',
            consequenceKz: 'Сіз нашар байланысқа тіреп қойдыңыз. Бұл дипфейк — алаяқшылар шұғылдықты тактика ретінде қолданды.',
          },
        ],
      },
    ],
  },

  // ===== TERMINAL APP (1 сценарий) =====
  {
    id: 'terminal_backdoor',
    title: 'Обнаружен бэкдор в системе',
    titleEn: 'Backdoor Detected in System',
    titleKz: 'Жүйеден бэкдор табылды',
    description: 'При сканировании системы обнаружен подозрительный процесс на порту 4444 — это может быть бэкдор.',
    type: 'malware',
    difficulty: 3,
    xpReward: 200,
    appId: 'terminal',
    steps: [
      {
        id: 1,
        title: 'Сканирование системы',
        titleEn: 'System scanning',
        titleKz: 'Жүйені сканерлеу',
        description: 'Вы выполнили команду scan. Результат: «suspicious_process.exe on port 4444 — UNKNOWN PROCESS». PID: 6660, запущен от имени SYSTEM. Что вы сделаете?',
        descriptionEn: 'You ran the scan command. Result: "suspicious_process.exe on port 4444 — UNKNOWN PROCESS". PID: 6660, running as SYSTEM. What will you do?',
        descriptionKz: 'Сіз scan командасын орындадыңыз. Нәтиже: "suspicious_process.exe on port 4444 — UNKNOWN PROCESS". PID: 6660, SYSTEM атынан жұмыс істейді. Не істейсіз?',
        choices: [
          {
            text: 'Немедленно kill процесс',
            textEn: 'Immediately kill the process',
            textKz: 'Процесті бірден тоқтату',
            correct: false,
            consequence: 'Процесс перезапущен автоматически! Бэкдор имеет persistence. Нужно сначала найти и удалить источник.',
            consequenceEn: 'Process restarted automatically! The backdoor has persistence. You need to find and remove the source first.',
            consequenceKz: 'Процесс автоматты түрде қайта іске қосылды! Бэкдорда persistence бар. Алдымен көзін тауып, жою керек.',
          },
          {
            text: 'Игнорировать — может, это системный процесс',
            textEn: 'Ignore — might be a system process',
            textKz: 'Елемеу — мүмкін бұл жүйелік процесс',
            correct: false,
            consequence: 'Бэкдор продолжил работу. Через час данные начали уходить на внешний сервер.',
            consequenceEn: 'The backdoor continued working. Within an hour, data started leaking to an external server.',
            consequenceKz: 'Бэкдор жұмысын жалғастырды. Бір сағаттан кейін деректер сыртқы серверге кете бастады.',
          },
          {
            text: 'Защитить порт + изолировать процесс + сообщить в SOC',
            textEn: 'Block port + isolate process + report to SOC',
            textKz: 'Портты бұғаттау + процесті оқшаулау + SOC-қа хабарлау',
            correct: true,
            consequence: 'Порт 4444 заблокирован, процесс изолирован в карантин. SOC начал расследование. Отличная работа!',
            consequenceEn: 'Port 4444 blocked, process quarantined. SOC started investigation. Great job!',
            consequenceKz: '4444 порты бұғатталды, процесс карантинге алынды. SOC тергеуді бастады. Керемет жұмыс!',
          },
        ],
      },
      {
        id: 2,
        title: 'Расследование инцидента',
        titleEn: 'Incident investigation',
        titleKz: 'Инцидентті тергеу',
        description: 'Процесс изолирован. Нужно найти источник — как бэкдор попал в систему?',
        descriptionEn: 'Process isolated. Need to find the source — how did the backdoor get into the system?',
        descriptionKz: 'Процесс оқшауланды. Көзін табу керек — бэкдор жүйеге қалай түсті?',
        choices: [
          {
            text: 'Проверить историю загрузок и последние установленные программы',
            textEn: 'Check download history and recently installed programs',
            textKz: 'Жүктеу тарихын және жақында орнатылған бағдарламаларды тексеру',
            correct: true,
            consequence: 'Обнаружено: бэкдор установлен вместе с «бесплатным антивирусом» 3 дня назад. Источник найден!',
            consequenceEn: 'Discovered: backdoor was installed with a "free antivirus" 3 days ago. Source found!',
            consequenceKz: 'Анықталды: бэкдор 3 күн бұрын "тегін антивируспен" бірге орнатылған. Көзі табылды!',
          },
          {
            text: 'Просто удалить файл процесса',
            textEn: 'Just delete the process file',
            textKz: 'Тек процесс файлын жою',
            correct: false,
            consequence: 'Файл удалён, но бэкдор уже создал копию в другом месте и добавил себя в автозагрузку.',
            consequenceEn: 'File deleted, but the backdoor already created a copy elsewhere and added itself to startup.',
            consequenceKz: 'Файл жойылды, бірақ бэкдор басқа жерге көшірме жасап, өзін автожүктеуге қосқан.',
          },
        ],
      },
    ],
  },

  // ===== SECURITY CENTER (1 сценарий) =====
  {
    id: 'security_mass_attack',
    title: 'Массированная атака — 3 волны',
    titleEn: 'Massive Attack — 3 Waves',
    titleKz: 'Жаппай шабуыл — 3 толқын',
    description: 'На дашборде обнаружена массированная атака: одновременно идут 3 волны — фишинг, сканирование портов и brute force. Нужно отразить все.',
    type: 'malware',
    difficulty: 5,
    xpReward: 300,
    appId: 'security',
    steps: [
      {
        id: 1,
        title: 'Обнаружение массированной атаки',
        titleEn: 'Detecting massive attack',
        titleKz: 'Жаппай шабуылды анықтау',
        description: 'Дашборд показывает 3 одновременные атаки: Волна 1 — 500 фишинговых писем, Волна 2 — сканирование портов с 10 IP, Волна 3 — brute force SSH. С чего начнёте?',
        descriptionEn: 'Dashboard shows 3 simultaneous attacks: Wave 1 — 500 phishing emails, Wave 2 — port scanning from 10 IPs, Wave 3 — SSH brute force. Where do you start?',
        descriptionKz: 'Дашборд 3 бір уақыттағы шабуылды көрсетеді: 1-толқын — 500 фишинг хат, 2-толқын — 10 IP-ден порт сканерлеу, 3-толқын — SSH brute force. Қайдан бастайсыз?',
        choices: [
          {
            text: 'Активировать защиту для всех векторов одновременно',
            textEn: 'Activate protection for all vectors simultaneously',
            textKz: 'Барлық векторлар үшін қорғанысты бірден іске қосу',
            correct: true,
            consequence: 'Защита активирована. Фишинг заблокирован, IP-адреса в чёрном списке, SSH-атака отражена.',
            consequenceEn: 'Protection activated. Phishing blocked, IPs blacklisted, SSH attack repelled.',
            consequenceKz: 'Қорғаныс іске қосылды. Фишинг бұғатталды, IP-лер қара тізімде, SSH-шабуыл қайтарылды.',
          },
          {
            text: 'Сначала заблокировать фишинг — он самый опасный',
            textEn: 'Block phishing first — it is the most dangerous',
            textKz: 'Алдымен фишингті бұғаттау — ол ең қауіпті',
            correct: false,
            consequence: 'Пока вы блокировали фишинг, brute force подобрал пароль SSH. Сервер скомпрометирован.',
            consequenceEn: 'While you blocked phishing, brute force cracked the SSH password. Server compromised.',
            consequenceKz: 'Сіз фишингті бұғаттап жатқанда, brute force SSH құпиясөзін тапты. Сервер бұзылды.',
          },
          {
            text: 'Сначала заблокировать IP сканеров',
            textEn: 'Block scanner IPs first',
            textKz: 'Алдымен сканер IP-лерін бұғаттау',
            correct: false,
            consequence: 'IP заблокированы, но фишинговые письма уже доставлены. 3 сотрудника перешли по ссылкам.',
            consequenceEn: 'IPs blocked, but phishing emails already delivered. 3 employees clicked the links.',
            consequenceKz: 'IP-лер бұғатталды, бірақ фишинг хаттар жеткізілді. 3 қызметкер сілтемелерді басты.',
          },
        ],
      },
      {
        id: 2,
        title: 'Волна 2 — усиление атаки',
        titleEn: 'Wave 2 — Attack escalation',
        titleKz: '2-толқын — Шабуылдың күшеюі',
        description: 'Атакующие усилили натиск. Теперь 1000 писем, 50 IP для сканирования и распределённый brute force. Ваши действия?',
        descriptionEn: 'Attackers escalated. Now 1000 emails, 50 scanning IPs, and distributed brute force. What will you do?',
        descriptionKz: 'Шабуылшылар күшейтті. Енді 1000 хат, 50 сканерлеу IP және үлестірілген brute force. Не істейсіз?',
        choices: [
          {
            text: 'Включить максимальный уровень защиты и изолировать уязвимые системы',
            textEn: 'Enable maximum protection and isolate vulnerable systems',
            textKz: 'Максималды қорғанысты қосып, осал жүйелерді оқшаулау',
            correct: true,
            consequence: 'Все волны отражены! Системы изолированы, атака провалилась.',
            consequenceEn: 'All waves repelled! Systems isolated, attack failed.',
            consequenceKz: 'Барлық толқындар қайтарылды! Жүйелер оқшауланды, шабуыл сәтсіз аяқталды.',
          },
          {
            text: 'Отключить внешнюю почту и закрыть все внешние порты',
            textEn: 'Disable external email and close all external ports',
            textKz: 'Сыртқы поштаны өшіріп, барлық сыртқы порттарды жабу',
            correct: false,
            consequence: 'Атака отражена, но бизнес-процессы остановлены. Компания потеряла продуктивность.',
            consequenceEn: 'Attack repelled, but business processes halted. Company lost productivity.',
            consequenceKz: 'Шабуыл қайтарылды, бірақ бизнес-процестер тоқтады. Компания өнімділікті жоғалтты.',
          },
        ],
      },
      {
        id: 3,
        title: 'Пост-атака анализ',
        titleEn: 'Post-attack analysis',
        titleKz: 'Шабуылдан кейінгі талдау',
        description: 'Атака отражена. Что нужно сделать после инцидента?',
        descriptionEn: 'Attack repelled. What should you do after the incident?',
        descriptionKz: 'Шабуыл қайтарылды. Инциденттен кейін не істеу керек?',
        choices: [
          {
            text: 'Составить отчёт, обновить правила файрвола, провести обучение сотрудников',
            textEn: 'Create report, update firewall rules, conduct employee training',
            textKz: 'Есеп жасау, фаервол ережелерін жаңарту, қызметкерлерді оқыту',
            correct: true,
            consequence: 'Отчёт составлен, правила обновлены, обучение запланировано. Система стала сильнее!',
            consequenceEn: 'Report created, rules updated, training scheduled. System is stronger!',
            consequenceKz: 'Есеп жасалды, ережелер жаңартылды, оқыту жоспарланды. Жүйе күштірек болды!',
          },
          {
            text: 'Ничего — атака же отражена, можно расслабиться',
            textEn: 'Nothing — attack was repelled, can relax',
            textKz: 'Ештеңе — шабуыл қайтарылды, демалуға болады',
            correct: false,
            consequence: 'Без анализа уязвимости остались. Атакующие вернутся с новой тактикой.',
            consequenceEn: 'Without analysis, vulnerabilities remain. Attackers will return with new tactics.',
            consequenceKz: 'Талдаусыз осалдықтар қалды. Шабуылшылар жаңа тактикамен оралады.',
          },
        ],
      },
    ],
  },

  // ===== WIFI SIMULATOR (1 сценарий) =====
  {
    id: 'wifi_evil_twin',
    title: 'Evil Twin в кофейне',
    titleEn: 'Evil Twin at Coffee Shop',
    titleKz: 'Кофедегі Evil Twin',
    description: 'В кофейне две сети: CoffeeShop_Free (открытая) и CoffeeShop_Secure (WPA3). Одна из них — точка доступа злоумышленника.',
    type: 'wifi_attack',
    difficulty: 2,
    xpReward: 150,
    appId: 'wifi_simulator',
    steps: [
      {
        id: 1,
        title: 'Выбор Wi-Fi сети в кофейне',
        titleEn: 'Choosing Wi-Fi network at coffee shop',
        titleKz: 'Кофеде Wi-Fi желісін таңдау',
        description: 'Вы в кофейне. Видите две сети: CoffeeShop_Free (без пароля, сигнал 85%) и CoffeeShop_Secure (WPA3, сигнал 70%). Какую выберете?',
        descriptionEn: 'You are at a coffee shop. You see two networks: CoffeeShop_Free (no password, 85% signal) and CoffeeShop_Secure (WPA3, 70% signal). Which do you choose?',
        descriptionKz: 'Сіз кофедесіз. Екі желіні көресіз: CoffeeShop_Free (құпиясөзсіз, сигнал 85%) және CoffeeShop_Secure (WPA3, сигнал 70%). Қайсысын таңдайсыз?',
        choices: [
          {
            text: 'CoffeeShop_Free — сигнал лучше и без пароля',
            textEn: 'CoffeeShop_Free — better signal and no password',
            textKz: 'CoffeeShop_Free — сигнал жақсы әрі құпиясөзсіз',
            correct: false,
            consequence: 'Это Evil Twin! Весь ваш трафик перехвачен: логины, пароли, cookies. Атакующий видит всё.',
            consequenceEn: 'This is an Evil Twin! All your traffic intercepted: logins, passwords, cookies. The attacker sees everything.',
            consequenceKz: 'Бұл Evil Twin! Барлық трафигіңіз ұсталды: логиндер, құпиясөздер, cookies. Шабуылшы бәрін көреді.',
          },
          {
            text: 'CoffeeShop_Secure — WPA3 защита',
            textEn: 'CoffeeShop_Secure — WPA3 protection',
            textKz: 'CoffeeShop_Secure — WPA3 қорғауы',
            correct: true,
            consequence: 'Правильно! WPA3 обеспечивает шифрование. Но для полной безопасности включите VPN.',
            consequenceEn: 'Correct! WPA3 provides encryption. But for full security, enable VPN.',
            consequenceKz: 'Дұрыс! WPA3 шифрлеуді қамтамасыз етеді. Бірақ толық қауіпсіздік үшін VPN қосыңыз.',
          },
          {
            text: 'Использовать мобильный интернет (hotspot)',
            textEn: 'Use mobile internet (hotspot)',
            textKz: 'Мобильді интернетті қолдану (hotspot)',
            correct: true,
            consequence: 'Самый безопасный вариант! Мобильная сеть защищена лучше любого публичного Wi-Fi.',
            consequenceEn: 'Safest option! Mobile network is better protected than any public Wi-Fi.',
            consequenceKz: 'Ең қауіпсіз нұсқа! Мобильді желі кез келген қоғамдық Wi-Fi-дан жақсы қорғалған.',
          },
        ],
      },
      {
        id: 2,
        title: 'Обнаружение перехвата трафика',
        titleEn: 'Traffic interception detected',
        titleKz: 'Трафиктің ұсталуы анықталды',
        description: 'Если вы подключились к CoffeeShop_Free — злоумышленник начал перехватывать данные. Если к Secure — трафик зашифрован. Что дальше?',
        descriptionEn: 'If you connected to CoffeeShop_Free — the attacker started intercepting data. If Secure — traffic is encrypted. What next?',
        descriptionKz: 'Егер CoffeeShop_Free-ға қосылсаңыз — шабуылшы деректерді ұстай бастады. Егер Secure — трафик шифрленген. Келесі?',
        choices: [
          {
            text: 'Включить VPN и сменить все пароли',
            textEn: 'Enable VPN and change all passwords',
            textKz: 'VPN қосып, барлық құпиясөздерді өзгерту',
            correct: true,
            consequence: 'VPN зашифровал дальнейший трафик. Пароли сменены. Ущерб минимизирован.',
            consequenceEn: 'VPN encrypted further traffic. Passwords changed. Damage minimized.',
            consequenceKz: 'VPN одан әрі трафикті шифрледі. Құпиясөздер өзгертілді. Зиян азайтылды.',
          },
          {
            text: 'Продолжить работу — ничего страшного нет',
            textEn: 'Continue working — nothing serious',
            textKz: 'Жұмысты жалғастыру — ештеңе болған жоқ',
            correct: false,
            consequence: 'Атакующий получил доступ к вашей почте и банковскому аккаунту. Данные украдены.',
            consequenceEn: 'The attacker gained access to your email and bank account. Data stolen.',
            consequenceKz: 'Шабуылшы email және банк аккаунтыңызға кірді. Деректер ұрланды.',
          },
        ],
      },
    ],
  },

  // ===== DEEPFAKE SIMULATOR (1 сценарий) =====
  {
    id: 'deepfake_it_support',
    title: 'Дипфейк видеозвонок от «IT-поддержки»',
    titleEn: 'Deepfake Video Call from "IT Support"',
    titleKz: '"IT-қолдаудан" дипфейк бейнеқоңырау',
    description: 'Вам приходит видеозвонок от «IT-поддержки». Человек в форме просит удалённый доступ к вашему компьютеру через TeamViewer.',
    type: 'deepfake',
    difficulty: 4,
    xpReward: 250,
    appId: 'deepfake_simulator',
    steps: [
      {
        id: 1,
        title: 'Видеозвонок от «IT-поддержки»',
        titleEn: 'Video call from "IT Support"',
        titleKz: '"IT-қолдаудан" бейнеқоңырау',
        description: 'Видеозвонок: человек в форме IT-отдела говорит: «Здравствуйте! Проводим плановое обновление. Дайте доступ через TeamViewer, код уже отправлен на вашу почту.» На лице — лёгкие артефакты генерации.',
        descriptionEn: 'Video call: person in IT department uniform says: "Hello! We are performing a scheduled update. Grant access via TeamViewer, code already sent to your email." Face has slight generation artifacts.',
        descriptionKz: 'Бейнеқоңырау: IT бөлімінің киіміндегі адам: "Сәлеметсіз бе! Жоспарлы жаңарту жүргізіп жатырмыз. TeamViewer арқылы қол жеткізуді беріңіз, код email-ға жіберілді." Бетте генерация артефактілері бар.',
        choices: [
          {
            text: 'Дать удалённый доступ — IT-поддержка же',
            textEn: 'Grant remote access — it is IT support',
            textKz: 'Қашықтан қол жеткізуді беру — IT-қолдау ғой',
            correct: false,
            consequence: 'Мошенник получил полный доступ к вашему ПК. Данные скопированы, установлен бэкдор.',
            consequenceEn: 'The scammer gained full access to your PC. Data copied, backdoor installed.',
            consequenceKz: 'Алаяқшы ПК-ға толық қол жеткізді. Деректер көшірілді, бэкдор орнатылды.',
          },
          {
            text: 'Проверить через официальный IT-отдел',
            textEn: 'Verify through official IT department',
            textKz: 'Ресми IT бөлімі арқылы тексеру',
            correct: true,
            consequence: 'IT-отдел: «Мы не рассылаем такие запросы!» Это дипфейк. Инцидент предотвращён.',
            consequenceEn: 'IT department: "We do not send such requests!" This is a deepfake. Incident prevented.',
            consequenceKz: 'IT бөлімі: "Біз мұндай сұраныстар жібермейміз!" Бұл дипфейк. Инцидент алдын алды.',
          },
          {
            text: 'Завершить звонок и заблокировать номер',
            textEn: 'End the call and block the number',
            textKz: 'Қоңырауды аяқтап, нөмірді бұғаттау',
            correct: true,
            consequence: 'Звонок завершён. Номер заблокирован и передан в SOC.',
            consequenceEn: 'Call ended. Number blocked and reported to SOC.',
            consequenceKz: 'Қоңырау аяқталды. Нөмір бұғатталып, SOC-қа берілді.',
          },
        ],
      },
      {
        id: 2,
        title: 'Признаки дипфейк-видео',
        titleEn: 'Deepfake video signs',
        titleKz: 'Дипфейк-бейне белгілері',
        description: 'Какие признаки дипфейка вы заметили в видео?',
        descriptionEn: 'What signs of deepfake did you notice in the video?',
        descriptionKz: 'Бейнеден дипфейктің қандай белгілерін байқадыңыз?',
        choices: [
          {
            text: 'Артефакты на лице + нестандартный запрос доступа',
            textEn: 'Face artifacts + non-standard access request',
            textKz: 'Беттегі артефактілер + стандартты емес қол жеткізу сұрауы',
            correct: true,
            consequence: 'Верно! Артефакты генерации и запрос TeamViewer — IT-отдел так не работает.',
            consequenceEn: 'Correct! Generation artifacts and TeamViewer request — IT department does not work this way.',
            consequenceKz: 'Дұрыс! Генерация артефактілері және TeamViewer сұрауы — IT бөлімі былай жұмыс істемейді.',
          },
          {
            text: 'Всё выглядит нормально, это настоящий сотрудник',
            textEn: 'Everything looks normal, it is a real employee',
            textKz: 'Бәрі қалыпты көрінеді, бұл нақты қызметкер',
            correct: false,
            consequence: 'Вы не заметили артефакты. Это был дипфейк — мошенники получили бы доступ к системе.',
            consequenceEn: 'You did not notice the artifacts. It was a deepfake — scammers would have gained system access.',
            consequenceKz: 'Сіз артефактілерді байқамадыңыз. Бұл дипфейк еді — алаяқшылар жүйеге кірер еді.',
          },
        ],
      },
    ],
  },

  // ===== SETTINGS APP (1 сценарий) =====
  {
    id: 'settings_security_checklist',
    title: 'Настройка безопасности — чеклист',
    titleEn: 'Security Settings Checklist',
    titleKz: 'Қауіпсіздік баптаулары — чеклист',
    description: 'Пройдите чеклист безопасности: включите 2FA, обновите пароль, настройте блокировку экрана.',
    type: 'credential_theft',
    difficulty: 1,
    xpReward: 100,
    appId: 'settings',
    steps: [
      {
        id: 1,
        title: 'Включение двухфакторной аутентификации',
        titleEn: 'Enable two-factor authentication',
        titleKz: 'Екі факторлы аутентификацияны қосу',
        description: 'Ваш аккаунт не защищён 2FA. Мошенник может подобрать пароль. Включите 2FA?',
        descriptionEn: 'Your account is not protected by 2FA. A scammer could guess the password. Enable 2FA?',
        descriptionKz: 'Аккаунтыңыз 2FA-мен қорғалмаған. Алаяқшы құпиясөзді таба алады. 2FA қосасыз ба?',
        choices: [
          {
            text: 'Включить 2FA (TOTP приложение)',
            textEn: 'Enable 2FA (TOTP app)',
            textKz: '2FA қосу (TOTP қосымшасы)',
            correct: true,
            consequence: '2FA включена! Теперь даже при утечке пароля аккаунт защищён.',
            consequenceEn: '2FA enabled! Now even if the password leaks, the account is protected.',
            consequenceKz: '2FA қосылды! Енді құпиясөз ағып кетсе де, аккаунт қорғалған.',
          },
          {
            text: 'Не сейчас — у меня сложный пароль',
            textEn: 'Not now — I have a strong password',
            textKz: 'Қазір емес — менде күрделі құпиясөз бар',
            correct: false,
            consequence: 'Сложный пароль — это хорошо, но без 2FA аккаунт уязвим к фишингу и кейлоггерам.',
            consequenceEn: 'A strong password is good, but without 2FA the account is vulnerable to phishing and keyloggers.',
            consequenceKz: 'Күрделі құпиясөз жақсы, бірақ 2FA-сыз аккаунт фишинг пен кейлоггерлерге осал.',
          },
        ],
      },
      {
        id: 2,
        title: 'Обновление пароля',
        titleEn: 'Password update',
        titleKz: 'Құпиясөзді жаңарту',
        description: 'Ваш пароль не менялся 6 месяцев. Рекомендация — менять каждые 90 дней. Обновить?',
        descriptionEn: 'Your password has not been changed in 6 months. Recommendation — change every 90 days. Update?',
        descriptionKz: 'Құпиясөзіңіз 6 айдан бері өзгермеген. Ұсыныс — әр 90 күнде өзгерту. Жаңартасыз ба?',
        choices: [
          {
            text: 'Обновить пароль на новый (12+ символов, спецсимволы)',
            textEn: 'Update password to new one (12+ chars, special chars)',
            textKz: 'Құпиясөзді жаңарту (12+ таңба, арнайы символдар)',
            correct: true,
            consequence: 'Пароль обновлён! Новый пароль соответствует всем требованиям безопасности.',
            consequenceEn: 'Password updated! New password meets all security requirements.',
            consequenceKz: 'Құпиясөз жаңартылды! Жаңа құпиясөз барлық қауіпсіздік талаптарына сай.',
          },
          {
            text: 'Оставить текущий — он достаточно сложный',
            textEn: 'Keep current — it is complex enough',
            textKz: 'Ағымдағыны қалдыру — ол жеткілікті күрделі',
            correct: false,
            consequence: 'Старый пароль мог быть скомпрометирован в утечках данных. Риск остаётся.',
            consequenceEn: 'The old password could have been compromised in data breaches. Risk remains.',
            consequenceKz: 'Ескі құпиясөз деректер ағып кетулерінде бұзылған болуы мүмкін. Тәуекел сақталады.',
          },
        ],
      },
    ],
  },

  // ===== ATTACK EMULATOR (1 сценарий) =====
  {
    id: 'attack_full_apt',
    title: 'Полная APT-атака — от разведки до эксфильтрации',
    titleEn: 'Full APT Attack — From Recon to Exfiltration',
    titleKz: 'Толық APT-шабуыл — Барлаудан эксфильтрацияға дейін',
    description: 'Симуляция полноценной Advanced Persistent Threat атаки: разведка → проникновение → латеральное перемещение → эксфильтрация → реагирование.',
    type: 'ransomware',
    difficulty: 5,
    xpReward: 350,
    appId: 'attack_emulator',
    steps: [
      {
        id: 1,
        title: 'Разведка — обнаружение сканирования',
        titleEn: 'Recon — scanning detected',
        titleKz: 'Барлау — сканерлеу анықталды',
        description: 'SOC обнаружил сканирование внешней инфраструктуры: 185.220.101.42 сканирует порты 22, 80, 443, 3389. Это разведка перед атакой. Ваши действия?',
        descriptionEn: 'SOC detected external infrastructure scanning: 185.220.101.42 is scanning ports 22, 80, 443, 3389. This is recon before an attack. What will you do?',
        descriptionKz: 'SOC сыртқы инфрақұрылымды сканерлеуді анықтады: 185.220.101.42 22, 80, 443, 3389 порттарын сканерлеуде. Бұл шабуыл алдындағы барлау. Не істейсіз?',
        choices: [
          {
            text: 'Заблокировать IP и усилить мониторинг',
            textEn: 'Block IP and enhance monitoring',
            textKz: 'IP бұғаттап, мониторингті күшейту',
            correct: true,
            consequence: 'IP заблокирован. Мониторинг усилен. Атакующий перейдёт к другим IP.',
            consequenceEn: 'IP blocked. Monitoring enhanced. The attacker will move to other IPs.',
            consequenceKz: 'IP бұғатталды. Мониторинг күшейтілді. Шабуылшы басқа IP-лерге көшеді.',
          },
          {
            text: 'Проигнорировать — сканирование не атака',
            textEn: 'Ignore — scanning is not an attack',
            textKz: 'Елемеу — сканерлеу шабуыл емес',
            correct: false,
            consequence: 'Сканирование выявило открытые порты. Атакующий подготовил план проникновения.',
            consequenceEn: 'Scanning revealed open ports. The attacker prepared a penetration plan.',
            consequenceKz: 'Сканерлеу ашық порттарды анықтады. Шабуылшы ену жоспарын дайындады.',
          },
        ],
      },
      {
        id: 2,
        title: 'Первичное проникновение — фишинг',
        titleEn: 'Initial penetration — phishing',
        titleKz: 'Алғашқы ену — фишинг',
        description: 'Атакующий отправил целевой фишинг бухгалтеру. Вложение: «Счёт_на_оплату.docm» с макросом. Бухгалтер открыл файл. Что делаете?',
        descriptionEn: 'The attacker sent targeted phishing to accounting. Attachment: "Invoice.docm" with macro. Accountant opened the file. What do you do?',
        descriptionKz: 'Шабуылшы бухгалтерге нысаналы фишинг жіберді. Тіркеме: "Счёт_на_оплату.docm" макроспен. Бухгалтер файлды ашты. Не істейсіз?',
        choices: [
          {
            text: 'Немедленно изолировать компьютер бухгалтера',
            textEn: 'Immediately isolate the accountant computer',
            textKz: 'Бухгалтер компьютерін бірден оқшаулау',
            correct: true,
            consequence: 'Компьютер изолирован до распространения malware. Макрос не смог соединиться с C2.',
            consequenceEn: 'Computer isolated before malware spread. Macro could not connect to C2.',
            consequenceKz: 'Компьютер malware таралмай тұрып оқшауланды. Макрос C2-ға қосыла алмады.',
          },
          {
            text: 'Подождать — может, ничего не произошло',
            textEn: 'Wait — maybe nothing happened',
            textKz: 'Күту — мүмкін ештеңе болған жоқ',
            correct: false,
            consequence: 'Макрос запустился и установил бэкдор. Атакующий получил первоначальный доступ.',
            consequenceEn: 'Macro executed and installed a backdoor. The attacker gained initial access.',
            consequenceKz: 'Макрос іске қосылып, бэкдор орнатты. Шабуылшы бастапқы қол жеткізуді алды.',
          },
        ],
      },
      {
        id: 3,
        title: 'Латеральное перемещение внутри сети',
        titleEn: 'Lateral movement inside the network',
        titleKz: 'Желі ішіндегі латеральды қозғалыс',
        description: 'Атакующий внутри сети! Он использует украденные учётные данные для перемещения к контроллеру домена. Что предпримете?',
        descriptionEn: 'The attacker is inside the network! Using stolen credentials to move to the domain controller. What will you do?',
        descriptionKz: 'Шабуылшы желі ішінде! Ұрланған тіркелу деректерін домен контроллеріне жылжу үшін қолдануда. Не істейсіз?',
        choices: [
          {
            text: 'Сбросить все учётные данные и включить сегментацию сети',
            textEn: 'Reset all credentials and enable network segmentation',
            textKz: 'Барлық тіркелу деректерін қалпына келтіріп, желі сегментациясын қосу',
            correct: true,
            consequence: 'Учётные данные сброшены. Сегментация остановила перемещение. Атакующий заперт в сегменте.',
            consequenceEn: 'Credentials reset. Segmentation stopped the movement. Attacker locked in segment.',
            consequenceKz: 'Тіркеу деректері қалпына келтірілді. Сегментация қозғалысты тоқтатты. Шабуылшы сегментте қамалды.',
          },
          {
            text: 'Понаблюдеть за действиями атакующего',
            textEn: 'Observe the attacker actions',
            textKz: 'Шабуылшы әрекеттерін бақылау',
            correct: false,
            consequence: 'Пока вы наблюдали, атакующий получил контроль над контроллером домена. Все учётные данные скомпрометированы.',
            consequenceEn: 'While you observed, the attacker gained domain controller control. All credentials compromised.',
            consequenceKz: 'Сіз бақылап тұрғанда, шабуылшы домен контроллерін бақылауға алды. Барлық тіркелу деректері бұзылды.',
          },
        ],
      },
      {
        id: 4,
        title: 'Эксфильтрация данных',
        titleEn: 'Data exfiltration',
        titleKz: 'Деректерді эксфильтрациялау',
        description: 'Данные начали уходить на внешний сервер: 2GB базы клиентов зашифрованы и отправляются. У вас есть минуты. Действуйте!',
        descriptionEn: 'Data started leaving for an external server: 2GB client database encrypted and being sent. You have minutes. Act!',
        descriptionKz: 'Деректер сыртқы серверге кете бастады: 2GB клиент базасы шифрленіп, жіберілуде. Сізде минуттар бар. Әрекет етіңіз!',
        choices: [
          {
            text: 'Разорвать все внешние подключения и активировать DLP',
            textEn: 'Sever all external connections and activate DLP',
            textKz: 'Барлық сыртқы байланыстарды үзіп, DLP іске қосу',
            correct: true,
            consequence: 'Внешние подключения разорваны. DLP заблокировал передачу. 90% данных спасено.',
            consequenceEn: 'External connections severed. DLP blocked the transfer. 90% of data saved.',
            consequenceKz: 'Сыртқы байланыстар үзілді. DLP тасымалдауды бұғаттады. Деректердің 90% құтқарылды.',
          },
          {
            text: 'Попытаться отследить, куда уходят данные',
            textEn: 'Try to track where data is going',
            textKz: 'Деректердің қайда кеткенін қадағалап көру',
            correct: false,
            consequence: 'Пока отслеживали, 2GB базы ушли. Данные на сервере злоумышленника.',
            consequenceEn: 'While tracking, 2GB of database left. Data is on the attacker server.',
            consequenceKz: 'Қадағалап жатқанда, 2GB база кетті. Деректер шабуылшы серверінде.',
          },
        ],
      },
      {
        id: 5,
        title: 'Реагирование и восстановление',
        titleEn: 'Response and recovery',
        titleKz: 'Реагирование және қалпына келтіру',
        description: 'Атака остановлена. Но нужно восстановить системы и провести расследование. С чего начнёте?',
        descriptionEn: 'Attack stopped. But systems need to be restored and investigation conducted. Where do you start?',
        descriptionKz: 'Шабуыл тоқтатылды. Бірақ жүйелерді қалпына келтіріп, тергеу жүргізу керек. Қайдан бастайсыз?',
        choices: [
          {
            text: 'Изолировать все затронутые системы, начать форензику, восстановить из бэкапов',
            textEn: 'Isolate all affected systems, start forensics, restore from backups',
            textKz: 'Барлық зақымданған жүйелерді оқшаулау, форензика бастау, бэкаптардан қалпына келтіру',
            correct: true,
            consequence: 'Системы восстановлены из чистых бэкапов. Форензика выявила полный путь атаки. Урок усвоен!',
            consequenceEn: 'Systems restored from clean backups. Forensics revealed the full attack path. Lesson learned!',
            consequenceKz: 'Жүйелер таза бэкаптардан қалпына келтірілді. Форензика шабуылдың толық жолын анықтады. Сабақ алынды!',
          },
          {
            text: 'Просто перезагрузить серверы и продолжить работу',
            textEn: 'Just reboot servers and continue working',
            textKz: 'Жай ғана серверлерді қайта жүктеп, жұмысты жалғастыру',
            correct: false,
            consequence: 'Бэкдор остался в системе. Атакующий вернётся через бэкап — он тоже был скомпрометирован.',
            consequenceEn: 'Backdoor remained in the system. The attacker will return via backup — it was also compromised.',
            consequenceKz: 'Бэкдор жүйеде қалды. Шабуылшы бэкап арқылы оралады — ол да бұзылған.',
          },
        ],
      },
    ],
  },
];

// Helper: get scenario by ID
export function getScenarioById(id: string): AttackScenario | undefined {
  return ATTACK_SCENARIOS.find(s => s.id === id);
}

// Helper: get scenarios by app ID
export function getScenariosByApp(appId: string): AttackScenario[] {
  return ATTACK_SCENARIOS.filter(s => s.appId === appId);
}

// Helper: get first uncompleted scenario for app
export function getFirstUncompletedScenario(appId: string, completedIds: Set<string>): AttackScenario | undefined {
  return ATTACK_SCENARIOS.find(s => s.appId === appId && !completedIds.has(s.id));
}

// Helper: translate choice text
export function translateChoiceText(choice: AttackChoice, lang: string): string {
  switch (lang) {
    case 'kz': return choice.textKz;
    case 'en': return choice.textEn;
    default: return choice.text;
  }
}

// Helper: translate consequence
export function translateConsequence(choice: AttackChoice, lang: string): string {
  switch (lang) {
    case 'kz': return choice.consequenceKz;
    case 'en': return choice.consequenceEn;
    default: return choice.consequence;
  }
}

// Helper: translate step title
export function translateStepTitle(step: AttackStep, lang: string): string {
  switch (lang) {
    case 'kz': return step.titleKz;
    case 'en': return step.titleEn;
    default: return step.title;
  }
}

// Helper: translate step description
export function translateStepDescription(step: AttackStep, lang: string): string {
  switch (lang) {
    case 'kz': return step.descriptionKz;
    case 'en': return step.descriptionEn;
    default: return step.description;
  }
}

// Helper: translate scenario title
export function translateScenarioTitle(scenario: AttackScenario, lang: string): string {
  switch (lang) {
    case 'kz': return scenario.titleKz;
    case 'en': return scenario.titleEn;
    default: return scenario.title;
  }
}
