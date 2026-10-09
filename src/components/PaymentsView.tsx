import React, { useState } from 'react';
import { Payment, Expense, Account, Job } from '../types';
import { 
  METHODS, 
  EXPENSE_CATEGORIES, 
  num, 
  money, 
  fd 
} from '../constants';
import { 
  IconPlus, 
  IconDownload, 
  IconPrint, 
  IconEdit, 
  IconTrash 
} from './Icons';

interface PaymentsViewProps {
  payments: Payment[];
  expenses: Expense[];
  accounts: Account[];
  jobs: Job[];
  onNewPayment: () => void;
  onNewExpense: () => void;
  onEditPayment: (p: Payment) => void;
  onEditExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onPrintReceipt: (p: Payment) => void;
  onSelectJob: (id: string) => void;
  onSelectAccount: (id: string) => void;
  onExportExcel: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  expenses,
  accounts,
  jobs,
  onNewPayment,
  onNewExpense,
  onEditPayment,
  onEditExpense,
  onDeleteExpense,
  onPrintReceipt,
  onSelectJob,
  onSelectAccount,
  onExportExcel
}) => {
  const [activeTab, setActiveTab] = useState<'received' | 'vendor'>('received');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  // 1. Receipts Tab
  if (activeTab === 'received') {
    let list = payments.filter(p => {
      if (fromDate && p.date < fromDate) return false;
      if (toDate && p.date > toDate) return false;
      if (methodFilter && p.method !== methodFilter) return false;
      return true;
    });

    list.sort((a, b) => (b.date + b.no).localeCompare(a.date + a.no));
    const totalReceived = list.reduce((s, p) => s + num(p.amount), 0);

    return (
      <div>
        <div className="page-head">
          <div>
            <h2>Payments &amp; Expenses</h2>
            <p>Customer receipts collected and outsourced payouts to vendors / agents.</p>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={onExportExcel}>
              <IconDownload /> Excel
            </button>
            <button className="btn primary" onClick={onNewPayment}>
              <IconPlus /> Receive Payment
            </button>
          </div>
        </div>

        <div className="tabs">
          <button className="tab active" onClick={() => setActiveTab('received')}>
            Customer Receipts Received
            <span className="c">{payments.length}</span>
          </button>
          <button className="tab" onClick={() => setActiveTab('vendor')}>
            Paid to Vendors / Agents
            <span className="c">{expenses.length}</span>
          </button>
        </div>

        <div className="filters">
          <input 
            type="date" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)} 
            aria-label="From Date" 
          />
          <input 
            type="date" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)} 
            aria-label="To Date" 
          />
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">All Payment Methods</option>
            {METHODS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="grid kpis" style={{ marginBottom: '16px' }}>
          <div className="card kpi accent">
            <div className="label">Total Received</div>
            <div className="val">{money(totalReceived)}</div>
            <div className="sub">{list.length} payments in selected filter</div>
          </div>
        </div>

        <div className="card">
          {list.length > 0 ? (
            <div className="table-wrap cards">
              <table>
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Received From</th>
                    <th className="hide-m">Vehicle</th>
                    <th className="hide-m">Method</th>
                    <th className="r">Amount</th>
                    <th className="r hide-m">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(p => {
                    const accObj = accounts.find(a => a.id === p.accountId);
                    const jObj = jobs.find(j => j.id === p.jobId);

                    return (
                      <tr key={p.id}>
                        <td>
                          <b>{p.no}</b>
                          <div className="faint" style={{ fontSize: '12px' }}>{fd(p.date)}</div>
                        </td>

                        <td>
                          <a href={`#/account/${p.accountId}`} onClick={(ev) => { ev.preventDefault(); onSelectAccount(p.accountId); }}>
                            <b>{accObj?.name || '—'}</b>
                          </a>
                          <div className="faint" style={{ fontSize: '12px' }}>
                            {p.method} {p.ref ? `· Ref: ${p.ref}` : ''}
                          </div>
                        </td>

                        <td className="hide-m">
                          {jObj ? (
                            <a href={`#/job/${jObj.id}`} onClick={(ev) => { ev.preventDefault(); onSelectJob(jObj.id); }}>
                              <span className="plate">{jObj.oldReg}</span>
                            </a>
                          ) : (
                            <span className="faint">On Account</span>
                          )}
                        </td>

                        <td className="hide-m">{p.method}</td>
                        <td className="r num" style={{ color: 'var(--ok)', fontWeight: 700 }}>
                          {money(p.amount)}
                        </td>

                        <td className="hide-m r">
                          <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                            <button 
                              className="btn sm ghost" 
                              onClick={() => onPrintReceipt(p)} 
                              title="Print receipt"
                            >
                              <IconPrint />
                            </button>
                            <button 
                              className="btn sm ghost" 
                              onClick={() => onEditPayment(p)} 
                              title="Edit receipt"
                            >
                              <IconEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td></td>
                    <td className="hide-m"></td>
                    <td className="hide-m"></td>
                    <td className="r num" style={{ color: 'var(--ok)' }}>{money(totalReceived)}</td>
                    <td className="hide-m"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="empty">No payments match this period.</div>
          )}
        </div>
      </div>
    );
  }

  // 2. Outsource Expenses to Vendors Tab
  let expList = expenses.filter(e => {
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    if (categoryFilter && e.category !== categoryFilter) return false;
    if (vendorFilter && e.vendorId !== vendorFilter) return false;
    return true;
  });

  expList.sort((a, b) => (b.date + b.no).localeCompare(a.date + a.no));
  const totalPaidOut = expList.reduce((s, e) => s + num(e.amount), 0);
  const vendorAccounts = accounts.filter(a => a.kind === 'Vendor');

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Payments &amp; Expenses</h2>
          <p>Customer receipts collected and outsourced payouts to vendors / agents.</p>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={onExportExcel}>
            <IconDownload /> Excel
          </button>
          <button className="btn primary" onClick={onNewExpense}>
            <IconPlus /> Pay Vendor / Agent
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className="tab" onClick={() => setActiveTab('received')}>
          Customer Receipts Received
          <span className="c">{payments.length}</span>
        </button>
        <button className="tab active" onClick={() => setActiveTab('vendor')}>
          Paid to Vendors / Agents
          <span className="c">{expenses.length}</span>
        </button>
      </div>

      <div className="filters">
        <input 
          type="date" 
          value={fromDate} 
          onChange={(e) => setFromDate(e.target.value)} 
          aria-label="From Date" 
        />
        <input 
          type="date" 
          value={toDate} 
          onChange={(e) => setToDate(e.target.value)} 
          aria-label="To Date" 
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Expense Categories</option>
          {EXPENSE_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
          <option value="">All Vendors / Agents</option>
          {vendorAccounts.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      <div className="grid kpis" style={{ marginBottom: '16px' }}>
        <div className="card kpi accent">
          <div className="label">Total Paid to Vendors</div>
          <div className="val" style={{ color: 'var(--danger)' }}>-{money(totalPaidOut)}</div>
          <div className="sub">{expList.length} outsource fees paid</div>
        </div>
      </div>

      <div className="card">
        {expList.length > 0 ? (
          <div className="table-wrap cards">
            <table>
              <thead>
                <tr>
                  <th>Expense No</th>
                  <th>Vendor / Subcontractor</th>
                  <th>Category</th>
                  <th className="hide-m">Vehicle</th>
                  <th className="hide-m">Method / Ref</th>
                  <th className="r">Amount Paid</th>
                  <th className="r">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expList.map(e => {
                  const vObj = accounts.find(a => a.id === e.vendorId);
                  const jObj = jobs.find(j => j.id === e.jobId);

                  return (
                    <tr key={e.id}>
                      <td>
                        <b>{e.no}</b>
                        <div className="faint" style={{ fontSize: '12px' }}>{fd(e.date)}</div>
                      </td>

                      <td>
                        <a href={`#/account/${e.vendorId}`} onClick={(ev) => { ev.preventDefault(); onSelectAccount(e.vendorId); }}>
                          <b>{vObj?.name || '—'}</b>
                        </a>
                        {e.notes && <div className="faint" style={{ fontSize: '12px' }}>{e.notes}</div>}
                      </td>

                      <td>
                        <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                          {e.category}
                        </span>
                      </td>

                      <td className="hide-m">
                        {jObj ? (
                          <a href={`#/job/${jObj.id}`} onClick={(ev) => { ev.preventDefault(); onSelectJob(jObj.id); }}>
                            <span className="plate">{jObj.oldReg}</span>
                          </a>
                        ) : (
                          <span className="faint">General</span>
                        )}
                      </td>

                      <td className="hide-m">
                        {e.method}
                        {e.ref && <div className="faint" style={{ fontSize: '12px' }}>Ref: {e.ref}</div>}
                      </td>

                      <td className="r num" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                        -{money(e.amount)}
                      </td>

                      <td className="r">
                        <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn sm ghost" 
                            onClick={() => onEditExpense(e)} 
                            title="Edit payout"
                          >
                            <IconEdit />
                          </button>
                          <button 
                            className="btn sm ghost danger" 
                            onClick={() => onDeleteExpense(e.id)} 
                            title="Delete payout"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td></td>
                  <td></td>
                  <td className="hide-m"></td>
                  <td className="hide-m"></td>
                  <td className="r num" style={{ color: 'var(--danger)' }}>-{money(totalPaidOut)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="empty">No vendor payments recorded in this filter.</div>
        )}
      </div>
    </div>
  );
};
