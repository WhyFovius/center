import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Lock, Unlock, FileX } from 'lucide-react';

interface GlitchEffectProps {
  active: boolean;
  onDone: () => void;
}

export default function GlitchEffect({ active, onDone }: GlitchEffectProps) {
  const [phase, setPhase] = useState<'glitch' | 'encrypt' | 'warning' | 'done'>('glitch');

  useEffect(() => {
    if (!active) return;

    setPhase('glitch');

    const t1 = setTimeout(() => setPhase('encrypt'), 1500);
    const t2 = setTimeout(() => setPhase('warning'), 2500);
    const t3 = setTimeout(() => {
      setPhase('done');
      onDone();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, onDone]);

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Glitch overlay */}
          {phase === 'glitch' && <GlitchOverlay />}

          {/* Encryption animation */}
          {phase === 'encrypt' && <EncryptionAnimation />}

          {/* Warning screen */}
          {phase === 'warning' && <WarningScreen />}
        </>
      )}
    </AnimatePresence>
  );
}

function GlitchOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Static noise */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          animation: 'glitch-anim 0.15s infinite',
        }}
      />

      {/* Scan lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          animation: 'scanlines 0.1s linear infinite',
        }}
      />

      {/* Color aberration */}
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        animate={{
          backgroundColor: [
            'rgba(255, 0, 0, 0.1)',
            'rgba(0, 255, 0, 0.1)',
            'rgba(0, 0, 255, 0.1)',
            'rgba(255, 0, 0, 0.15)',
          ],
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />

      {/* Random glitch blocks */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-danger/40"
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            width: [`${Math.random() * 200 + 50}px`, `${Math.random() * 150 + 30}px`],
            height: [`${Math.random() * 20 + 2}px`, `${Math.random() * 10 + 1}px`],
            left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      ))}

      {/* Text glitch */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          opacity: [0, 1, 0, 1, 0],
        }}
        transition={{ duration: 0.5, repeat: 3 }}
      >
        <span
          className="text-6xl font-bold text-danger font-mono"
          style={{
            textShadow: '-3px 0 #00ffff, 3px 0 #ff00ff',
            animation: 'text-glitch 0.1s infinite',
          }}
        >
          ERROR
        </span>
      </motion.div>

      <style>{`
        @keyframes glitch-anim {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes text-glitch {
          0% { transform: translate(0); }
          25% { transform: translate(-3px, 0); }
          50% { transform: translate(3px, 0); }
          75% { transform: translate(-1px, 0); }
          100% { transform: translate(0); }
        }
      `}</style>
    </motion.div>
  );
}

function EncryptionAnimation() {
  const [files, setFiles] = useState<Array<{ name: string; encrypted: boolean }>>([]);

  useEffect(() => {
    const fileNames = [
      'отчет_2026.xlsx',
      'база_клиентов.db',
      'пароли.txt',
      'договоры.pdf',
      'финансы.xlsx',
      'конфиденциально.docx',
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index >= fileNames.length) {
        clearInterval(interval);
        return;
      }
      setFiles((prev) => [
        ...prev,
        { name: fileNames[index], encrypted: true },
      ]);
      index++;
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Lock className="w-16 h-16 text-danger mx-auto mb-4" />
        </motion.div>

        <p className="text-danger font-mono text-lg font-bold mb-4">ШИФРОВАНИЕ ФАЙЛОВ...</p>

        <div className="space-y-1 max-h-40 overflow-hidden">
          {files.map((file, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm font-mono"
            >
              <FileX className="w-4 h-4 text-danger" />
              <span className="text-text-secondary line-through">{file.name}</span>
              <span className="text-danger">.locked</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 w-64 mx-auto">
          <div className="w-full bg-bg-secondary rounded-full h-2">
            <motion.div
              className="h-2 bg-danger rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(files.length / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WarningScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] bg-danger/95 flex items-center justify-center"
    >
      <motion.div
        className="text-center text-white"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <motion.div
          animate={{
            rotateY: [0, 180, 360],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-6"
        >
          <ShieldAlert className="w-24 h-24 mx-auto" />
        </motion.div>

        <h1 className="text-4xl font-bold mb-3 font-mono">СИСТЕМА СКОМПРОМЕТИРОВАНА</h1>
        <p className="text-lg opacity-90 mb-6">
          Обнаружена несанкционированная активность
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p>Данные под угрозой</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <Unlock className="w-6 h-6 mx-auto mb-2" />
            <p>Доступ получен</p>
          </div>
        </div>

        <p className="mt-6 text-sm opacity-75 font-mono">
          ID инцидента: {Math.random().toString(36).substring(2, 10).toUpperCase()}
        </p>
      </motion.div>
    </motion.div>
  );
}
