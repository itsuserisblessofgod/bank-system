import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService.js';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  const reload = () => {
    adminService.users().then(setUsers).catch((e) => setError(e.message));
    adminService.accounts().then(setAccounts);
  };
  useEffect(() => { reload(); }, []);

  const deactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    await adminService.deactivate(id);
    reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Users ({users.length})</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase">
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Country</th>
              <th className="py-2 px-3">Accounts</th>
              <th className="py-2 px-3">Active</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-200">
                <td className="py-2 px-3">{u.email}</td>
                <td className="py-2 px-3">{u.fullName}</td>
                <td className="py-2 px-3">{u.role}</td>
                <td className="py-2 px-3">{u.countryCode || '-'}</td>
                <td className="py-2 px-3">{u.accountCount}</td>
                <td className="py-2 px-3">{u.active ? 'Yes' : 'No'}</td>
                <td className="py-2 px-3">
                  {u.active && <button className="btn-ghost text-xs" onClick={() => deactivate(u.id)}>Deactivate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">All accounts ({accounts.length})</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase">
              <th className="py-2 px-3">Number</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Balance</th>
              <th className="py-2 px-3">Daily limit</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="py-2 px-3 font-mono text-xs">{a.accountNumber}</td>
                <td className="py-2 px-3">{a.accountType}</td>
                <td className="py-2 px-3">${Number(a.balance).toFixed(2)}</td>
                <td className="py-2 px-3">${Number(a.dailyLimit).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
