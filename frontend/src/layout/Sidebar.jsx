import { NavLink, Link } from 'react-router-dom';
import Icon, { BrandMark } from '../components/icons/Icon.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { Badge } from '../components/ui/index.jsx';

const PRIMARY = [
  { to: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { to: '/accounts', label: 'Accounts', icon: 'accounts' },
  { to: '/transactions', label: 'Transactions', icon: 'transactions' },
  { to: '/transfer', label: 'Transfers', icon: 'transfer' },
  // { to: '/cards', label: 'Cards', icon: 'cards' },  // Mock-only, not connected
  { to: '/loans', label: 'Loans & Credit', icon: 'loans' },
  { to: '/rewards', label: 'Rewards', icon: 'star' },
  // { to: '/analytics', label: 'Analytics', icon: 'analytics' },  // Mock-only, not connected
];

const PERSONAL = [
  { to: '/profile', label: 'Profile & KYC', icon: 'profile' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

const ADMIN = [
  { to: '/admin', label: 'Control Panel', icon: 'admin' },
  { to: '/admin/fraud', label: 'Fraud & Security', icon: 'fraud' },
  { to: '/admin/audit', label: 'Audit Log', icon: 'audit' },
];

function Section({ title, items, badges = {} }) {
  return (
    <div className="px-3">
      {title && <div className="px-3 mt-5 mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-graphite-500">{title}</div>}
      <nav className="space-y-0.5">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            end={it.to === '/dashboard'}
          >
            <Icon name={it.icon} size={17} className="opacity-90" />
            <span className="flex-1 truncate">{it.label}</span>
            {badges[it.to] != null && badges[it.to] > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gold-300/90 text-navy-900">
                {badges[it.to]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({ unreadNotifications = 0, fraudCount = 0 }) {
  const { isAdmin, auth } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-gradient-navy text-graphite-200 z-30
                      border-r border-navy-950/60 shadow-elev-3">
      {/* Brand */}
      <Link to="/dashboard" className="px-5 pt-5 pb-4 flex items-center gap-3 group">
        <BrandMark size={36} />
        <div className="leading-tight">
          <div className="text-white font-display font-semibold tracking-tight">EBMS</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-graphite-400">Private Banking</div>
        </div>
      </Link>

      <div className="mx-5 mt-1 mb-2 rounded-lg bg-white/5 ring-1 ring-white/5 px-3 py-2.5 flex items-center gap-2 text-[11px] text-graphite-300">
        <Icon name="shieldCheck" size={14} className="text-success-500" />
        <span className="flex-1">Secured TLS 1.3 · FIPS 140-3</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <Section items={PRIMARY} badges={{}} />
        <Section title="Personal" items={PERSONAL} badges={unreadNotifications > 0 ? { '/notifications': unreadNotifications } : {}} />
        {isAdmin && (
          <Section title="Administration" items={ADMIN} badges={fraudCount > 0 ? { '/admin/fraud': fraudCount } : {}} />
        )}
      </div>

      {/* Footer card */}
      <div className="mx-3 mb-3 rounded-xl bg-white/5 ring-1 ring-white/10 p-3.5 backdrop-blur">
        <div className="flex items-center gap-2 text-[11px] text-graphite-300 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse-subtle" />
          All systems operational
        </div>
        <div className="text-[11px] text-graphite-400">
          Compliance: SOC 2 · PCI-DSS · ISO 27001
        </div>
        {auth && (
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-graphite-400 truncate">
            Session · {auth.email}
          </div>
        )}
      </div>
    </aside>
  );
}
