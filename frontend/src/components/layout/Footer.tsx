import { Shield, Send, Heart } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

export default function Footer() {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);

  return (
    <footer className="border-t border-border/40 bg-surface/60 shrink-0">
      <div className="max-w-6xl mx-auto px-6 py-4 space-y-3">
        {/* Main row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-primary/50" />
            <span className="text-sm font-semibold text-text">{T('footerBrand')}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Telegram */}
            <a
              href="https://t.me/halvans"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>

            {/* GitHub — placeholder, заменишь когда скинешь ссылку */}
            <a
              href="https://github.com/halvans/zero-day"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="opacity-70">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Info row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-muted/70">
            <span>Сделано с</span>
            <Heart className="w-3 h-3 text-danger/60 fill-current" />
            <span>командой</span>
            <span className="font-semibold text-text/80">Pixel Minds</span>
          </div>

          <p className="text-[11px] text-text-muted/50 text-center sm:text-right max-w-md leading-relaxed">
            Любительский open-source проект. Не является официальным продуктом и не связан с компанией «Центр Инвест».
          </p>
        </div>
      </div>
    </footer>
  );
}
