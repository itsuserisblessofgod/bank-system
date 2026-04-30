import { useEffect, useState } from 'react';
import { accountService } from '../services/accountService.js';
import { transactionService } from '../services/transactionService.js';

const TYPES = ['SAVINGS', 'CHECKING', 'PREMIUM'];

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [creating, setCreating] = useState('SAVINGS');
  const [opAccount, setOpAccount] = useState('');
  const [opAmount, setOpAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const reload = () => accountService.myAccounts().then(setAccounts);
  useEffect(() => { reload(); }, []);

  const createAccount = async () => {
    setError(null); setMessage(null);
    try {
      await accountService.create(creating);
      setMessage(`${creating} account created.`);
      reload();
    } catch (ex) {
      setError(ex.response?.data?.message || 'Failed to create account');
    }
  };

  const doOp = async (op) => {
    setError(null); setMessage(null);
    if (!opAccount || !opAmount) { setError('Pick account and amount'); return; }
    try {
      const fn = op === 'deposit' ? transactionService.deposit : transactionService.withdraw;
      const tx = await fn(opAccount, opAmount);
      if (tx.status === 'BLOCKED') setError(`Blocked: ${tx.fraudReason}`);
      else setMessage(`${op} of $${opAmount} succeeded`);
      reload();
    } catch (ex) {
      setError(ex.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((a) => (
          <div key={a.id} className="card">
            <div className="text-xs uppercase text-slate-500">{a.accountType}</div>
            <div className="font-mono text-sm text-slate-700">{a.accountNumber}</div>
            <div className="text-3xl font-bold mt-2">${Number(a.balance).toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">Daily limit: ${Number(a.dailyLimit).toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-2 font-mono break-all cursor-pointer"
         onClick={() => navigator.clipboard.writeText(a.id)}
         title="Click to copy">
      ID: {a.id} 📋
    </div>
          </div>
        ))}
        {accounts.length === 0 && <div className="text-slate-500">No accounts yet — create one below.</div>}
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Create account</h2>
        <div className="flex gap-2">
          <select className="input" value={creating} onChange={(e) => setCreating(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn-primary" onClick={createAccount}>Create</button>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Quick deposit / withdraw</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select className="input" value={opAccount} onChange={(e) => setOpAccount(e.target.value)}>
            <option value="">Select account</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.accountType} — {a.accountNumber}</option>)}
          </select>
          <input className="input" type="number" min="0.01" step="0.01" placeholder="Amount"
            value={opAmount} onChange={(e) => setOpAmount(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={() => doOp('deposit')}>Deposit</button>
            <button className="btn-ghost flex-1" onClick={() => doOp('withdraw')}>Withdraw</button>
          </div>
        </div>
        {message && <div className="text-green-600 text-sm">{message}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
}
