import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, Avatar, Money, KpiTile, Tabs, Input,
  Alert, EmptyState, Modal, StatusPill, CopyChip,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    adminService.users().then(setUsers).catch((e) => setError(e.message));
    adminService.accounts().then(setAccounts).catch(() => {});
  };
  useEffect(() => { reload(); }, []);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.active).length;
    const inactive = users.length - active;
    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    return { active, inactive, totalBalance };
  }, [users, accounts]);

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.email, u.fullName, u.role, u.countryCode].some((v) => v?.toLowerCase().includes(q));
  });
  const filteredAccounts = accounts.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [a.accountNumber, a.accountType].some((v) => v?.toLowerCase().includes(q));
  });

  const deactivate = async () => {
    if (!confirm) return;
    setBusy(true);
    try { await adminService.deactivate(confirm.id); reload(); setConfirm(null); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Administration' }, { label: 'Control panel' }]}
        eyebrow="Operations"
        title="Control panel"
        subtitle="Tenant-level oversight: clients, accounts, balances, and segregated duties."
        actions={
          <>
            <Button variant="secondary" leftIcon="download">Export ledger</Button>
            <Button leftIcon="refresh" onClick={reload}>Refresh</Button>
          </>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile label="Clients" value={users.length} icon="users" delta={`${stats.active} active`} deltaTone="success" />
        <KpiTile label="Accounts under management" value={accounts.length} icon="bank" footer="Across all currencies" />
        <KpiTile label="Aggregate balance" value={<Money value={stats.totalBalance} compact />} icon="wallet" delta="+5.2% MoM" deltaTone="success" />
        <KpiTile label="Suspended" value={stats.inactive} icon="lock" deltaTone="warning" footer="Awaiting compliance review" />
      </div>

      <Card flush>
        <div className="px-6 pt-5 pb-4 flex flex-wrap items-center gap-3">
          <Tabs value={tab} onChange={setTab} items={[
            { value: 'users', label: 'Clients', count: users.length, icon: 'users' },
            { value: 'accounts', label: 'Accounts', count: accounts.length, icon: 'bank' },
          ]} />
          <div className="ml-auto flex-1 max-w-sm">
            <Input leftIcon="search" placeholder="Search by name, email, account…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {tab === 'users' && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!pl-6">Client</th>
                  <th>Role</th>
                  <th>Country</th>
                  <th>Accounts</th>
                  <th>Status</th>
                  <th className="!pr-6"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="!pl-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={u.fullName || u.email} size={36} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-navy-900 dark:text-graphite-100 truncate">{u.fullName || '—'}</div>
                          <div className="text-xs text-graphite-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={u.role === 'ROLE_ADMIN' ? 'gold' : 'navy'}>
                        {u.role === 'ROLE_ADMIN' ? 'Administrator' : 'Client'}
                      </Badge>
                    </td>
                    <td className="text-sm font-mono">{u.countryCode || '—'}</td>
                    <td className="num text-sm">{u.accountCount}</td>
                    <td><StatusPill status={u.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                    <td className="!pr-6 text-right">
                      {u.active ? (
                        <Button size="sm" variant="secondary" leftIcon="lock" onClick={() => setConfirm(u)}>
                          Deactivate
                        </Button>
                      ) : (
                        <Badge tone="neutral">Suspended</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredUsers.length && (
                  <tr><td colSpan={6}><EmptyState icon="users" title="No clients match" description="Try a different search." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'accounts' && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!pl-6">Account</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Daily limit</th>
                  <th className="!pr-6">Reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((a) => (
                  <tr key={a.id}>
                    <td className="!pl-6">
                      <div className="font-mono text-sm font-medium text-navy-900 dark:text-graphite-100">{a.accountNumber}</div>
                      <div className="text-[11px] text-graphite-500">USD</div>
                    </td>
                    <td><Badge tone="navy">{a.accountType}</Badge></td>
                    <td className="num font-semibold text-navy-900 dark:text-graphite-100"><Money value={a.balance} /></td>
                    <td className="num text-graphite-600"><Money value={a.dailyLimit} /></td>
                    <td className="!pr-6"><CopyChip value={a.id} /></td>
                  </tr>
                ))}
                {!filteredAccounts.length && (
                  <tr><td colSpan={5}><EmptyState icon="bank" title="No accounts" /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Deactivate client account"
        description="The client will lose access immediately. Funds remain frozen pending compliance review."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" loading={busy} onClick={deactivate}>Deactivate</Button>
          </>
        }
      >
        {confirm && (
          <div className="rounded-xl bg-graphite-50 ring-1 ring-graphite-200 px-4 py-3 flex items-center gap-3">
            <Avatar name={confirm.fullName || confirm.email} size={40} />
            <div>
              <div className="text-sm font-semibold text-navy-900">{confirm.fullName || confirm.email}</div>
              <div className="text-xs text-graphite-500">{confirm.email}</div>
            </div>
          </div>
        )}
        <p className="text-sm text-graphite-600 mt-4 leading-relaxed">
          This action will be recorded in the immutable audit log. A two-person review is required before reactivation.
        </p>
      </Modal>
    </div>
  );
}
