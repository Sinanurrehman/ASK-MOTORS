import React from 'react';
import { Job, Account, Payment, Expense } from '../types';
import { 
  COMMERCIAL_FLOW, 
  num, 
  today, 
  money, 
  days, 
  fd,
  getJobTotal 
} from '../constants';
import { IconPlus, IconFile, IconCash } from './Icons';

interface DashboardViewProps {
  jobs: Job[];
  accounts: Account[];
  payments: Payment[];
  expenses: Expense[];
  onSelectJob: (id: string) => void;
  onSelectAccount: (id: string) => void;
  onNavigateToTab: (tab: string, filter?: string) => void;
  onNewJob: () => void;
  onNewPayment: () => void;
  onNewAccount?: () => void;
  onImportSeed?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  accounts,
  payments,
  onSelectJob,
  onSelectAccount,
  onNavigateToTab,
  onNewJob,
  onNewPayment,
  onNewAccount,
  onImportSeed
}) => {
  const openJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
  const curMonth = today().slice(0, 7);

  const recvMonth = payments
    .filter(p => p.date.startsWith(curMonth))
    .reduce((s, p) => s + num(p.amount), 0);

  const billMonth = jobs
    .filter(j => j.date.startsWith(curMonth) && j.status !== 'Cancelled')
    .reduce((s: number, j) => s + getJobTotal(j), 0);

  // Account stats calculation
  const getAccStats = (a: Account) => {
    if (a.kind === 'Vendor') {
      return { bal: 0, open: 0, vehicles: 0 };
    }
    const accJobs = jobs.filter(j => j.accountId === a.id && j.status !== 'Cancelled');
    const billed = accJobs.reduce((s: number, j) => s + getJobTotal(j), 0);
    const paid = payments.filter(p => p.accountId === a.id).reduce((s: number, p) => s + num(p.amount), 0);
    const bal = num(a.opening) + billed - paid;
    const open = accJobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled').length;
    return { bal, open, vehicles: accJobs.length };
  };

  const totalReceivable = accounts
    .map(a => getAccStats(a).bal)
    .filter(b => b > 0.5)
    .reduce((s, b) => s + b, 0);

  // Pending task counts
  const pendingMap: { [key: string]: number } = {};
  openJobs.forEach(j => {
    (j.tasks || []).forEach(t => {
      if (!t.done) {
        pendingMap[t.key] = (pendingMap[t.key] || 0) + 1;
      }
    });
  });

  const stageKeys = Array.from(new Set([...COMMERCIAL_FLOW, 'Transfer', ...Object.keys(pendingMap)]));

  const agingJobs = [...openJobs]
    .map(j => ({ job: j, d: days(j.date) }))
    .sort((a, b) => b.d - a.d)
    .slice(0, 8);

  const topBalances = accounts
    .map(a => ({ acc: a, stats: getAccStats(a) }))
    .filter(x => Math.abs(x.stats.bal) > 0.5)
    .sort((a, b) => b.stats.bal - a.stats.bal)
    .slice(0, 6);

  const recentPayments = [...payments]
    .sort((a, b) => (b.date + b.no).localeCompare(a.date + a.no))
    .slice(0, 6);

  if (jobs.length === 0 && accounts.length === 0) {
    return (
      <div className="card">
        <div className="empty" style={{ padding: '48px 20px' }}>
          <IconFile style={{ width: '48px', height: '48px', color: 'var(--primary)', margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px' }}>Welcome to ASK MOTORS</h3>
          <p className="muted" style={{ maxWidth: '460px', margin: '0 auto 20px' }}>
            Your cloud database is connected and active. Create your first vehicle file or add a party to start managing vehicle records.
          </p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <button className="btn primary" onClick={onNewJob}>
              <IconPlus /> Add First Vehicle File
            </button>
            {onNewAccount && (
              <button className="btn" onClick={onNewAccount}>
                <IconPlus /> Add Party / Customer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 4 KPIs */}
      <div className="grid kpis">
        <div className="card kpi accent">
          <div className="label">Outstanding Receivable</div>
          <div className="val">{money(totalReceivable)}</div>
          <div className="sub">
            across {accounts.filter(a => getAccStats(a).bal > 0.5).length} parties
          </div>
        </div>

        <div className="card kpi">
          <div className="label">Open Vehicle Files</div>
          <div className="val">{openJobs.length}</div>
          <div className="sub">
            {Object.values(pendingMap).reduce((a, b) => a + b, 0)} pending tasks
          </div>
        </div>

        <div className="card kpi">
          <div className="label">Received This Month</div>
          <div className="val">{money(recvMonth)}</div>
          <div className="sub">
            {payments.filter(p => p.date.startsWith(curMonth)).length} payments recorded
          </div>
        </div>

        <div className="card kpi">
          <div className="label">Billed This Month</div>
          <div className="val">{money(billMonth)}</div>
          <div className="sub">
            {jobs.filter(j => j.date.startsWith(curMonth)).length} files opened
          </div>
        </div>
      </div>

      {/* Pending Work by Stage */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-h">
          <h2>Pending Work by Stage</h2>
          <div className="btn-row">
            <button className="btn sm" onClick={() => onNavigateToTab('pending')}>
              Open Pending Board
            </button>
          </div>
        </div>
        <div className="card-b">
          <div className="stages">
            {stageKeys.map(k => (
              <div 
                key={k} 
                className={`stage ${pendingMap[k] ? '' : 'zero'}`}
                onClick={() => onNavigateToTab('pending', k)}
              >
                <b>{pendingMap[k] || 0}</b>
                <span>{k} pending</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aging & Balances Grid */}
      <div className="grid two" style={{ marginTop: '16px' }}>
        {/* Oldest open files */}
        <div className="card">
          <div className="card-h">
            <h2>Oldest Open Files</h2>
            <div className="btn-row">
              <button className="btn sm" onClick={() => onNavigateToTab('jobs', 'open')}>
                View All Open
              </button>
            </div>
          </div>

          {agingJobs.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th className="hide-m">Party</th>
                    <th>Next Step</th>
                    <th className="r">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {agingJobs.map(({ job: j, d }) => {
                    const nextTask = (j.tasks || []).find(t => !t.done);
                    const accObj = accounts.find(a => a.id === j.accountId);
                    return (
                      <tr key={j.id} className="click" onClick={() => onSelectJob(j.id)}>
                        <td>
                          <span style={{ whiteSpace: 'nowrap' }}>
                            <span className={`plate ${j.vtype === 'Commercial' ? 'com' : ''}`}>{j.oldReg}</span>
                            {j.newReg && <span className="plate new" style={{ marginLeft: '4px' }}>→ {j.newReg}</span>}
                          </span>
                          <div className="faint" style={{ fontSize: '12px', marginTop: '3px' }}>
                            {j.owner || '—'}
                          </div>
                        </td>
                        <td className="hide-m">{accObj?.name || '—'}</td>
                        <td>
                          {nextTask ? (
                            <span className="badge pending">{nextTask.key}</span>
                          ) : (
                            <span className={`badge ${j.status.toLowerCase().replace(/\s+/g, '')}`}>
                              {j.status}
                            </span>
                          )}
                        </td>
                        <td className="r num">
                          <b style={{ color: d > 30 ? 'var(--danger)' : d > 15 ? 'var(--warn)' : 'inherit' }}>
                            {d}
                          </b>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">All vehicle files completed!</div>
          )}
        </div>

        {/* Account balances & recent payments */}
        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card">
            <div className="card-h">
              <h2>Party Account Balances</h2>
              <div className="btn-row">
                <button className="btn sm" onClick={() => onNavigateToTab('accounts')}>
                  All Accounts
                </button>
              </div>
            </div>

            {topBalances.length > 0 ? (
              <table>
                <tbody>
                  {topBalances.map(({ acc: a, stats: s }) => (
                    <tr key={a.id} className="click" onClick={() => onSelectAccount(a.id)}>
                      <td>
                        <b>{a.name}</b>
                        <div className="faint" style={{ fontSize: '12px' }}>
                          {s.open} open · {s.vehicles} files
                        </div>
                      </td>
                      <td className={`r num ${s.bal > 0.5 ? 'bal-pos' : s.bal < -0.5 ? 'bal-neg' : 'bal-zero'}`}>
                        {money(s.bal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">All accounts settled.</div>
            )}
          </div>

          <div className="card">
            <div className="card-h">
              <h2>Recent Payments Received</h2>
              <div className="btn-row">
                <button className="btn sm primary" onClick={onNewPayment}>
                  <IconCash style={{ width: '14px' }} /> Receive
                </button>
              </div>
            </div>

            {recentPayments.length > 0 ? (
              <table>
                <tbody>
                  {recentPayments.map(p => {
                    const accObj = accounts.find(a => a.id === p.accountId);
                    return (
                      <tr key={p.id}>
                        <td>
                          <b>{accObj?.name || '—'}</b>
                          <div className="faint" style={{ fontSize: '12px' }}>
                            {fd(p.date)} · {p.method}
                          </div>
                        </td>
                        <td className="r num" style={{ color: 'var(--ok)', fontWeight: 700 }}>
                          {money(p.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty">No payments recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
