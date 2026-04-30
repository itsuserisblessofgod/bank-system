import { useEffect, useMemo, useState } from 'react';
import { accountService } from '../services/accountService.js';
import { transactionService } from '../services/transactionService.js';
import PageHeader from '../layout/PageHeader.jsx';
import {
  Card, CardHeader, Button, Badge, StatusPill, Money, Input, Select,
  Tabs, EmptyState, CopyChip,
} from '../components/ui/index.jsx';
import Icon from '../components/icons/Icon.jsx';

const TYPE_LABEL = { SAVINGS: 'Savings', CHECKING: 'Checking', PREMIUM: 'Premium' };

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.content.filter((t) =>
      (filterType === 'ALL' || t.transactionType === filterType) &&
      (filterStatus === 'ALL' || t.status === filterStatus) &&
      (!q || t.id?.toLowerCase().includes(q) || t.transactionType?.toLowerCase().includes(q))
    );
  }, [data.content, filterType, filterStatus, search]);

  const stats = useMemo(() => {
    const completed = data.content.filter((t) => t.status === 'COMPLETED').length;
    const blocked = data.content.filter((t) => t.status === 'BLOCKED').length;
    const pending = data.content.filter((t) => t.status === 'PENDING').length;
    return { completed, blocked, pending };
  }, [data.content]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        subtitle="Granular audit-grade record of every movement, with regulatory disclosures and counterparty metadata."
        actions={
          <>
            <Button variant="secondary" leftIcon="filter">Advanced filters</Button>
            <Button variant="secondary" leftIcon="download">Export CSV</Button>
            <Button leftIcon="plus">New entry</Button>
          </>
        }
      />

      <Card flush>
        <div className="px-6 pt-5 pb-4 flex flex-wrap items-center gap-3">
          <Select className="max-w-xs" value={accountId} onChange={(e) => { setAccountId(e.target.value); setPage(0); }}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {TYPE_LABEL[a.accountType] || a.accountType} · {a.accountNumber}
              </option>
            ))}
          </Select>
          <div className="flex-1 min-w-[220px]">
            <Input leftIcon="search" placeholder="Search by ID, type, counterparty…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="max-w-[160px]" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="ALL">All types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
          </Select>
        </div>

        <div className="px-6">
          <Tabs
            value={filterStatus}
            onChange={setFilterStatus}
            items={[
              { value: 'ALL', label: 'All', count: data.content.length },
              { value: 'COMPLETED', label: 'Completed', count: stats.completed },
              { value: 'PENDING', label: 'Pending', count: stats.pending },
              { value: 'BLOCKED', label: 'Blocked', count: stats.blocked },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="!pl-6">Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Counterparty</th>
                <th className="!pr-6">Posted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const isOut = tx.transactionType === 'WITHDRAWAL' || tx.transactionType === 'TRANSFER';
                return (
                  <tr key={tx.id}>
                    <td className="!pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ring-1
                          ${isOut ? 'bg-danger-50 text-danger-600 ring-danger-100' : 'bg-success-50 text-success-600 ring-success-100'}`}>
                          <Icon name={isOut ? 'arrowUpRight' : 'arrowDownRight'} size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-navy-900 dark:text-graphite-100">
                            {tx.transactionType?.charAt(0) + tx.transactionType?.slice(1).toLowerCase()}
                          </div>
                          <CopyChip value={tx.id} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={isOut ? 'navy' : 'success'} icon={isOut ? 'arrowUpRight' : 'arrowDownRight'}>
                        {tx.transactionType}
                      </Badge>
                    </td>
                    <td className="num font-semibold">
                      <span className={isOut ? 'text-danger-700' : 'text-success-700'}>
                        {isOut ? '−' : '+'}<Money value={tx.amount} />
                      </span>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <StatusPill status={tx.status} />
                        {tx.fraudFlag && (
                          <Badge tone="danger" icon="warning">Fraud flag</Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-graphite-600">
                      {tx.fraudReason || <span className="text-graphite-400">Internal · Same entity</span>}
                    </td>
                    <td className="!pr-6 text-xs text-graphite-500">
                      {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '—'}
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="receipt"
                      title="No transactions match your filters"
                      description="Try a broader status or remove the search query to see all activity."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-t border-graphite-200 dark:border-graphite-800 bg-graphite-50/50 dark:bg-graphite-900/40">
          <span className="text-xs text-graphite-500">
            Showing <span className="font-semibold text-navy-900 dark:text-graphite-100 num">{filtered.length}</span> of{' '}
            <span className="font-semibold text-navy-900 dark:text-graphite-100 num">{data.totalElements ?? data.content.length}</span> records
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon="chevronLeft" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="text-xs text-graphite-500 num">Page {page + 1} / {Math.max(1, data.totalPages)}</span>
            <Button variant="ghost" size="sm" rightIcon="chevronRight" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
