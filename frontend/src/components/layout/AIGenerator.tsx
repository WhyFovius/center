import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertTriangle, Send, Globe } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { Button } from '@/components/ui/button';

const TOPICS = [
  'Фишинг через QR-код', 'Поддельный звонок из банка', 'Вредоносное обновление ПО',
  'Утечка данных через мессенджер', 'Атака на публичном Wi-Fi', 'Социальная инженерия в отеле',
  'Поддельное письмо от руководства', 'Кража данных через USB', 'Атака на облачное хранилище',
  'Мошенничество с криптовалютой', 'Поддельный сайт госуслуг', 'Атака через умные устройства',
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Лёгкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'hard', label: 'Сложный' },
];

export function AIGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<any>(null);
  const [customTopic, setCustomTopic] = useState('');

  const lang = useGS(s => s.lang);

  const handleGenerate = async () => {
    const t = customTopic || topic;
    if (!t) return;
    setLoading(true); setError(''); setGenerated(null);
    try {
      const token = localStorage.getItem('zd_token');
      const resp = await fetch('/api/v1/ai/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic: t, difficulty, language: lang }),
      });
      if (!resp.ok) {
        const e = await resp.json();
        throw new Error(e.detail || 'Ошибка генерации');
      }
      const data = await resp.json();
      setGenerated(data.scenario);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="text-base font-bold text-text">AI-генератор сценариев</h3>
      </div>

      <div className="space-y-3">
        {/* Topic selection */}
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Тема</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {TOPICS.map(t => (
              <button key={t} onClick={() => { setTopic(t); setCustomTopic(''); }}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                  topic === t && !customTopic
                    ? 'border-primary bg-primary-container text-on-primary-container'
                    : 'border-border text-text-muted hover:text-text hover:bg-bg-secondary'
                }`}>{t}</button>
            ))}
          </div>
          <input
            type="text"
            value={customTopic}
            onChange={e => { setCustomTopic(e.target.value); setTopic(''); }}
            placeholder="Или введите свою тему..."
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Сложность</label>
          <div className="flex gap-1">
            {DIFFICULTIES.map(d => (
              <button key={d.value} onClick={() => setDifficulty(d.value)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  difficulty === d.value
                    ? 'border-primary bg-primary-container text-on-primary-container'
                    : 'border-border text-text-muted hover:text-text'
                }`}>{d.label}</button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading || (!topic && !customTopic)} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {loading ? 'Генерация...' : 'Сгенерировать сценарий'}
        </Button>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 bg-danger-soft border border-danger/20 rounded-lg text-danger text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {generated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-bg-secondary border border-border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-text">{generated.title}</span>
            </div>
            <p className="text-xs text-text-secondary">{generated.brief}</p>
            <div className="font-mono text-[10px] text-text-muted bg-bg p-2 rounded whitespace-pre-wrap">{generated.payload}</div>
            <div className="grid grid-cols-2 gap-1.5">
              {generated.options?.map((opt: any) => (
                <div key={opt.option_key} className={`p-2 rounded text-xs border ${
                  opt.is_correct ? 'border-success/30 bg-success-soft text-success' : 'border-border text-text-secondary'
                }`}>
                  <strong>{opt.option_key}.</strong> {opt.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
