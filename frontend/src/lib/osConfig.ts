import { Mail, Globe, MessageSquare, FolderOpen, Terminal, Shield, User, Trophy, Settings } from 'lucide-react';
import type { ComponentType } from 'react';

export type OSAppId = 'mail' | 'browser' | 'messenger' | 'files' | 'terminal' | 'security' | 'profile' | 'leaderboard' | 'settings';

export interface OSAppConfig {
  id: OSAppId;
  label: string;
  labelEn: string;
  icon: ComponentType<{ className?: string }>;
  defaultWidth: number;
  defaultHeight: number;
  dockOnly?: boolean;
}

export const OS_APPS: OSAppConfig[] = [
  { id: 'mail', label: 'Почта', labelEn: 'Mail', icon: Mail, defaultWidth: 900, defaultHeight: 600 },
  { id: 'browser', label: 'Браузер', labelEn: 'Browser', icon: Globe, defaultWidth: 1000, defaultHeight: 650 },
  { id: 'messenger', label: 'Xam', labelEn: 'Xam', icon: MessageSquare, defaultWidth: 800, defaultHeight: 550 },
  { id: 'files', label: 'Файлы', labelEn: 'Files', icon: FolderOpen, defaultWidth: 750, defaultHeight: 500 },
  { id: 'terminal', label: 'Терминал', labelEn: 'Terminal', icon: Terminal, defaultWidth: 700, defaultHeight: 450 },
  { id: 'security', label: 'Безопасность', labelEn: 'Security', icon: Shield, defaultWidth: 800, defaultHeight: 550 },
  { id: 'profile', label: 'Профиль', labelEn: 'Profile', icon: User, defaultWidth: 700, defaultHeight: 550, dockOnly: true },
  { id: 'leaderboard', label: 'Рейтинг', labelEn: 'Leaderboard', icon: Trophy, defaultWidth: 600, defaultHeight: 500, dockOnly: true },
  { id: 'settings', label: 'Настройки', labelEn: 'Settings', icon: Settings, defaultWidth: 650, defaultHeight: 500 },
];

export function getAppConfig(id: string): OSAppConfig | undefined {
  return OS_APPS.find(a => a.id === id);
}

export function getDockApps(): OSAppConfig[] {
  return OS_APPS.filter(a => !a.dockOnly);
}

export function getDockExtraApps(): OSAppConfig[] {
  return OS_APPS.filter(a => a.dockOnly);
}
