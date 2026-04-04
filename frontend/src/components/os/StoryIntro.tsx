import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Zap, Globe, Lock } from 'lucide-react';
import { STORY_CHAPTERS } from '@/lib/story';

export default function StoryIntro({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const steps = [
    {
      icon: <Shield className="w-16 h-16" />,
      title: 'Добро пожаловать в ZeroOS',
      text: 'Вы — новый специалист по информационной безопасности в компании «Центр Инвест». Сегодня ваш первый день.',
      color: '#3fb950',
    },
    {
      icon: <Globe className="w-16 h-16" />,
      title: 'Ваш рабочий стол',
      text: 'Перед вами — ZeroOS, корпоративная операционная система. Через неё вы будете работать с почтой, мессенджером и системами защиты.',
      color: '#58a6ff',
    },
    {
      icon: <Zap className="w-16 h-16" />,
      title: 'Кто-то наблюдает',
      text: 'Но вы не одни. APT-группировка «ShadowNet» начала разведку. Фишинг, поддельные сети, социальная инженерия — всё будет использовано.',
      color: '#f59e0b',
    },
    {
      icon: <Lock className="w-16 h-16" />,
      title: 'Ваша задача',
      text: 'Распознавайте атаки, защищайте данные компании. Каждое решение имеет последствия. Ошибка — и данные будут скомпрометированы.',
      color: '#ef4444',
    },
  ];

  const currentStep = steps[step];
  const totalSteps = steps.length;

  useEffect(() => {
    const timer = setInterval(() => {
      if (step < totalSteps - 1) {
        setFadeIn(false);
        setTimeout(() => {
          setStep(s => s + 1);
          setFadeIn(true);
        }, 300);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [step, totalSteps]);

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-lg w-full mx-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: fadeIn ? 1 : 0, y: fadeIn ? 0 : -20 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{
              backgroundColor: `${currentStep.color}15`,
              border: `2px solid ${currentStep.color}40`,
              color: currentStep.color,
            }}>
              {currentStep.icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">{currentStep.title}</h2>

            {/* Text */}
            <p className="text-base text-gray-300 leading-relaxed mb-8">{currentStep.text}</p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all" style={{
                  backgroundColor: i === step ? currentStep.color : i < step ? '#3fb950' : '#333',
                  width: i === step ? '24px' : '8px',
                }} />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3">
              {step > 0 && (
                <button onClick={() => { setFadeIn(false); setTimeout(() => { setStep(s => s - 1); setFadeIn(true); }, 200); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Назад
                </button>
              )}
              {step < totalSteps - 1 ? (
                <button onClick={() => { setFadeIn(false); setTimeout(() => { setStep(s => s + 1); setFadeIn(true); }, 200); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: currentStep.color }}
                >
                  Далее <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={onStart}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-base font-bold text-white shadow-lg"
                  style={{ backgroundColor: '#3fb950', boxShadow: '0 0 30px rgba(63,185,80,0.3)' }}
                >
                  Начать работу <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Chapters preview */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {STORY_CHAPTERS.map((ch, i) => (
            <div key={ch.id} className="p-3 rounded-xl text-center" style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${ch.color}30`,
            }}>
              <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: ch.color }}>
                {i + 1}
              </div>
              <p className="text-[10px] text-gray-400">{ch.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
