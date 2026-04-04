import { useState, useCallback, createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  MessageSquare,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

export interface OSNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

interface NotificationContextType {
  notifications: OSNotification[];
  addNotification: (notification: Omit<OSNotification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<OSNotification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<OSNotification, 'id' | 'timestamp'>) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newNotification: OSNotification = {
        ...notification,
        id,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [...prev, newNotification]);

      if (notification.duration !== 0) {
        const duration = notification.duration ?? 5000;
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

// Game-driven notifications
function useGameNotifications() {
  const { addNotification } = useNotifications();
  const lang = useGS((s) => s.lang);
  const fb = useGS((s) => s.fb);
  const energy = useGS((s) => s.energy);
  const shield = useGS((s) => s.shield);
  const prevEnergy = useRef(energy);
  const prevShield = useRef(shield);
  const T = (key: string) => t(lang, key);

  useEffect(() => {
    if (prevEnergy.current !== energy) {
      if (energy < prevEnergy.current && energy < 50) {
        addNotification({
          title: T('notifAttention'),
          message: T('notifEnergyLow').replace('{value}', String(energy)),
          type: 'warning',
          icon: <AlertTriangle className="w-5 h-5" />,
          duration: 4000,
        });
      }
      prevEnergy.current = energy;
    }
  }, [energy, addNotification, lang]);

  useEffect(() => {
    if (prevShield.current !== shield) {
      if (shield < prevShield.current && shield < 50) {
        addNotification({
          title: T('notifWarning'),
          message: T('notifShieldWeak').replace('{value}', String(shield)),
          type: 'error',
          icon: <ShieldAlert className="w-5 h-5" />,
          duration: 5000,
        });
      }
      prevShield.current = shield;
    }
  }, [shield, addNotification, lang]);

  useEffect(() => {
    if (fb?.kind === 'warning') {
      addNotification({
        title: fb.title || T('notifAttention'),
        message: fb.message || T('notifThreat'),
        type: 'error',
        icon: <ShieldAlert className="w-5 h-5" />,
        duration: 6000,
      });
    } else if (fb?.kind === 'success') {
      addNotification({
        title: fb.title || T('notifGreat'),
        message: fb.message || T('notifThreatNeutralized'),
        type: 'success',
        icon: <Check className="w-5 h-5" />,
        duration: 4000,
      });
    }
  }, [fb, addNotification, lang]);
}

// Demo notifications on mount
function useDemoNotifications() {
  const { addNotification } = useNotifications();
  const lang = useGS((s) => s.lang);
  const [shown, setShown] = useState(false);
  const T = (key: string) => t(lang, key);

  useEffect(() => {
    if (shown) return;
    setShown(true);

    const timers = [
      setTimeout(() => {
        addNotification({
          title: T('notifNewMail'),
          message: 'СРОЧНО: Подтвердите данные учетной записи',
          type: 'warning',
          icon: <Mail className="w-5 h-5" />,
          duration: 0,
        });
      }, 2000),
      setTimeout(() => {
        addNotification({
          title: T('notifMessage'),
          message: 'Алексей Иванов: Привет! Как дела с отчетом?',
          type: 'info',
          icon: <MessageSquare className="w-5 h-5" />,
          duration: 5000,
        });
      }, 5000),
      setTimeout(() => {
        addNotification({
          title: T('notifSystemUpdate'),
          message: 'Доступно обновление антивирусной базы',
          type: 'info',
          icon: <Shield className="w-5 h-5" />,
          duration: 6000,
        });
      }, 8000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [shown, addNotification, lang]);
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: OSNotification;
  onClose: () => void;
}) {
  const typeStyles = {
    info: {
      bg: 'bg-info/10',
      border: 'border-info/20',
      icon: 'text-info',
    },
    success: {
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: 'text-success',
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: 'text-warning',
    },
    error: {
      bg: 'bg-danger/10',
      border: 'border-danger/20',
      icon: 'text-danger',
    },
  };

  const style = typeStyles[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      className={`w-80 ${style.bg} ${style.border} border rounded-lg shadow-lg overflow-hidden backdrop-blur-sm`}
    >
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div className={style.icon}>{notification.icon || <Info className="w-5 h-5" />}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{notification.title}</p>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
            <p className="text-[10px] text-text-muted mt-1">
              {new Date(notification.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-surface-active rounded transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 text-text-muted" />
          </button>
        </div>

        {notification.action && (
          <div className="mt-2 pt-2 border-t border-border/50 flex justify-end">
            <button
              onClick={notification.action.onClick}
              className="text-xs text-ci-green hover:underline font-medium"
            >
              {notification.action.label}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NotificationRenderer() {
  const notificationState = useNotifications();
  useGameNotifications();
  useDemoNotifications();

  return (
    <div className="absolute top-4 right-4 z-40 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notificationState.notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onClose={() => notificationState.removeNotification(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Notifications() {
  return <NotificationRenderer />;
}
