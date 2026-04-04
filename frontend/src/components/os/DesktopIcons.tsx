import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Globe,
  MessageSquare,
  FolderOpen,
  Terminal,
  Shield,
  User,
  Trophy,
} from 'lucide-react';

interface DesktopIcon {
  id: string;
  label: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
}

interface DesktopIconsProps {
  onOpenApp: (appId: string) => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
}

export default function DesktopIcons({ onOpenApp, onOpenProfile, onOpenLeaderboard }: DesktopIconsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const icons: DesktopIcon[] = [
    {
      id: 'mail',
      label: 'Почта',
      icon: <Mail className="w-8 h-8" />,
      onDoubleClick: () => onOpenApp('mail'),
    },
    {
      id: 'browser',
      label: 'Браузер',
      icon: <Globe className="w-8 h-8" />,
      onDoubleClick: () => onOpenApp('browser'),
    },
    {
      id: 'messenger',
      label: 'Мессенджер',
      icon: <MessageSquare className="w-8 h-8" />,
      onDoubleClick: () => onOpenApp('messenger'),
    },
    {
      id: 'files',
      label: 'Файлы',
      icon: <FolderOpen className="w-8 h-8" />,
      onDoubleClick: () => onOpenApp('files'),
    },
    {
      id: 'terminal',
      label: 'Терминал',
      icon: <Terminal className="w-8 h-8" />,
      onDoubleClick: () => onOpenApp('terminal'),
    },
    {
      id: 'security',
      label: 'Безопасность',
      icon: <Shield className="w-8 h-8" />,
      onDoubleClick: () => onOpenApp('security'),
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: <User className="w-8 h-8" />,
      onDoubleClick: onOpenProfile,
    },
    {
      id: 'leaderboard',
      label: 'Рейтинг',
      icon: <Trophy className="w-8 h-8" />,
      onDoubleClick: onOpenLeaderboard,
    },
  ];

  return (
    <div
      className="absolute top-4 left-4 z-10 flex flex-col gap-1"
      onClick={() => setSelectedId(null)}
    >
      {icons.map((icon, index) => (
        <motion.div
          key={icon.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
          onDoubleClick={icon.onDoubleClick}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(icon.id);
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all select-none w-20
            ${selectedId === icon.id
              ? 'bg-ci-green/20 ring-1 ring-ci-green/40'
              : 'hover:bg-white/10'
            }`}
        >
          <div className="text-text-secondary group-hover:text-ci-green-light transition-colors drop-shadow-lg">
            {icon.icon}
          </div>
          <span className="text-[10px] text-center text-text-secondary leading-tight drop-shadow-md line-clamp-2">
            {icon.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
