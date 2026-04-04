import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';

export default function OrientationLock({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const portrait = window.matchMedia('(orientation: portrait)').matches;
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      setIsPortrait(portrait);
      setIsMobile(mobile);
    };
    check();
    window.addEventListener('orientationchange', check);
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('orientationchange', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  const show = isMobile && isPortrait;

  return (
    <>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <RotateCw className="w-16 h-16 text-primary" />
            </motion.div>
            <div className="text-center px-8">
              <h2 className="text-xl font-bold text-text mb-2">Переверните устройство</h2>
              <p className="text-sm text-text-secondary">Для лучшего опыта используйте горизонтальную ориентацию</p>
            </div>
            <motion.div
              className="w-12 h-20 border-2 border-border rounded-3xl flex items-start justify-center pt-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-3 h-3 rounded-full bg-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
