import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, Money, Field, Input, Select,
  Tabs, Segmented, EmptyState, Alert, StatusPill,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';
import { loanService } from '../services/loanService.js';

const STRATEGY_LABEL = {
  STANDARD: 'Standard',
  MURABAHA: 'Murabaha (Halal)',
  LEASING:  'Leasing',
};

const PURPOSES = ['CAR', 'REAL_ESTATE', 'BUSINESS', 'OTHER'];

const DEFAULT_FORM = {
  STANDARD: { assetPrice: 250000, profitMargin: 0,    annualRate: 0.0585, residualValue: 0,     termMonths: 240, purpose: 'REAL_ESTATE' },
  MURABAHA: { assetPrice: 50000,  profitMargin: 0.15, annualRate: 0,      residualValue: 0,     termMonths: 60,  purpose: 'CAR' },
  LEASING:  { assetPrice: 80000,  profitMargin: 0,    annualRate: 0.06,   residualValue: 20000, termMonths: 36,  purpose: 'CAR' },
};

function strategyTone(s) {
  if (s === 'MURABAHA') return 'gold';
  if (s === 'LEASING') return 'info';
  return 'navy';
}

export default function Loans() {
  const [tab, setTab] = useState('calculator');
  const [strategy, setStrategy] = useState('STANDARD');
  const [form, setForm] = useState(DEFAULT_FORM.STANDARD);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [myLoans, setMyLoans] = useState([]);

  useEffect(() => {
    setForm(DEFAULT_FORM[strategy]);
    setResult(null);
    setError(null);
  }, [strategy]);

  const reloadLoans = () => loanService.getMyLoans().then(setMyLoans).catch(() => {});
  useEffect(() => { reloadLoans(); }, []);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async () => {
    setError(null); setMessage(null); setLoading(true);
    try {
      const payload = { ...form, strategyType: strategy };
      const data = await loanService.calculate(payload);
      setResult(data);
    } catch (ex) {
      setError(ex.response?.data?.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const applyLoan = async () => {
    if (!result) return;
    setApplying(true); setError(null); setMessage(null);
    try {
      const payload = { ...form, strategyType: strategy };
      const app = await loanService.apply(payload);
      setMessage(`Application submitted (${app.id.slice(0, 8)}…). Status: ${app.status}.`);
      reloadLoans();
    } catch (ex) {
      setError(ex.response?.data?.message || 'Application failed.');
    } finally {
      setApplying(false);
    }
  };

  const tabItems = useMemo(() => ([
    { value: 'calculator',   label: 'Calculator', icon: 'coin' },
    { value: 'applications', label: 'My Applications', icon: 'receipt', count: myLoans.length || undefined },
  ]), [myLoans.length]);

  const segItems = useMemo(() => Object.entries(STRATEGY_LABEL).map(([v, label]) => ({ value: v, label })), []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Credit"
        title="Loans & Credit"
        subtitle="Standard annuity loans, Halal Murabaha financing, and Leasing — all in one calculator."
      />

      <Tabs value={tab} onChange={setTab} items={tabItems} />

      {tab === 'calculator' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader
              eyebrow="Tools"
              title="Loan calculator"
              subtitle="Switch strategy to see live monthly payment, total cost, and profit/interest split."
              action={<Segmented value={strategy} onChange={setStrategy} items={segItems} />}
            />

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={strategy === 'STANDARD' ? 'Loan amount (USD)' : 'Asset price (USD)'}>
                <Input type="number" min="0" step="100" leftIcon="coin"
                  value={form.assetPrice}
                  onChange={(e) => setField('assetPrice', Number(e.target.value))} />
              </Field>

              {strategy === 'MURABAHA' && (
                <Field label="Profit margin (decimal, e.g. 0.15 = 15%)">
                  <Input type="number" min="0" step="0.01"
                    value={form.profitMargin}
                    onChange={(e) => setField('profitMargin', Number(e.target.value))} />
                </Field>
              )}

              {strategy === 'STANDARD' && (
                <Field label="Annual rate (decimal, e.g. 0.0585 = 5.85%)">
                  <Input type="number" min="0" step="0.001"
                    value={form.annualRate}
                    onChange={(e) => setField('annualRate', Number(e.target.value))} />
                </Field>
              )}

              {strategy === 'LEASING' && (
                <>
                  <Field label="Annual rate (decimal)">
                    <Input type="number" min="0" step="0.001"
                      value={form.annualRate}
                      onChange={(e) => setField('annualRate', Number(e.target.value))} />
                  </Field>
                  <Field label="Residual value (USD)">
                    <Input type="number" min="0" step="100"
                      value={form.residualValue}
                      onChange={(e) => setField('residualValue', Number(e.target.value))} />
                  </Field>
                </>
              )}

              <Field label="Term (months)">
                <Input type="number" min="1" step="1"
                  value={form.termMonths}
                  onChange={(e) => setField('termMonths', Number(e.target.value))} />
              </Field>

              <Field label="Purpose">
                <Select value={form.purpose} onChange={(e) => setField('purpose', e.target.value)}>
                  {PURPOSES.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                </Select>
              </Field>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Button onClick={submit} loading={loading} leftIcon="trendUp">Calculate</Button>
              {result && (
                <Button variant="secondary" loading={applying} onClick={applyLoan} leftIcon="check">
                  Apply for this loan
                </Button>
              )}
            </div>

            {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
            {message && <Alert tone="success" className="mt-4">{message}</Alert>}
          </Card>

          <Card>
            <CardHeader
              eyebrow="Result"
              title="Estimated terms"
              subtitle={result ? `Strategy · ${STRATEGY_LABEL[result.strategyType] || result.strategyType}` : 'Run the calculator to see numbers.'}
            />

            {!result ? (
              <div className="mt-5">
                <EmptyState
                  icon="loans"
                  title="No calculation yet"
                  description="Choose a strategy and fill in the form to see your monthly payment and total cost."
                />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-navy-900 text-white p-4">
                  <div className="flex items-center gap-2">
                    <Badge tone={strategyTone(result.strategyType)}>{result.strategyType}</Badge>
                    {result.strategyType === 'MURABAHA' && (
                      <Badge tone="success" dot>Zero interest · Sharia-compliant</Badge>
                    )}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-graphite-300 mt-3">Monthly payment</div>
                  <div className="font-display text-3xl font-semibold mt-1 num"><Money value={result.monthlyPayment} /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3">
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">Asset price</div>
                    <div className="text-sm font-medium num text-navy-900 dark:text-graphite-100 mt-0.5">
                      <Money value={result.assetPrice} />
                    </div>
                  </div>
                  <div className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3">
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">Total payment</div>
                    <div className="text-sm font-medium num text-navy-900 dark:text-graphite-100 mt-0.5">
                      <Money value={result.totalPayment} />
                    </div>
                  </div>
                  <div className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3">
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">
                      {result.strategyType === 'MURABAHA' ? 'Total profit (markup)' : 'Total interest'}
                    </div>
                    <div className="text-sm font-medium num text-navy-900 dark:text-graphite-100 mt-0.5">
                      <Money value={result.strategyType === 'MURABAHA' ? result.totalProfit : result.totalInterest} />
                    </div>
                  </div>
                  <div className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-3.5 py-3">
                    <div className="text-[11px] uppercase tracking-wider text-graphite-500">Term</div>
                    <div className="text-sm font-medium num text-navy-900 dark:text-graphite-100 mt-0.5">
                      {result.termMonths} months
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'applications' && (
        <Card>
          <CardHeader eyebrow="History" title="My applications" subtitle="All submitted loan applications." />
          {myLoans.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No applications yet"
              description="Run the calculator and click Apply to submit your first loan request."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {myLoans.map((l) => (
                <div key={l.id} className="rounded-xl ring-1 ring-graphite-200 dark:ring-graphite-800 px-4 py-3 flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center ring-1 ring-navy-100">
                    <Icon name="loans" size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={strategyTone(l.strategyType)}>{l.strategyType}</Badge>
                      <Badge tone="neutral">{l.purpose || '—'}</Badge>
                      <span className="text-xs text-graphite-500">{l.termMonths} months</span>
                    </div>
                    <div className="mt-1 text-sm text-graphite-700 dark:text-graphite-300">
                      Asset <span className="num font-semibold"><Money value={l.assetPrice} /></span>
                      <span className="mx-2 text-graphite-400">·</span>
                      Monthly <span className="num font-semibold"><Money value={l.monthlyPayment} /></span>
                    </div>
                  </div>
                  <StatusPill status={l.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
