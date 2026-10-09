import React, { useState } from 'react';
import { Job, Payment, Account } from '../types';
import { 
  CHARGE_HEADS, 
  num, 
  money, 
  moneyPlain, 
  today, 
  fd,
  getJobTotal 
} from '../constants';
import { IconDownload, IconPrint } from './Icons';

interface ReportsViewProps {
  jobs: Job[];
  payments: Payment[];
  accounts: Account[];
  onSelectAccount: (id: string) => void;
  onExportExcel: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  jobs,
  payments,
  accounts,
  onSelectAccount,
  onExportExcel
}) => {
  const firstOfMonth = today().slice(0, 8) + '01';
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today());

  const filteredJobs = jobs.filter(j => j.date >= fromDate && j.date <= toDate && j.status !== 'Cancelled');
  const filteredPayments = payments.filter(p => p.date >= fromDate && p.date <= toDate);

  const totalBilled = filteredJobs.reduce((s: number, j) => s + getJobTotal(j), 0);
  const totalReceived = filteredPayments.reduce((s: number, p) => s + num(p.amount), 0);
  const serviceIncome = filteredJobs.reduce((s: number, j) => s + num(j.charges?.service), 0);

  // Charges by head
  const headTotals = CHARGE_HEADS.map(([k, label]) => {
    const sum = filteredJobs.reduce((s, j) => s + num(j.charges?.[k]), 0);
    return { key: k, label, amount: sum };
  }).filter(h => h.amount > 0);

  // Method distribution
  const byMethod: { [key: string]: number } = {};
  filteredPayments.forEach(p => {
    byMethod[p.method] = (byMethod[p.method] || 0) + num(p.amount);
  });

  // Party summary
  const partySummaries = accounts.map(a => {
    const aJobs = filteredJobs.filter(j => j.accountId === a.id);
    const aPays = filteredPayments.filter(p => p.accountId === a.id);
    const charged = aJobs.reduce((s: number, j) => s + getJobTotal(j), 0);
    const recd = aPays.reduce((s, p) => s + num(p.amount), 0);
    return {
      account: a,
      filesCount: aJobs.length,
      charged,
      received: recd
    };
  }).filter(x => x.filesCount > 0 || x.received > 0).sort((a, b) => b.charged - a.charged);

  const setPreset = (f: string, t: string) => {
    setFromDate(f);
    setToDate(t);
  };

  const getSubDays = (daysCount: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysCount);
    return d.toISOString().slice(0, 10);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Business Reports &amp; Analytics</h2>
          <p>{fd(fromDate)} to {fd(toDate)}</p>
        </div>
        <div className="btn-row">
          <input 
            type="date" 
            className="btn" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)} 
            aria-label="From Date" 
          />
          <input 
            type="date" 
            className="btn" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)} 
            aria-label="To Date" 
          />
          <button className="btn" onClick={onExportExcel}>
            <IconDownload /> Export Excel
          </button>
          <button className="btn" onClick={() => window.print()}>
            <IconPrint /> Print Report
          </button>
        </div>
      </div>

      {/* Preset tabs */}
      <div className="tabs">
        <button className={`tab ${fromDate === firstOfMonth && toDate === today() ? 'active' : ''}`} onClick={() => setPreset(firstOfMonth, today())}>
          This Month
        </button>
        <button className={`tab ${fromDate === getSubDays(6) && toDate === today() ? 'active' : ''}`} onClick={() => setPreset(getSubDays(6), today())}>
          Last 7 Days
        </button>
        <button className={`tab ${fromDate === getSubDays(29) && toDate === today() ? 'active' : ''}`} onClick={() => setPreset(getSubDays(29), today())}>
          Last 30 Days
        </button>
        <button className={`tab ${fromDate === today().slice(0, 4) + '-01-01' ? 'active' : ''}`} onClick={() => setPreset(today().slice(0, 4) + '-01-01', today())}>
          This Year
        </button>
      </div>

      {/* 4 KPIs */}
      <div className="grid kpis">
        <div className="card kpi accent">
          <div className="label">Files Handled</div>
          <div className="val">{filteredJobs.length}</div>
          <div className="sub">{filteredJobs.filter(j => j.vtype === 'Commercial').length} commercial</div>
        </div>

        <div className="card kpi">
          <div className="label">Total Billed</div>
          <div className="val">{money(totalBilled)}</div>
        </div>

        <div className="card kpi">
          <div className="label">Total Collected</div>
          <div className="val" style={{ color: 'var(--ok)' }}>{money(totalReceived)}</div>
        </div>

        <div className="card kpi">
          <div className="label">Service Charges (Gross Revenue)</div>
          <div className="val">{money(serviceIncome)}</div>
        </div>
      </div>

      {/* 2-column breakdown */}
      <div className="grid two" style={{ marginTop: '16px' }}>
        {/* Party-wise breakdown */}
        <div className="card">
          <div className="card-h">
            <h3>Party-wise Revenue Summary</h3>
          </div>
          {partySummaries.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Party</th>
                    <th className="r">Files</th>
                    <th className="r">Charged</th>
                    <th className="r">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {partySummaries.map(p => (
                    <tr key={p.account.id} className="click" onClick={() => onSelectAccount(p.account.id)}>
                      <td><b>{p.account.name}</b></td>
                      <td className="r num">{p.filesCount}</td>
                      <td className="r num">{moneyPlain(p.charged)}</td>
                      <td className="r num" style={{ color: 'var(--ok)' }}>{moneyPlain(p.received)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">No party activity in this time period.</div>
          )}
        </div>

        {/* Head-wise and method breakdown */}
        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card">
            <div className="card-h">
              <h3>Excise Charges by Head</h3>
            </div>
            <div className="card-b">
              {headTotals.length > 0 ? (
                <>
                  <table className="lines">
                    <tbody>
                      {headTotals.map(h => (
                        <tr key={h.key}>
                          <td>{h.label}</td>
                          <td className="r num">{money(h.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="money-sum">
                    <span>Total Billed</span>
                    <span>{money(totalBilled)}</span>
                  </div>
                </>
              ) : (
                <div className="muted">No charges recorded.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>Receipts by Payment Method</h3>
            </div>
            <div className="card-b">
              {Object.keys(byMethod).length > 0 ? (
                <table className="lines">
                  <tbody>
                    {Object.entries(byMethod).map(([m, amt]) => (
                      <tr key={m}>
                        <td>{m}</td>
                        <td className="r num" style={{ color: 'var(--ok)' }}>{money(amt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="muted">No payments received in this period.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
