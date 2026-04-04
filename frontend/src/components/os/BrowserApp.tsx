import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Lock, Unlock, ExternalLink, X } from 'lucide-react';
import { useGS } from '@/store/useGS';

const QUICK_LINKS = [
  { label: 'Google', url: 'https://www.google.com/webhp?igu=1' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { label: 'Habr', url: 'https://habr.com' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'YouTube', url: 'https://www.youtube.com' },
  { label: 'Reddit', url: 'https://www.reddit.com' },
];

const BOOKMARKS_KEY = 'zd_browser_bookmarks';

function getBookmarks(): string[] {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}

function saveBookmarks(b: string[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(b));
}

export default function BrowserApp() {
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark' || theme === 'bw';
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [bookmarks, setBookmarks] = useState<string[]>(getBookmarks);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = (targetUrl: string) => {
    let finalUrl = targetUrl.trim();
    if (!finalUrl) return;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(finalUrl);
      }
    }
    setUrl(finalUrl);
    setCurrentUrl(finalUrl);
    setLoading(true);
    setError('');
    const newHistory = [...history.slice(0, historyIdx + 1), finalUrl];
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setUrl(prev);
      setCurrentUrl(prev);
      setLoading(true);
      setError('');
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      setUrl(next);
      setCurrentUrl(next);
      setLoading(true);
      setError('');
    }
  };

  const toggleBookmark = () => {
    const exists = bookmarks.includes(currentUrl);
    const next = exists ? bookmarks.filter(b => b !== currentUrl) : [...bookmarks, currentUrl];
    setBookmarks(next);
    saveBookmarks(next);
  };

  const isBookmarked = bookmarks.includes(currentUrl);
  const isHome = !currentUrl;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{
        backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
        borderColor: isDark ? '#333' : '#e0e0e0',
      }}>
        <button onClick={goBack} disabled={historyIdx <= 0} className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 transition-colors">
          <ArrowLeft className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={goForward} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 transition-colors">
          <ArrowRight className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={() => { setCurrentUrl(''); setUrl(''); setError(''); setHistory([]); setHistoryIdx(-1); }} className="p-1.5 rounded hover:bg-black/10 transition-colors">
          <Home className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={() => { setLoading(true); if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }} className="p-1.5 rounded hover:bg-black/10 transition-colors">
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${isDark ? '#444' : '#ddd'}`,
        }}>
          {currentUrl && (
            currentUrl.startsWith('https://')
              ? <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
              : <Unlock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          )}
          <input
            ref={inputRef}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(url); }}
            placeholder="Введите URL или поисковый запрос"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: isDark ? '#e0e0e0' : '#333' }}
          />
          <button onClick={toggleBookmark} className="p-0.5 hover:bg-black/10 rounded transition-colors" title={isBookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}>
            <Search className={`w-3.5 h-3.5 ${isBookmarked ? 'text-yellow-500' : ''}`} style={{ color: isBookmarked ? undefined : (isDark ? '#888' : '#999') }} />
          </button>
        </div>

        <button onClick={() => currentUrl && window.open(currentUrl, '_blank')} className="p-1.5 rounded hover:bg-black/10 transition-colors" title="Открыть в новой вкладке">
          <ExternalLink className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
      </div>

      {/* Bookmarks bar */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-1 overflow-x-auto border-b" style={{
          backgroundColor: isDark ? '#252525' : '#fafafa',
          borderColor: isDark ? '#333' : '#e0e0e0',
        }}>
          {bookmarks.map(bm => {
            const domain = (() => { try { return new URL(bm).hostname.replace('www.', ''); } catch { return bm.slice(0, 30); } })();
            return (
              <button
                key={bm}
                onClick={() => navigate(bm)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs whitespace-nowrap hover:bg-black/10 transition-colors"
                style={{ color: isDark ? '#aaa' : '#555' }}
              >
                {domain}
                <X className="w-3 h-3 opacity-0 hover:opacity-100" onClick={e => { e.stopPropagation(); toggleBookmark(); }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {isHome ? (
          /* Home page */
          <div className="flex flex-col items-center justify-center h-full p-8" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
              <h1 className="text-4xl font-bold mb-2" style={{ color: isDark ? '#e0e0e0' : '#333' }}>
                Zero<span style={{ color: '#3fb950' }}>Browser</span>
              </h1>
              <p className="text-sm mb-6" style={{ color: isDark ? '#888' : '#666' }}>Безопасный браузер для работы и исследований</p>

              {/* Search */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-full mb-8" style={{
                backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
              }}>
                <Search className="w-4 h-4" style={{ color: isDark ? '#888' : '#999' }} />
                <input
                  placeholder="Поиск в интернете..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: isDark ? '#e0e0e0' : '#333' }}
                  onKeyDown={e => { if (e.key === 'Enter') navigate((e.target as HTMLInputElement).value); }}
                />
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-3 gap-3">
                {QUICK_LINKS.map(link => (
                  <button
                    key={link.url}
                    onClick={() => navigate(link.url)}
                    className="p-3 rounded-xl text-center transition-all hover:scale-105"
                    style={{
                      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
                      border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: isDark ? '#ccc' : '#333' }}>{link.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : error ? (
          /* Error page */
          <div className="flex flex-col items-center justify-center h-full p-8" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Не удалось загрузить страницу</h2>
              <p className="text-sm mb-4" style={{ color: isDark ? '#888' : '#666' }}>{error}</p>
              <p className="text-xs mb-4" style={{ color: isDark ? '#666' : '#999' }}>
                Некоторые сайты блокируют встраивание. Попробуйте открыть в новой вкладке.
              </p>
              <button
                onClick={() => window.open(currentUrl, '_blank')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#3fb950' }}
              >
                Открыть в новой вкладке
              </button>
            </motion.div>
          </div>
        ) : (
          /* iframe */
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>Загрузка...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError('Страница отказывается загружаться во встроенном режиме.'); }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              referrerPolicy="no-referrer"
            />
          </>
        )}
      </div>
    </div>
  );
}
