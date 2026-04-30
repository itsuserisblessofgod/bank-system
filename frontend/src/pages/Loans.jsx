import { useMemo, useState } from 'react';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, Money, Field, Input, Select,
  KpiTile, ProgressBar, StatusPill, EmptyState, Alert,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';
import { ProgressArc, BarChart } from '../components/charts/Charts.jsx';

// Mock — backend does not expose loan endpoints.
const PRODUCTS = [
  { id: 'mort', label: 'Residential Mortgage', apr: '5.85%', term: 'Up to 30 yrs', desc: 'Owner-occupied & investment properties.' },
  { id: 'sec',  label: 'Securities-Backed Line', apr: '4.20%', term: 'Revolving', desc: 'Borrow against your investment portfolio.' },
  { id: 'biz',  label: 'Business Term Loan', apr: '7.10%', term: '12–84 months', desc: 'Working capital, expansion, equipment.' },
  { id: 'auto', label: 'Premium Auto', apr: '4.95%', term: '24–72 months', desc: 'Marque dealerships and direct purchase.' },
];

const MY_LOANS = [
  { id: 'L-77321', name: 'Manhattan Residence', kind: 'Mortgage', principal: 1850000, balance: 1620400, apr: 5.45, term: 360, paidMonths: 38, next: '2026-05-12' },
  { id: 'L-21908', name: 'Sterling Holdings — Series A line', kind: 'Securities-Backed', principal: 500000, balance: 122500, apr: 4.20, term: 0, paidMonths: 0, next: 'Revolving' },
];

function amortization(principal, aprPct, months) {
  if (!months) return [];
  const r = aprPct / 100 / 12;
  const m = principal * (r / (1 - Math.pow(1 + r, -months)));
  return Array.from({ length: 12 }, (_, i) => {
    const period = i + 1;
    const interest = principal * r;
    const principalPay = m - interest;
    principal = principal - principalPay;
    return { period, interest, principalPay, balance: Math.max(0, principal) };
  });
}

export default function Loans() {
  const [calc, setCalc] = useState({ principal: 250000, apr: 5.85, term: 240 });
  const monthly = useMemo(() => {
    const r = (calc.apr / 100) / 12;
    if (!r || !calc.term) return 0;
    return calc.principal * (r / (1 - Math.pow(1 + r, -calc.term)));
  }, [calc]);
  const totalPaid = monthly * calc.term;
  const totalInterest = totalPaid - calc.principal;

  const schedule = useMemo(() => amortization(calc.principal, calc.apr, calc.term), [calc]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Credit"
        title="Loans & Credit"
        subtitle="Originate, manage, and amortise your facilities — fully integrated with treasury and KYC."
        actions={<Button leftIcon="plus">Apply for credit</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile label="Outstanding principal" value={<Money value={MY_LOANS.reduce((s, l) => s + l.balance, 0)} compact />}
                 icon="loans" footer={`${MY_LOANS.length} active facilities`} />
        <KpiTile label="Weighted APR" value="5.21%" icon="trendUp" delta="−12 bps QoQ" deltaTone="success" />
        <KpiTile label="Next payment" value={<Money value={9485.30} />} icon="calendar" footer="Due May 12, 2026" />
        <KpiTile label="Available credit" value={<Money value={377500} compact />} icon="wallet" footer="Securities-backed line" />
      </div>

      {/* Active facilities */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {MY_LOANS.map((l) => {
          const pct = l.term ? Math.min(100, Math.round((l.paidMonths / l.term) * 100)) : 35;
          return (
            <Card key={l.id} flush>
              <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><Badge tone="navy">{l.kind}</Badge><Badge tone="neutral">{l.id}</Badge></div>
                  <h3 className="mt-2 text-base font-semibold text-navy-900 dark:text-graphite-50">{l.name}</h3>
                  <p className="text-sm text-graphite-500 mt-0.5">Next event · {l.next}</p>
                </div>
                <ProgressArc value={pct} size={68} thickness={7} color="#243e68" />
              </div>
              <div className="px-6 pb-5">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">Principal</div>
                    <div className="num font-semibold text-navy-900 dark:text-graphite-100"><Money value={l.principal} compact /></div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">Outstanding</div>
                    <div className="num font-semibold text-navy-900 dark:text-graphite-100"><Money value={l.balance} compact /></div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">APR</div>
                    <div className="num font-semibold text-navy-900 dark:text-graphite-100">{l.apr.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar value={pct} label={`Repaid · ${l.paidMonths} of ${l.term || '∞'} periods`} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <StatusPill status="ACTIVE" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" leftIcon="receipt">Statement</Button>
                    <Button size="sm" leftIcon="transfer">Make payment</Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Calculator + schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader eyebrow="Tools" title="Loan calculator" subtitle="Real-time amortization with first-year breakdown." />
          <div className="mt-5 space-y-4">
            <Field label="Principal (USD)">
              <Input leftIcon="coin" type="number" min="0" step="1000"
                value={calc.principal} onChange={(e) => setCalc({ ...calc, principal: Number(e.target.value) })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="APR (%)">
                <Input type="number" min="0" step="0.05"
                  value={calc.apr} onChange={(e) => setCalc({ ...calc, apr: Number(e.target.value) })} />
              </Field>
              <Field label="Term (months)">
                <Select value={calc.term} onChange={(e) => setCalc({ ...calc, term: Number(e.target.value) })}>
                  {[60, 120, 180, 240, 360].map((m) => <option key={m} value={m}>{m} months · {m / 12}y</option>)}
                </Select>
              </Field>
            </div>
            <div className="rounded-xl bg-navy-900 text-white p-4">
              <div className="text-[11px] uppercase tracking-wider text-graphite-300">Estimated monthly payment</div>
              <div className="font-display text-3xl font-semibold mt-1 num"><Money value={monthly} /></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-graphite-300">
                <div>Total interest · <span className="num text-white"><Money value={totalInterest} /></span></div>
                <div>Total cost · <span className="num text-white"><Money value={totalPaid} /></span></div>
              </div>
            </div>
            <Alert tone="info">Indicative only. Final pricing subject to underwriting and KYC verification.</Alert>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader eyebrow="Amortization" title="First-year schedule" subtitle="Principal vs interest split, month by month." />
          <div className="mt-4 -mx-2">
            <BarChart
              data={schedule.slice(0, 12).map((s) => Math.round(s.interest))}
              labels={schedule.slice(0, 12).map((s) => `M${s.period}`)}
              color="#b88a2c"
              height={170}
              formatY={(v) => `$${Math.round(v / 100) / 10}k`}
            />
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800">
            <table className="data-table">
              <thead>
                <tr><th className="!pl-4">Period</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>
              </thead>
              <tbody>
                {schedule.slice(0, 6).map((s) => (
                  <tr key={s.period}>
                    <td className="!pl-4 num">M{s.period}</td>
                    <td className="num"><Money value={s.principalPay} /></td>
                    <td className="num text-graphite-500"><Money value={s.interest} /></td>
                    <td className="num font-semibold"><Money value={s.balance} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-base font-semibold text-navy-900 dark:text-graphite-50 mb-3">Lending products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PRODUCTS.map((p) => (
            <Card key={p.id} className="hover:shadow-elev-2 transition-shadow">
              <div className="h-9 w-9 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center ring-1 ring-navy-100">
                <Icon name="loans" size={17} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-navy-900 dark:text-graphite-50">{p.label}</h3>
              <p className="text-xs text-graphite-500 mt-1 leading-relaxed">{p.desc}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge tone="navy">{p.apr}</Badge>
                <Badge tone="neutral">{p.term}</Badge>
              </div>
              <Button size="sm" variant="secondary" rightIcon="arrowRight" className="mt-4 w-full">Learn more</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
