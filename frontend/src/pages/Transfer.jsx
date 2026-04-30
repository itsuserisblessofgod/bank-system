import { useEffect, useState } from 'react';
import { accountService } from '../services/accountService.js';
import { transactionService } from '../services/transactionService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { accountService.myAccounts().then(setAccounts); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setResult(null); setError(null);

    if (!UUID_REGEX.test(to)) {
      setError('Recipient account ID must be a valid UUID. Ask the recipient to copy it from their Dashboard.');
      return;
    }

    setBusy(true);
    try {
      const tx = await transactionService.transfer(from, to, amount);
      if (tx.status === 'BLOCKED') setError(`Blocked: ${tx.fraudReason}`);
      else setResult(`Transferred $${amount}. Status: ${tx.status}`);
    } catch (ex) {
      setError(ex.response?.data?.message || 'Transfer failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Transfer funds</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">From account</label>
          <select className="input" required value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">Select source</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.accountType} — {a.accountNumber} (${Number(a.balance).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">To account ID</label>
          <input
            className="input"
            required
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">
            Ask the recipient to copy their account UUID from their Dashboard.
          </p>
        </div>
        <div>
          <label className="label">Amount</label>
          <input className="input" type="number" min="0.01" step="0.01" required
            value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        {result && <div className="text-green-600 text-sm">{result}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Sending...' : 'Send transfer'}
        </button>
      </form>
    </div>
  );
}