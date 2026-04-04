import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { useGS } from '@/store/useGS';

interface OSWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  zIndex: number;
  initialX?: number;
  initialY?: number;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  initialWidth?: number;
  initialHeight?: number;
}

export default function OSWindow({
  id, title, icon, children, isActive, zIndex,
  initialX, initialY, onClose, onMinimize, onFocus,
  initialWidth = 850, initialHeight = 580,
}: OSWindowProps) {
  const [position, setPosition] = useState(() => ({
    x: initialX ?? 120,
    y: initialY ?? 80,
  }));
  const [size] = useState({ width: initialWidth, height: initialHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark' || theme === 'bw';

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus(id);
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
    e.preventDefault();
    e.stopPropagation();
  }, [isMaximized, id, onFocus, position]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, dragStart.current.posX + dx)),
        y: Math.max(28, Math.min(window.innerHeight - size.height - 60, dragStart.current.posY + dy)),
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{
        opacity: 1, scale: 1, y: 0,
        x: isMaximized ? 0 : position.x,
        ...(isMaximized ? {} : { y: position.y }),
        width: isMaximized ? window.innerWidth : size.width,
        height: isMaximized ? window.innerHeight - 88 : size.height,
      }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onFocus(id)}
      className="absolute flex flex-col overflow-hidden rounded-xl"
      style={{
        zIndex,
        boxShadow: isActive
          ? isDark ? '0 12px 48px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08)' : '0 12px 48px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.08)'
          : isDark ? '0 6px 24px rgba(0,0,0,0.4)' : '0 6px 24px rgba(0,0,0,0.1)',
      }}
    >
      {/* macOS-style traffic lights */}
      <div
        className={`flex items-center h-9 px-3 cursor-default select-none ${
          isActive ? (isDark ? 'bg-[#2a2a2a]' : 'bg-[#e8e8e8]') : (isDark ? 'bg-[#222]' : 'bg-[#d8d8d8]')
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Traffic light buttons */}
        <div className="flex items-center gap-2">
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(id); }}
            className="w-3 h-3 rounded-full flex items-center justify-center transition-all group"
            style={{ backgroundColor: isActive ? '#ff5f57' : (isDark ? '#555' : '#ccc') }}
          >
            <X className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black/60" strokeWidth={3} />
          </button>
          {/* Minimize */}
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
            className="w-3 h-3 rounded-full flex items-center justify-center transition-all group"
            style={{ backgroundColor: isActive ? '#febc2e' : (isDark ? '#555' : '#ccc') }}
          >
            <Minimize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black/60" strokeWidth={3} />
          </button>
          {/* Maximize */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
            className="w-3 h-3 rounded-full flex items-center justify-center transition-all group"
            style={{ backgroundColor: isActive ? '#28c840' : (isDark ? '#555' : '#ccc') }}
          >
            <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black/60" strokeWidth={3} />
          </button>
        </div>

        {/* Title */}
        <span className={`flex-1 text-xs font-medium text-center -ml-16 ${isDark ? 'text-white/70' : 'text-black/60'}`}>
          {icon && <span className="inline-block mr-1.5 align-middle">{icon}</span>}
          {title}
        </span>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
        {children}
      </div>
    </motion.div>
  );
}
