import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const THEME_KEY = 'ebms.theme';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export default function AppShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const location = useLocation();

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Close any future mobile drawer on route change (placeholder kept for parity)
  useEffect(() => {}, [location.pathname]);

  return (
    <div className="min-h-screen bg-graphite-50 dark:bg-graphite-950">
      <Sidebar unreadNotifications={3} fraudCount={0} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar
          unreadNotifications={3}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">
          <Outlet />
        </main>
        <footer className="px-6 lg:px-8 py-4 border-t border-graphite-200 dark:border-graphite-800
                           text-[11px] text-graphite-500 dark:text-graphite-500
                           flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>© {new Date().getFullYear()} EBMS Holdings · Member FDIC · Equal Housing Lender</span>
          <span className="hidden sm:inline">·</span>
          <a className="hover:text-navy-900 dark:hover:text-graphite-200" href="#">Privacy</a>
          <a className="hover:text-navy-900 dark:hover:text-graphite-200" href="#">Disclosures</a>
          <a className="hover:text-navy-900 dark:hover:text-graphite-200" href="#">Compliance</a>
          <span className="ml-auto font-mono">v1.0 · Build 2026.04</span>
        </footer>
      </div>
    </div>
  );
}
