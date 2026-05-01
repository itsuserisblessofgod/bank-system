import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountService } from '../services/accountService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Money, Badge, CopyChip, EmptyState, Field, Select,
  Alert, ProgressBar,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';
import { Sparkline } from '../components/charts/Charts.jsx';

const TYPE = {
  SAVINGS:  { label: 'Savings', tone: 'navy', apr: '4.10% APY', desc: 'High-yield savings' },
  CHECKING: { label: 'Checking', tone: 'info', apr: 'No monthly fee', desc: 'Daily transactions' },
  PREMIUM:  { label: 'Premium', tone: 'gold', apr: 'Concierge banking', desc: 'White-glove service' },
};

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [creating, setCreating] = useState('SAVINGS');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const reload = () => accountService.myAccounts().then(setAccounts);
  useEffect(() => { reload(); }, []);

  const open = async () => {
    setError(null); setMessage(null);
    try {
      await accountService.create(creating);
      setMessage(`${TYPE[creating].label} account opened.`);
      reload();
    } catch (ex) { setError(ex.response?.data?.message || 'Account creation failed.'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Accounts"
        title="All accounts"
        subtitle="Manage savings, checking, and premium accounts. Each account carries its own ledger and limits."
        actions={
          <>
            <Link to="/transfer" className="btn btn-primary"><Icon name="transfer" size={16} />Transfer</Link>
          </>
        }
      />

      {/* Open account */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <div className="section-title">Open new account</div>
            <h3 className="text-base font-semibold text-navy-900 dark:text-graphite-50 mt-1">Add an account to your portfolio</h3>
            <p className="text-sm text-graphite-500 mt-0.5">Provisioned in seconds with KYC carried over.</p>
          </div>
          <div className="flex items-end gap-2">
            <Field label="Type" className="w-56">
              <Select value={creating} onChange={(e) => setCreating(e.target.value)}>
                {Object.entries(TYPE).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.apr}</option>)}
              </Select>
            </Field>
            <Button onClick={open} leftIcon="plus">Open</Button>
          </div>
        </div>
        {message && <Alert tone="success" className="mt-4">{message}</Alert>}
        {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
      </Card>

      {accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon="bank"
            title="You have no accounts yet"
            description="Open your first account above to begin transacting."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((a, i) => {
            const cfg = TYPE[a.accountType] || { label: a.accountType, tone: 'neutral', apr: '', desc: '' };
            const dailyUsage = Math.min(100, Math.round((Number(a.balance) / Math.max(1, Number(a.dailyLimit))) * 18 + i * 7));
            return (
              <Card key={a.id} flush>
                <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={cfg.tone}>{cfg.label}</Badge>
                      <Badge tone="neutral">USD</Badge>
                    </div>
                    <div className="mt-3 font-mono text-sm text-graphite-500">{a.accountNumber}</div>
                    <div className="mt-1 text-xs text-graphite-500">{cfg.desc} · {cfg.apr}</div>
                  </div>
                  <div className="text-right">
                    <div className="kpi-label">Available</div>
                    <div className="kpi-value num mt-0.5"><Money value={a.balance} /></div>
                    <div className="mt-2 flex justify-end">
                      <Sparkline
                        data={[12, 14, 12, 16, 18, 17, 20, 22, 24, 26, 25, 28].map((v) => v + i * 3)}
                        color="#243e68"
                        className="w-28 h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3">
                      <div className="text-[11px] uppercase tracking-wider text-graphite-500">Daily limit</div>
                      <div className="text-sm font-medium num text-navy-900 dark:text-graphite-100 mt-0.5">
                        <Money value={a.dailyLimit} />
                      </div>
                    </div>
                    <div className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3">
                      <div className="text-[11px] uppercase tracking-wider text-graphite-500">Status</div>
                      <div className="mt-1.5"><Badge tone="success" dot>Active</Badge></div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={dailyUsage} label="Daily usage" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <CopyChip value={a.id} />
                    <div className="flex items-center gap-2">
                      <Link to="/transactions" className="btn btn-secondary btn-sm" title="View ledger">
                        <Icon name="receipt" size={14} /> Ledger
                      </Link>
                      <Link to="/transfer" className="btn btn-primary btn-sm">
                        <Icon name="transfer" size={14} /> Transfer
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
