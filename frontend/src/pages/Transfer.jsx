import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../services/accountService.js';
import { transactionService } from '../services/transactionService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Field, Input, Select, Money, Alert, Badge,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TYPE_LABEL = { SAVINGS: 'Savings', CHECKING: 'Checking', PREMIUM: 'Premium' };

const STEPS = ['Details', 'Confirm', 'Receipt'];

export default function Transfer() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { accountService.myAccounts().then(setAccounts); }, []);

  const fromAccount = useMemo(() => accounts.find((a) => a.id === from), [accounts, from]);

  const validateDetails = () => {
    setError(null);
    if (!from) return setError('Choose a source account.'), false;
    if (!UUID_REGEX.test(to)) return setError('Recipient ID must be a valid UUID. Have your recipient copy it from their dashboard.'), false;
    if (!amount || Number(amount) <= 0) return setError('Enter a transfer amount greater than zero.'), false;
    if (fromAccount && Number(amount) > Number(fromAccount.balance)) return setError('Insufficient available balance on the source account.'), false;
    return true;
  };

  const next = () => { if (validateDetails()) setStep(1); };

  const submit = async () => {
    setError(null); setResult(null); setBusy(true);
    try {
      const tx = await transactionService.transfer(from, to, amount);
      if (tx.status === 'BLOCKED') setError(`Blocked by fraud rules: ${tx.fraudReason}`);
      else setResult(tx);
      setStep(2);
    } catch (ex) {
      setError(ex.response?.data?.message || 'Transfer failed.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFrom(''); setTo(''); setAmount(''); setMemo(''); setStep(0); setResult(null); setError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settlement"
        title="Transfer funds"
        subtitle="Real-time book transfer with same-day final settlement and embedded sanctions screening."
      />

      {/* Stepper */}
      <ol className="grid grid-cols-3 gap-2 max-w-2xl">
        {STEPS.map((label, i) => {
          const active = step === i, done = step > i;
          return (
            <li key={label} className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold
                ${done ? 'bg-success-500 text-white' : active ? 'bg-navy-900 text-white' : 'bg-graphite-100 text-graphite-500'}`}>
                {done ? <Icon name="check" size={14} /> : i + 1}
              </div>
              <div className={`text-sm font-medium ${active || done ? 'text-navy-900 dark:text-graphite-100' : 'text-graphite-500'}`}>{label}</div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? 'bg-success-500/40' : 'bg-graphite-200'}`} />}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          {step === 0 && (
            <>
              <CardHeader eyebrow="Step 1 of 3" title="Transfer details" subtitle="Settlement is immediate for internal accounts, ACH/wire otherwise." />
              {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
              <div className="mt-5 space-y-4">
                <Field label="From account">
                  <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                    <option value="">Select source…</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {TYPE_LABEL[a.accountType]} · {a.accountNumber} · ${Number(a.balance).toFixed(2)} avail.
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Recipient account ID" hint="Ask the recipient to copy the UUID from their dashboard.">
                  <Input leftIcon="user" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={to} onChange={(e) => setTo(e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount (USD)">
                    <Input type="number" min="0.01" step="0.01" leftIcon="coin" placeholder="0.00"
                      value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </Field>
                  <Field label="Memo (optional)">
                    <Input leftIcon="receipt" placeholder="e.g. Q2 retainer"
                      value={memo} onChange={(e) => setMemo(e.target.value)} />
                  </Field>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" onClick={reset}>Reset</Button>
                <Button onClick={next} rightIcon="arrowRight">Review transfer</Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <CardHeader eyebrow="Step 2 of 3" title="Review and authorise" subtitle="Verify the details — transfers are final upon authorisation." />
              {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
              <div className="mt-5 rounded-2xl ring-1 ring-graphite-200 dark:ring-graphite-800 divide-y divide-graphite-200 dark:divide-graphite-800">
                {[
                  ['From', fromAccount ? `${TYPE_LABEL[fromAccount.accountType]} · ${fromAccount.accountNumber}` : '—'],
                  ['To (account UUID)', to],
                  ['Amount', <Money value={amount} />],
                  ['Memo', memo || <span className="text-graphite-400">—</span>],
                  ['Settlement', <Badge tone="success" dot>Same-day · Internal book transfer</Badge>],
                  ['Fees', <span className="num">$0.00</span>],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-5 py-3.5 text-sm">
                    <span className="text-graphite-500">{k}</span>
                    <span className="text-navy-900 dark:text-graphite-100 font-medium num truncate max-w-[60%] text-right">{v}</span>
                  </div>
                ))}
              </div>

              <Alert tone="navy" className="mt-4">
                <strong className="font-semibold">Authorisation required.</strong> By clicking Authorise, you certify
                the recipient is verified and accept the transfer is final. This action will be logged for compliance.
              </Alert>

              <div className="mt-6 flex items-center justify-between">
                <Button variant="secondary" leftIcon="arrowLeft" onClick={() => setStep(0)}>Edit</Button>
                <Button loading={busy} onClick={submit} leftIcon="shieldCheck">Authorise transfer</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {result ? (
                <>
                  <div className="text-center py-4">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center ring-1 ring-success-100">
                      <Icon name="check" size={26} />
                    </div>
                    <h3 className="mt-4 text-xl font-display font-semibold text-navy-900">Transfer authorised</h3>
                    <p className="text-sm text-graphite-500 mt-1">Funds have been booked. A receipt is available below.</p>
                  </div>
                  <div className="mt-2 rounded-2xl bg-graphite-50 ring-1 ring-graphite-200 px-6 py-5">
                    <div className="flex items-center justify-between text-xs text-graphite-500 uppercase tracking-wider">
                      <span>Receipt · EBMS</span>
                      <span className="font-mono">{result.id?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="mt-3 font-display text-3xl font-semibold text-navy-900 num">
                      <Money value={result.amount || amount} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-graphite-500">Status</span><div className="font-medium">{result.status}</div></div>
                      <div><span className="text-graphite-500">Time</span><div className="font-medium">{new Date(result.timestamp || Date.now()).toLocaleString()}</div></div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <Button variant="secondary" leftIcon="receipt" onClick={() => navigate('/transactions')}>View in ledger</Button>
                    <Button onClick={reset} rightIcon="plus">New transfer</Button>
                  </div>
                </>
              ) : (
                <>
                  {error && <Alert tone="danger">{error}</Alert>}
                  <div className="mt-4">
                    <Button onClick={() => setStep(0)} variant="secondary" leftIcon="arrowLeft">Try again</Button>
                  </div>
                </>
              )}
            </>
          )}
        </Card>

        {/* Right rail */}
        <Card>
          <CardHeader eyebrow="Source account" title={fromAccount ? TYPE_LABEL[fromAccount.accountType] : 'Select to preview'}
            subtitle={fromAccount ? fromAccount.accountNumber : 'Account-level details will appear once selected.'} />
          {fromAccount && (
            <div className="mt-5 space-y-4">
              <div>
                <div className="kpi-label">Available balance</div>
                <div className="kpi-value num mt-1"><Money value={fromAccount.balance} /></div>
              </div>
              <div className="rounded-xl bg-graphite-50 dark:bg-graphite-900/40 ring-1 ring-graphite-200 dark:ring-graphite-800 px-4 py-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-graphite-500">Daily limit</span><span className="num font-medium"><Money value={fromAccount.dailyLimit} /></span></div>
                <div className="flex items-center justify-between mt-1"><span className="text-graphite-500">Currency</span><span className="num font-medium">USD</span></div>
              </div>
              <div className="rounded-xl bg-navy-50 ring-1 ring-navy-100 px-4 py-3 text-sm flex items-start gap-3">
                <Icon name="shield" className="text-navy-700 mt-0.5" />
                <div className="text-navy-900">
                  <div className="font-semibold">Compliance check</div>
                  <div className="text-graphite-600 text-xs mt-0.5">Counterparty will be screened against OFAC, EU, and UN sanction lists at authorisation.</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
