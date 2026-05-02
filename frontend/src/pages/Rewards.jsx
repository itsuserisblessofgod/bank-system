import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, Money, Field, Input, Select,
  Alert, EmptyState, ProgressBar,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';
import { rewardsService } from '../services/rewardsService.js';
import { accountService } from '../services/accountService.js';

const TIER_TONE = { SILVER: 'neutral', GOLD: 'gold', PLATINUM: 'navy' };
const NEXT_TIER = { SILVER: 'Gold', GOLD: 'Platinum', PLATINUM: null };

function formatPoints(n) {
  return new Intl.NumberFormat('en-US').format(n || 0);
}

export default function Rewards() {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemPoints, setRedeemPoints] = useState(100);
  const [redeemAccount, setRedeemAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const reload = async () => {
    setError(null);
    try {
      const [s, a] = await Promise.all([
        rewardsService.getMyRewards(),
        accountService.myAccounts(),
      ]);
      setSummary(s);
      setAccounts(a);
      if (!redeemAccount && a.length > 0) setRedeemAccount(a[0].id);
    } catch (ex) {
      setError(ex.response?.data?.message || 'Failed to load rewards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const tier = summary?.cardTier || 'SILVER';
  const next = NEXT_TIER[tier];
  const tierProgressPct = useMemo(() => {
    if (!summary) return 0;
    if (tier === 'PLATINUM') return 100;
    const totalPoints = summary.totalPoints || 0;
    const next_ = totalPoints + (summary.pointsToNextTier || 0);
    if (next_ === 0) return 0;
    return Math.min(100, (totalPoints / next_) * 100);
  }, [summary, tier]);

  const submit = async () => {
    if (!redeemAccount) {
      setError('Select an account first.');
      return;
    }
    if (redeemPoints <= 0) {
      setError('Enter a positive amount of points.');
      return;
    }
    setSubmitting(true); setError(null); setMessage(null);
    try {
      const res = await rewardsService.redeem(redeemPoints, redeemAccount);
      setMessage(`Redeemed ${formatPoints(res.redeemedPoints)} points · credited $${Number(res.creditedAmount).toFixed(2)}.`);
      reload();
    } catch (ex) {
      setError(ex.response?.data?.message || 'Redeem failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Loyalty"
        title="Rewards & Cashback"
        subtitle="Earn points on every transaction. Redeem to any account at 1 point = $1."
      />

      {loading && (
        <Card><EmptyState icon="star" title="Loading…" description="Fetching your rewards summary." /></Card>
      )}

      {!loading && summary && (
        <>
          {/* Tier banner */}
          <Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-gradient-navy text-white p-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-300/10" />
                <div className="absolute right-10 top-16 h-24 w-24 rounded-full bg-gold-300/5" />
                <div className="flex items-center gap-2">
                  <Badge tone={TIER_TONE[tier]} icon="star">{tier} CARD</Badge>
                  <Badge tone="success" dot>{Number(summary.cashbackRate).toFixed(1)}% cashback</Badge>
                </div>
                <div className="mt-6">
                  <div className="text-[11px] uppercase tracking-wider text-graphite-300">Points balance</div>
                  <div className="font-display text-4xl font-semibold mt-1 num">{formatPoints(summary.totalPoints)}</div>
                  <div className="text-xs text-graphite-300 mt-1">
                    Lifetime earned · <span className="num text-white">{formatPoints(Number(summary.totalEarned))}</span> points
                  </div>
                </div>
                <div className="mt-6">
                  {next ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-graphite-300 mb-1.5">
                        <span>Progress to {next}</span>
                        <span className="num text-white">{formatPoints(summary.pointsToNextTier)} points to go</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="bg-gold-300 h-full rounded-full transition-all duration-500"
                             style={{ width: `${tierProgressPct}%` }} />
                      </div>
                    </>
                  ) : (
                    <Badge tone="gold" icon="star">Top tier — Platinum perks unlocked</Badge>
                  )}
                </div>
              </div>

              <div>
                <CardHeader eyebrow="How it works" title="Earn on every transaction"
                            subtitle="Cashback is awarded automatically after each successful deposit, withdrawal, or transfer." />
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-graphite-600 dark:text-graphite-300">Silver</span>
                    <Badge tone="neutral">1.0% cashback · 0 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-graphite-600 dark:text-graphite-300">Gold</span>
                    <Badge tone="gold">1.5% cashback · 10,000 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-graphite-600 dark:text-graphite-300">Platinum</span>
                    <Badge tone="navy">2.0% cashback · 50,000 pts</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Redeem */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-1">
              <CardHeader eyebrow="Redeem" title="Convert points to cash" subtitle="1 point = $1 credited to the selected account." />
              <div className="mt-4 space-y-3">
                <Field label="Points to redeem">
                  <Input type="number" min="1" step="1" leftIcon="star"
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Number(e.target.value))} />
                </Field>
                <Field label="Credit to account">
                  <Select value={redeemAccount} onChange={(e) => setRedeemAccount(e.target.value)}>
                    {accounts.length === 0 && <option value="">No accounts available</option>}
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.accountType} · {a.accountNumber}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="rounded-xl bg-graphite-50 dark:bg-graphite-800/40 px-3.5 py-3 text-sm">
                  You will receive <span className="num font-semibold text-navy-900 dark:text-graphite-100">
                    <Money value={Math.max(0, redeemPoints)} />
                  </span>
                </div>
                <Button onClick={submit} loading={submitting} leftIcon="check" className="w-full">
                  Redeem
                </Button>
                {error && <Alert tone="danger">{error}</Alert>}
                {message && <Alert tone="success">{message}</Alert>}
              </div>
            </Card>

            {/* Recent activity */}
            <Card className="xl:col-span-2">
              <CardHeader eyebrow="Activity" title="Recent rewards" subtitle="Last 10 events on your loyalty account." />
              {summary.recentTransactions.length === 0 ? (
                <EmptyState icon="star" title="No activity yet"
                            description="Make a deposit, withdrawal, or transfer to start earning cashback." />
              ) : (
                <div className="mt-3 space-y-2">
                  {summary.recentTransactions.map((rt) => {
                    const earned = rt.type === 'EARNED';
                    return (
                      <div key={rt.id}
                           className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-4 py-3 flex items-center gap-4">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ring-1
                          ${earned ? 'bg-success-50 text-success-700 ring-success-100' : 'bg-danger-50 text-danger-700 ring-danger-100'}`}>
                          <Icon name={earned ? 'trendUp' : 'trendDown'} size={17} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-navy-900 dark:text-graphite-100 truncate">
                            {rt.description || (earned ? 'Cashback earned' : 'Points redeemed')}
                          </div>
                          <div className="text-xs text-graphite-500">{new Date(rt.createdAt).toLocaleString()}</div>
                        </div>
                        <div className={`num font-semibold ${earned ? 'text-success-700' : 'text-danger-700'}`}>
                          {earned ? '+' : '−'}{formatPoints(rt.points)} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {!loading && error && !summary && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
