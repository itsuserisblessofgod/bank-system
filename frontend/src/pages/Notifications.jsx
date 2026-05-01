import { useState } from 'react';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, Tabs, EmptyState,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

const CATEGORIES = {
  security: { tone: 'danger', icon: 'shield' },
  transactional: { tone: 'navy', icon: 'transactions' },
  account: { tone: 'info', icon: 'profile' },
  product: { tone: 'gold', icon: 'star' },
};

const NOTIFICATIONS = [
  // Mock notifications removed - real notifications will come from the backend
];

export default function Notifications() {
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState(NOTIFICATIONS);
  const filtered = items.filter((n) => tab === 'all' || n.category === tab || (tab === 'unread' && n.unread));
  const unread = items.filter((n) => n.unread).length;

  const markAll = () => setItems((arr) => arr.map((n) => ({ ...n, unread: false })));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        subtitle="A consolidated, audit-grade timeline of every event tied to your account."
        actions={
          <>
            <Button variant="secondary" leftIcon="check" onClick={markAll}>Mark all read</Button>
            <Button variant="ghost" leftIcon="settings">Preferences</Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'all', label: 'All', count: items.length },
          { value: 'unread', label: 'Unread', count: unread },
          { value: 'security', label: 'Security' },
          { value: 'transactional', label: 'Transactional' },
          { value: 'account', label: 'Account' },
          { value: 'product', label: 'Product' },
        ]}
      />

      <Card flush>
        {filtered.length === 0 ? (
          <EmptyState icon="notifications" title="You're all caught up" description="No notifications match the current filter." />
        ) : (
          <ul className="divide-y divide-graphite-200 dark:divide-graphite-800">
            {filtered.map((n) => {
              const cat = CATEGORIES[n.category] || { tone: 'neutral', icon: 'info' };
              return (
                <li key={n.id} className={`px-6 py-4 flex items-start gap-4 transition-colors hover:bg-graphite-50/60 dark:hover:bg-graphite-900/40 ${n.unread ? 'bg-graphite-50/40 dark:bg-graphite-900/30' : ''}`}>
                  <div className={`mt-0.5 h-9 w-9 rounded-full flex items-center justify-center
                    ${cat.tone === 'danger' ? 'bg-danger-50 text-danger-600 ring-1 ring-danger-100'
                      : cat.tone === 'navy' ? 'bg-navy-50 text-navy-700 ring-1 ring-navy-100'
                      : cat.tone === 'info' ? 'bg-info-50 text-info-600 ring-1 ring-info-100'
                      : 'bg-gold-50 text-gold-700 ring-1 ring-gold-100'}`}>
                    <Icon name={cat.icon} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-navy-900 dark:text-graphite-100 truncate">{n.title}</h4>
                      {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-info-500 shrink-0" aria-label="Unread" />}
                      <Badge tone={cat.tone}>{n.category}</Badge>
                    </div>
                    <p className="text-sm text-graphite-600 dark:text-graphite-400 mt-1 leading-relaxed">{n.body}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-graphite-500">
                      <span><Icon name="clock" size={11} className="inline -mt-0.5 mr-1" />{n.time}</span>
                      {n.action && (
                        <button className="font-medium text-navy-900 dark:text-graphite-100 hover:underline">
                          {n.action} →
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
