import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, FileText, Image, FileCode, Download, ArrowUp, Home, Search, ChevronRight } from 'lucide-react';
import { useGS } from '@/store/useGS';

type FileItem = {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified?: string;
  icon: React.ReactNode;
  children?: FileItem[];
};

const FILE_SYSTEM: FileItem[] = [
  {
    name: 'Документы', type: 'folder', modified: '02.04.2026', icon: <FolderOpen className="w-4 h-4 text-yellow-500" />,
    children: [
      { name: 'Отчёт_по_безопасности.pdf', type: 'file', size: '2.4 MB', modified: '01.04.2026', icon: <FileText className="w-4 h-4 text-red-400" /> },
      { name: 'Инструкция_ИБ.docx', type: 'file', size: '856 KB', modified: '28.03.2026', icon: <FileText className="w-4 h-4 text-blue-400" /> },
      { name: 'Презентация', type: 'folder', modified: '25.03.2026', icon: <FolderOpen className="w-4 h-4 text-yellow-500" />,
        children: [
          { name: 'slide_01.png', type: 'file', size: '1.2 MB', modified: '25.03.2026', icon: <Image className="w-4 h-4 text-green-400" /> },
          { name: 'slide_02.png', type: 'file', size: '1.5 MB', modified: '25.03.2026', icon: <Image className="w-4 h-4 text-green-400" /> },
        ],
      },
    ],
  },
  {
    name: 'Загрузки', type: 'folder', modified: '03.04.2026', icon: <FolderOpen className="w-4 h-4 text-yellow-500" />,
    children: [
      { name: 'update_v2.3.1.exe', type: 'file', size: '45.2 MB', modified: '03.04.2026', icon: <Download className="w-4 h-4 text-purple-400" /> },
      { name: 'report_final.xlsx', type: 'file', size: '3.1 MB', modified: '02.04.2026', icon: <FileText className="w-4 h-4 text-green-400" /> },
    ],
  },
  {
    name: 'Рабочий стол', type: 'folder', modified: '04.04.2026', icon: <FolderOpen className="w-4 h-4 text-yellow-500" />,
    children: [
      { name: 'заметки.txt', type: 'file', size: '1.2 KB', modified: '04.04.2026', icon: <FileText className="w-4 h-4 text-gray-400" /> },
      { name: 'script.py', type: 'file', size: '4.5 KB', modified: '03.04.2026', icon: <FileCode className="w-4 h-4 text-blue-400" /> },
    ],
  },
  {
    name: 'Изображения', type: 'folder', modified: '30.03.2026', icon: <FolderOpen className="w-4 h-4 text-yellow-500" />,
    children: [
      { name: 'screenshot_001.png', type: 'file', size: '2.1 MB', modified: '30.03.2026', icon: <Image className="w-4 h-4 text-green-400" /> },
      { name: 'logo.png', type: 'file', size: '156 KB', modified: '28.03.2026', icon: <Image className="w-4 h-4 text-green-400" /> },
    ],
  },
];

export default function FileManager() {
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark' || theme === 'bw';
  const [path, setPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getCurrentFolder = (): FileItem | null => {
    let current: FileItem | null = null;
    let items = FILE_SYSTEM;
    for (const segment of path) {
      current = items.find(i => i.name === segment && i.type === 'folder') || null;
      if (!current) return null;
      items = current.children || [];
    }
    return current || { name: 'Корень', type: 'folder', children: FILE_SYSTEM, icon: <Home className="w-4 h-4" /> };
  };

  const folder = getCurrentFolder();
  const items = folder?.children || [];

  const filtered = searchQuery
    ? items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const navigateTo = (name: string) => {
    setPath(prev => [...prev, name]);
    setSelectedFile(null);
  };

  const navigateUp = () => {
    setPath(prev => prev.slice(0, -1));
    setSelectedFile(null);
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
      {/* Sidebar */}
      <div className="w-44 border-r flex flex-col shrink-0" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="px-3 py-2.5 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" style={{ color: isDark ? '#e0e0e0' : '#333' }} />
            <span className="text-xs font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Файлы</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1.5">
          <button onClick={() => { setPath([]); setSelectedFile(null); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
              path.length === 0 ? (isDark ? 'bg-white/10' : 'bg-gray-100') : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
            }`}
            style={{ color: isDark ? '#ccc' : '#333' }}
          >
            <Home className="w-3.5 h-3.5" />Главная
          </button>

          {FILE_SYSTEM.map(f => (
            <button key={f.name} onClick={() => navigateTo(f.name)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                path.length === 1 && path[0] === f.name ? (isDark ? 'bg-white/10' : 'bg-gray-100') : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
              }`}
              style={{ color: isDark ? '#ccc' : '#333' }}
            >
              <FolderOpen className="w-3.5 h-3.5 text-yellow-500" />{f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', borderColor: isDark ? '#333' : '#e0e0e0' }}>
          <button onClick={navigateUp} disabled={path.length === 0} className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 transition-colors">
            <ArrowUp className="w-4 h-4" style={{ color: isDark ? '#ccc' : '#333' }} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs flex-1" style={{ color: isDark ? '#aaa' : '#666' }}>
            <button onClick={() => { setPath([]); }} className="hover:underline">Главная</button>
            {path.map((p, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                <button onClick={() => { setPath(path.slice(0, i + 1)); }} className="hover:underline">{p}</button>
              </span>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: isDark ? '#1a1a1a' : '#fff', border: `1px solid ${isDark ? '#444' : '#ddd'}` }}>
            <Search className="w-3 h-3" style={{ color: isDark ? '#888' : '#999' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск..."
              className="w-28 bg-transparent text-xs outline-none" style={{ color: isDark ? '#e0e0e0' : '#333' }} />
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{ color: isDark ? '#888' : '#666' }}>Папка пуста</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filtered.map(item => (
                <motion.button key={item.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (item.type === 'folder') navigateTo(item.name);
                    else setSelectedFile(item.name);
                  }}
                  onDoubleClick={() => { if (item.type === 'folder') navigateTo(item.name); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                    selectedFile === item.name
                      ? (isDark ? 'border-purple-500/40 bg-purple-500/10' : 'border-purple-300 bg-purple-50')
                      : (isDark ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50')
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center">{item.icon}</div>
                  <p className="text-xs truncate w-full" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{item.name}</p>
                  {item.size && <p className="text-[10px]" style={{ color: isDark ? '#666' : '#999' }}>{item.size}</p>}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t text-[10px]" style={{ backgroundColor: isDark ? '#252525' : '#fafafa', borderColor: isDark ? '#333' : '#e0e0e0', color: isDark ? '#888' : '#666' }}>
          <span>{filtered.length} элементов</span>
          {selectedFile && <span>Выбрано: {selectedFile}</span>}
        </div>
      </div>
    </div>
  );
}
