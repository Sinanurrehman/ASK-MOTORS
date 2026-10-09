import React, { useState } from 'react';
import { Account, Job, Payment, Expense } from '../types';
import { num, money, getJobTotal } from '../constants';
import { IconPlus } from './Icons';

interface AccountsViewProps {
  accounts: Account[];
  jobs: Job[];
  payments: Payment[];
  expenses: Expense[];
  onSelectAccount: (id: string) => void;
  onNewAccount: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  jobs,
  payments,
  expenses,
  onSelectAccount,
  onNewAccount
}) => {
  const [kindFilter, setKindFilter] = useState<string>('all');

  const getStats = (a: Account) => {
    if (a.kind === 'Vendor') {
      const vExps = expenses.filter(e => e.vendorId === a.id);
      const paidOut = vExps.reduce((s: number, e) => s + num(e.amount), 0);
      return {
        billed: 0,
        paid: paidOut,
        opening: num(a.opening),
        bal: num(a.opening) - paidOut,
        vehicles: vExps.length,
        open: vExps.length,
        isVendor: true
      };
    }

    const accJobs = jobs.filter(j => j.accountId === a.id && j.status !== 'Cancelled');
    const billed = accJobs.reduce((s: number, j) => s + getJobTotal(j), 0);
    const paid = payments.filter(p => p.accountId === a.id).reduce((s: number, p) => s + num(p.amount), 0);
    const bal = num(a.opening) + billed - paid;
    const open = accJobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled').length;

    return {
      billed,
      paid,
      opening: num(a.opening),
      bal,
      vehicles: accJobs.length,
      open,
      isVendor: false
    };
  };

  const listWithStats = accounts.map(a => ({ account: a, stats: getStats(a) }));

  const filteredList = kindFilter === 'all'
    ? listWithStats
    : listWithStats.filter(x => x.account.kind === kindFilter);

  // Sort by highest balance due first
  filteredList.sort((x, y) => y.stats.bal - x.stats.bal);

  const totalBilled = filteredList.reduce((s, x) => s + (x.stats.isVendor ? 0 : x.stats.billed + x.stats.opening), 0);
  const totalPaid = filteredList.reduce((s, x) => s + x.stats.paid, 0);
  const totalBalance = filteredList.reduce((s, x) => s + x.stats.bal, 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Parties &amp; Accounts</h2>
          <p>
            Dealers, companies, individual vehicle owners, and outsource agents with live running debit/credit balances.
          </p>
        </div>
        <div className="btn-row">
          <button className="btn primary" onClick={onNewAccount}>
            <IconPlus /> Add Party / Vendor
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${kindFilter === 'all' ? 'active' : ''}`}
          onClick={() => setKindFilter('all')}
        >
          All Accounts
          <span className="c">{accounts.length}</span>
        </button>

        <button
          className={`tab ${kindFilter === 'Party' ? 'active' : ''}`}
          onClick={() => setKindFilter('Party')}
        >
          Parties / Companies
          <span className="c">{accounts.filter(a => a.kind === 'Party').length}</span>
        </button>

        <button
          className={`tab ${kindFilter === 'Customer' ? 'active' : ''}`}
          onClick={() => setKindFilter('Customer')}
        >
          Individual Customers
          <span className="c">{accounts.filter(a => a.kind === 'Customer').length}</span>
        </button>

        <button
          className={`tab ${kindFilter === 'Vendor' ? 'active' : ''}`}
          onClick={() => setKindFilter('Vendor')}
        >
          Vendors &amp; Agents
          <span className="c">{accounts.filter(a => a.kind === 'Vendor').length}</span>
        </button>
      </div>

      <div className="card">
        {filteredList.length > 0 ? (
          <div className="table-wrap cards">
            <table>
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th className="hide-m">Phone</th>
                  <th className="r hide-m">Files / Works</th>
                  <th className="r hide-m">Open</th>
                  <th className="r hide-m">Charged</th>
                  <th className="r hide-m">Paid / Received</th>
                  <th className="r">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(({ account: a, stats: s }) => (
                  <tr key={a.id} className="click" onClick={() => onSelectAccount(a.id)}>
                    <td>
                      <b>{a.name}</b>
                      <div className="faint" style={{ fontSize: '12px' }}>
                        {a.kind === 'Party' ? 'Party / Company' : 
                         a.kind === 'Vendor' ? <span className="badge vendor" style={{ fontSize: '10.5px' }}>Vendor / Agent</span> : 
                         'Customer'}
                      </div>
                    </td>

                    <td className="hide-m">{a.phone || '—'}</td>
                    <td className="r num hide-m">{s.vehicles}</td>
                    <td className="r num hide-m">{s.open}</td>
                    <td className="r num hide-m">{s.isVendor ? '—' : money(s.billed + s.opening)}</td>
                    <td className="r num hide-m" style={{ color: s.isVendor ? 'var(--danger)' : 'var(--ok)' }}>
                      {money(s.paid)}
                    </td>
                    <td className={`r num ${s.bal > 0.5 ? 'bal-pos' : s.bal < -0.5 ? 'bal-neg' : 'bal-zero'}`}>
                      {money(s.bal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>{filteredList.length} accounts</td>
                  <td className="hide-m"></td>
                  <td className="hide-m"></td>
                  <td className="hide-m"></td>
                  <td className="r num hide-m">{money(totalBilled)}</td>
                  <td className="r num hide-m">{money(totalPaid)}</td>
                  <td className="r num">{money(totalBalance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="empty">
            No accounts found in this category.
          </div>
        )}
      </div>
    </div>
  );
};
