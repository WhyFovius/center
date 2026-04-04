import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Lock, Unlock, ExternalLink, X, Plus, Globe } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  loading: boolean;
  error: string | null;
}

const QUICK_LINKS = [
  { label: 'Google', url: 'https://www.google.com/webhp?igu=1', icon: '🔍' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
  { label: 'Habr', url: 'https://habr.com', icon: '💻' },
  { label: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { label: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
  { label: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
  { label: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: '🦆' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📋' },
];

const BOOKMARKS_KEY = 'zd_browser_bookmarks';
const HISTORY_KEY = 'zd_browser_history';

function getBookmarks(): string[] {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}

function saveBookmarks(b: string[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(b));
}

function getHistory(): Array<{ url: string; title: string; time: string }> {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function addHistory(url: string, title: string) {
  const h = getHistory();
  h.unshift({ url, title, time: new Date().toLocaleString('ru-RU') });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 100)));
}

export default function BrowserApp() {
  const theme = useGS(s => s.theme);
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const isDark = theme === 'dark' || theme === 'bw';
  const [tabs, setTabs] = useState<BrowserTab[]>([{ id: 'tab-1', title: T('osBrowserNewTab'), url: '', loading: false, error: null }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [urlInput, setUrlInput] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>(getBookmarks);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const createTab = () => {
    const id = `tab-${Date.now()}`;
    const newTab: BrowserTab = { id, title: T('osBrowserNewTab'), url: '', loading: false, error: null };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
    setUrlInput('');
  };

  const closeTab = (tabId: string) => {
    const idx = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    if (newTabs.length === 0) {
      createTab();
      return;
    }
    if (activeTabId === tabId) {
      const newActive = newTabs[Math.min(idx, newTabs.length - 1)];
      setActiveTabId(newActive.id);
      setUrlInput(newActive.url);
    }
    setTabs(newTabs);
  };

  const navigate = useCallback((targetUrl: string, tabId?: string) => {
    const tid = tabId || activeTabId;
    let finalUrl = targetUrl.trim();
    if (!finalUrl) return;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(finalUrl);
      }
    }

    setTabs(prev => prev.map(t => t.id === tid ? { ...t, url: finalUrl, title: finalUrl, loading: true, error: null } : t));
    setUrlInput(finalUrl);
    addHistory(finalUrl, finalUrl);
  }, [activeTabId]);

  const goHome = () => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: '', title: T('osBrowserNewTab'), loading: false, error: null } : t));
    setUrlInput('');
  };

  const toggleBookmark = () => {
    if (!activeTab.url) return;
    const exists = bookmarks.includes(activeTab.url);
    const next = exists ? bookmarks.filter(b => b !== activeTab.url) : [...bookmarks, activeTab.url];
    setBookmarks(next);
    saveBookmarks(next);
  };

  const isBookmarked = bookmarks.includes(activeTab.url);
  const isHome = !activeTab.url;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
      {/* Tab bar */}
      <div className="flex items-end gap-0.5 px-2 pt-1.5 pb-0 overflow-x-auto" style={{ backgroundColor: isDark ? '#2a2a2a' : '#e8e8e8' }}>
        <AnimatePresence>
          {tabs.map(tab => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer min-w-0 max-w-48 text-xs ${
                tab.id === activeTabId
                  ? (isDark ? 'bg-[#1e1e1e]' : 'bg-white')
                  : (isDark ? 'bg-[#333] hover:bg-[#3a3a3a]' : 'bg-[#d8d8d8] hover:bg-[#d0d0d0]')
              }`}
              onClick={() => { setActiveTabId(tab.id); setUrlInput(tab.url); }}
            >
              {tab.loading ? (
                <RotateCcw className="w-3 h-3 animate-spin shrink-0" style={{ color: isDark ? '#ccc' : '#666' }} />
              ) : tab.error ? (
                <X className="w-3 h-3 shrink-0 text-red-500" />
              ) : (
                <Globe className="w-3 h-3 shrink-0" style={{ color: isDark ? '#ccc' : '#666' }} />
              )}
              <span className="truncate flex-1" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{tab.title}</span>
              <button
                onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                className="p-0.5 rounded hover:bg-black/10 shrink-0"
              >
                <X className="w-3 h-3" style={{ color: isDark ? '#999' : '#666' }} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={createTab} className="p-1.5 rounded hover:bg-black/10 transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" style={{ color: isDark ? '#ccc' : '#666' }} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333' : '#e0e0e0' }}>
        <button onClick={() => { const iw = iframeRef.current?.contentWindow; if (iw) iw.history.back(); }} className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 transition-colors">
          <ArrowLeft className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={() => { const iw = iframeRef.current?.contentWindow; if (iw) iw.history.forward(); }} className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 transition-colors">
          <ArrowRight className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={goHome} className="p-1.5 rounded hover:bg-black/10 transition-colors">
          <Home className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={() => { setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: true } : t)); if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }} className="p-1.5 rounded hover:bg-black/10 transition-colors">
          <RotateCcw className={`w-4 h-4 ${activeTab.loading ? 'animate-spin' : ''}`} style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1 rounded-full" style={{
          backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
          border: `1px solid ${isDark ? '#444' : '#ddd'}`,
        }}>
          {activeTab.url && (
            activeTab.url.startsWith('https://')
              ? <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
              : <Unlock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          )}
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(urlInput); }}
            placeholder={T('osBrowserUrl')}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: isDark ? '#e0e0e0' : '#333' }}
          />
          {activeTab.url && (
            <button onClick={toggleBookmark} className="p-0.5 hover:bg-black/10 rounded transition-colors" title={isBookmarked ? T('osBrowserBookmarks') : T('osBrowserBookmarks')}>
              <Search className={`w-3.5 h-3.5 ${isBookmarked ? 'text-yellow-500' : ''}`} style={{ color: isBookmarked ? undefined : (isDark ? '#888' : '#999') }} />
            </button>
          )}
        </div>

        <button onClick={() => activeTab.url && window.open(activeTab.url, '_blank')} className="p-1.5 rounded hover:bg-black/10 transition-colors" title={T('osContinue')}>
          <ExternalLink className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
        </button>
        <button onClick={() => setShowBookmarks(!showBookmarks)} className="p-1.5 rounded hover:bg-black/10 transition-colors" title={T('osBrowserBookmarks')}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ color: isBookmarked ? '#fbbf24' : (isDark ? '#ccc' : '#333') }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 rounded hover:bg-black/10 transition-colors" title={T('osBrowserHistory')}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: isDark ? '#ccc' : '#333' }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>

      {/* Bookmarks / History bar */}
      <AnimatePresence>
        {(showBookmarks || showHistory) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b" style={{ backgroundColor: isDark ? '#252525' : '#fafafa', borderColor: isDark ? '#333' : '#e0e0e0' }}
          >
            {showBookmarks && (
              <div className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto">
                {bookmarks.length === 0 ? (
                  <p className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>{T('osBrowserBookmarks')}</p>
                ) : bookmarks.map(bm => {
                  const domain = (() => { try { return new URL(bm).hostname.replace('www.', ''); } catch { return bm.slice(0, 30); } })();
                  return (
                    <button key={bm} onClick={() => navigate(bm)}
                      className="group flex items-center gap-1 px-2 py-0.5 rounded text-xs whitespace-nowrap hover:bg-black/10 transition-colors"
                      style={{ color: isDark ? '#aaa' : '#555' }}
                    >
                      {domain}
                      <X className="w-3 h-3 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); const next = bookmarks.filter(b => b !== bm); setBookmarks(next); saveBookmarks(next); }} />
                    </button>
                  );
                })}
              </div>
            )}
            {showHistory && (
              <div className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto max-h-20 overflow-y-auto">
                {getHistory().length === 0 ? (
                  <p className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>{T('osBrowserHistory')}</p>
                ) : getHistory().map((h, i) => (
                  <button key={i} onClick={() => navigate(h.url)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs whitespace-nowrap hover:bg-black/10 transition-colors"
                    style={{ color: isDark ? '#aaa' : '#555' }}
                  >
                    {h.title.slice(0, 25)}...
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {isHome ? (
          <div className="flex flex-col items-center justify-center h-full p-6" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg w-full">
              <h1 className="text-4xl font-bold mb-2" style={{ color: isDark ? '#e0e0e0' : '#333' }}>
                Zero<span style={{ color: '#3fb950' }}>Browser</span>
              </h1>
              <p className="text-sm mb-6" style={{ color: isDark ? '#888' : '#666' }}>ZeroBrowser</p>

              {/* Search */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-full mb-6" style={{
                backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
              }}>
                <Search className="w-4 h-4" style={{ color: isDark ? '#888' : '#999' }} />
                <input
                  placeholder={T('osBrowserSearch')}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: isDark ? '#e0e0e0' : '#333' }}
                  onKeyDown={e => { if (e.key === 'Enter') navigate((e.target as HTMLInputElement).value); }}
                />
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-4 gap-2">
                {QUICK_LINKS.map(link => (
                  <button key={link.url} onClick={() => navigate(link.url)}
                    className="p-3 rounded-xl text-center transition-all hover:scale-105"
                    style={{ backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', border: `1px solid ${isDark ? '#333' : '#e0e0e0'}` }}
                  >
                    <div className="text-xl mb-1">{link.icon}</div>
                    <p className="text-xs font-medium" style={{ color: isDark ? '#ccc' : '#333' }}>{link.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : activeTab.error ? (
          <div className="flex flex-col items-center justify-center h-full p-6" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{T('osBrowserFailed')}</h2>
              <p className="text-sm mb-4" style={{ color: isDark ? '#888' : '#666' }}>{activeTab.error}</p>
              <button onClick={() => window.open(activeTab.url, '_blank')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#3fb950' }}
              >Открыть в новом окне</button>
            </motion.div>
          </div>
        ) : (
          <>
            {activeTab.loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>{T('osBrowserLoading')}</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={activeTab.url}
              className="w-full h-full border-0"
              style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}
              onLoad={() => {
                setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false, error: null } : t));
                try {
                  const title = iframeRef.current?.contentDocument?.title;
                  if (title) setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title } : t));
                } catch {}
              }}
              onError={() => {
                setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false, error: 'Страница отказывается загружаться во встроенном режиме.' } : t));
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              referrerPolicy="no-referrer"
            />
          </>
        )}
      </div>
    </div>
  );
}
