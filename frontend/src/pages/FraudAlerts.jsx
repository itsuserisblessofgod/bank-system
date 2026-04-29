import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService.js';

export default function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [audit, setAudit] = useState([]);
  const [message, setMessage] = useState(null);

  const reload = () => {
    adminService.fraudAlerts().then(setAlerts);
    adminService.fraudAuditLog().then(setAudit);
  };
  useEffect(() => { reload(); }, []);

  const reload2 = async () => {
    const rules = await adminService.reloadRules();
    setMessage(`Reloaded rules: ${rules.join(', ')}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fraud Engine</h1>
        <button className="btn-ghost" onClick={reload2}>Hot-reload rules</button>
      </div>
      {message && <div className="text-green-600 text-sm">{message}</div>}

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Flagged transactions ({alerts.length})</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Reason</th>
              <th className="py-2 px-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((tx) => (
              <tr key={tx.id} className="border-t border-slate-200 bg-red-50">
                <td className="py-2 px-3 font-mono text-xs">{tx.id.slice(0, 8)}</td>
                <td className="py-2 px-3">{tx.transactionType}</td>
                <td className="py-2 px-3">${Number(tx.amount).toFixed(2)}</td>
                <td className="py-2 px-3 text-red-700 text-xs">{tx.fraudReason}</td>
                <td className="py-2 px-3 text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {!alerts.length && <tr><td colSpan="5" className="py-6 text-center text-slate-500">No fraud alerts</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Compliance audit log ({audit.length})</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Tx</th>
              <th className="py-2 px-3">Rule</th>
              <th className="py-2 px-3">Decision</th>
              <th className="py-2 px-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="py-2 px-3 text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="py-2 px-3 font-mono text-xs">{a.transactionId.slice(0, 8)}</td>
                <td className="py-2 px-3">{a.ruleTriggered}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${a.decision === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {a.decision}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs">{a.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
