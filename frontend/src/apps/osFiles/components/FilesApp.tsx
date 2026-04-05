import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, FileText, Image, FileCode, Download, ArrowUp, Home,
  Search, ChevronRight, AlertTriangle, Shield, Eye, FileWarning,
  X, CheckCircle, Virus, Trash2
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { FileItem, MalwareIndicator, FileWarning } from '../types';

interface Props {
  onCompleteTask?: (taskId: string) => void;
  onMalwareDetected?: () => void;
}

const MALWARE_PATTERNS = [
  { pattern: /\.exe\.txt$/i, type: 'double_extension', description: 'Двойное расширение: .exe замаскирован под .txt' },
  { pattern: /\.pdf\.exe$/i, type: 'double_extension', description: 'Двойное расширение: .pdf.exe - исполняемый файл' },
  { pattern: /\.doc\.exe$/i, type: 'double_extension', description: 'Двойное расширение: .doc.exe - опасный файл' },
  { pattern: /\.scr$/i, type: 'executable_instead_of_doc', description: 'Screensaver (.scr) - часто содержит вирусы' },
  { pattern: /\.bat$/i, type: 'executable_instead_of_doc', description: 'Batch-скрипт (.bat) - может выполнять команды' },
  { pattern: /\.cmd$/i, type: 'executable_instead_of_doc', description: 'Command-файл (.cmd) - потенциально опасен' },
  { pattern: /\.ps1$/i, type: 'executable_instead_of_doc', description: 'PowerShell-скрипт (.ps1) - может выполнять код' },
  { pattern: /\.vbs$/i, type: 'executable_instead_of_doc', description: 'VBScript (.vbs) - может выполнять вредоносный код' },
  { pattern: /update.*\.exe$/i, type: 'suspicious_name', description: 'Имя файла имитирует обновление' },
  { pattern: /free.*\.exe$/i, type: 'suspicious_name', description: 'Подозрительное имя с "free"' },
  { pattern: /crack.*\./i, type: 'suspicious_name', description: 'Крэк или кейген - часто содержит малварь' },
];

const FILE_SYSTEM: FileItem[] = [
  {
    id: 'docs',
    name: 'Документы',
    type: 'folder',
    modified: '02.04.2026',
    icon: '📁',
    children: [
      { id: 'doc1', name: 'Отчёт_по_безопасности.pdf', type: 'file', size: '2.4 MB', modified: '01.04.2026', icon: '📄' },
      { id: 'doc2', name: 'Инструкция_ИБ.docx', type: 'file', size: '856 KB', modified: '28.03.2026', icon: '📝' },
    ],
  },
  {
    id: 'downloads',
    name: 'Загрузки',
    type: 'folder',
    modified: '05.04.2026',
    icon: '📥',
    children: [
      { id: 'dl1', name: 'browser_update_v2.3.1.exe', type: 'file', size: '45.2 MB', modified: '05.04.2026', icon: '⚙️', isMalicious: true },
      { id: 'dl2', name: 'report_final.xlsx', type: 'file', size: '3.1 MB', modified: '02.04.2026', icon: '📊' },
      { id: 'dl3', name: 'invoice_march_2026.pdf.exe', type: 'file', size: '12.8 KB', modified: '05.04.2026', icon: '📎', isMalicious: true },
      { id: 'dl4', name: 'presentation.pptx', type: 'file', size: '8.4 MB', modified: '01.04.2026', icon: '📽️' },
    ],
  },
  {
    id: 'desktop',
    name: 'Рабочий стол',
    type: 'folder',
    modified: '05.04.2026',
    icon: '🖥️',
    children: [
      { id: 'desk1', name: 'заметки.txt', type: 'file', size: '1.2 KB', modified: '05.04.2026', icon: '📝' },
      { id: 'desk2', name: 'free_antivirus_2026.exe', type: 'file', size: '2.1 MB', modified: '04.04.2026', icon: '🛡️', isMalicious: true },
      { id: 'desk3', name: 'salary_update_2025.pdf.exe', type: 'file', size: '156 KB', modified: '05.04.2026', icon: '💰', isMalicious: true },
    ],
  },
  {
    id: 'images',
    name: 'Изображения',
    type: 'folder',
    modified: '30.03.2026',
    icon: '🖼️',
    children: [
      { id: 'img1', name: 'screenshot_2026.png', type: 'file', size: '2.1 MB', modified: '30.03.2026', icon: '🖼️' },
      { id: 'img2', name: 'logo.png', type: 'file', size: '156 KB', modified: '28.03.2026', icon: '🎨' },
    ],
  },
];

function analyzeFile(file: FileItem): MalwareIndicator | null {
  const name = file.name;
  
  for (const { pattern, type, description } of MALWARE_PATTERNS) {
    if (pattern.test(name)) {
      const severity = type === 'double_extension' || type === 'executable_instead_of_doc' ? 'critical' : 'high';
      return {
        type: type as MalwareIndicator['type'],
        severity,
        description,
        file
      };
    }
  }

  // Check for unusually small executable files
  const sizeMB = parseFloat(file.size || '0');
  if ((name.endsWith('.exe') || name.endsWith('.msi')) && sizeMB < 1) {
    return {
      type: 'unusual_size',
      severity: 'medium',
      description: `Подозрительно маленький размер для исполняемого файла: ${file.size}`,
      file
    };
  }

  return null;
}

function FileWarningModal({ 
  file, 
  indicator, 
  onClose, 
  onOpenAnyway,
  onDelete 
}: { 
  file: FileItem; 
  indicator: MalwareIndicator; 
  onClose: () => void;
  onOpenAnyway?: () => void;
  onDelete?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}>
              <Virus className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">⚠️ Внимание!</h3>
              <p className="text-sm text-red-400">Обнаружен потенциально опасный файл</p>
            </div>
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#2a2a2a' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{file.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-gray-400">{file.size} • {file.modified}</p>
              </div>
            </div>

            <div className="border-t pt-3" style={{ borderColor: '#333' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-300">{indicator.description}</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-300 mb-1">Как защитить себя:</p>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• Проверяйте расширение файла</li>
                  <li>• Не открывайте файлы из непроверенных источников</li>
                  <li>• Легитимные файлы не требуют .exe расширения</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#374151', color: '#e5e7eb' }}
            >
              <Trash2 className="w-4 h-4" />
              Удалить
            </button>
            <button
              onClick={onOpenAnyway}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}
            >
              Всё равно открыть
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function FilesApp({ onCompleteTask, onMalwareDetected }: Props) {
  const lang = useGS(s => s.lang);
  const completeTask = useGS(s => s.completeTask);

  const [path, setPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState<{ file: FileItem; indicator: MalwareIndicator } | null>(null);
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set());
  const [showDeleted, setShowDeleted] = useState(false);

  const getCurrentFolder = (): FileItem | null => {
    let current: FileItem | null = null;
    let items = FILE_SYSTEM;
    for (const segment of path) {
      current = items.find(i => i.name === segment && i.type === 'folder') || null;
      if (!current) return null;
      items = current.children || [];
    }
    return current || { id: 'root', name: 'Корень', type: 'folder', icon: '💻', children: FILE_SYSTEM };
  };

  const folder = getCurrentFolder();
  const items = (folder?.children || []).filter(item => !deletedFiles.has(item.id));

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

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      navigateTo(file.name);
    } else {
      setSelectedFile(file.name);
      const indicator = analyzeFile(file);
      if (indicator) {
        setShowWarning({ file, indicator });
        onMalwareDetected?.();
      }
    }
  };

  const handleDeleteMalware = () => {
    if (showWarning) {
      setDeletedFiles(prev => new Set([...prev, showWarning.file.id]));
      completeTask('files_malware_detected');
      onCompleteTask?.('files_malware_detected');
      setShowWarning(null);
    }
  };

  const handleOpenAnyway = () => {
    completeTask('files_malware_ignored');
    onCompleteTask?.('files_malware_ignored');
    setShowWarning(null);
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Sidebar */}
      <div className="w-44 border-r flex flex-col shrink-0" style={{ borderColor: '#2a2a2a' }}>
        <div className="px-3 py-2.5 border-b" style={{ borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold" style={{ color: '#e0e0e0' }}>osFiles</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1.5">
          <button
            onClick={() => { setPath([]); setSelectedFile(null); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
              path.length === 0 ? 'bg-blue-500/10' : 'hover:bg-white/5'
            }`}
            style={{ color: '#9ca3af' }}
          >
            <Home className="w-3.5 h-3.5" />🏠 Главная
          </button>

          {FILE_SYSTEM.map(f => (
            <button
              key={f.id}
              onClick={() => { setPath([f.name]); setSelectedFile(null); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                path.length > 0 && path[0] === f.name ? 'bg-blue-500/10' : 'hover:bg-white/5'
              }`}
              style={{ color: '#9ca3af' }}
            >
              <span>{f.icon}</span>{f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ backgroundColor: '#252525', borderColor: '#2a2a2a' }}>
          <button
            onClick={navigateUp}
            disabled={path.length === 0}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
          >
            <ArrowUp className="w-4 h-4" style={{ color: '#9ca3af' }} />
          </button>

          <div className="flex items-center gap-1 text-xs flex-1 min-w-0" style={{ color: '#9ca3af' }}>
            <button
              onClick={() => { setPath([]); setSelectedFile(null); }}
              className="hover:underline shrink-0"
            >
              Главная
            </button>
            {path.map((p, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3 h-3" />
                <button
                  onClick={() => { setPath(path.slice(0, i + 1)); setSelectedFile(null); }}
                  className="hover:underline truncate"
                >
                  {p}
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0" style={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
            <Search className="w-3 h-3" style={{ color: '#666' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-28 bg-transparent text-xs outline-none"
              style={{ color: '#e0e0e0' }}
            />
          </div>
        </div>

        {/* File grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="w-16 h-16 mb-4 opacity-20" style={{ color: '#666' }} />
              <p className="text-sm" style={{ color: '#666' }}>Папка пуста</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {filtered.map(item => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFileClick(item)}
                  onDoubleClick={() => item.type === 'folder' && navigateTo(item.name)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${
                    selectedFile === item.name
                      ? 'border-blue-500/40 bg-blue-500/10'
                      : 'hover:bg-white/5'
                  }`}
                  style={{ borderColor: '#333' }}
                >
                  <div className="relative">
                    <span className="text-3xl">{item.icon}</span>
                    {item.isMalicious && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs truncate w-full" style={{ color: '#e0e0e0' }}>{item.name}</p>
                  {item.size && (
                    <p className="text-[10px]" style={{ color: '#666' }}>{item.size}</p>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t text-[10px]" style={{ backgroundColor: '#252525', borderColor: '#2a2a2a', color: '#666' }}>
          <span>{filtered.length} объектов</span>
          {selectedFile && <span>Выбран: {selectedFile}</span>}
        </div>
      </div>

      {/* Warning modal */}
      <AnimatePresence>
        {showWarning && (
          <FileWarningModal
            file={showWarning.file}
            indicator={showWarning.indicator}
            onClose={() => setShowWarning(null)}
            onOpenAnyway={handleOpenAnyway}
            onDelete={handleDeleteMalware}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
