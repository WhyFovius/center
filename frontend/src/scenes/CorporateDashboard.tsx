import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, AlertTriangle, TrendingUp, Award, FileCheck, Search, Filter, BarChart3, ChevronRight, Download, QrCode, Eye, CheckCircle } from 'lucide-react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

const EMPLOYEES = [
  { id: 1, name: 'Иванов Алексей', dept: 'Финансы', progress: 87, league: 'Эксперт', weak: ['Фишинг'], certs: 3, lastActive: '2 часа назад' },
  { id: 2, name: 'Петрова Мария', dept: 'HR', progress: 92, league: 'Аналитик', weak: ['WiFi'], certs: 2, lastActive: '1 день назад' },
  { id: 3, name: 'Козлов Дмитрий', dept: 'IT', progress: 64, league: 'Новичок', weak: ['Соц. инженерия', 'Дипфейк'], certs: 1, lastActive: '3 дня назад' },
  { id: 4, name: 'Сидорова Елена', dept: 'Маркетинг', progress: 78, league: 'Аналитик', weak: ['Smishing'], certs: 2, lastActive: '5 часов назад' },
  { id: 5, name: 'Новиков Артём', dept: 'Продажи', progress: 45, league: 'Новичок', weak: ['Фишинг', 'WiFi', 'Дипфейк'], certs: 0, lastActive: '1 неделю назад' },
  { id: 6, name: 'Волкова Анна', dept: 'Бухгалтерия', progress: 95, league: 'Эксперт', weak: [], certs: 4, lastActive: '30 мин назад' },
];

const ATTACK_HEATMAP = [
  { type: 'Фишинг', count: 34, avg: 72, color: '#ef4444' },
  { type: 'WiFi-атаки', count: 28, avg: 65, color: '#f59e0b' },
  { type: 'Соц. инженерия', count: 19, avg: 58, color: '#8b5cf6' },
  { type: 'Smishing', count: 15, avg: 80, color: '#3b82f6' },
  { type: 'Дипфейк', count: 12, avg: 45, color: '#ec4899' },
  { type: 'Credential', count: 8, avg: 88, color: '#22c55e' },
];

export default function CorporateDashboard() {
  const theme = useGS(s => s.theme);
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const isDark = theme === 'dark' || theme === 'bw';
  const [tab, setTab] = useState<'overview' | 'employees' | 'heatmap' | 'certs'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProgress = Math.round(EMPLOYEES.reduce((a, e) => a + e.progress, 0) / EMPLOYEES.length);
  const certified = EMPLOYEES.filter(e => e.certs > 0).length;
  const weakPoints = [...new Set(EMPLOYEES.flatMap(e => e.weak))];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: isDark ? '#121212' : '#f8f9fa' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(63,185,80,0.15)' }}>
            <Shield className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Corporate Dashboard</h2>
            <p className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>Панель мониторинга кибербезопасности</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#ccc' : '#333' }}>
          <Download className="w-4 h-4" /> Экспорт
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 border-b shrink-0" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        {[
          { id: 'overview' as const, label: T('osOverview'), icon: BarChart3 },
          { id: 'employees' as const, label: T('osEmployees'), icon: Users },
          { id: 'heatmap' as const, label: T('osHeatmap'), icon: AlertTriangle },
          { id: 'certs' as const, label: T('osCerts'), icon: Award },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900')
                : (isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')
            }`}
          >
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Сотрудников', value: EMPLOYEES.length, icon: Users, color: '#58a6ff' },
                { label: 'Общий прогресс', value: `${totalProgress}%`, icon: TrendingUp, color: totalProgress > 70 ? '#22c55e' : '#f59e0b' },
                { label: 'Сертифицировано', value: `${certified}/${EMPLOYEES.length}`, icon: FileCheck, color: '#a78bfa' },
                { label: 'Слабые места', value: weakPoints.length, icon: AlertTriangle, color: '#ef4444' },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    <span className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="rounded-xl p-5" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? '#e0e0e0' : '#333' }}>🤖 Автоматические рекомендации</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#252525' : '#f5f5f5' }}>
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Дипфейк-атаки — критическая уязвимость</p>
                    <p className="text-[10px]" style={{ color: isDark ? '#888' : '#666' }}>Средний балл: 45%. Рекомендуется провести тренинг для всех сотрудников.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto" style={{ color: isDark ? '#666' : '#999' }} />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#252525' : '#f5f5f5' }}>
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Новиков Артём отстаёт от графика</p>
                    <p className="text-[10px]" style={{ color: isDark ? '#888' : '#666' }}>Прогресс: 45%. Последняя активность: 1 неделю назад.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto" style={{ color: isDark ? '#666' : '#999' }} />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#252525' : '#f5f5f5' }}>
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Волкова Анна — лучший сотрудник</p>
                    <p className="text-[10px]" style={{ color: isDark ? '#888' : '#666' }}>Прогресс: 95%, 4 сертификата. Рекомендуется как ментор.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto" style={{ color: isDark ? '#666' : '#999' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* EMPLOYEES */}
        {tab === 'employees' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}>
                <Search className="w-4 h-4" style={{ color: isDark ? '#888' : '#999' }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск сотрудника..."
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color: isDark ? '#e0e0e0' : '#333' }}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`, color: isDark ? '#ccc' : '#333' }}>
                <Filter className="w-4 h-4" /> Фильтр
              </button>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: isDark ? '#888' : '#666' }}>Сотрудник</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: isDark ? '#888' : '#666' }}>Отдел</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: isDark ? '#888' : '#666' }}>Прогресс</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: isDark ? '#888' : '#666' }}>Лига</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: isDark ? '#888' : '#666' }}>Сертификаты</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: isDark ? '#888' : '#666' }}>Активность</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="border-t" style={{ backgroundColor: isDark ? '#121212' : '#ffffff', borderColor: isDark ? '#222' : '#e5e5e5' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#ccc' : '#333' }}>
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span style={{ color: isDark ? '#e0e0e0' : '#333' }}>{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: isDark ? '#888' : '#666' }}>{emp.dept}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e5e5' }}>
                            <div className="h-full rounded-full" style={{ width: `${emp.progress}%`, backgroundColor: emp.progress > 70 ? '#22c55e' : emp.progress > 40 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: isDark ? '#ccc' : '#333' }}>{emp.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: emp.league === 'Эксперт' ? 'rgba(34,197,94,0.15)' : emp.league === 'Аналитик' ? 'rgba(88,166,255,0.15)' : 'rgba(136,136,136,0.15)', color: emp.league === 'Эксперт' ? '#22c55e' : emp.league === 'Аналитик' ? '#58a6ff' : '#888' }}>
                          {emp.league}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium" style={{ color: emp.certs > 0 ? (isDark ? '#ccc' : '#333') : (isDark ? '#666' : '#999') }}>{emp.certs}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>{emp.lastActive}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
                          <Eye className="w-4 h-4" style={{ color: isDark ? '#888' : '#666' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* HEATMAP */}
        {tab === 'heatmap' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-sm font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Тепловая карта уязвимостей</h3>
            <div className="space-y-3">
              {ATTACK_HEATMAP.map(attack => (
                <div key={attack.type} className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{attack.type}</span>
                    <span className="text-xs" style={{ color: attack.color }}>{attack.avg}% средний балл</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e5e5' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${attack.avg}%`, backgroundColor: attack.color }} />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: isDark ? '#888' : '#666' }}>{attack.count} инцидентов за месяц</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CERTS */}
        {tab === 'certs' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-bold" style={{ color: isDark ? '#e0e0e0' : '#333' }}>Сертификаты сотрудников</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EMPLOYEES.filter(e => e.certs > 0).map(emp => (
                <div key={emp.id} className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', color: isDark ? '#ccc' : '#333' }}>
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: isDark ? '#e0e0e0' : '#333' }}>{emp.name}</p>
                        <p className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>{emp.dept}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#fbbf24' }}>{emp.certs} 🏆</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: isDark ? '#252525' : '#f5f5f5', color: isDark ? '#ccc' : '#333' }}>
                      <QrCode className="w-3.5 h-3.5" /> QR Валидация
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: isDark ? '#252525' : '#f5f5f5', color: isDark ? '#ccc' : '#333' }}>
                      <Download className="w-3.5 h-3.5" /> Скачать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
