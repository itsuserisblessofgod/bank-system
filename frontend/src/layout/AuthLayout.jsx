import { Link } from 'react-router-dom';
import Icon, { BrandMark } from '../components/icons/Icon.jsx';

const STATS = [
  { label: 'Assets under custody', value: '$2.4T' },
  { label: 'Active institutional clients', value: '14,800+' },
  { label: 'Sovereign jurisdictions', value: '46' },
];

export default function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen flex bg-graphite-50">
      {/* Brand panel */}
      <div className="hidden lg:flex relative w-1/2 bg-gradient-navy text-white overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-[360px] w-[360px] rounded-full bg-info-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col w-full px-12 py-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <BrandMark size={40} />
            <div>
              <div className="font-display text-xl font-semibold tracking-tight">EBMS</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-graphite-300">Private Banking · est. 1998</div>
            </div>
          </Link>

          <div className="mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-[11px] uppercase tracking-wider mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" /> Member FDIC · SIPC · ISO 27001
            </div>
            <h2 className="font-display text-4xl xl:text-5xl font-semibold tracking-tightest leading-[1.05] text-balance">
              Banking infrastructure for the world's most discerning institutions.
            </h2>
            <p className="mt-5 text-graphite-300 max-w-md leading-relaxed">
              Settle global treasury, custody multi-currency portfolios, and operate a real-time
              fraud surveillance perimeter — from one regulated platform.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
              {STATS.map((s) => (
                <div key={s.label} className="border-l border-white/10 pl-4">
                  <div className="font-display text-2xl font-semibold tracking-tight">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-graphite-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center gap-6 text-[11px] text-graphite-400 uppercase tracking-wider">
            <span className="inline-flex items-center gap-1.5"><Icon name="shieldCheck" size={13} className="text-gold-300" /> 256-bit AES</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="lock" size={13} className="text-gold-300" /> Zero-trust</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="fingerprint" size={13} className="text-gold-300" /> Biometric MFA</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-graphite-200">
          <div className="flex items-center gap-2">
            <BrandMark size={28} variant="dark" />
            <span className="font-display font-semibold text-navy-900">EBMS</span>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-graphite-500">Secure portal</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {(title || subtitle) && (
              <div className="mb-8">
                {title && <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900">{title}</h1>}
                {subtitle && <p className="mt-2 text-sm text-graphite-500">{subtitle}</p>}
              </div>
            )}
            {children}
            {footer && <div className="mt-6 text-sm text-center text-graphite-500">{footer}</div>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-graphite-200 text-[11px] text-graphite-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} EBMS Holdings</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-navy-900">Privacy</a>
            <a href="#" className="hover:text-navy-900">Terms</a>
            <a href="#" className="hover:text-navy-900">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}
