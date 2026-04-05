import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldAlert, CheckCircle, XCircle, ArrowRight, RotateCcw,
  Zap, Eye, Lock, AlertTriangle, Award
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import type { AttackScenario } from '@/lib/attackScenarios';
import {
  translateChoiceText,
  translateConsequence,
  translateStepTitle,
  translateStepDescription,
  translateScenarioTitle,
} from '@/lib/attackScenarios';

interface AttackScenarioPlayerProps {
  scenario: AttackScenario;
  onComplete: (success: boolean, xpEarned: number) => void;
  onClose: () => void;
}

export default function AttackScenarioPlayer({ scenario, onComplete, onClose }: AttackScenarioPlayerProps) {
  const lang = useGS(s => s.lang);
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark' || theme === 'bw';

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [allStepsCorrect, setAllStepsCorrect] = useState(true);
  const [stepResults, setStepResults] = useState<boolean[]>([]);

  const currentStep = scenario.steps[currentStepIdx];
  const progress = ((currentStepIdx + (showConsequence ? 1 : 0)) / scenario.steps.length) * 100;

  const handleChoice = useCallback((choiceIdx: number) => {
    if (showConsequence) return;
    setSelectedChoice(choiceIdx);
    const choice = currentStep.choices[choiceIdx];
    const correct = choice.correct;

    setWasCorrect(correct);
    setStepResults(prev => [...prev, correct]);

    if (!correct) {
      setAllStepsCorrect(false);
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 3000);
    }

    setTimeout(() => {
      setShowConsequence(true);
    }, correct ? 500 : 2500);
  }, [currentStep, showConsequence]);

  const handleContinue = useCallback(() => {
    if (currentStepIdx < scenario.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setSelectedChoice(null);
      setShowConsequence(false);
      setWasCorrect(null);
    } else {
      const totalXP = allStepsCorrect ? scenario.xpReward : Math.floor(scenario.xpReward * 0.5);
      setXpEarned(totalXP);
      setScenarioComplete(true);
      onComplete(allStepsCorrect, totalXP);
    }
  }, [currentStepIdx, scenario, allStepsCorrect, onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentStepIdx(0);
    setSelectedChoice(null);
    setShowConsequence(false);
    setWasCorrect(null);
    setShowGlitch(false);
    setScenarioComplete(false);
    setXpEarned(0);
    setAllStepsCorrect(true);
    setStepResults([]);
  }, []);

  const getDifficultyColor = (d: number) => {
    if (d <= 2) return '#22c55e';
    if (d <= 3) return '#f59e0b';
    if (d <= 4) return '#ef4444';
    return '#dc2626';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phishing': return '📧';
      case 'malware': return '🦠';
      case 'social_engineering': return '🎭';
      case 'wifi_attack': return '📡';
      case 'deepfake': return '🎬';
      case 'credential_theft': return '🔑';
      case 'ransomware': return '🔒';
      default: return '⚠️';
    }
  };

  return (
    <>
      {/* Glitch overlay for wrong answers */}
      <AnimatePresence>
        {showGlitch && (
          <GlitchHackAnimation
            consequence={selectedChoice !== null ? translateConsequence(currentStep.choices[selectedChoice], lang) : ''}
            type={scenario.type}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)' }}
      >
        <div className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
          style={{ backgroundColor: isDark ? '#121212' : '#ffffff', borderColor: isDark ? '#2a2a2a' : '#e0e0e0' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 py-4 border-b"
            style={{ backgroundColor: isDark ? '#121212' : '#ffffff', borderColor: isDark ? '#2a2a2a' : '#e0e0e0' }}
          >
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full mb-3 overflow-hidden" style={{ backgroundColor: isDark ? '#2a2a2a' : '#e5e5e5' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                style={{ backgroundColor: wasCorrect === false ? '#ef4444' : wasCorrect === true ? '#22c55e' : '#7c3aed' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(scenario.type)}</span>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: isDark ? '#e0e0e0' : '#1a1a1a' }}>
                    {translateScenarioTitle(scenario, lang)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      backgroundColor: `${getDifficultyColor(scenario.difficulty)}20`,
                      color: getDifficultyColor(scenario.difficulty),
                    }}>
                      {'★'.repeat(scenario.difficulty)}{'☆'.repeat(5 - scenario.difficulty)}
                    </span>
                    <span className="text-xs" style={{ color: isDark ? '#666' : '#999' }}>
                      {currentStepIdx + 1}/{scenario.steps.length}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                style={{ color: isDark ? '#888' : '#666' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Scenario Complete */}
              {scenarioComplete ? (
                <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: allStepsCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)' }}
                  >
                    {allStepsCorrect ? <Award className="w-10 h-10 text-green-400" /> : <Shield className="w-10 h-10 text-yellow-400" />}
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: allStepsCorrect ? '#22c55e' : '#f59e0b' }}>
                      {allStepsCorrect ? 'Все шаги пройдены!' : 'Сценарий завершён'}
                    </h2>
                    <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>
                      {allStepsCorrect
                        ? 'Безупречное прохождение! Вы распознали все угрозы.'
                        : 'Вы допустили ошибки, но получили ценный опыт.'}
                    </p>
                  </div>

                  {/* Results per step */}
                  <div className="space-y-2">
                    {stepResults.map((correct, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {correct
                          ? <CheckCircle className="w-4 h-4 text-green-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />}
                        <span style={{ color: correct ? '#22c55e' : '#ef4444' }}>
                          Шаг {i + 1}: {correct ? 'Верно' : 'Ошибка'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }}
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-bold" style={{ color: '#f59e0b' }}>+{xpEarned} XP</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleRestart}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: '#7c3aed' }}
                    >
                      <RotateCcw className="w-4 h-4" /> Начать заново
                    </button>
                    <button onClick={onClose}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: '#22c55e' }}
                    >
                      <ArrowRight className="w-4 h-4" /> Продолжить
                    </button>
                  </div>
                </motion.div>
              ) : showConsequence ? (
                /* Consequence */
                <motion.div key="consequence" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: wasCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}
                    >
                      {wasCorrect ? <CheckCircle className="w-8 h-8 text-green-400" /> : <ShieldAlert className="w-8 h-8 text-red-400" />}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: wasCorrect ? '#22c55e' : '#ef4444' }}>
                      {wasCorrect ? 'Правильное решение!' : 'Ошибка!'}
                    </h3>
                  </div>

                  {/* Consequence text */}
                  <div className="p-4 rounded-xl" style={{
                    backgroundColor: wasCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${wasCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                    <p className="text-sm leading-relaxed" style={{ color: wasCorrect ? '#22c55e' : '#ef4444' }}>
                      {selectedChoice !== null ? translateConsequence(currentStep.choices[selectedChoice], lang) : ''}
                    </p>
                  </div>

                  {/* Educational note */}
                  {wasCorrect === false && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }}>
                      <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: isDark ? '#aaa' : '#666' }}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Правило безопасности:
                      </p>
                      <p className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>
                        {scenario.type === 'phishing' && 'Всегда проверяйте домен отправителя, SPF/DKIM заголовки и не переходите по подозрительным ссылкам.'}
                        {scenario.type === 'social_engineering' && 'Никогда не передавайте учётные данные через мессенджер. Подтверждайте личность через независимый канал.'}
                        {scenario.type === 'deepfake' && 'При подозрении на дипфейк — перезвоните по известному номеру. Обращайте внимание на артефакты голоса/видео.'}
                        {scenario.type === 'malware' && 'Не скачивайте файлы из ненадёжных источников. Проверяйте сертификаты сайтов.'}
                        {scenario.type === 'wifi_attack' && 'Никогда не подключайтесь к открытым Wi-Fi без VPN. Используйте мобильный интернет для важных операций.'}
                        {scenario.type === 'credential_theft' && 'Всегда используйте 2FA и меняйте пароли регулярно. Не используйте один пароль на нескольких сервисах.'}
                        {scenario.type === 'ransomware' && 'При подозрении на APT-атаку: изолируйте системы, сбросьте учётные данные, восстановите из чистых бэкапов.'}
                      </p>
                    </div>
                  )}

                  <button onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: wasCorrect ? '#22c55e' : '#7c3aed' }}
                  >
                    {currentStepIdx < scenario.steps.length - 1 ? (
                      <>Продолжить <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Завершить сценарий <Award className="w-4 h-4" /></>
                    )}
                  </button>
                </motion.div>
              ) : (
                /* Step content */
                <motion.div key="step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Step title */}
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: isDark ? '#e0e0e0' : '#1a1a1a' }}>
                      {translateStepTitle(currentStep, lang)}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: isDark ? '#aaa' : '#555' }}>
                      {translateStepDescription(currentStep, lang)}
                    </p>
                  </div>

                  {/* Choices */}
                  <div className="space-y-3">
                    {currentStep.choices.map((choice, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleChoice(i)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left p-4 rounded-xl border-2 transition-all"
                        style={{
                          backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
                          borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
                          (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = isDark ? '#2a2a2a' : '#e5e5e5';
                          (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? '#1a1a1a' : '#f9f9f9';
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ backgroundColor: isDark ? '#2a2a2a' : '#e5e5e5', color: isDark ? '#ccc' : '#666' }}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-sm font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>
                            {translateChoiceText(choice, lang)}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Hint */}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)' }}>
                    <p className="text-xs" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
                      💡 Подумайте как специалист по безопасности. Какой выбор минимизирует риск?
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ============================================
   GLITCH HACK ANIMATION — Красивая анимация взлома
   ============================================ */
interface GlitchHackAnimationProps {
  consequence: string;
  type: string;
}

function GlitchHackAnimation({ consequence, type }: GlitchHackAnimationProps) {
  const getHackTheme = () => {
    switch (type) {
      case 'phishing': return { color: '#ef4444', icon: '📧', label: 'ДАННЫЕ УКРАДЕНЫ' };
      case 'social_engineering': return { color: '#f59e0b', icon: '🎭', label: 'АККАУНТ СКОМПРОМЕТИРОВАН' };
      case 'deepfake': return { color: '#a855f7', icon: '🎬', label: 'ОБМАН СРАБОТАЛ' };
      case 'malware': return { color: '#ef4444', icon: '🦠', label: 'СИСТЕМА ЗАРАЖЕНА' };
      case 'wifi_attack': return { color: '#3b82f6', icon: '📡', label: 'ТРАФИК ПЕРЕХВАЧЕН' };
      case 'credential_theft': return { color: '#ef4444', icon: '🔑', label: 'УЧЁТНЫЕ ДАННЫЕ УКРАДЕНЫ' };
      case 'ransomware': return { color: '#dc2626', icon: '🔒', label: 'ДАННЫЕ ЗАШИФРОВАНЫ' };
      default: return { color: '#ef4444', icon: '⚠️', label: 'ВЗЛОМ' };
    }
  };

  const theme = getHackTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[350] pointer-events-none"
    >
      {/* Static noise */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          animation: 'glitch-attack-anim 0.15s infinite',
        }}
      />

      {/* Scan lines */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          animation: 'scanlines-attack 0.1s linear infinite',
        }}
      />

      {/* Red overlay with pulsing */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundColor: [
            `${theme.color}08`,
            `${theme.color}18`,
            `${theme.color}08`,
            `${theme.color}20`,
          ],
        }}
        transition={{ duration: 0.4, repeat: Infinity }}
      />

      {/* Color aberration bars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ backgroundColor: `${theme.color}30` }}
          animate={{
            x: [0, Math.random() * 80 - 40, 0],
            y: [0, Math.random() * 60 - 30, 0],
            width: [`${Math.random() * 300 + 50}px`, `${Math.random() * 200 + 30}px`],
            height: [`${Math.random() * 30 + 2}px`, `${Math.random() * 15 + 1}px`],
            left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: 0.3, repeat: Infinity, delay: Math.random() * 0.5 }}
        />
      ))}

      {/* Central hack message */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            {theme.icon}
          </motion.div>

          {/* Main label with glitch text */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold font-mono mb-4"
            style={{
              color: theme.color,
              textShadow: `-3px 0 #00ffff, 3px 0 #ff00ff`,
              animation: 'text-glitch-attack 0.1s infinite',
            }}
          >
            {theme.label}
          </motion.h1>

          {/* Consequence text */}
          <motion.p
            className="text-sm md:text-base max-w-md mx-auto px-4"
            style={{ color: `${theme.color}cc` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {consequence}
          </motion.p>

          {/* Data stolen icons */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {type === 'phishing' && (
              <>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Lock className="w-3.5 h-3.5" /> Пароли
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Eye className="w-3.5 h-3.5" /> Cookies
                </div>
              </>
            )}
            {type === 'social_engineering' && (
              <>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Eye className="w-3.5 h-3.5" /> Данные
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Lock className="w-3.5 h-3.5" /> Доступ
                </div>
              </>
            )}
            {type === 'deepfake' && (
              <>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  💸 Деньги
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Eye className="w-3.5 h-3.5" /> Доверие
                </div>
              </>
            )}
            {type === 'wifi_attack' && (
              <>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Eye className="w-3.5 h-3.5" /> Трафик
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Lock className="w-3.5 h-3.5" /> Сессии
                </div>
              </>
            )}
            {type === 'malware' && (
              <>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Lock className="w-3.5 h-3.5" /> Система
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Eye className="w-3.5 h-3.5" /> Данные
                </div>
              </>
            )}
            {type === 'ransomware' && (
              <>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Lock className="w-3.5 h-3.5" /> Бэкапы
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Eye className="w-3.5 h-3.5" /> Сеть
                </div>
              </>
            )}
            {(type === 'credential_theft') && (
              <>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Lock className="w-3.5 h-3.5" /> Учётки
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: theme.color }}>
                  <Eye className="w-3.5 h-3.5" /> 2FA
                </div>
              </>
            )}
          </motion.div>

          {/* Incident ID */}
          <motion.p
            className="text-[10px] font-mono mt-4"
            style={{ color: `${theme.color}66` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            INC-{Math.random().toString(36).substring(2, 10).toUpperCase()}
          </motion.p>
        </div>
      </motion.div>

      <style>{`
        @keyframes glitch-attack-anim {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
          100% { transform: translate(0); }
        }
        @keyframes scanlines-attack {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes text-glitch-attack {
          0% { transform: translate(0); }
          20% { transform: translate(-4px, 0); }
          40% { transform: translate(4px, 0); }
          60% { transform: translate(-2px, 0); }
          80% { transform: translate(2px, 0); }
          100% { transform: translate(0); }
        }
      `}</style>
    </motion.div>
  );
}
