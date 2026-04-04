import { Shield, Send, Globe, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4a9e5c, #6dbf7e)' }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-text">Zero Day</span>
            </div>
            <p className="text-xs text-text-muted">Интерактивный симулятор кибербезопасности</p>
            <p className="text-[10px] text-text-muted mt-2">Сделано командой <strong className="text-text-secondary">Pixel Minds</strong></p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <div>
              <h4 className="text-xs font-semibold text-text mb-2">Проект</h4>
              <ul className="space-y-1">
                <li><a href="#" className="text-xs text-text-muted hover:text-text transition-colors">Политика конфиденциальности</a></li>
                <li><a href="#" className="text-xs text-text-muted hover:text-text transition-colors">Пользовательское соглашение</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text mb-2">Контакты</h4>
              <ul className="space-y-1">
                <li><a href="mailto:support@zeroday.security" className="text-xs text-text-muted hover:text-text transition-colors">support@zeroday.security</a></li>
                <li><span className="text-xs text-text-muted">Telegram: @zeroday_sim</span></li>
              </ul>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-xs font-semibold text-text mb-2">Мы в сети</h4>
            <div className="flex gap-2">
              <a href="#" className="w-8 h-8 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-strong transition-all">
                <Send className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-strong transition-all">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-strong transition-all">
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="border-t border-border pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-text-muted">© 2026 Zero Day. Все права защищены.</p>
          <div className="flex flex-wrap gap-3">
            <span className="text-[10px] text-text-muted/70">Сервис является учебным проектом</span>
            <span className="text-[10px] text-text-muted/70">Не является коммерческим продуктом</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
