import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import logo from '@/assets/logo.png';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'ru' | 'kz' | 'en'>('ru');

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
        setMode('login'); setPassword('');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f7f6f2 0%, #eeede8 100%)' }}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4a9e5c, transparent)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #4a9e5c, transparent)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(74,158,92,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Floating shapes */}
        <div className="absolute top-32 right-40 w-3 h-3 rounded-full bg-primary/20 float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-40 left-32 w-2 h-2 rounded-full bg-accent/20 float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-60 left-60 w-4 h-4 rounded-full bg-primary/10 float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-60 right-60 w-2 h-2 rounded-full bg-accent/15 float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-primary/15 float" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        {/* Lang switcher */}
        <div className="flex justify-end mb-3 gap-1">
          {(['ru', 'kz', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${lang === l ? 'bg-primary text-white' : 'bg-white/60 text-text-secondary hover:bg-white'}`}>
              {l === 'ru' ? 'RU' : l === 'kz' ? 'KZ' : 'EN'}
            </button>
          ))}
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="text-center pb-2">
            <img src={logo} alt="Логотип Центр Инвест" className="mx-auto mb-3 h-14 w-auto object-contain" />
            <CardTitle className="text-2xl">{T('appName')}</CardTitle>
            <CardDescription>{T('tagline')}</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Tab switcher */}
            <div className="flex p-1 bg-bg-secondary rounded-lg mb-5">
              <button onClick={() => { setMode('login'); setErr(''); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'login' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'}`}>{T('login')}</button>
              <button onClick={() => { setMode('register'); setErr(''); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'register' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'}`}>{T('register')}</button>
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={T('fullName')} className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" required />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={T('username')} className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" required autoComplete="username" />
              </div>

              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={T('passwordHint')} className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </div>

              <AnimatePresence>
                {err && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-3 bg-danger-soft border border-danger/20 rounded-lg text-danger text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" /><span>{err}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
