import { useEffect } from 'react';
import type { Theme } from '@/types';

export function useTheme() {
  useEffect(() => {
    const saved = localStorage.getItem('zd_theme') as Theme | null;
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  return (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zd_theme', theme);
  };
}
