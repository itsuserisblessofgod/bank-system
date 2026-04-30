import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, KpiTile, Money, Tabs, Input,
  Alert, EmptyState, StatusPill, CopyChip,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

export default function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [audit, setAudit] = useState([]);
  const [message, setMessage] = useState(null);
  const [tab, setTab] = useState('alerts');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => {
    adminService.fraudAlerts().then(setAlerts).catch(() => {});
    adminService.fraudAuditLog().then(setAudit).catch(() => {});
  };
  useEffect(() => { reload(); }, []);

  const reload2 = async () => {
    setBusy(true);
    try {
      const rules = await adminService.reloadRules();
      setMessage(`Hot-reload complete · ${rules.length} rule${rules.length === 1 ? '' : 's'} active: ${rules.join(', ')}.`);
    } finally { setBusy(false); }
  };

  const stats = useMemo(() => {
    const blocked = audit.filter((a) => a.decision === 'BLOCKED').length;
    const passed = audit.filter((a) => a.decision !== 'BLOCKED').length;
    const sumBlocked = alerts.reduce((s, a) => s + Number(a.amount || 0), 0);
    const blockRate = audit.length ? Math.round((blocked / audit.length) * 100) : 0;
    return { blocked, passed, sumBlocked, blockRate };
  }, [alerts, audit]);

  const filteredAlerts = alerts.filter((tx) => {
    const q = search.trim().toLowerCase();
    return !q || tx.id?.toLowerCase().includes(q) || tx.fraudReason?.toLowerCase().includes(q) || tx.transactionType?.toLowerCase().includes(q);
  });
  const filteredAudit = audit.filter((a) => {
    const q = search.trim().toLowerCase();
    return !q || a.transactionId?.toLowerCase().includes(q) || a.ruleTriggered?.toLowerCase().includes(q) || a.details?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Administration' }, { label: 'Fraud & security' }]}
        eyebrow="Security Operations"
        title="Fraud surveillance & rules engine"
        subtitle="Real-time perimeter for transactional risk. Decisions are immutable and replayable."
        actions={
          <>
            <Button variant="secondary" leftIcon="download">Export findings</Button>
            <Button leftIcon="refresh" loading={busy} onClick={reload2}>Hot-reload rules</Button>
          </>
        }
      />

      {message && <Alert tone="success" onClose={() => setMessage(null)}>{message}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile label="Open alerts" value={alerts.length} icon="warning" deltaTone="warning"
          delta={alerts.length > 0 ? 'Action required' : 'All clear'} />
        <KpiTile label="Blocked decisions" value={stats.blocked} icon="shieldCheck" footer={`${stats.blockRate}% block rate`} />
        <KpiTile label="Allowed decisions" value={stats.passed} icon="check" deltaTone="success" />
        <KpiTile label="Value blocked" value={<Money value={stats.sumBlocked} compact />} icon="lock" footer="Across flagged transactions" />
      </div>

      <Card flush>
        <div className="px-6 pt-5 pb-4 flex flex-wrap items-center gap-3">
          <Tabs value={tab} onChange={setTab} items={[
            { value: 'alerts', label: 'Active alerts', count: alerts.length, icon: 'fraud' },
            { value: 'audit', label: 'Decision log', count: audit.length, icon: 'audit' },
          ]} />
          <div className="ml-auto flex-1 max-w-sm">
            <Input leftIcon="search" placeholder="Filter by transaction, rule, or detail…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {tab === 'alerts' && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!pl-6">Transaction</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Rule trigger</th>
                  <th>Status</th>
                  <th className="!pr-6">Detected</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((tx) => (
                  <tr key={tx.id} className="!bg-danger-50/40 hover:!bg-danger-50/70">
                    <td className="!pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-danger-100 text-danger-700 flex items-center justify-center ring-1 ring-danger-200">
                          <Icon name="warning" size={15} />
                        </div>
                        <CopyChip value={tx.id} />
                      </div>
                    </td>
                    <td><Badge tone="navy">{tx.transactionType}</Badge></td>
                    <td className="num font-semibold text-danger-700"><Money value={tx.amount} /></td>
                    <td className="text-sm text-graphite-700 max-w-md truncate" title={tx.fraudReason}>{tx.fraudReason}</td>
                    <td><StatusPill status={tx.status} /></td>
                    <td className="!pr-6 text-xs text-graphite-500">
                      {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
                {!filteredAlerts.length && (
                  <tr><td colSpan={6}>
                    <EmptyState icon="shieldCheck" title="No active fraud alerts"
                      description="The surveillance engine is running. Anomalies will surface here in real time." />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!pl-6">Time</th>
                  <th>Transaction</th>
                  <th>Rule</th>
                  <th>Decision</th>
                  <th className="!pr-6">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((a) => (
                  <tr key={a.id}>
                    <td className="!pl-6 text-xs text-graphite-500">{new Date(a.createdAt).toLocaleString()}</td>
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
                {!filteredAudit.length && (
                  <tr><td colSpan={5}><EmptyState icon="audit" title="No decisions yet" /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['LARGE_AMOUNT', 'Blocks transactions above $10,000 unless explicitly approved.'],
          ['VELOCITY', 'Flags > 5 outbound transactions in a 60-second window.'],
          ['SANCTIONED_COUNTRY', 'Cross-references counterparty country against OFAC, EU, UN lists.'],
        ].map(([k, v]) => (
          <Card key={k}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center ring-1 ring-navy-100">
                <Icon name="shield" size={17} />
              </div>
              <div className="text-xs uppercase tracking-wider text-graphite-500">Rule</div>
            </div>
            <h4 className="mt-3 text-sm font-semibold text-navy-900 font-mono">{k}</h4>
            <p className="text-sm text-graphite-600 mt-1.5 leading-relaxed">{v}</p>
            <div className="mt-3"><Badge tone="success" dot>Active</Badge></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
