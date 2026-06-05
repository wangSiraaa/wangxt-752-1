import { useStore } from '@/store/useStore';
import RoleSelector from './RoleSelector';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, RotateCcw, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { Role } from '@/types';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '@/types';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { path: string; label: string; roles: Role[] }[] = [
  { path: '/', label: '门牌总览', roles: ['tenant', 'frontdesk', 'admin'] },
  { path: '/booking', label: '预约会议室', roles: ['tenant'] },
  { path: '/schedule', label: '时段列表', roles: ['frontdesk', 'admin'] },
  { path: '/equipment', label: '设备标签', roles: ['admin'] },
];

export default function Header() {
  const { role, resetToSample } = useStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">科创园会议室</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">当前角色: {ROLE_LABELS[role]}</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <RoleSelector />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              title={isDark ? '切换亮色' : '切换暗色'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={resetToSample}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              title="重置样例数据"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 mt-2 overflow-x-auto pb-1">
          {visibleNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
