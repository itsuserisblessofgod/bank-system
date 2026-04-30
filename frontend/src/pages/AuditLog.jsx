import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, Tabs, Input, EmptyState, CopyChip, Money,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

export default function AuditLog() {
  const [audit, setAudit] = useState([]);
  const [search, setSearch] = useState('');
  const [decision, setDecision] = useState('ALL');

  useEffect(() => { adminService.fraudAuditLog().then(setAudit).catch(() => {}); }, []);

  const stats = useMemo(() => {
    const blocked = audit.filter((a) => a.decision === 'BLOCKED').length;
    const allowed = audit.filter((a) => a.decision !== 'BLOCKED').length;
    return { total: audit.length, blocked, allowed };
  }, [audit]);

  const filtered = audit
    .filter((a) => decision === 'ALL' || a.decision === decision)
    .filter((a) => {
      const q = search.trim().toLowerCase();
      return !q || [a.transactionId, a.ruleTriggered, a.details].some((v) => v?.toLowerCase().includes(q));
    });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Administration' }, { label: 'Audit log' }]}
        eyebrow="Compliance"
        title="Immutable audit log"
        subtitle="A tamper-evident record of every decision made by the fraud engine, retained per regulatory schedule."
        actions={
          <>
            <Button variant="secondary" leftIcon="download">Export</Button>
            <Button variant="ghost" leftIcon="external">Open in SIEM</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="kpi-label">Total events</div>
          <div className="kpi-value mt-1 num">{stats.total}</div>
        </Card>
        <Card>
          <div className="kpi-label">Blocked</div>
          <div className="kpi-value mt-1 num text-danger-700">{stats.blocked}</div>
        </Card>
        <Card>
          <div className="kpi-label">Allowed</div>
          <div className="kpi-value mt-1 num text-success-700">{stats.allowed}</div>
        </Card>
      </div>

      <Card flush>
        <div className="px-6 pt-5 pb-4 flex flex-wrap items-center gap-3">
          <Tabs value={decision} onChange={setDecision} items={[
            { value: 'ALL', label: 'All', count: stats.total },
            { value: 'BLOCKED', label: 'Blocked', count: stats.blocked },
            { value: 'ALLOWED', label: 'Allowed', count: stats.allowed },
          ]} />
          <div className="ml-auto flex-1 max-w-sm">
            <Input leftIcon="search" placeholder="Search by transaction, rule, detail…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="!pl-6">Timestamp</th>
                <th>Transaction</th>
                <th>Rule</th>
                <th>Decision</th>
                <th className="!pr-6">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="!pl-6 font-mono text-xs text-graphite-500">{new Date(a.createdAt).toLocaleString()}</td>
                  <td><CopyChip value={a.transactionId} /></td>
                  <td><Badge tone="navy">{a.ruleTriggered}</Badge></td>
                  <td>
                    <Badge tone={a.decision === 'BLOCKED' ? 'danger' : 'success'} dot>
                      {a.decision}
                    </Badge>
                  </td>
                  <td className="!pr-6 text-sm text-graphite-700 max-w-lg truncate" title={a.details}>{a.details}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={5}>
                  <EmptyState icon="audit" title="No audit events"
                    description="As the engine evaluates transactions, decisions will appear here in chronological order." />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-graphite-200 dark:border-graphite-800 flex items-center gap-2 text-[11px] text-graphite-500 bg-graphite-50/40 dark:bg-graphite-900/40">
          <Icon name="lock" size={12} />
          <span>Hash-chained · WORM storage · 7-year retention</span>
        </div>
      </Card>
    </div>
  );
}
