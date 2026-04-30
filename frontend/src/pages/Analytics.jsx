import { useState } from 'react';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, KpiTile, Money, Badge, Segmented, Tabs, Button,
} from '../components/ui/index.jsx';
import { AreaChart, BarChart, DonutChart, ProgressArc } from '../components/charts/Charts.jsx';

// Showcase mock data — analytics endpoint not exposed by the backend.
const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const INCOME =  [22500, 24100, 26300, 25600, 27200, 29800, 31200, 33800, 30800, 32400, 35100, 38400];
const EXPENSE = [15200, 16100, 18300, 17600, 19200, 21800, 23200, 24800, 22800, 24400, 27100, 29400];
const SAVINGS = INCOME.map((v, i) => v - EXPENSE[i]);

const CATEGORIES = [
  { label: 'Operations',     value: 18420.55, color: '#0d1b34' },
  { label: 'Salaries',       value: 14200.00, color: '#243e68' },
  { label: 'Tax & Compliance', value: 6890.00, color: '#5f85b6' },
  { label: 'Travel',         value:  4220.00, color: '#b88a2c' },
  { label: 'Software',       value:  3180.00, color: '#dfbe65' },
  { label: 'Other',          value:  1480.00, color: '#94aed1' },
];
const TOTAL_CAT = CATEGORIES.reduce((s, c) => s + c.value, 0);

const TOP_MERCHANTS = [
  { name: 'Bloomberg LP', amount: 4920, count: 12, tone: 'navy' },
  { name: 'AWS, Inc.', amount: 3680, count: 24, tone: 'navy' },
  { name: 'Boeing Travel', amount: 2810, count: 4, tone: 'gold' },
  { name: 'WeWork Mgmt', amount: 2100, count: 8, tone: 'neutral' },
  { name: 'Stripe Network', amount: 1840, count: 36, tone: 'navy' },
];

export default function Analytics() {
  const [range, setRange] = useState('12M');
  const [view, setView] = useState('flow');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        subtitle="Treasury-grade analytics, cohort spending behaviour, and merchant intelligence — refreshed nightly."
        actions={
          <>
            <Segmented value={range} onChange={setRange} items={[
              { value: '30D', label: '30D' }, { value: '90D', label: '90D' }, { value: '12M', label: '12M' }, { value: 'YTD', label: 'YTD' },
            ]} />
            <Button variant="secondary" leftIcon="download">Export PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile label="Total inflow" value={<Money value={INCOME.reduce((a, b) => a + b, 0)} compact />} icon="trendUp" delta="+18.2% YoY" deltaTone="success" />
        <KpiTile label="Total outflow" value={<Money value={EXPENSE.reduce((a, b) => a + b, 0)} compact />} icon="trendDown" delta="+12.1% YoY" deltaTone="warning" />
        <KpiTile label="Net savings" value={<Money value={SAVINGS.reduce((a, b) => a + b, 0)} compact />} icon="wallet" delta="+24.4%" deltaTone="success" />
        <KpiTile label="Savings rate" value="29.4%" icon="trendUp" delta="+3.1pp QoQ" deltaTone="success" footer="Target: 25%" />
      </div>

      <Card>
        <CardHeader
          eyebrow="Treasury Flow"
          title="Income, expense & savings"
          subtitle="A 12-month view of cash dynamics across all entities."
          action={
            <Tabs value={view} onChange={setView} items={[
              { value: 'flow', label: 'Flow' },
              { value: 'savings', label: 'Savings' },
            ]} />
          }
        />
        <div className="mt-4 -mx-2">
          {view === 'flow' ? (
            <AreaChart
              series={[
                { data: INCOME, color: '#243e68' },
                { data: EXPENSE, color: '#b88a2c' },
              ]}
              labels={MONTHS}
              height={280}
              formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
          ) : (
            <AreaChart
              series={[{ data: SAVINGS, color: '#10a06b' }]}
              labels={MONTHS}
              height={280}
              formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader eyebrow="Categories" title="Spending breakdown" subtitle="Last 30 days, all accounts." />
          <div className="mt-5 flex justify-center">
            <DonutChart segments={CATEGORIES} size={196} thickness={26}
              centerValue={<Money value={TOTAL_CAT} compact />}
              centerLabel="Outflow" />
          </div>
          <ul className="mt-6 space-y-2">
            {CATEGORIES.map((c) => {
              const pct = Math.round((c.value / TOTAL_CAT) * 100);
              return (
                <li key={c.label} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-graphite-700">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    {c.label}
                  </span>
                  <span className="num text-navy-900 dark:text-graphite-100 font-medium">
                    <Money value={c.value} /> · <span className="text-graphite-500">{pct}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader eyebrow="Merchants" title="Top counterparties" subtitle="By outflow volume in the last 30 days." />
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <BarChart
                data={TOP_MERCHANTS.map((m) => m.amount)}
                labels={TOP_MERCHANTS.map((m) => m.name.split(' ')[0])}
                color="#243e68"
                height={170}
                formatY={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
            </div>
            <ul className="space-y-2.5">
              {TOP_MERCHANTS.map((m) => (
                <li key={m.name} className="flex items-center justify-between rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy-900 dark:text-graphite-100 truncate">{m.name}</div>
                    <div className="text-[11px] text-graphite-500">{m.count} transactions</div>
                  </div>
                  <div className="text-right">
                    <div className="num font-semibold text-navy-900 dark:text-graphite-100"><Money value={m.amount} /></div>
                    <div className="mt-0.5"><Badge tone={m.tone}>Recurring</Badge></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader eyebrow="Goals" title="Treasury benchmarks" subtitle="Tracking your operational and reserve targets." />
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Operating runway', value: 78, hint: '14.2 months · target 12+' },
            { label: 'Liquidity coverage', value: 112, hint: 'LCR 112% · regulatory ≥ 100%' },
            { label: 'Cost / income ratio', value: 64, hint: '64% · industry median 71%' },
          ].map((g) => (
            <div key={g.label} className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-5 py-5 flex items-center gap-4">
              <ProgressArc value={Math.min(100, g.value)} size={84} thickness={9} />
              <div>
                <div className="text-sm font-semibold text-navy-900 dark:text-graphite-100">{g.label}</div>
                <div className="text-xs text-graphite-500 mt-1">{g.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
