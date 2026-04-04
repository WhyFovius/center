import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Mail, Loader2, AlertTriangle, Globe, Palette } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import logo from '@/assets/logo.png';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLangState] = useState<'ru' | 'kz' | 'en'>('ru');
  const setGlobalLang = useGS(s => s.setLang);

  const setLang = (l: 'ru' | 'kz' | 'en') => {
    setLangState(l);
    setGlobalLang(l);
  };

  const setAuthed = useGS(s => s.setAuthed);
  const load = useGS(s => s.load);

  const T = (k: string) => t(lang, k);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await api.auth.register({ username: username.trim().toLowerCase(), password, full_name: fullName.trim() });
        setMode('login'); setPassword(''); setUsername(''); setFullName('');
      } else {
        const r = await api.auth.login({ username: username.trim().toLowerCase(), password });
        api.setToken(r.access_token);
        setAuthed(true);
        await load();
      }
    } catch (e: any) { setErr(e.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-24 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4a9e5c, transparent)' }} />
        <div className="absolute bottom-24 right-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(74,158,92,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg relative z-10">
        <Card className="border-border/60 shadow-2xl">
          <CardHeader className="text-center pb-3">
            <img src={logo} alt="Логотип Центр Инвест" className="mx-auto mb-4 h-16 w-auto object-contain" />
            <CardTitle className="text-3xl font-extrabold tracking-tight">{T('appName')}</CardTitle>
            <CardDescription className="text-base mt-1">{T('tagline')}</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Settings row inside card */}
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-text-muted" />
                {(['ru', 'kz', 'en'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      lang === l
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-bg-secondary text-text-muted hover:text-text'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-text-muted" />
                <ToggleTheme />
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex p-1.5 bg-bg-secondary rounded-xl mb-6">
              <button
                onClick={() => { setMode('login'); setErr(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  mode === 'login' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                {T('login')}
              </button>
              <button
                onClick={() => { setMode('register'); setErr(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  mode === 'register' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                {T('register')}
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder={T('fullName')}
                        className="w-full pl-12 pr-5 py-3.5 bg-bg-secondary border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={T('username')}
                  className="w-full pl-12 pr-5 py-3.5 bg-bg-secondary border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={T('passwordHint')}
                  className="w-full pl-12 pr-5 py-3.5 bg-bg-secondary border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base"
                  required
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 bg-danger-soft border border-danger/20 rounded-xl text-danger text-base"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{err}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={loading} className="w-full py-4 text-base font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {mode === 'login' ? T('signIn') : T('createAccount')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-4">© 2026 Zero Day • Центр Инвест</p>
      </motion.div>
    </div>
  );
}
