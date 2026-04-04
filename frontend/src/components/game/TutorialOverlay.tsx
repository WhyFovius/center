import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, Eye, Shield, ArrowRight, X, Play } from 'lucide-react';
import { useGS } from '@/store/useGS';

type TutorialStep = {
  icon: React.ReactNode;
  text: string;
  highlight: { x: number; y: number; w: number; h: number } | null;
};

function getTutorialForMission(missionCode: string, lang: string): TutorialStep[] {

  const tutorials: Record<string, TutorialStep[]> = {
    office: [
      {
        icon: <Eye className="w-6 h-6" />,
        text: lang === 'ru' ? 'Внимательно осмотритесь. Здесь есть 3 зоны: рабочий стол, SOC и переговорная.' : lang === 'kz' ? 'Мұқият қараңыз. Мұнда 3 аймақ бар: жұмыс үстелі, SOC және келіссөз бөлмесі.' : 'Look around. There are 3 zones: desk, SOC, and meeting room.',
        highlight: null,
      },
      {
        icon: <MousePointerClick className="w-6 h-6" />,
        text: lang === 'ru' ? 'Подойдите к маркеру угрозы. Нажмите WASD или стрелки для перемещения.' : lang === 'kz' ? 'Қауіп маркеріне жақындаңыз. Жылжу үшін WASD немесе бағыттарды басыңыз.' : 'Approach the threat marker. Use WASD or arrows to move.',
        highlight: { x: 56, y: 72, w: 382, h: 230 },
      },
      {
        icon: <Shield className="w-6 h-6" />,
        text: lang === 'ru' ? 'Прочитайте обучение, выполните практику и примите решение в тесте.' : lang === 'kz' ? 'Оқытуды оқып, практиканы орындап, тесте шешім қабылдаңыз.' : 'Read the training, complete the practice, and make a decision in the test.',
        highlight: null,
      },
    ],
    home: [
      {
        icon: <Eye className="w-6 h-6" />,
        text: lang === 'ru' ? 'Вы дома. Проверьте почту, смартфон и уведомления — угрозы повсюду.' : lang === 'kz' ? 'Сіз үйдесіз. Поштаны, смартфонды және хабарламаларды тексеріңіз — қауіптер кез келген жерде.' : 'You\'re at home. Check mail, smartphone, and notifications — threats are everywhere.',
        highlight: null,
      },
      {
        icon: <MousePointerClick className="w-6 h-6" />,
        text: lang === 'ru' ? 'Подойдите к маркеру. Не открывайте подозрительные ссылки и вложения!' : lang === 'kz' ? 'Маркерге жақындаңыз. Күмәнді сілтемелер мен тіркемелерді ашпаңыз!' : 'Approach the marker. Don\'t open suspicious links and attachments!',
        highlight: { x: 62, y: 84, w: 372, h: 226 },
      },
    ],
    wifi: [
      {
        icon: <Eye className="w-6 h-6" />,
        text: lang === 'ru' ? 'Публичный Wi-Fi — зона повышенного риска. Будьте осторожны с подключениями.' : lang === 'kz' ? 'Қоғамдық Wi-Fi — жоғары тәуекел аймағы. Байланыстарға абай болыңыз.' : 'Public Wi-Fi is a high-risk zone. Be careful with connections.',
        highlight: null,
      },
      {
        icon: <Shield className="w-6 h-6" />,
        text: lang === 'ru' ? 'Не вводите данные в публичных сетях. Используйте VPN или мобильный интернет.' : lang === 'kz' ? 'Қоғамдық желілерде деректерді енгізбеңіз. VPN немесе мобильді интернетті қолданыңыз.' : 'Don\'t enter data on public networks. Use VPN or mobile internet.',
        highlight: { x: 58, y: 80, w: 378, h: 226 },
      },
    ],
    banking: [
      {
        icon: <Eye className="w-6 h-6" />,
        text: lang === 'ru' ? 'Банковские операции требуют максимальной бдительности.' : lang === 'kz' ? 'Банк операциялары максималды сақтықты талап етеді.' : 'Banking operations require maximum vigilance.',
        highlight: null,
      },
      {
        icon: <Shield className="w-6 h-6" />,
        text: lang === 'ru' ? 'Проверяйте реквизиты. Никому не сообщайте OTP и CVV.' : lang === 'kz' ? 'Реквизиттерді тексеріңіз. Ешкімге OTP және CVV айтпаңыз.' : 'Check details. Never share OTP and CVV with anyone.',
        highlight: { x: 54, y: 86, w: 380, h: 228 },
      },
    ],
    travel: [
      {
        icon: <Eye className="w-6 h-6" />,
        text: lang === 'ru' ? 'В поездках бдительность снижается — этим пользуются злоумышленники.' : lang === 'kz' ? 'Сапарларда сақтық төмендейді — мұны шабуылдаушылар пайдаланады.' : 'Vigilance drops during travel — attackers exploit this.',
        highlight: null,
      },
      {
        icon: <MousePointerClick className="w-6 h-6" />,
        text: lang === 'ru' ? 'Проверяйте сеть перед подключением. Не сообщайте данные карты по телефону.' : lang === 'kz' ? 'Қосылу алдында желіні тексеріңіз. Телефон арқылы карта деректерін айтпаңыз.' : 'Check the network before connecting. Don\'t share card details by phone.',
        highlight: { x: 56, y: 76, w: 382, h: 232 },
      },
    ],
    remote: [
      {
        icon: <Eye className="w-6 h-6" />,
        text: lang === 'ru' ? 'Удалённая работа — новые векторы атак. Проверяйте обновления и VPN.' : lang === 'kz' ? 'Қашықтан жұмыс — жаңа шабуыл векторлары. Жаңартулар мен VPN-ды тексеріңіз.' : 'Remote work means new attack vectors. Check updates and VPN.',
        highlight: null,
      },
      {
        icon: <Shield className="w-6 h-6" />,
        text: lang === 'ru' ? 'Не устанавливайте обновления из непроверенных источников.' : lang === 'kz' ? 'Тексерілмеген көздерден жаңартуларды орнатпаңыз.' : 'Don\'t install updates from unverified sources.',
        highlight: { x: 60, y: 80, w: 376, h: 228 },
      },
    ],
  };

  return tutorials[missionCode] || tutorials.office;
}

export function TutorialOverlay() {
  const lang = useGS(s => s.lang);
  const sim = useGS(s => s.sim);
  const mi = useGS(s => s.mi);
  const [showing, setShowing] = useState(false);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const mission = sim?.missions?.[mi];
  const code = mission?.code || 'office';
  const steps = getTutorialForMission(code, lang);
  const tt = (key: string) => tutorialT(lang, key);

  useEffect(() => {
    // Auto-show tutorial on first visit to a mission
    const tutorialSeen = localStorage.getItem(`zd_tutorial_${code}`);
    if (!tutorialSeen) {
      setShowing(true);
      setStep(0);
      setVisible(true);
    }
  }, [code]);

  const dismiss = () => {
    setShowing(false);
    localStorage.setItem(`zd_tutorial_${code}`, '1');
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setVisible(false);
      setTimeout(() => {
        setStep(step + 1);
        setVisible(true);
      }, 200);
    } else {
      dismiss();
    }
  };

  if (!showing || !mission) return null;

  const currentStep = steps[step];
  const highlight = currentStep.highlight;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Overlay background */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={dismiss} />

      {/* Highlight rectangle */}
      {highlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none"
          style={{
            left: `${(highlight.x / 1320) * 100}%`,
            top: `${(highlight.y / 840) * 100}%`,
            width: `${(highlight.w / 1320) * 100}%`,
            height: `${(highlight.h / 840) * 100}%`,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full h-full rounded-2xl border-2 border-primary/60 shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(63,185,80,0.3)' }}
          />
        </motion.div>
      )}

      {/* Tutorial card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10, scale: visible ? 1 : 0.95 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-auto"
      >
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {currentStep.icon}
              </div>
              <div>
                <p className="text-xs text-text-muted">{tt('tutorialStep')} {step + 1} {tt('tutorialOf')} {steps.length}</p>
                <p className="text-sm font-bold text-text">{tt('tutorialTitle')}</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Text */}
          <p className="text-base text-text-secondary leading-relaxed mb-5">{currentStep.text}</p>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/40' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            {/* Next/Skip button */}
            <button
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              {step < steps.length - 1 ? (
                <>
                  {tt('tutorialNext')}
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {tt('tutorialStart')}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function tutorialT(lang: string, key: string): string {
  const translations: Record<string, Record<string, string>> = {
    ru: {
      tutorialStep: 'Шаг',
      tutorialOf: 'из',
      tutorialTitle: 'Подсказка',
      tutorialNext: 'Далее',
      tutorialStart: 'Начать',
    },
    kz: {
      tutorialStep: 'Қадам',
      tutorialOf: '/',
      tutorialTitle: 'Кеңес',
      tutorialNext: 'Әрі',
      tutorialStart: 'Бастау',
    },
    en: {
      tutorialStep: 'Step',
      tutorialOf: 'of',
      tutorialTitle: 'Hint',
      tutorialNext: 'Next',
      tutorialStart: 'Start',
    },
  };
  return translations[lang]?.[key] || translations.en[key] || key;
}
