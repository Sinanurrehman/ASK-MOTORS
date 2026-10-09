import React, { useState } from 'react';
import { Account, Job, Payment, Expense } from '../types';
import { 
  num, 
  money, 
  moneyPlain, 
  fd, 
  today,
  getJobTotal 
} from '../constants';
import { 
  IconEdit, 
  IconPlus, 
  IconCash, 
  IconPrint, 
  IconWhatsApp, 
  IconTrash 
} from './Icons';

interface AccountDetailViewProps {
  account: Account;
  jobs: Job[];
  payments: Payment[];
  expenses: Expense[];
  onEditAccount: () => void;
  onDeleteAccount: () => void;
  onNewJobForAccount: () => void;
  onReceivePayment: () => void;
  onPayVendor: () => void;
  onDeleteExpense: (expenseId: string) => void;
  onPrintStatement: (rows: LedgerRow[], opening: number, closing: number, from: string, to: string) => void;
  onWhatsAppStatement: (stats: AccountStats) => void;
  onSelectJob: (id: string) => void;
}

export interface LedgerRow {
  date: string;
  ref: string;
  desc: string;
  dr: number;
  cr: number;
  bal: number;
  jobId?: string;
  paymentId?: string;
}

export interface AccountStats {
  billed: number;
  paid: number;
  opening: number;
  bal: number;
  open: number;
  vehicles: number;
  isVendor: boolean;
}

export const AccountDetailView: React.FC<AccountDetailViewProps> = ({
  account,
  jobs,
  payments,
  expenses,
  onEditAccount,
  onDeleteAccount,
  onNewJobForAccount,
  onReceivePayment,
  onPayVendor,
  onDeleteExpense,
  onPrintStatement,
  onWhatsAppStatement,
  onSelectJob
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const isVendor = account.kind === 'Vendor';

  // Vendor handling
  if (isVendor) {
    const vExps = expenses
      .filter(e => e.vendorId === account.id)
      .sort((a, b) => (b.date + b.no).localeCompare(a.date + a.no));

    const totalPaid = vExps.reduce((s, e) => s + num(e.amount), 0);
    const linkedJobIds = Array.from(new Set(vExps.map(e => e.jobId).filter(Boolean)));
    const linkedJobs = jobs.filter(j => linkedJobIds.includes(j.id));
    const opening = num(account.opening);
    const netBal = opening - totalPaid;

    return (
      <div>
        <div className="page-head">
          <div>
            <h2>{account.name}</h2>
            <p>
              <span className="badge vendor">Vendor / Agent / Subcontractor</span>
              {account.phone ? ` · ${account.phone}` : ''}
              {account.address ? ` · ${account.address}` : ''}
            </p>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={onEditAccount}>
              <IconEdit /> Edit Vendor
            </button>
            <button className="btn primary" onClick={onPayVendor}>
              <IconPlus /> Pay Vendor / Agent
            </button>
          </div>
        </div>

        <div className="grid kpis">
          <div className="card kpi accent">
            <div className="label">Total Paid to Vendor</div>
            <div className="val" style={{ color: 'var(--danger)' }}>{money(totalPaid)}</div>
            <div className="sub">Across {vExps.length} payouts</div>
          </div>
          <div className="card kpi">
            <div className="label">Vehicles Handled</div>
            <div className="val">{linkedJobs.length}</div>
            <div className="sub">Outsourced files</div>
          </div>
          <div className="card kpi">
            <div className="label">Opening Balance</div>
            <div className="val">{money(opening)}</div>
            <div className="sub">{opening > 0 ? 'Payable' : 'Settled'}</div>
          </div>
          <div className="card kpi">
            <div className="label">Net Balance</div>
            <div className={`val ${netBal > 0.5 ? 'bal-pos' : netBal < -0.5 ? 'bal-neg' : 'bal-zero'}`}>
              {money(netBal)}
            </div>
            <div className="sub">{netBal < 0 ? 'Advance paid' : 'Payable'}</div>
          </div>
        </div>

        {/* Payouts list */}
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-h">
            <h3>Payments Made to {account.name} ({vExps.length})</h3>
            <button className="btn sm primary" onClick={onPayVendor}>
              <IconPlus /> Record Payment
            </button>
          </div>
          {vExps.length > 0 ? (
            <div className="table-wrap cards">
              <table>
                <thead>
                  <tr>
                    <th>Expense No</th>
                    <th>Category / Work</th>
                    <th>Vehicle File</th>
                    <th>Method / Ref</th>
                    <th className="r">Amount Paid</th>
                    <th className="r"></th>
                  </tr>
                </thead>
                <tbody>
                  {vExps.map(e => {
                    const jObj = jobs.find(j => j.id === e.jobId);
                    return (
                      <tr key={e.id}>
                        <td>
                          <b>{e.no}</b>
                          <div className="faint" style={{ fontSize: '12px' }}>{fd(e.date)}</div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                            {e.category}
                          </span>
                          {e.notes && <div className="faint" style={{ fontSize: '12px' }}>{e.notes}</div>}
                        </td>
                        <td>
                          {jObj ? (
                            <a href={`#/job/${jObj.id}`} onClick={(ev) => { ev.preventDefault(); onSelectJob(jObj.id); }}>
                              <b>{jObj.oldReg}</b> {jObj.owner ? `(${jObj.owner})` : ''}
                            </a>
                          ) : <span className="faint">General expense</span>}
                        </td>
                        <td>
                          {e.method}
                          {e.ref && <div className="faint" style={{ fontSize: '12px' }}>Ref: {e.ref}</div>}
                        </td>
                        <td className="r num" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                          -{money(e.amount)}
                        </td>
                        <td className="r">
                          <button 
                            className="btn sm ghost danger" 
                            onClick={() => onDeleteExpense(e.id)}
                            title="Delete payout"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Outflow</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="r num" style={{ color: 'var(--danger)' }}>-{money(totalPaid)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="empty">No expenses or outsource fees recorded for this vendor yet.</div>
          )}
        </div>

        <div style={{ marginTop: '16px' }}>
          <button className="btn danger" onClick={onDeleteAccount}>
            <IconTrash /> Delete Vendor
          </button>
        </div>
      </div>
    );
  }

  // Party / Customer handling
  const accJobs = jobs.filter(j => j.accountId === account.id && j.status !== 'Cancelled');
  const accPayments = payments.filter(p => p.accountId === account.id);

  const totalCharged = accJobs.reduce((s: number, j) => s + getJobTotal(j), 0);
  const totalReceived = accPayments.reduce((s: number, p) => s + num(p.amount), 0);
  const openingBalance = num(account.opening);
  const currentBalance = openingBalance + totalCharged - totalReceived;
  const openFilesCount = accJobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled').length;

  // Ledger calculation with running balance
  const rawRows: { date: string; sortKey: string; ref: string; desc: string; dr: number; cr: number; jobId?: string; paymentId?: string }[] = [];

  accJobs.forEach(j => {
    rawRows.push({
      date: j.date,
      sortKey: j.date + '0' + j.no,
      ref: j.no,
      desc: `${j.oldReg}${j.newReg ? ' → ' + j.newReg : ''} · ${(j.services || []).join(', ')}${j.owner ? ' · ' + j.owner : ''}`,
      dr: getJobTotal(j),
      cr: 0,
      jobId: j.id
    });
  });

  accPayments.forEach(p => {
    const linkedJob = jobs.find(j => j.id === p.jobId);
    rawRows.push({
      date: p.date,
      sortKey: p.date + '1' + p.no,
      ref: p.no,
      desc: `Received · ${p.method}${p.ref ? ' (' + p.ref + ')' : ''}${linkedJob ? ' · ' + linkedJob.oldReg : ''}${p.notes ? ' · ' + p.notes : ''}`,
      dr: 0,
      cr: num(p.amount),
      paymentId: p.id
    });
  });

  rawRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  let runningBal = openingBalance;
  let ledgerOpening = runningBal;
  const finalLedgerRows: LedgerRow[] = [];

  rawRows.forEach(r => {
    runningBal += r.dr - r.cr;
    const item: LedgerRow = { ...r, bal: runningBal };

    if (fromDate && r.date < fromDate) {
      ledgerOpening = runningBal;
      return;
    }
    if (toDate && r.date > toDate) {
      return;
    }

    finalLedgerRows.push(item);
  });

  const ledgerClosing = finalLedgerRows.length > 0
    ? (finalLedgerRows[finalLedgerRows.length - 1]?.bal ?? ledgerOpening)
    : ledgerOpening;

  const statsObj: AccountStats = {
    billed: totalCharged,
    paid: totalReceived,
    opening: openingBalance,
    bal: currentBalance,
    open: openFilesCount,
    vehicles: accJobs.length,
    isVendor: false
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>{account.name}</h2>
          <p>
            {account.kind === 'Party' ? 'Party / Company / Dealer' : 'Individual Customer'}
            {account.phone ? ` · ${account.phone}` : ''}
            {account.cnic ? ` · CNIC ${account.cnic}` : ''}
            {account.address ? ` · ${account.address}` : ''}
          </p>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={onEditAccount}>
            <IconEdit /> Edit
          </button>
          <button className="btn" onClick={onNewJobForAccount}>
            <IconPlus /> New File
          </button>
          <button className="btn primary" onClick={onReceivePayment}>
            <IconCash /> Receive Payment
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid kpis">
        <div className="card kpi accent">
          <div className="label">Balance Due</div>
          <div className={`val ${currentBalance > 0.5 ? 'bal-pos' : currentBalance < -0.5 ? 'bal-neg' : 'bal-zero'}`}>
            {money(currentBalance)}
          </div>
          <div className="sub">{currentBalance < 0 ? 'Advance with you' : 'Receivable'}</div>
        </div>

        <div className="card kpi">
          <div className="label">Total Charged</div>
          <div className="val">{money(totalCharged)}</div>
          <div className="sub">
            {openingBalance ? `+ opening ${money(openingBalance)}` : `${accJobs.length} vehicle files`}
          </div>
        </div>

        <div className="card kpi">
          <div className="label">Total Received</div>
          <div className="val" style={{ color: 'var(--ok)' }}>{money(totalReceived)}</div>
          <div className="sub">{accPayments.length} payments recorded</div>
        </div>

        <div className="card kpi">
          <div className="label">Open Files</div>
          <div className="val">{openFilesCount}</div>
          <div className="sub">Ongoing excise tasks</div>
        </div>
      </div>

      {/* Account Statement Ledger */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-h">
          <h3>Account Statement Ledger</h3>
          <div className="btn-row">
            <input 
              type="date" 
              className="btn sm" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
              aria-label="From Date" 
            />
            <input 
              type="date" 
              className="btn sm" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
              aria-label="To Date" 
            />
            <button 
              className="btn sm" 
              onClick={() => onPrintStatement(finalLedgerRows, ledgerOpening, ledgerClosing, fromDate, toDate)}
            >
              <IconPrint /> Print Statement
            </button>
            <button 
              className="btn sm" 
              onClick={() => onWhatsAppStatement(statsObj)}
            >
              <IconWhatsApp /> WhatsApp
            </button>
          </div>
        </div>

        <div className="table-wrap ledger">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th className="hide-m">Ref</th>
                <th>Transaction Details</th>
                <th className="r">Debit (Charged)</th>
                <th className="r">Credit (Received)</th>
                <th className="r hide-m">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="num">{fromDate ? fd(fromDate) : '—'}</td>
                <td className="hide-m"></td>
                <td><b>Opening Balance</b></td>
                <td className="r"></td>
                <td className="r"></td>
                <td className="r num hide-m"><b>{money(ledgerOpening)}</b></td>
              </tr>

              {finalLedgerRows.map((r, i) => (
                <tr 
                  key={i} 
                  className={r.jobId ? 'click' : ''} 
                  onClick={() => r.jobId && onSelectJob(r.jobId)}
                >
                  <td className="num">{fd(r.date)}</td>
                  <td className="hide-m faint">{r.ref}</td>
                  <td>{r.desc}</td>
                  <td className="r num">{r.dr ? moneyPlain(r.dr) : ''}</td>
                  <td className="r num" style={{ color: 'var(--ok)' }}>{r.cr ? moneyPlain(r.cr) : ''}</td>
                  <td className="r num hide-m">{moneyPlain(r.bal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td className="hide-m"></td>
                <td>Closing Balance</td>
                <td className="r num">{moneyPlain(finalLedgerRows.reduce((s, r) => s + r.dr, 0))}</td>
                <td className="r num">{moneyPlain(finalLedgerRows.reduce((s, r) => s + r.cr, 0))}</td>
                <td className={`r num hide-m ${ledgerClosing > 0.5 ? 'bal-pos' : ledgerClosing < -0.5 ? 'bal-neg' : 'bal-zero'}`}>
                  {money(ledgerClosing)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Linked vehicle files list */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-h">
          <h3>Vehicle Files ({accJobs.length})</h3>
        </div>
        {accJobs.length > 0 ? (
          <div className="table-wrap cards">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th className="hide-m">Date</th>
                  <th className="hide-m">Owner</th>
                  <th className="r hide-m">Total Charged</th>
                  <th className="r">Status</th>
                </tr>
              </thead>
              <tbody>
                {accJobs.map(j => (
                  <tr key={j.id} className="click" onClick={() => onSelectJob(j.id)}>
                    <td>
                      <span className={`plate ${j.vtype === 'Commercial' ? 'com' : ''}`}>{j.oldReg}</span>
                      {j.newReg && <span className="plate new" style={{ marginLeft: '4px' }}>→ {j.newReg}</span>}
                      {j.fileReturned && <span className="badge returned" style={{ marginLeft: '6px' }}>✔ Returned</span>}
                    </td>
                    <td className="hide-m num">{fd(j.date)}</td>
                    <td className="hide-m">{j.owner || '—'}</td>
                    <td className="r num hide-m">{money(getJobTotal(j))}</td>
                    <td className="r">
                      <span className={`badge ${j.status.toLowerCase().replace(/\s+/g, '')}`}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No vehicle files linked to this account yet.</div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <button className="btn danger" onClick={onDeleteAccount}>
          <IconTrash /> Delete Account
        </button>
      </div>
    </div>
  );
};
