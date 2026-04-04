import { useCallback } from 'react';
import { MonitorCog, MoonStar, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGS } from '@/store/useGS';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

const THEME_OPTIONS: { icon: typeof Sun; value: Theme | 'system'; label: string }[] = [
  { icon: Sun, value: 'light', label: 'Светлая' },
  { icon: MoonStar, value: 'dark', label: 'Тёмная' },
  { icon: MonitorCog, value: 'system', label: 'Системная' },
];

export function ToggleTheme({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const theme = useGS(s => s.theme);
  const setTheme = useGS(s => s.setTheme);

  const handleChange = useCallback((value: Theme | 'system') => {
    if (value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(value);
    }
  }, [setTheme]);

  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4';
  const btnSize = size === 'sm' ? 'size-7' : 'size-8';

  return (
    <motion.div
      className="inline-flex items-center overflow-hidden rounded-md border border-border bg-bg-secondary/50"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={cn(
            `relative ${btnSize} cursor-pointer flex items-center justify-center rounded-md transition-all`,
            theme === option.value
              ? 'text-text'
              : 'text-text-muted hover:text-text'
          )}
          role="radio"
          aria-checked={theme === option.value}
          aria-label={`Переключить на ${option.label} тему`}
          onClick={() => handleChange(option.value)}
          title={option.label}
        >
          {theme === option.value && (
            <motion.div
              layoutId="theme-option"
              transition={{ type: 'spring', bounce: 0.1, duration: 0.75 }}
              className="absolute inset-0 rounded-md border border-border/50 bg-bg-secondary/30"
            />
          )}
          <option.icon className={iconSize} />
        </button>
      ))}
    </motion.div>
  );
}
