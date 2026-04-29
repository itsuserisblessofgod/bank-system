import { useEffect, useState } from 'react';
import { accountService } from '../services/accountService.js';
import { transactionService } from '../services/transactionService.js';
import TransactionRow from '../components/TransactionRow.jsx';

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    accountService.myAccounts().then((acc) => {
      setAccounts(acc);
      if (acc.length && !accountId) setAccountId(acc[0].id);
    });
  }, []);

  useEffect(() => {
    if (!accountId) return;
    transactionService.history(accountId, page, 20).then(setData);
  }, [accountId, page]);

  const filtered = data.content.filter((t) =>
    (filterType === 'ALL' || t.transactionType === filterType) &&
    (filterStatus === 'ALL' || t.status === filterStatus)
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="flex gap-2 flex-wrap">
        <select className="input max-w-xs" value={accountId} onChange={(e) => { setAccountId(e.target.value); setPage(0); }}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.accountType} — {a.accountNumber}</option>)}
        </select>
        <select className="input max-w-xs" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="ALL">All types</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="WITHDRAWAL">Withdrawal</option>
          <option value="TRANSFER">Transfer</option>
        </select>
        <select className="input max-w-xs" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All status</option>
          <option value="COMPLETED">Completed</option>
          <option value="BLOCKED">Blocked</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
            {!filtered.length && (
              <tr><td colSpan="5" className="py-6 text-center text-slate-500">No transactions</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span className="text-sm text-slate-600">Page {page + 1} of {Math.max(1, data.totalPages)}</span>
        <button className="btn-ghost" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
