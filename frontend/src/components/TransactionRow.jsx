export default function TransactionRow({ tx }) {
  const statusClass = {
    COMPLETED: 'bg-green-100 text-green-700',
    BLOCKED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
  }[tx.status] || 'bg-slate-100 text-slate-700';

  return (
    <tr className="border-t border-slate-200">
      <td className="py-2 px-3 font-mono text-xs">{tx.id.slice(0, 8)}</td>
      <td className="py-2 px-3">{tx.transactionType}</td>
      <td className="py-2 px-3 font-semibold">${Number(tx.amount).toFixed(2)}</td>
      <td className="py-2 px-3">
        <span className={`px-2 py-0.5 rounded text-xs ${statusClass}`}>{tx.status}</span>
        {tx.fraudFlag && <span className="ml-2 text-xs text-red-600">⚠ FRAUD</span>}
      </td>
      <td className="py-2 px-3 text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
    </tr>
  );
}
