import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Wifi,
  Battery,
  Volume2,
  Shield,
  ChevronUp,
  X,
  Minimize2,
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { ToggleTheme } from '@/components/ui/toggle-theme';

interface OpenWindow {
  id: string;
  title: string;
  icon: React.ReactNode;
  minimized: boolean;
}

interface TaskbarProps {
  openWindows: OpenWindow[];
  activeWindow: string | null;
  onToggleWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onStartClick: () => void;
}

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-sm font-medium">{timeStr}</span>
      <span className="text-[10px] text-text-muted">{dateStr}</span>
    </div>
  );
}

function SystemTray() {
  const energy = useGS((s) => s.energy);
  const shield = useGS((s) => s.shield);
  const [showTray, setShowTray] = useState(false);

  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={() => setShowTray(!showTray)}
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-surface-active transition-colors"
      >
        <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
      </button>

      <div className="flex items-center gap-2 px-2 py-1">
        <Shield className={`w-4 h-4 ${shield > 50 ? 'text-ci-green' : shield > 25 ? 'text-warning' : 'text-danger'}`} />
        <Wifi className="w-4 h-4 text-text-secondary" />
        <Volume2 className="w-4 h-4 text-text-secondary" />
        <Battery className="w-4 h-4 text-text-secondary" />
      </div>

      {showTray && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute bottom-full right-0 mb-2 w-64 bg-surface border border-border rounded-lg shadow-xl p-3"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Энергия</span>
              <span className={energy > 50 ? 'text-ci-green' : energy > 25 ? 'text-warning' : 'text-danger'}>
                {energy}%
              </span>
            </div>
            <div className="w-full bg-bg-secondary rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${energy > 50 ? 'bg-ci-green' : energy > 25 ? 'bg-warning' : 'bg-danger'}`}
                style={{ width: `${energy}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Щит</span>
              <span className={shield > 50 ? 'text-ci-green' : shield > 25 ? 'text-warning' : 'text-danger'}>
                {shield}%
              </span>
            </div>
            <div className="w-full bg-bg-secondary rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${shield > 50 ? 'bg-ci-green' : shield > 25 ? 'bg-warning' : 'bg-danger'}`}
                style={{ width: `${shield}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Taskbar({
  openWindows,
  activeWindow,
  onToggleWindow,
  onMinimizeWindow,
  onCloseWindow,
  onStartClick,
}: TaskbarProps) {
  return (
    <motion.div
      initial={{ y: 40 }}
      animate={{ y: 0 }}
      className="h-10 bg-surface/95 backdrop-blur border-t border-border flex items-center px-1 gap-1 z-50 relative"
    >
      {/* Start button */}
      <button
        onClick={onStartClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-surface-active transition-colors group"
      >
        <Monitor className="w-4 h-4 text-ci-green group-hover:text-ci-green-light transition-colors" />
        <span className="text-xs font-semibold hidden sm:inline">Пуск</span>
      </button>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Open windows */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto">
        {openWindows.map((win) => (
          <div
            key={win.id}
            className={`flex items-center gap-1.5 px-2 py-1 rounded min-w-0 max-w-40 cursor-pointer transition-all group ${
              win.minimized
                ? 'bg-bg-secondary opacity-60 hover:opacity-100'
                : activeWindow === win.id
                ? 'bg-surface-active border-b-2 border-ci-green'
                : 'hover:bg-surface-active'
            }`}
            onClick={() => (win.minimized ? onToggleWindow(win.id) : onToggleWindow(win.id))}
          >
            <span className="w-4 h-4 flex-shrink-0 text-text-secondary">{win.icon}</span>
            <span className="text-xs truncate flex-1">{win.title}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMinimizeWindow(win.id);
                }}
                className="p-0.5 hover:bg-bg-secondary rounded"
              >
                <Minimize2 className="w-3 h-3 text-text-muted" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseWindow(win.id);
                }}
                className="p-0.5 hover:bg-danger/20 rounded"
              >
                <X className="w-3 h-3 text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* System tray */}
      <SystemTray />

      {/* Theme toggle */}
      <div className="px-1 py-1 border-l border-border mx-0.5">
        <ToggleTheme />
      </div>

      {/* Clock */}
      <div className="px-2 py-1 border-l border-border ml-0.5">
        <Clock />
      </div>
    </motion.div>
  );
}
