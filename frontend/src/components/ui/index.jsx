import { forwardRef, useEffect, useRef, useState } from 'react';
import Icon from '../icons/Icon.jsx';

// ────────────────────────────────────────────────────────────────────
// Money formatting
// ────────────────────────────────────────────────────────────────────
export function formatMoney(value, currency = 'USD', { compact = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
  }).format(n);
}

export function Money({ value, currency = 'USD', signed = false, className = '', compact = false }) {
  const n = Number(value);
  const sign = signed ? (n > 0 ? '+' : n < 0 ? '−' : '') : '';
  const abs = Math.abs(n);
  return (
    <span className={`num ${className}`}>
      {sign}{formatMoney(abs, currency, { compact })}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// Button
// ────────────────────────────────────────────────────────────────────
const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  gold: 'btn-gold',
};
export const Button = forwardRef(function Button(
  { variant = 'primary', size, leftIcon, rightIcon, loading, className = '', children, ...rest }, ref
) {
  const sz = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button ref={ref} {...rest} className={`${VARIANTS[variant] || VARIANTS.primary} ${sz} ${className}`} disabled={loading || rest.disabled}>
      {loading
        ? <Spinner size={14} />
        : leftIcon && <Icon name={leftIcon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {rightIcon && !loading && <Icon name={rightIcon} size={size === 'sm' ? 14 : 16} />}
    </button>
  );
});

// ────────────────────────────────────────────────────────────────────
// Card
// ────────────────────────────────────────────────────────────────────
export function Card({ className = '', as: Tag = 'div', flush = false, children, ...rest }) {
  return (
    <Tag {...rest} className={`${flush ? 'card-flush' : 'card'} ${className}`}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, eyebrow, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <div className="section-title mb-1.5">{eyebrow}</div>}
        {title && <h3 className="text-base font-semibold tracking-tight text-navy-900 dark:text-graphite-50">{title}</h3>}
        {subtitle && <p className="text-sm text-graphite-500 dark:text-graphite-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Inputs
// ────────────────────────────────────────────────────────────────────
export const Input = forwardRef(function Input({ className = '', leftIcon, rightSlot, ...rest }, ref) {
  if (!leftIcon && !rightSlot) {
    return <input ref={ref} className={`input ${className}`} {...rest} />;
  }
  return (
    <div className="relative">
      {leftIcon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-graphite-400">
          <Icon name={leftIcon} size={16} />
        </div>
      )}
      <input ref={ref} className={`input ${leftIcon ? 'pl-9' : ''} ${rightSlot ? 'pr-10' : ''} ${className}`} {...rest} />
      {rightSlot && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div>
      )}
    </div>
  );
});

export const Select = forwardRef(function Select({ className = '', children, ...rest }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={`input pr-9 appearance-none ${className}`} {...rest}>
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-graphite-400">
        <Icon name="chevronDown" size={16} />
      </div>
    </div>
  );
});

export function Field({ label, hint, error, htmlFor, children, className = '' }) {
  return (
    <label className={`block ${className}`} htmlFor={htmlFor}>
      {label && <span className="label">{label}</span>}
      {children}
      {error
        ? <p className="text-xs text-danger-600 mt-1.5">{error}</p>
        : hint && <p className="help">{hint}</p>}
    </label>
  );
}

export function Checkbox({ label, hint, className = '', ...rest }) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer select-none ${className}`}>
      <input type="checkbox" {...rest}
        className="mt-0.5 h-4 w-4 rounded border-graphite-300 text-navy-900 focus:ring-navy-700" />
      <span>
        {label && <span className="block text-sm text-graphite-800 dark:text-graphite-200">{label}</span>}
        {hint && <span className="block text-xs text-graphite-500 mt-0.5">{hint}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label, description, disabled }) {
  return (
    <label className={`flex items-start justify-between gap-4 ${disabled ? 'opacity-60' : ''}`}>
      <span className="min-w-0">
        {label && <span className="block text-sm font-medium text-navy-900 dark:text-graphite-100">{label}</span>}
        {description && <span className="block text-xs text-graphite-500 dark:text-graphite-400 mt-0.5">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200
          ${checked ? 'bg-navy-900' : 'bg-graphite-300 dark:bg-graphite-700'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0.5'} self-center`}
        />
      </button>
    </label>
  );
}

// ────────────────────────────────────────────────────────────────────
// Status / Badge
// ────────────────────────────────────────────────────────────────────
const STATUS = {
  success: 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-100',
  warning: 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-100',
  danger:  'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-100',
  info:    'bg-info-50 text-info-700 ring-1 ring-inset ring-info-100',
  neutral: 'bg-graphite-100 text-graphite-700 ring-1 ring-inset ring-graphite-200 dark:bg-graphite-800 dark:text-graphite-200 dark:ring-graphite-700',
  navy:    'bg-navy-50 text-navy-800 ring-1 ring-inset ring-navy-100',
  gold:    'bg-gold-50 text-gold-800 ring-1 ring-inset ring-gold-100',
};
export function Badge({ tone = 'neutral', children, dot = false, icon, className = '' }) {
  return (
    <span className={`pill ${STATUS[tone] || STATUS.neutral} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}

export function StatusPill({ status }) {
  const map = {
    COMPLETED: { tone: 'success', label: 'Completed', dot: true },
    PENDING:   { tone: 'warning', label: 'Pending', dot: true },
    BLOCKED:   { tone: 'danger',  label: 'Blocked', dot: true },
    FLAGGED:   { tone: 'warning', label: 'Flagged', dot: true },
    APPROVED:  { tone: 'success', label: 'Approved', dot: true },
    REJECTED:  { tone: 'danger',  label: 'Rejected', dot: true },
    ACTIVE:    { tone: 'success', label: 'Active', dot: true },
    INACTIVE:  { tone: 'neutral', label: 'Inactive' },
  };
  const cfg = map[status] || { tone: 'neutral', label: status };
  return <Badge tone={cfg.tone} dot={cfg.dot}>{cfg.label}</Badge>;
}

// ────────────────────────────────────────────────────────────────────
// Avatar
// ────────────────────────────────────────────────────────────────────
export function Avatar({ name = '', size = 36, src, className = '' }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '·';
  if (src) {
    return <img src={src} alt={name} width={size} height={size}
      className={`rounded-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-navy-900
        bg-gradient-to-br from-graphite-100 to-graphite-200
        ring-1 ring-graphite-200 dark:ring-graphite-700
        dark:from-graphite-700 dark:to-graphite-800 dark:text-graphite-100 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Spinner / Skeleton
// ────────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

// ────────────────────────────────────────────────────────────────────
// Empty state
// ────────────────────────────────────────────────────────────────────
export function EmptyState({ icon = 'info', title, description, action }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-graphite-100 dark:bg-graphite-800 flex items-center justify-center text-graphite-500">
        <Icon name={icon} size={22} />
      </div>
      {title && <h4 className="mt-4 text-sm font-semibold text-navy-900 dark:text-graphite-100">{title}</h4>}
      {description && <p className="mt-1 text-sm text-graphite-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tabs
// ────────────────────────────────────────────────────────────────────
export function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div className={`flex items-center gap-1 border-b border-graphite-200 dark:border-graphite-800 ${className}`}>
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={`relative px-3.5 py-2.5 -mb-px text-sm font-medium transition-colors
              ${active
                ? 'text-navy-900 dark:text-graphite-50'
                : 'text-graphite-500 hover:text-navy-900 dark:hover:text-graphite-100'}`}
          >
            <span className="inline-flex items-center gap-2">
              {it.icon && <Icon name={it.icon} size={14} />}
              {it.label}
              {it.count != null && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums
                  ${active ? 'bg-navy-900 text-white' : 'bg-graphite-100 text-graphite-600 dark:bg-graphite-800 dark:text-graphite-300'}`}>
                  {it.count}
                </span>
              )}
            </span>
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-navy-900 dark:bg-gold-300 rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Segmented control
// ────────────────────────────────────────────────────────────────────
export function Segmented({ value, onChange, items, size = 'md', className = '' }) {
  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  return (
    <div className={`inline-flex p-1 rounded-lg bg-graphite-100 dark:bg-graphite-800 ${className}`}>
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={`${padding} rounded-md font-medium transition-all
              ${active
                ? 'bg-white text-navy-900 shadow-elev-1 dark:bg-graphite-900 dark:text-graphite-50'
                : 'text-graphite-500 hover:text-navy-900 dark:hover:text-graphite-100'}`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Modal
// ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} surface rounded-2xl shadow-elev-4 overflow-hidden`}>
        {(title || description) && (
          <div className="px-6 py-5 border-b border-graphite-200 dark:border-graphite-800">
            {title && <h3 className="text-lg font-semibold tracking-tight text-navy-900 dark:text-graphite-50">{title}</h3>}
            {description && <p className="text-sm text-graphite-500 dark:text-graphite-400 mt-1">{description}</p>}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-graphite-200 dark:border-graphite-800 bg-graphite-50/60 dark:bg-graphite-900/40 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Dropdown menu (click-outside)
// ────────────────────────────────────────────────────────────────────
export function Dropdown({ trigger, children, align = 'right', menuClassName = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-30 mt-2 min-w-[200px] surface rounded-xl shadow-elev-3 py-1.5 animate-fade-in
            ${align === 'right' ? 'right-0' : 'left-0'} ${menuClassName}`}
          role="menu"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
export function MenuItem({ icon, children, danger, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left
        ${danger ? 'text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20' : 'text-graphite-800 dark:text-graphite-200 hover:bg-graphite-50 dark:hover:bg-graphite-800'}
        ${className}`}
      role="menuitem"
    >
      {icon && <Icon name={icon} size={14} className="text-graphite-500" />}
      {children}
    </button>
  );
}
export function MenuDivider() {
  return <div className="my-1 border-t border-graphite-200 dark:border-graphite-800" />;
}

// ────────────────────────────────────────────────────────────────────
// Progress bar
// ────────────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, color = 'bg-navy-900', height = 'h-1.5', label }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between text-xs text-graphite-500 mb-1.5">
          <span>{label}</span>
          <span className="num font-medium text-navy-900 dark:text-graphite-100">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-graphite-100 dark:bg-graphite-800 overflow-hidden`}>
        <div className={`${color} h-full rounded-full transition-all duration-500 ease-out-expo`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// KPI tile
// ────────────────────────────────────────────────────────────────────
export function KpiTile({ label, value, hint, delta, deltaTone = 'success', icon, footer, className = '' }) {
  return (
    <div className={`card relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="kpi-label">{label}</div>
          <div className="kpi-value mt-1.5 truncate">{value}</div>
          {hint && <div className="text-xs text-graphite-500 mt-1">{hint}</div>}
        </div>
        {icon && (
          <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-navy-900/5 text-navy-900 dark:bg-graphite-800 dark:text-graphite-100 ring-1 ring-navy-900/5 dark:ring-graphite-700">
            <Icon name={icon} size={18} />
          </div>
        )}
      </div>
      {(delta != null || footer) && (
        <div className="mt-4 pt-4 border-t border-graphite-200 dark:border-graphite-800 flex items-center justify-between gap-3 text-xs">
          {delta != null && (
            <Badge tone={deltaTone} icon={deltaTone === 'success' ? 'trendUp' : deltaTone === 'danger' ? 'trendDown' : undefined}>
              {delta}
            </Badge>
          )}
          {footer && <div className="text-graphite-500 ml-auto truncate">{footer}</div>}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Toast (simple in-page)
// ────────────────────────────────────────────────────────────────────
export function Alert({ tone = 'info', title, children, onClose, icon, className = '' }) {
  const tones = {
    info:    'bg-info-50 text-info-700 border-info-100',
    success: 'bg-success-50 text-success-700 border-success-100',
    warning: 'bg-warning-50 text-warning-700 border-warning-100',
    danger:  'bg-danger-50 text-danger-700 border-danger-100',
    navy:    'bg-navy-50 text-navy-800 border-navy-100',
  };
  const iconMap = { info: 'info', success: 'success', warning: 'warning', danger: 'warning', navy: 'shield' };
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${tones[tone]} ${className}`} role="alert">
      <Icon name={icon || iconMap[tone]} size={18} className="mt-0.5 shrink-0" />
      <div className="text-sm flex-1">
        {title && <div className="font-semibold leading-5">{title}</div>}
        {children && <div className="leading-5">{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Copy-to-clipboard chip
// ────────────────────────────────────────────────────────────────────
export function CopyChip({ value, className = '' }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch {}
  };
  return (
    <button onClick={onClick} type="button"
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-1 rounded-md
        bg-graphite-100 text-graphite-700 hover:bg-graphite-200 dark:bg-graphite-800 dark:text-graphite-300 transition-colors ${className}`}
      title="Copy to clipboard"
    >
      <span className="truncate max-w-[180px]">{value}</span>
      <Icon name={copied ? 'check' : 'copy'} size={12} className={copied ? 'text-success-500' : ''} />
    </button>
  );
}
