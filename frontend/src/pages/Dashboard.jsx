import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountService } from '../services/accountService.js';
import { transactionService } from '../services/transactionService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Button, Card, CardHeader, KpiTile, Money, Badge, StatusPill,
  Segmented, Alert, EmptyState, Field, Input, Select, CopyChip, Avatar,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';
import { AreaChart, Sparkline, DonutChart } from '../components/charts/Charts.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const TYPE_LABEL = { SAVINGS: 'Savings', CHECKING: 'Checking', PREMIUM: 'Premium' };
const TYPE_GRADIENT = {
  SAVINGS:  'bg-gradient-card-platinum',
  CHECKING: 'bg-gradient-card-obsidian',
  PREMIUM:  'bg-gradient-card-gold text-navy-900',
};

function maskAccount(num) {
  if (!num) return '•••• •••• •••• ••••';
  return num.replace(/(\w{4})/g, '$1 ').trim();
}

// Synthetic 12-month cashflow used in the chart (UI showcase — backend doesn't expose this yet)
const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const INFLOW =  [12500, 14200, 13800, 15900, 16400, 17800, 19500, 21000, 18800, 20400, 23100, 24800];
const OUTFLOW = [ 9200, 11400, 10800, 12600, 12100, 13500, 14800, 16200, 14100, 15700, 17400, 18200];

export default function Dashboard() {
  const { auth } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [creating, setCreating] = useState('SAVINGS');
  const [opAccount, setOpAccount] = useState('');
  const [opAmount, setOpAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('12M');
  const [loadingAcc, setLoadingAcc] = useState(true);

  const reload = async () => {
    setLoadingAcc(true);
    try {
      const acc = await accountService.myAccounts();
      setAccounts(acc);
      // Pull the latest 5 transactions across the first account, if present
      if (acc[0]) {
        const page = await transactionService.history(acc[0].id, 0, 5);
        setActivity(page.content || []);
      } else setActivity([]);
    } catch {
      // ignore — UI shows empty state
    } finally {
      setLoadingAcc(false);
    }
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);

  const totals = useMemo(() => {
    const total = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    const limit = accounts.reduce((s, a) => s + Number(a.dailyLimit || 0), 0);
    return { total, limit, count: accounts.length };
  }, [accounts]);

  const breakdown = accounts.length
    ? accounts.map((a, i) => ({
        label: TYPE_LABEL[a.accountType] || a.accountType,
        value: Number(a.balance) || 0,
        color: ['#0d1b34', '#243e68', '#b88a2c', '#5f85b6'][i % 4],
      }))
    : [{ label: 'No accounts', value: 1, color: '#dde1e9' }];

  const createAccount = async () => {
    setError(null); setMessage(null);
    try {
      await accountService.create(creating);
      setMessage(`${TYPE_LABEL[creating]} account opened.`);
      reload();
    } catch (ex) { setError(ex.response?.data?.message || 'Account creation failed.'); }
  };

  const doOp = async (op) => {
    setError(null); setMessage(null);
    if (!opAccount || !opAmount) { setError('Select an account and amount.'); return; }
    try {
      const fn = op === 'deposit' ? transactionService.deposit : transactionService.withdraw;
      const tx = await fn(opAccount, opAmount);
      if (tx.status === 'BLOCKED') setError(`Blocked by fraud rules: ${tx.fraudReason}`);
      else setMessage(`${op === 'deposit' ? 'Deposit' : 'Withdrawal'} of $${opAmount} ${tx.status?.toLowerCase()}.`);
      reload();
    } catch (ex) { setError(ex.response?.data?.message || 'Operation failed.'); }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();
  const firstName = auth?.fullName?.split(' ')[0] || auth?.email?.split('@')[0] || 'Client';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Treasury Overview"
        title={`${greeting}, ${firstName}.`}
        subtitle="A consolidated view of your portfolio, liquidity, and recent activity across all entities."
        actions={
          <>
            <Button variant="secondary" leftIcon="download">Statement</Button>
            <Link to="/transfer" className="btn-primary"><Icon name="transfer" size={16} />New transfer</Link>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile
          label="Total liquidity"
          value={<Money value={totals.total} />}
          icon="wallet"
          delta="+8.4% MoM"
          deltaTone="success"
          footer={`${totals.count} active account${totals.count === 1 ? '' : 's'}`}
        />
        <KpiTile
          label="Net inflow · 30d"
          value={<Money value={INFLOW.at(-1) - OUTFLOW.at(-1)} />}
          icon="trendUp"
          delta="+12.1%"
          deltaTone="success"
          footer="vs prior month"
        />
        <KpiTile
          label="Daily transfer limit"
          value={<Money value={totals.limit} compact />}
          icon="shieldCheck"
          footer="Aggregate cap across accounts"
        />
        <KpiTile
          label="Pending approvals"
          value={<span>02</span>}
          icon="clock"
          delta="2 awaiting"
          deltaTone="warning"
          footer="Wire transfers in queue"
        />
      </div>

      {/* Chart + breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            eyebrow="Cash Flow"
            title="Inflows vs Outflows"
            subtitle="Consolidated across all accounts and currencies (USD equivalent)."
            action={
              <Segmented
                value={range}
                onChange={setRange}
                items={[
                  { value: '7D', label: '7D' },
                  { value: '30D', label: '30D' },
                  { value: '90D', label: '90D' },
                  { value: '12M', label: '12M' },
                ]}
              />
            }
          />
          <div className="mt-4 flex items-center gap-5 text-xs">
            <span className="inline-flex items-center gap-2 text-graphite-600">
              <span className="h-2 w-2 rounded-full bg-navy-900" /> Inflow
              <span className="num font-semibold text-navy-900 ml-1"><Money value={INFLOW.reduce((a, b) => a + b, 0)} compact /></span>
            </span>
            <span className="inline-flex items-center gap-2 text-graphite-600">
              <span className="h-2 w-2 rounded-full bg-gold-500" /> Outflow
              <span className="num font-semibold text-navy-900 ml-1"><Money value={OUTFLOW.reduce((a, b) => a + b, 0)} compact /></span>
            </span>
          </div>
          <div className="mt-4 -mx-2">
            <AreaChart
              series={[
                { data: INFLOW, color: '#243e68' },
                { data: OUTFLOW, color: '#b88a2c' },
              ]}
              labels={MONTHS}
              height={260}
              formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Portfolio Allocation"
            title="By account type"
            subtitle="Real-time balance distribution."
          />
          <div className="mt-6 flex items-center justify-center">
            <DonutChart
              segments={breakdown}
              size={188}
              thickness={26}
              centerValue={<Money value={totals.total} compact />}
              centerLabel="Total"
            />
          </div>
          <ul className="mt-6 space-y-2.5">
            {breakdown.map((b) => {
              const pct = totals.total > 0 ? Math.round((b.value / totals.total) * 100) : 0;
              return (
                <li key={b.label} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-graphite-700">
                    <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                    {b.label}
                  </span>
                  <span className="num text-navy-900 font-medium">
                    <Money value={b.value} compact /> · <span className="text-graphite-500">{pct}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Accounts strip */}
      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-graphite-50">Your accounts</h2>
            <p className="page-subtitle">Tap any card for full statement history.</p>
          </div>
          <Link to="/accounts" className="btn btn-ghost btn-sm" >View all<Icon name="arrowRight" size={14} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((a, i) => (
            <Link
              to="/accounts"
              key={a.id}
              className={`relative group rounded-2xl p-5 text-white ${TYPE_GRADIENT[a.accountType] || 'bg-gradient-navy'} shadow-elev-3 ring-1 ring-black/10 overflow-hidden transition-transform hover:-translate-y-0.5`}
            >
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(120%_120%_at_120%_0%,rgba(255,255,255,0.5),transparent_60%)]" />
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] opacity-80">{TYPE_LABEL[a.accountType] || a.accountType} · USD</span>
                <Icon name="bank" size={18} className="opacity-90" />
              </div>
              <div className="relative mt-6 font-mono text-sm tracking-wider opacity-85">
                {maskAccount(a.accountNumber)}
              </div>
              <div className="relative mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider opacity-70">Available</div>
                  <div className="font-display text-2xl font-semibold mt-0.5 num"><Money value={a.balance} /></div>
                </div>
                <Sparkline
                  data={[20, 24, 22, 28, 32, 30, 36, 34, 40, 44, 42, 48].map((v) => v + i * 2)}
                  color="rgba(255,255,255,0.85)"
                  className="w-24 h-9 opacity-90"
                />
              </div>
              <div className="relative mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] opacity-80">
                <span>Daily limit · <span className="font-mono num"><Money value={a.dailyLimit} compact /></span></span>
                <CopyChip value={a.id} className="bg-white/10 text-white hover:bg-white/20" />
              </div>
            </Link>
          ))}

          {accounts.length === 0 && !loadingAcc && (
            <Card className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon="bank"
                title="No accounts yet"
                description="Open your first account to begin transacting. Settlement is instant for internal accounts."
                action={<Button leftIcon="plus" onClick={createAccount}>Open {TYPE_LABEL[creating]} account</Button>}
              />
            </Card>
          )}
        </div>
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader eyebrow="Quick Actions" title="Open new account" subtitle="Provisioned and KYC-verified instantly." />
          {message && <Alert tone="success" className="mt-4">{message}</Alert>}
          {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Field label="Account type">
              <Select value={creating} onChange={(e) => setCreating(e.target.value)}>
                <option value="SAVINGS">Savings · 4.10% APY</option>
                <option value="CHECKING">Checking · No fees</option>
                <option value="PREMIUM">Premium · Concierge banking</option>
              </Select>
            </Field>
            <Button onClick={createAccount} leftIcon="plus">Open account</Button>
          </div>

          <div className="mt-6 pt-5 border-t border-graphite-200 dark:border-graphite-800">
            <h4 className="text-sm font-semibold text-navy-900 dark:text-graphite-100 mb-3">Quick deposit / withdraw</h4>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Account">
                <Select value={opAccount} onChange={(e) => setOpAccount(e.target.value)}>
                  <option value="">Select account…</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{TYPE_LABEL[a.accountType]} · {a.accountNumber}</option>)}
                </Select>
              </Field>
              <Field label="Amount (USD)">
                <Input leftIcon="coin" type="number" min="0.01" step="0.01" placeholder="0.00"
                  value={opAmount} onChange={(e) => setOpAmount(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => doOp('deposit')} leftIcon="plus">Deposit</Button>
                <Button onClick={() => doOp('withdraw')} variant="secondary" leftIcon="minus">Withdraw</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2" flush>
          <div className="px-6 pt-6">
            <CardHeader
              eyebrow="Recent Activity"
              title="Latest transactions"
              subtitle="Across your default account."
              action={<Link to="/transactions" className="btn btn-ghost btn-sm">All transactions <Icon name="arrowRight" size={14} /></Link>}
            />
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!pl-6">Counterparty</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="!pr-6">Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((tx) => {
                  const isOut = tx.transactionType === 'WITHDRAWAL' || tx.transactionType === 'TRANSFER';
                  return (
                    <tr key={tx.id}>
                      <td className="!pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center
                            ${isOut ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600'}`}>
                            <Icon name={isOut ? 'arrowUpRight' : 'arrowDownRight'} size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-navy-900 dark:text-graphite-100 capitalize">
                              {tx.transactionType?.toLowerCase() || '—'}
                            </div>
                            <div className="text-[11px] font-mono text-graphite-500 truncate">{tx.id?.slice(0, 12)}…</div>
                          </div>
                        </div>
                      </td>
                      <td><Badge tone="neutral">{tx.transactionType}</Badge></td>
                      <td className="font-medium num">
                        <span className={isOut ? 'text-danger-700' : 'text-success-700'}>
                          {isOut ? '−' : '+'}<Money value={tx.amount} />
                        </span>
                      </td>
                      <td><StatusPill status={tx.status} /></td>
                      <td className="!pr-6 text-graphite-500 text-xs">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
                {!activity.length && (
                  <tr><td colSpan={5}>
                    <EmptyState
                      icon="receipt"
                      title="No recent activity"
                      description="Once funds move through this account, transactions will appear here in real time."
                    />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Security panel */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center ring-1 ring-success-100">
              <Icon name="shieldCheck" size={22} />
            </div>
            <div>
              <div className="section-title">Security Posture</div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-graphite-50 mt-1">All controls verified</h3>
              <p className="text-sm text-graphite-500 mt-1">Last reviewed {new Date().toLocaleDateString()}. No anomalies detected on this device.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            {[
              ['Two-factor auth', 'Enabled', 'success'],
              ['Device trust', '3 devices', 'navy'],
              ['Sanctions check', 'Cleared', 'success'],
              ['Compliance', 'Up to date', 'success'],
            ].map(([k, v, t]) => (
              <div key={k} className="rounded-xl bg-graphite-50 dark:bg-graphite-900/40 ring-1 ring-graphite-200 dark:ring-graphite-800 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wider text-graphite-500">{k}</div>
                <div className="mt-1.5"><Badge tone={t} dot>{v}</Badge></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
