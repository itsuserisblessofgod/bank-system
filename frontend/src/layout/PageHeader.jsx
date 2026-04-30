import Icon from '../components/icons/Icon.jsx';
import { Link } from 'react-router-dom';

export default function PageHeader({ eyebrow, title, subtitle, actions, breadcrumbs }) {
  return (
    <div className="mb-6 lg:mb-8">
      {breadcrumbs?.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-graphite-500 mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevronRight" size={12} className="text-graphite-300" />}
              {b.to
                ? <Link to={b.to} className="hover:text-navy-900 dark:hover:text-graphite-200">{b.label}</Link>
                : <span className="text-graphite-700 dark:text-graphite-300">{b.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <div className="section-title mb-1.5">{eyebrow}</div>}
          <h1 className="page-title text-balance">{title}</h1>
          {subtitle && <p className="page-subtitle mt-1.5 max-w-2xl text-balance">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
