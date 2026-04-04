import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Wifi, Shield, Mail, Globe, MessageSquare, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    title: 'Добро пожаловать в ZeroOS!',
    desc: 'Это ваша корпоративная операционная система для обучения кибербезопасности. Здесь вы будете выполнять миссии и защищать данные компании.',
    icon: Monitor,
    color: '#3fb950',
  },
  {
    title: 'Приложения на рабочем столе',
    desc: 'Кликните по иконке чтобы открыть приложение: Почта, Браузер, Xam Мессенджер, Файлы, Терминал, Безопасность. Каждое приложение — часть обучения.',
    icon: Monitor,
    color: '#58a6ff',
  },
  {
    title: 'Почта — ваша первая миссия',
    desc: 'Откройте Почту. Вы получите фишинговое письмо. Проверьте SPF/DKIM заголовки, не переходите по подозрительным ссылкам. Это ваш первый тест!',
    icon: Mail,
    color: '#ef4444',
  },
  {
    title: 'Xam Мессенджер с AI',
    desc: 'Xam — умный мессенджер с AI-ассистентом. Пишите сообщения и получайте ответы от нейросети. Но будьте осторожны — мошенники тоже используют AI!',
    icon: MessageSquare,
    color: '#7c3aed',
  },
  {
    title: 'ZeroBrowser',
    desc: 'Браузер с вкладками, историей и закладками. Работает через iframe. Для важных операций используйте мобильный интернет или VPN.',
    icon: Globe,
    color: '#f59e0b',
  },
  {
    title: 'Симуляторы атак',
    desc: 'В меню «Пуск» есть симуляторы: Wi-Fi атака (сниффинг трафика), Дипфейк-звонок (распознавание AI-голоса), Эмуляция атаки (визуализация).',
    icon: Wifi,
    color: '#ec4899',
  },
  {
    title: 'Центр безопасности',
    desc: 'Мониторинг угроз в реальном времени. Сканируйте систему, активируйте защиту, отслеживайте уровень безопасности.',
    icon: Shield,
    color: '#22c55e',
  },
  {
    title: 'Готовы начать?',
    desc: 'Откройте Почту — там вас ждёт первое задание. Удачи в защите данных компании!',
    icon: Check,
    color: '#3fb950',
  },
];

export default function OSTutorial({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);
  const current = STEPS[step];
  const Icon = current.icon;

  const goNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setFade(false);
      setTimeout(() => { setStep(s => s + 1); setFade(true); }, 250);
    } else {
      onComplete();
    }
  }, [step, onComplete]);

  const goPrev = useCallback(() => {
    if (step > 0) {
      setFade(false);
      setTimeout(() => { setStep(s => s - 1); setFade(true); }, 250);
    }
  }, [step]);

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)' }}>
      <button onClick={onComplete} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-lg w-full mx-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: fade ? 1 : 0, y: fade ? 0 : -10 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${current.color}15`, border: `2px solid ${current.color}40`, color: current.color }}>
              <Icon className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">{current.title}</h2>
            <p className="text-base text-gray-300 leading-relaxed mb-6">{current.desc}</p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-8">
              {STEPS.map((_, i) => (
                <div key={i} className="rounded-full transition-all" style={{
                  backgroundColor: i === step ? current.color : i < step ? '#3fb950' : '#333',
                  width: i === step ? '24px' : '8px', height: '8px',
                }} />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-3">
              {step > 0 && (
                <button onClick={goPrev} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
              )}
              <button onClick={goNext} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
                style={{ backgroundColor: current.color, boxShadow: `0 0 20px ${current.color}30` }}
              >
                {step < STEPS.length - 1 ? (<>Далее <ChevronRight className="w-4 h-4" /></>) : (<>Начать работу <Check className="w-4 h-4" /></>)}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
