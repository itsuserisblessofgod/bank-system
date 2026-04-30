import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Icon, { BrandMark } from '../components/icons/Icon.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { Avatar, Dropdown, MenuItem, MenuDivider, Input, Badge } from '../components/ui/index.jsx';

export default function Topbar({ onOpenMobileNav, unreadNotifications = 0, theme, onToggleTheme }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [scope, setScope] = useState('All');

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/85 dark:bg-graphite-950/80 backdrop-blur-md
                       border-b border-graphite-200 dark:border-graphite-800">
      <div className="flex items-center gap-4 h-16 px-4 lg:px-8">
        {/* Mobile brand + menu */}
        <button onClick={onOpenMobileNav} className="lg:hidden p-2 -ml-2 text-navy-900 dark:text-graphite-100">
          <Icon name="menu" size={20} />
        </button>
        <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
          <BrandMark size={28} variant="dark" />
          <span className="font-display font-semibold text-navy-900 dark:text-graphite-50">EBMS</span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-graphite-400">
              <Icon name="search" size={16} />
            </div>
            <input
              placeholder="Search transactions, accounts, recipients…"
              className="input pl-9 pr-20 bg-graphite-50 dark:bg-graphite-900/60"
            />
            <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2
                          items-center gap-1 px-1.5 py-0.5 rounded border border-graphite-200
                          dark:border-graphite-700 text-[10px] text-graphite-500 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          <Badge tone="navy" dot className="hidden xl:inline-flex">
            <span className="hidden xl:inline">Production · USD</span>
          </Badge>
          <button
            onClick={onToggleTheme}
            title="Toggle theme"
            className="p-2 rounded-lg text-graphite-600 hover:bg-graphite-100 dark:text-graphite-300 dark:hover:bg-graphite-800"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg text-graphite-600 hover:bg-graphite-100 dark:text-graphite-300 dark:hover:bg-graphite-800"
            title="Notifications"
          >
            <Icon name="notifications" size={17} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-danger-500 ring-2 ring-white dark:ring-graphite-950" />
            )}
          </Link>

          <div className="hidden md:block h-6 w-px bg-graphite-200 dark:bg-graphite-800 mx-1" />

          <Dropdown
            trigger={
              <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-graphite-100 dark:hover:bg-graphite-800">
                <Avatar name={auth?.email || 'Client'} size={32} />
                <div className="hidden md:flex flex-col items-start leading-tight pr-1">
                  <span className="text-sm font-medium text-navy-900 dark:text-graphite-100 truncate max-w-[160px]">
                    {auth?.fullName || auth?.email?.split('@')[0] || 'Client'}
                  </span>
                  <span className="text-[11px] text-graphite-500">{auth?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Verified Client'}</span>
                </div>
                <Icon name="chevronDown" size={14} className="text-graphite-400" />
              </button>
            }
          >
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-navy-900 dark:text-graphite-100 truncate">
                {auth?.fullName || auth?.email}
              </div>
              <div className="text-xs text-graphite-500 truncate">{auth?.email}</div>
            </div>
            <MenuDivider />
            <MenuItem icon="profile" onClick={() => navigate('/profile')}>Profile & KYC</MenuItem>
            <MenuItem icon="settings" onClick={() => navigate('/settings')}>Settings</MenuItem>
            <MenuItem icon="shield" onClick={() => navigate('/two-factor')}>Two-factor auth</MenuItem>
            <MenuDivider />
            <MenuItem icon="logout" danger onClick={onLogout}>Sign out</MenuItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
