import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useGS } from '@/store/useGS';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'system';
  content: string;
}

interface FileSystemEntry {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: string[];
  encrypted?: boolean;
}

const FILE_SYSTEM: Record<string, FileSystemEntry> = {
  '/': { name: '/', type: 'dir', children: ['home', 'etc', 'var', 'tmp', 'opt'] },
  '/home': { name: 'home', type: 'dir', children: ['employee'] },
  '/home/employee': { name: 'employee', type: 'dir', children: ['documents', 'downloads', '.ssh', '.config', 'report.pdf'] },
  '/home/employee/documents': { name: 'documents', type: 'dir', children: ['memo.txt', 'project_plan.docx', 'budget_2024.xlsx'] },
  '/home/employee/downloads': { name: 'downloads', type: 'dir', children: ['update_patch.exe'] },
  '/home/employee/.ssh': { name: '.ssh', type: 'dir', children: ['id_rsa', 'known_hosts'] },
  '/home/employee/.config': { name: '.config', type: 'dir', children: ['settings.json'] },
  '/home/employee/report.pdf': { name: 'report.pdf', type: 'file', content: '[Binary PDF file - 2.4MB]' },
  '/home/employee/documents/memo.txt': { name: 'memo.txt', type: 'file', content: 'СЛУЖЕБНАЯ ЗАПИСКА\nОт: IT-отдел\nКому: Все сотрудники\n\nНапоминаем о необходимости пройти обучение по кибербезопасности до конца месяца.\n\nКлючевые темы:\n- Распознавание фишинговых писем\n- Безопасное использование Wi-Fi\n- Защита персональных данных\n- Правила работы с паролями' },
  '/home/employee/documents/project_plan.docx': { name: 'project_plan.docx', type: 'file', content: '[Document file - Project Shield 2024]' },
  '/home/employee/documents/budget_2024.xlsx': { name: 'budget_2024.xlsx', type: 'file', content: '[Spreadsheet - Confidential]' },
  '/home/employee/downloads/update_patch.exe': { name: 'update_patch.exe', type: 'file', content: '[Executable - POTENTIALLY MALICIOUS]', encrypted: false },
  '/home/employee/.ssh/id_rsa': { name: 'id_rsa', type: 'file', content: '-----BEGIN OPENSSH PRIVATE KEY-----\n[binary key data]\n-----END OPENSSH PRIVATE KEY-----' },
  '/home/employee/.ssh/known_hosts': { name: 'known_hosts', type: 'file', content: 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5\n' },
  '/home/employee/.config/settings.json': { name: 'settings.json', type: 'file', content: '{\n  "theme": "dark",\n  "language": "ru",\n  "notifications": true,\n  "two_factor": true\n}' },
  '/etc': { name: 'etc', type: 'dir', children: ['hostname', 'hosts', 'firewall.conf'] },
  '/etc/hostname': { name: 'hostname', type: 'file', content: 'zeroos-workstation' },
  '/etc/hosts': { name: 'hosts', type: 'file', content: '127.0.0.1 localhost\n10.0.0.1 zerocorp-internal\n10.0.0.2 mail.zerocorp.com' },
  '/etc/firewall.conf': { name: 'firewall.conf', type: 'file', content: '# Firewall Configuration\nENABLED=true\nDEFAULT_POLICY=DROP\nALLOW_SSH=true\nALLOW_HTTPS=true\nLOG_LEVEL=INFO' },
  '/var': { name: 'var', type: 'dir', children: ['log'] },
  '/var/log': { name: 'log', type: 'dir', children: ['syslog', 'auth.log', 'firewall.log'] },
  '/var/log/syslog': { name: 'syslog', type: 'file', content: 'Apr 04 09:15:01 zeroos systemd[1]: Started ZeroOS Security Service.\nApr 04 09:15:02 zeroos kernel: [UFW BLOCK] IN=eth0 OUT= SRC=185.220.101.42' },
  '/var/log/auth.log': { name: 'auth.log', type: 'file', content: 'Apr 04 08:30:15 zeroos sshd[1234]: Accepted publickey for employee\nApr 04 09:00:22 zeroos sshd[2345]: Failed password for root from 45.33.32.156' },
  '/var/log/firewall.log': { name: 'firewall.log', type: 'file', content: 'Apr 04 09:20:33 BLOCK TCP 185.220.101.42:44832 -> 10.0.0.5:22\nApr 04 09:20:34 BLOCK TCP 185.220.101.42:44833 -> 10.0.0.5:22\nApr 04 09:21:01 ALLOW TCP 10.0.0.1:52341 -> 10.0.0.5:443' },
  '/tmp': { name: 'tmp', type: 'dir', children: [] },
  '/opt': { name: 'opt', type: 'dir', children: ['shieldops'] },
  '/opt/shieldops': { name: 'shieldops', type: 'dir', children: ['version.txt'] },
  '/opt/shieldops/version.txt': { name: 'version.txt', type: 'file', content: 'ShieldOps Security Suite v2.1.0\nBuild 20260404' },
};

export default function TerminalApp() {
  const shield = useGS(s => s.shield);
  const energy = useGS(s => s.energy);
  const setShield = useGS(s => s.setShield);
  const setEnergy = useGS(s => s.setEnergy);

  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 'init-1', type: 'system', content: '╔══════════════════════════════════════════╗' },
    { id: 'init-2', type: 'system', content: '║   ZeroOS Terminal v1.0 — ShieldOps     ║' },
    { id: 'init-3', type: 'system', content: '║   Введите "help" для списка команд     ║' },
    { id: 'init-4', type: 'system', content: '╚══════════════════════════════════════════╝' },
    { id: 'init-5', type: 'info', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState('/home/employee');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [protectionActive, setProtectionActive] = useState(true);
  const [encryptedFiles, setEncryptedFiles] = useState<Set<string>>(new Set());
  const [tabComplete, setTabComplete] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, content }]);
  }, []);

  const addLines = useCallback((entries: { type: TerminalLine['type']; content: string }[]) => {
    setLines(prev => [...prev, ...entries.map(e => ({ id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...e }))]);
  }, []);

  const resolvePath = useCallback((path: string): string => {
    if (path.startsWith('/')) return path;
    if (path === '~') return '/home/employee';
    if (path.startsWith('~/')) return '/home/employee/' + path.slice(2);
    if (path === '..') {
      const parts = currentDir.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/');
    }
    if (path === '.') return currentDir;
    const normalized = currentDir === '/' ? `/${path}` : `${currentDir}/${path}`;
    return normalized.replace(/\/+/g, '/');
  }, [currentDir]);

  const runCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCommandHistory(prev => [...prev.slice(-50), trimmed]);
    setHistoryIndex(-1);
    addLine('input', `$ ${trimmed}`);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help': {
        addLines([
          { type: 'info', content: 'Доступные команды:' },
          { type: 'output', content: '  help              — Показать справку' },
          { type: 'output', content: '  date              — Текущая дата и время' },
          { type: 'output', content: '  whoami            — Текущий пользователь' },
          { type: 'output', content: '  ls [path]         — Список файлов' },
          { type: 'output', content: '  cd <path>         — Сменить директорию' },
          { type: 'output', content: '  cat <file>        — Показать содержимое файла' },
          { type: 'output', content: '  clear             — Очистить терминал' },
          { type: 'output', content: '  echo <text>       — Вывести текст' },
          { type: 'output', content: '  uname [-a]        — Информация о системе' },
          { type: 'output', content: '  pwd               — Текущая директория' },
          { type: 'output', content: '  history           — История команд' },
          { type: 'output', content: '' },
          { type: 'info', content: 'Команды безопасности:' },
          { type: 'success', content: '  scan              — Сканирование системы' },
          { type: 'success', content: '  firewall [on|off] — Управление фаерволом' },
          { type: 'success', content: '  encrypt <file>    — Шифрование файла' },
          { type: 'success', content: '  decrypt <file>    — Расшифровка файла' },
          { type: 'success', content: '  protect [on|off]  — Активация защиты' },
          { type: 'success', content: '  status            — Статус системы' },
          { type: 'success', content: '  threats           — Список угроз' },
        ]);
        break;
      }

      case 'date': {
        addLine('output', new Date().toLocaleString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        break;
      }

      case 'whoami': {
        addLine('output', 'employee@zeroos');
        break;
      }

      case 'pwd': {
        addLine('output', currentDir);
        break;
      }

      case 'ls': {
        const targetPath = args[0] ? resolvePath(args[0]) : currentDir;
        const entry = FILE_SYSTEM[targetPath];
        if (!entry) {
          addLine('error', `ls: нельзя получить доступ к '${args[0]}': Нет такого файла или каталога`);
        } else if (entry.type !== 'dir') {
          addLine('output', entry.name);
        } else {
          const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
          const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
          const children = entry.children || [];
          const items = showHidden ? ['.', '..', ...(children)] : children.filter(c => !c.startsWith('.'));

          if (longFormat) {
            addLine('output', `всего ${items.length}`);
            items.forEach(item => {
              const childPath = targetPath === '/' ? `/${item}` : `${targetPath}/${item}`;
              const child = FILE_SYSTEM[childPath];
              const isDir = child?.type === 'dir' || item.endsWith('/') || ['.', '..'].includes(item);
              const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
              const size = child?.type === 'file' ? (child.content?.length || 0).toString().padStart(6) : '   4096';
              const name = isDir && child ? `\x1b[34m${item}/\x1b[0m` : item;
              addLine('output', `${perms}  1 employee  staff  ${size}  ${item}${isDir && !child ? '/' : ''}`);
            });
          } else {
            addLine('output', items.map(item => {
              const childPath = targetPath === '/' ? `/${item}` : `${targetPath}/${item}`;
              const child = FILE_SYSTEM[childPath];
              const isDir = child?.type === 'dir' || ['.', '..'].includes(item);
              return isDir ? `${item}/` : item;
            }).join('  '));
          }
        }
        break;
      }

      case 'cd': {
        if (!args[0] || args[0] === '~') {
          setCurrentDir('/home/employee');
        } else {
          const targetPath = resolvePath(args[0]);
          const entry = FILE_SYSTEM[targetPath];
          if (!entry) {
            addLine('error', `cd: нет такого каталога: ${args[0]}`);
          } else if (entry.type !== 'dir') {
            addLine('error', `cd: не каталог: ${args[0]}`);
          } else {
            setCurrentDir(targetPath);
          }
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          addLine('error', 'cat: укажите файл');
        } else {
          const filePath = resolvePath(args[0]);
          const entry = FILE_SYSTEM[filePath];
          if (!entry) {
            addLine('error', `cat: нет такого файла: ${args[0]}`);
          } else if (entry.type === 'dir') {
            addLine('error', `cat: это каталог: ${args[0]}`);
          } else {
            const isEnc = encryptedFiles.has(filePath);
            if (isEnc) {
              addLine('warning', `[ЗАШИФРОВАНО] Файл зашифрован. Используйте "decrypt ${args[0]}" для расшифровки.`);
              addLine('output', entry.content?.substring(0, 20) + '... [ENCRYPTED]');
            } else {
              entry.content?.split('\n').forEach(line => addLine('output', line));
            }
          }
        }
        break;
      }

      case 'clear': {
        setLines([]);
        setInput('');
        return;
      }

      case 'echo': {
        addLine('output', args.join(' '));
        break;
      }

      case 'uname': {
        if (args.includes('-a')) {
          addLine('output', 'ZeroOS 1.0.0 zeroos-workstation x86_64 ShieldOS GNU/Linux');
        } else {
          addLine('output', 'ZeroOS 1.0.0');
        }
        break;
      }

      case 'history': {
        commandHistory.forEach((cmd, i) => addLine('output', `  ${(i + 1).toString().padStart(4)}  ${cmd}`));
        break;
      }

      case 'scan': {
        addLine('info', '');
        addLine('info', '┌─────────────────────────────────────┐');
        addLine('info', '│     Сканирование системы...         │');
        addLine('info', '└─────────────────────────────────────┘');
        addLine('info', '');

        const scanSteps = [
          { msg: '[1/5] Проверка файловой системы...', result: 'OK — 23 файла проверено', type: 'success' as const },
          { msg: '[2/5] Сканирование сетевых подключений...', result: 'ВНИМАНИЕ: 2 подозрительных соединения', type: 'warning' as const },
          { msg: '[3/5] Анализ процессов...', result: 'OK — 47 процессов, угроз не обнаружено', type: 'success' as const },
          { msg: '[4/5] Проверка целостности системных файлов...', result: 'OK — контрольные суммы совпадают', type: 'success' as const },
          { msg: '[5/5] Проверка правил фаервола...', result: firewallEnabled ? 'OK — фаервол активен' : 'ВНИМАНИЕ — фаервол отключён!', type: firewallEnabled ? 'success' as const : 'warning' as const },
        ];

        let delay = 300;
        scanSteps.forEach((step, i) => {
          setTimeout(() => {
            addLine('info', step.msg);
            addLine(step.type, `       → ${step.result}`);
            if (i === scanSteps.length - 1) {
              addLine('info', '');
              addLine('success', 'Сканирование завершено.');
            }
          }, delay);
          delay += 500;
        });
        break;
      }

      case 'firewall': {
        const action = args[0]?.toLowerCase();
        if (action === 'on' || action === 'enable') {
          setFirewallEnabled(true);
          addLine('success', '✓ Фаервол активирован');
          addLine('info', '  Правила: DROP по умолчанию, SSH и HTTPS разрешены');
        } else if (action === 'off' || action === 'disable') {
          setFirewallEnabled(false);
          addLine('warning', '⚠ Фаервол деактивирован! Система уязвима!');
        } else {
          addLine('info', 'Статус фаервола:');
          addLine(firewallEnabled ? 'success' : 'warning', `  Состояние: ${firewallEnabled ? 'АКТИВЕН ✓' : 'ОТКЛЮЧЁН ⚠'}`);
          addLine('output', '  Политика по умолчанию: DROP');
          addLine('output', '  Разрешённые порты: SSH(22), HTTPS(443)');
          addLine('output', '  Уровень логирования: INFO');
          addLine('info', '  Использование: firewall [on|off]');
        }
        break;
      }

      case 'encrypt': {
        if (!args[0]) {
          addLine('error', 'encrypt: укажите файл');
          addLine('info', '  Использование: encrypt <filename>');
        } else {
          const filePath = resolvePath(args[0]);
          const entry = FILE_SYSTEM[filePath];
          if (!entry || entry.type === 'dir') {
            addLine('error', `encrypt: файл не найден: ${args[0]}`);
          } else if (encryptedFiles.has(filePath)) {
            addLine('warning', `Файл уже зашифрован: ${args[0]}`);
          } else {
            setEncryptedFiles(prev => new Set([...prev, filePath]));
            addLine('success', `✓ Файл зашифрован: ${args[0]}`);
            addLine('info', '  Алгоритм: AES-256-GCM');
          }
        }
        break;
      }

      case 'decrypt': {
        if (!args[0]) {
          addLine('error', 'decrypt: укажите файл');
        } else {
          const filePath = resolvePath(args[0]);
          if (encryptedFiles.has(filePath)) {
            setEncryptedFiles(prev => {
              const next = new Set(prev);
              next.delete(filePath);
              return next;
            });
            addLine('success', `✓ Файл расшифрован: ${args[0]}`);
          } else {
            addLine('error', `decrypt: файл не зашифрован: ${args[0]}`);
          }
        }
        break;
      }

      case 'protect': {
        const action = args[0]?.toLowerCase();
        if (action === 'on' || action === 'enable') {
          setProtectionActive(true);
          setShield(prev => Math.min(100, prev + 20));
          setEnergy(prev => Math.min(100, prev + 10));
          addLine('success', '✓ Полная защита активирована');
          addLine('success', '  → Щит: +' + Math.min(20, 100 - shield) + '%');
          addLine('success', '  → Энергия: +' + Math.min(10, 100 - energy) + '%');
        } else if (action === 'off' || action === 'disable') {
          setProtectionActive(false);
          addLine('warning', '⚠ Защита деактивирована');
        } else {
          addLine('info', 'Статус защиты:');
          addLine(protectionActive ? 'success' : 'warning', `  Защита: ${protectionActive ? 'АКТИВНА ✓' : 'ОТКЛЮЧЕНА ⚠'}`);
          addLine('output', `  Щит: ${shield}%`);
          addLine('output', `  Энергия: ${energy}%`);
          addLine('output', `  Фаервол: ${firewallEnabled ? 'Активен' : 'Отключён'}`);
          addLine('output', `  Зашифровано файлов: ${encryptedFiles.size}`);
          addLine('info', '  Использование: protect [on|off]');
        }
        break;
      }

      case 'status': {
        addLine('info', '');
        addLine('info', '┌──────────────────────────────────────────┐');
        addLine('info', '│         СТАТУС СИСТЕМЫ ZeroOS            │');
        addLine('info', '└──────────────────────────────────────────┘');
        addLine('info', '');
        addLine('output', `  ОС:          ZeroOS 1.0.0 (ShieldOS)`);
        addLine('output', `  Хост:        zeroos-workstation`);
        addLine('output', `  Пользователь: employee`);
        addLine('output', `  Директория:  ${currentDir}`);
        addLine('info', '');
        addLine('info', '  БЕЗОПАСНОСТЬ:');
        addLine(shield > 60 ? 'success' : shield > 30 ? 'warning' : 'error', `  Щит:         ${shield}% ${shield > 60 ? '✓' : shield > 30 ? '⚠' : '✗'}`);
        addLine(energy > 60 ? 'success' : 'warning', `  Энергия:     ${energy}% ${energy > 60 ? '✓' : '⚠'}`);
        addLine(firewallEnabled ? 'success' : 'error', `  Фаервол:     ${firewallEnabled ? 'Активен ✓' : 'Отключён ✗'}`);
        addLine(protectionActive ? 'success' : 'warning', `  Защита:      ${protectionActive ? 'Активна ✓' : 'Отключена ⚠'}`);
        addLine('output', `  Зашифровано: ${encryptedFiles.size} файл(ов)`);
        addLine('info', '');
        break;
      }

      case 'threats': {
        addLine('info', 'Активные угрозы:');
        addLine('warning', '  [!] 185.220.101.42 — Brute Force SSH (заблокировано)');
        addLine('warning', '  [!] 45.33.32.156   — Сканирование портов (заблокировано)');
        addLine('error', '  [!!] 10.0.3.15       — Аномальная активность (мониторинг)');
        addLine('info', `Всего: 3 угрозы, 2 заблокированы`);
        break;
      }

      default: {
        addLine('error', `Команда не найдена: ${command}`);
        addLine('info', 'Введите "help" для списка доступных команд');
      }
    }

    setInput('');
    setTabComplete([]);
    setTabIndex(0);
  }, [addLine, addLines, currentDir, resolvePath, commandHistory, firewallEnabled, protectionActive, encryptedFiles, shield, energy, setShield, setEnergy]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tabComplete.length > 0 && tabIndex >= 0) {
        runCommand(tabComplete[tabIndex] || input);
      } else {
        runCommand(input);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.split(' ').pop() || '';
      if (tabComplete.length === 0 || tabComplete[0] !== partial) {
        // Find completions
        const currentPath = currentDir;
        const entry = FILE_SYSTEM[currentPath];
        if (entry?.children) {
          const matches = entry.children.filter(c => c.startsWith(partial));
          if (matches.length > 0) {
            setTabComplete(matches);
            setTabIndex(0);
            setInput(input.slice(0, input.lastIndexOf(' ') + 1) + matches[0]);
          }
        }
      } else {
        const nextIndex = (tabIndex + 1) % tabComplete.length;
        setTabIndex(nextIndex);
        setInput(input.slice(0, input.lastIndexOf(' ') + 1) + tabComplete[nextIndex]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }, [input, commandHistory, historyIndex, tabComplete, tabIndex, currentDir, runCommand]);

  const getPrompt = () => {
    const displayDir = currentDir.replace('/home/employee', '~') || '~';
    return `employee@zeroos:${displayDir}$`;
  };

  const getLineColor = (type: TerminalLine['type']): string => {
    switch (type) {
      case 'input': return 'text-green-400';
      case 'output': return 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'system': return 'text-cyan-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div
      className="h-full font-mono text-sm overflow-y-auto p-3 cursor-text"
      style={{ backgroundColor: '#0c0c0c' }}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map(line => (
        <div key={line.id} className={`whitespace-pre-wrap leading-relaxed ${getLineColor(line.type)}`}>
          {line.content}
        </div>
      ))}

      {/* Input line */}
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-green-400 flex-shrink-0">{getPrompt()}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setTabComplete([]);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-gray-100"
          style={{ caretColor: '#22c55e' }}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div ref={bottomRef} />

      {/* Status bar */}
      <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {shield}%
          </span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {energy}%
          </span>
          {firewallEnabled && (
            <span className="flex items-center gap-1 text-green-400/50">
              <Lock className="w-3 h-3" />
              FW
            </span>
          )}
        </div>
        <span>{encryptedFiles.size} encrypted</span>
      </div>
    </div>
  );
}
