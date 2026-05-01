import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountService } from '../services/accountService.js';
import { transactionService } from '../services/transactionService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Button, Card, CardHeader, KpiTile, Money, Badge, StatusPill,
  Alert, EmptyState, Field, Input, Select, CopyChip,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';
import { Sparkline, DonutChart } from '../components/charts/Charts.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const TYPE_LABEL = { SAVINGS: 'Savings', CHECKING: 'Checking', PREMIUM: 'Premium' };
const TYPE_GRADIENT = {
  SAVINGS: 'bg-gradient-card-platinum',
  CHECKING: 'bg-gradient-card-obsidian',
  PREMIUM: 'bg-gradient-card-gold text-navy-900',
};

function maskAccount(num) {
  if (!num) return '—';
  return num.replace(/(\w{4})/g, '$1 ').trim();
}

export default function Dashboard() {
  const { auth } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [creating, setCreating] = useState('SAVINGS');
  const [opAccount, setOpAccount] = useState('');
  const [opAmount, setOpAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loadingAcc, setLoadingAcc] = useState(true);

  const reload = async () => {
    setLoadingAcc(true);
    try {
      const [acc, recent] = await Promise.all([
        accountService.myAccounts(),
        transactionService.getRecent(10),
      ]);
      setAccounts(acc);
      setActivity(recent);
    } catch {
      setAccounts([]);
      setActivity([]);
    } finally {
      setLoadingAcc(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const totals = useMemo(() => {
    const total = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const limit = accounts.reduce((sum, account) => sum + Number(account.dailyLimit || 0), 0);
    return { total, limit, count: accounts.length };
  }, [accounts]);

  const breakdown = accounts.length
    ? accounts.map((account, index) => ({
        label: TYPE_LABEL[account.accountType] || account.accountType,
        value: Number(account.balance) || 0,
        color: ['#0d1b34', '#243e68', '#b88a2c', '#5f85b6'][index % 4],
      }))
    : [{ label: 'No accounts', value: 1, color: '#dde1e9' }];

  const ownedAccountIds = useMemo(() => new Set(accounts.map((account) => account.id)), [accounts]);

  const counterpartyLabel = (tx) => {
    if (tx.transactionType === 'TRANSFER') {
      const counterpartyId = ownedAccountIds.has(tx.senderAccountId) ? tx.receiverAccountId : tx.senderAccountId;
      return counterpartyId ? `Account · ${counterpartyId.slice(0, 8)}…` : 'Internal transfer';
    }
    if (tx.transactionType === 'DEPOSIT') return 'Inbound funding';
    if (tx.transactionType === 'WITHDRAWAL') return 'Cash withdrawal';
    return '—';
  };

  const createAccount = async () => {
    setError(null);
    setMessage(null);
    try {
      await accountService.create(creating);
      setMessage(`${TYPE_LABEL[creating]} account opened.`);
      await reload();
    } catch (ex) {
      setError(ex.response?.data?.message || 'Account creation failed.');
    }
  };

  const doOp = async (op) => {
    setError(null);
    setMessage(null);
    if (!opAccount || !opAmount) {
      setError('Select an account and amount.');
      return;
    }
    try {
      const fn = op === 'deposit' ? transactionService.deposit : transactionService.withdraw;
      const tx = await fn(opAccount, opAmount);
      if (tx.status === 'BLOCKED') {
        setError(`Blocked by fraud rules: ${tx.fraudReason}`);
      } else {
        setMessage(`${op === 'deposit' ? 'Deposit' : 'Withdrawal'} of $${opAmount} ${tx.status?.toLowerCase()}.`);
      }
      await reload();
    } catch (ex) {
      setError(ex.response?.data?.message || 'Operation failed.');
    }
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();
  const firstName = auth?.fullName?.split(' ')[0] || auth?.email?.split('@')[0] || 'Client';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Treasury Overview"
        title={`${greeting}, ${firstName}.`}
        subtitle="A consolidated view of your portfolio, liquidity, and recent activity across all entities."
        actions={<Link to="/transfer" className="btn-primary"><Icon name="transfer" size={16} />New transfer</Link>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile
          label="Total liquidity"
          value={<Money value={totals.total} />}
          icon="wallet"
          footer={`${totals.count} active account${totals.count === 1 ? '' : 's'}`}
        />
        <KpiTile
          label="Daily transfer limit"
          value={<Money value={totals.limit} compact />}
          icon="shieldCheck"
          footer="Aggregate cap across accounts"
        />
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-graphite-500">Spending analytics</div>
          <div className="mt-2 text-sm text-graphite-600">Spending analytics coming soon.</div>
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] uppercase tracking-wider text-graphite-500">Pending approvals</div>
          <div className="mt-2 text-sm text-graphite-600">0 pending approvals.</div>
        </Card>
      </div>

      <Card>
        <CardHeader eyebrow="Portfolio mix" title="Current account distribution" subtitle="Balance allocation across your live accounts." />
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
          {breakdown.map((item) => {
            const pct = totals.total > 0 ? Math.round((item.value / totals.total) * 100) : 0;
            return (
              <li key={item.label} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-graphite-700">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </span>
                <span className="num text-navy-900 font-medium">
                  <Money value={item.value} compact /> · <span className="text-graphite-500">{pct}%</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-graphite-50">Your accounts</h2>
            <p className="page-subtitle">Tap any card for full statement history.</p>
          </div>
          <Link to="/accounts" className="btn btn-ghost btn-sm">View all<Icon name="arrowRight" size={14} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account, index) => (
            <Link
              to="/accounts"
              key={account.id}
              className={`relative group rounded-2xl p-5 text-white ${TYPE_GRADIENT[account.accountType] || 'bg-gradient-navy'} shadow-elev-3 ring-1 ring-black/10 overflow-hidden transition-transform hover:-translate-y-0.5`}
            >
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(120%_120%_at_120%_0%,rgba(255,255,255,0.5),transparent_60%)]" />
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] opacity-80">{TYPE_LABEL[account.accountType] || account.accountType} · USD</span>
                <Icon name="bank" size={18} className="opacity-90" />
              </div>
              <div className="relative mt-6 font-mono text-sm tracking-wider opacity-85">
                {maskAccount(account.accountNumber)}
              </div>
              <div className="relative mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider opacity-70">Available</div>
                  <div className="font-display text-2xl font-semibold mt-0.5 num"><Money value={account.balance} /></div>
                </div>
                <Sparkline
                  data={[20, 24, 22, 28, 32, 30, 36, 34, 40, 44, 42, 48].map((value) => value + index * 2)}
                  color="rgba(255,255,255,0.85)"
                  className="w-24 h-9 opacity-90"
                />
              </div>
              <div className="relative mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] opacity-80">
                <span>Daily limit · <span className="font-mono num"><Money value={account.dailyLimit} compact /></span></span>
                <CopyChip value={account.id} className="bg-white/10 text-white hover:bg-white/20" />
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
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {TYPE_LABEL[account.accountType]} · {account.accountNumber}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Amount (USD)">
                <Input
                  leftIcon="coin"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={opAmount}
                  onChange={(e) => setOpAmount(e.target.value)}
                />
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
              subtitle="Across all of your live accounts."
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
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isOut ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600'}`}>
                            <Icon name={isOut ? 'arrowUpRight' : 'arrowDownRight'} size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-navy-900 dark:text-graphite-100">
                              {counterpartyLabel(tx)}
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
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon="receipt"
                        title="No recent activity"
                        description="Once funds move through your accounts, transactions will appear here in real time."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
