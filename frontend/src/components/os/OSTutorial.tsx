import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Wifi, Shield, Mail, Globe, MessageSquare, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

const STEPS = [
  {
    titleKey: 'osTutorialTitle1',
    descKey: 'osTutorialDesc1',
    icon: Monitor,
    color: '#3fb950',
  },
  {
    titleKey: 'osTutorialTitle2',
    descKey: 'osTutorialDesc2',
    icon: Monitor,
    color: '#58a6ff',
  },
  {
    titleKey: 'osTutorialTitle3',
    descKey: 'osTutorialDesc3',
    icon: Mail,
    color: '#ef4444',
  },
  {
    titleKey: 'osTutorialTitle4',
    descKey: 'osTutorialDesc4',
    icon: MessageSquare,
    color: '#7c3aed',
  },
  {
    titleKey: 'osTutorialTitle5',
    descKey: 'osTutorialDesc5',
    icon: Globe,
    color: '#f59e0b',
  },
  {
    titleKey: 'osTutorialTitle6',
    descKey: 'osTutorialDesc6',
    icon: Wifi,
    color: '#ec4899',
  },
  {
    titleKey: 'osTutorialTitle7',
    descKey: 'osTutorialDesc7',
    icon: Shield,
    color: '#22c55e',
  },
  {
    titleKey: 'osTutorialTitle8',
    descKey: 'osTutorialDesc8',
    icon: Check,
    color: '#3fb950',
  },
];

export default function OSTutorial({ onComplete }: { onComplete: () => void }) {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
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

            <h2 className="text-2xl font-bold text-white mb-3">{T(current.titleKey)}</h2>
            <p className="text-base text-gray-300 leading-relaxed mb-6">{T(current.descKey)}</p>

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
                  <ChevronLeft className="w-4 h-4" /> {T('osTutorialBack')}
                </button>
              )}
              <button onClick={goNext} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
                style={{ backgroundColor: current.color, boxShadow: `0 0 20px ${current.color}30` }}
              >
                {step < STEPS.length - 1 ? (<>{T('osTutorialNext')} <ChevronRight className="w-4 h-4" /></>) : (<>{T('osTutorialStart')} <Check className="w-4 h-4" /></>)}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
