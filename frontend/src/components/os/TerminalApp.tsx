import { useState, useRef, useEffect, useCallback } from 'react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';
import { CheckCircle } from 'lucide-react';

interface CommandEntry {
  type: 'input' | 'output' | 'error' | 'info';
  text: string;
  color?: string;
}

export default function TerminalApp() {
  const lang = useGS(s => s.lang);
  const completeTask = useGS(s => s.completeTask);
  const osTasks = useGS(s => s.osTasks);
  const T = (key: string) => t(lang, key);
  const isDark = true;
  const [history, setHistory] = useState<CommandEntry[]>([
    { type: 'info', text: 'ZeroOS Terminal v1.0.0', color: '#58a6ff' },
    { type: 'info', text: T('osTerminalHelp'), color: '#888' },
    { type: 'info', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [currentDir, setCurrentDir] = useState('/home/employee');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileSystem: Record<string, string[]> = {
    '/home/employee': ['documents', 'downloads', 'desktop', '.ssh', '.config', 'notes.txt', 'report.pdf'],
    '/home/employee/documents': ['report_2026.docx', 'budget.xlsx', 'presentation.pptx'],
    '/home/employee/downloads': ['update_v2.3.1.exe', 'logs.zip'],
    '/home/employee/desktop': ['screenshot.png', 'todo.txt'],
  };

  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [history]);

  const runCommand = useCallback((cmd: string) => {
    const parts = cmd.trim().split(' ');
    const c = parts[0]?.toLowerCase();
    const args = parts.slice(1);
    let result: CommandEntry[] = [];

    switch (c) {
      case 'help':
        result = [
          { type: 'info', text: T('osTerminalHelp'), color: '#58a6ff' },
          { type: 'output', text: '  help          — список команд' },
          { type: 'output', text: '  ls            — содержимое папки' },
          { type: 'output', text: '  cd <dir>      — перейти в папку' },
          { type: 'output', text: '  pwd           — текущая директория' },
          { type: 'output', text: '  cat <file>    — содержимое файла' },
          { type: 'output', text: '  whoami        — текущий пользователь' },
          { type: 'output', text: '  date          — дата и время' },
          { type: 'output', text: '  uname -a      — информация о системе' },
          { type: 'output', text: '  echo <text>   — вывести текст' },
          { type: 'output', text: '  clear         — очистить терминал' },
          { type: 'output', text: '  scan          — сканирование системы' },
          { type: 'output', text: '  firewall      — статус фаервола' },
          { type: 'output', text: '  status        — статус системы' },
          { type: 'output', text: '  protect       — активировать защиту' },
          { type: 'output', text: '  history       — история команд' },
          { type: 'output', text: '  neofetch      — информация о системе (красиво)' },
        ];
        break;

      case 'ls': {
        const files = fileSystem[currentDir] || [];
        result = files.map(f => ({ type: 'output' as const, text: f, color: f.includes('.') ? '#e0e0e0' : '#58a6ff' }));
        break;
      }

      case 'cd': {
        if (!args[0] || args[0] === '~') { setCurrentDir('/home/employee'); }
        else if (args[0] === '..') {
          const parts = currentDir.split('/');
          parts.pop();
          setCurrentDir(parts.join('/') || '/');
        } else {
          const newDir = currentDir + '/' + args[0];
          if (fileSystem[newDir]) setCurrentDir(newDir);
          else result = [{ type: 'error', text: `cd: ${args[0]}: Нет такой директории`, color: '#ef4444' }];
        }
        break;
      }

      case 'pwd':
        result = [{ type: 'output', text: currentDir }];
        break;

      case 'cat': {
        if (!args[0]) { result = [{ type: 'error', text: 'cat: укажите файл', color: '#ef4444' }]; break; }
        const contents: Record<string, string> = {
          'notes.txt': 'TODO:\n- Проверить логи\n- Обновить антивирус\n- Пройти обучение по фишингу',
          'todo.txt': '1. Настроить фаервол\n2. Проверить сертификаты\n3. Обновить пароли',
          'report.pdf': '[PDF файл — 2.4 MB]',
        };
        result = [{ type: 'output', text: contents[args[0]] || `cat: ${args[0]}: Файл не найден` }];
        break;
      }

      case 'whoami':
        result = [{ type: 'output', text: 'employee@zero-os' }];
        break;

      case 'date':
        result = [{ type: 'output', text: new Date().toLocaleString('ru-RU') }];
        break;

      case 'uname':
        result = [{ type: 'output', text: 'ZeroOS 1.0.0 x86_64 GNU/Linux' }];
        break;

      case 'echo':
        result = [{ type: 'output', text: args.join(' ') }];
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'history':
        result = cmdHistory.map((c, i) => ({ type: 'output', text: `  ${i + 1}  ${c}` }));
        break;

      case 'scan':
        result = [
          { type: 'info', text: 'Сканирование системы...', color: '#58a6ff' },
          { type: 'output', text: '┌─────────────────────────────────┐' },
          { type: 'output', text: '│  Сканирование файлов...  ████████ │' },
          { type: 'output', text: '│  Проверка процессов...   ████████ │' },
          { type: 'output', text: '│  Анализ сети...          ████████ │' },
          { type: 'output', text: '└─────────────────────────────────┘' },
          { type: 'info', text: '✓ Угроз не обнаружено. Система в безопасности.', color: '#22c55e' },
        ];
        setTimeout(() => completeTask('terminal_scan'), 2000);
        break;

      case 'firewall':
        result = [
          { type: 'info', text: 'Firewall Status: ACTIVE', color: '#22c55e' },
          { type: 'output', text: 'Inbound Rules: 23 active | Outbound Rules: 15 active' },
          { type: 'output', text: 'Blocked IPs: 1,247 | Blocked Ports: 8' },
          { type: 'output', text: 'Last Update: ' + new Date().toLocaleString('ru-RU') },
        ];
        break;

      case 'status':
        result = [
          { type: 'info', text: '┌─── System Status ───┐', color: '#58a6ff' },
          { type: 'output', text: '│ Shield Level:  87%  │' },
          { type: 'output', text: '│ Reputation:    92   │' },
          { type: 'output', text: '│ Active Threats: 1   │' },
          { type: 'output', text: '│ Blocked Today: 34   │' },
          { type: 'info', text: '└──────────────────────┘', color: '#58a6ff' },
        ];
        break;

      case 'protect':
        result = [
          { type: 'info', text: '🛡️ Активация максимальной защиты...', color: '#fbbf24' },
          { type: 'output', text: '  → Фаервол: усилен' },
          { type: 'output', text: ' → IPS: активирован' },
          { type: 'output', text: '  → IDS: мониторинг включён' },
          { type: 'info', text: '✓ Защита на максимальном уровне!', color: '#22c55e' },
        ];
        completeTask('terminal_protect');
        break;

      case 'neofetch':
        result = [
          { type: 'output', text: '        ████████        employee@zero-os' },
          { type: 'output', text: '      ██        ██      ──────────────────' },
          { type: 'output', text: '    ██   ██████   ██    OS: ZeroOS 1.0.0 x86_64' },
          { type: 'output', text: '   ██   ██░░░░██   ██   Kernel: 1.0.0-zero' },
          { type: 'output', text: '  ██   ██░░░░░░██   ██  Uptime: ' + Math.floor(Math.random() * 24) + ' hours' },
          { type: 'output', text: '  ██   ██░░░░██   ██   Shell: zero-term 1.0' },
          { type: 'output', text: '   ██   ██░░██   ██    Theme: ' + (isDark ? 'Dark' : 'Light') },
          { type: 'output', text: '    ██   ████   ██     Terminal: ZeroTerminal' },
          { type: 'output', text: '      ██    ██        CPU: Virtual Core @ 2.4GHz' },
          { type: 'output', text: '        ████          Memory: 2.4GB / 8GB' },
        ];
        break;

      case '':
        break;

      default:
        result = [{ type: 'error', text: `${T('osTerminalNotFound')}: ${c}. ${T('osTerminalHelp')}`, color: '#ef4444' }];
    }

    setHistory(prev => [...prev, { type: 'input', text: `$ ${cmd}` }, ...result, { type: 'output', text: '' }]);
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setInput('');
  }, [currentDir, cmdHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const newIdx = historyIdx + 1;
        if (newIdx >= cmdHistory.length) {
          setHistoryIdx(-1);
          setInput('');
        } else {
          setHistoryIdx(newIdx);
          setInput(cmdHistory[newIdx]);
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col font-mono text-sm overflow-hidden" style={{ backgroundColor: '#0c0c0c' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Tab bar */}
      <div className="flex items-center justify-between gap-1 px-2 py-1" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded text-xs" style={{ backgroundColor: '#0c0c0c', color: '#e0e0e0' }}>
          <span>⬛</span> Terminal
        </div>
        <div className="flex items-center gap-1">
          {osTasks.terminal_scan && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-[9px] text-green-500">scan</span>
            </div>
          )}
          {osTasks.terminal_protect && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-[9px] text-green-500">protect</span>
            </div>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0">
        {history.map((entry, i) => (
          <div key={i} style={{ color: entry.type === 'input' ? '#22c55e' : (entry.color || '#e0e0e0'), whiteSpace: 'pre-wrap' }}>
            {entry.type === 'input' ? <span className="text-green-400 font-bold">{entry.text}</span> : entry.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ backgroundColor: '#0c0c0c', borderColor: '#333' }}>
        <span className="text-green-400 font-bold shrink-0">❯</span>
        <span className="text-blue-400 shrink-0">{currentDir}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400"
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  );
}
