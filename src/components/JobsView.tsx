import React, { useState, useMemo } from 'react';
import { Job, Account, Payment } from '../types';
import { 
  STATUSES, 
  num, 
  money, 
  fd, 
  normVal,
  getJobTotal 
} from '../constants';
import { IconPlus, IconDownload, IconCheck, IconFile, IconTrash } from './Icons';

interface JobsViewProps {
  jobs: Job[];
  accounts: Account[];
  payments: Payment[];
  services: string[];
  initialFilter?: string;
  onSelectJob: (id: string) => void;
  onNewJob: () => void;
  onToggleFileReturn: (job: Job) => void;
  onExportExcel: (subset: Job[]) => void;
  onDeleteJob?: (id: string) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  accounts,
  payments,
  services,
  initialFilter = 'open',
  onSelectJob,
  onNewJob,
  onToggleFileReturn,
  onExportExcel,
  onDeleteJob
}) => {
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [partyFilter, setPartyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Duplicate detection computation
  const { dupJobIds, dupCountMap } = useMemo(() => {
    const regMap = new Map<string, string[]>();
    const chMap = new Map<string, string[]>();

    jobs.forEach(j => {
      [j.oldReg, j.newReg].forEach(r => {
        const nr = normVal(r);
        if (nr) {
          if (!regMap.has(nr)) regMap.set(nr, []);
          regMap.get(nr)!.push(j.id);
        }
      });
      const nch = normVal(j.chassis);
      if (nch) {
        if (!chMap.has(nch)) chMap.set(nch, []);
        chMap.get(nch)!.push(j.id);
      }
    });

    const dupIds = new Set<string>();
    const counts = new Map<string, number>();

    regMap.forEach(ids => {
      if (ids.length > 1) {
        ids.forEach(id => {
          dupIds.add(id);
          counts.set(id, Math.max(counts.get(id) || 1, ids.length));
        });
      }
    });

    chMap.forEach(ids => {
      if (ids.length > 1) {
        ids.forEach(id => {
          dupIds.add(id);
          counts.set(id, Math.max(counts.get(id) || 1, ids.length));
        });
      }
    });

    return { dupJobIds: dupIds, dupCountMap: counts };
  }, [jobs]);

  const jobPaid = (j: Job) => payments.filter(p => p.jobId === j.id).reduce((s: number, p) => s + num(p.amount), 0);
  const jobBal = (j: Job) => getJobTotal(j) - jobPaid(j);

  // Filtering
  const filteredJobs = useMemo(() => {
    let list = [...jobs];

    if (statusFilter === 'open') {
      list = list.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
    } else if (statusFilter === 'all') {
      // all
    } else if (statusFilter === 'returned') {
      list = list.filter(j => !!j.fileReturned);
    } else if (statusFilter === 'pending_return') {
      list = list.filter(j => !j.fileReturned);
    } else if (statusFilter === 'duplicates') {
      list = list.filter(j => dupJobIds.has(j.id));
    } else if (statusFilter) {
      list = list.filter(j => j.status === statusFilter);
    }

    if (partyFilter) {
      list = list.filter(j => j.accountId === partyFilter);
    }

    if (typeFilter) {
      list = list.filter(j => j.vtype === typeFilter);
    }

    if (serviceFilter) {
      list = list.filter(j => (j.services || []).includes(serviceFilter));
    }

    if (searchQuery.trim()) {
      const q = normVal(searchQuery);
      list = list.filter(j => {
        const accObj = accounts.find(a => a.id === j.accountId);
        const hay = [j.no, j.oldReg, j.newReg, j.owner, accObj?.name, j.chassis, j.engine, j.receiptNo].map(normVal).join('|');
        return hay.includes(q);
      });
    }

    return list.sort((a, b) => (b.date + b.no).localeCompare(a.date + a.no));
  }, [jobs, accounts, statusFilter, partyFilter, typeFilter, serviceFilter, searchQuery, dupJobIds]);

  const totalCharges = filteredJobs.reduce((s: number, j) => s + getJobTotal(j), 0);
  const totalBalance = filteredJobs.reduce((s: number, j) => s + jobBal(j), 0);

  const filterTabs = [
    { key: 'open', label: 'Open', count: jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled').length },
    { key: 'all', label: 'All', count: jobs.length },
    { key: 'returned', label: '✔ Returned', count: jobs.filter(j => !!j.fileReturned).length },
    { key: 'pending_return', label: '📁 In Office', count: jobs.filter(j => !j.fileReturned).length },
    { key: 'duplicates', label: '⚠️ Duplicates', count: dupJobIds.size },
    ...STATUSES.map(s => ({ key: s, label: s, count: jobs.filter(j => j.status === s).length }))
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Vehicle Files</h2>
          <p>Excise files, transfer dockets, alteration and commercial compliance workflows.</p>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={() => onExportExcel(filteredJobs)}>
            <IconDownload /> Excel
          </button>
          <button className="btn primary" onClick={onNewJob}>
            <IconPlus /> New File
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {filterTabs.map(t => (
          <button
            key={t.key}
            className={`tab ${statusFilter === t.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(t.key)}
          >
            {t.label}
            <span className="c">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="filters">
        <input 
          placeholder="Filter table rows…" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '180px' }}
        />
        <select value={partyFilter} onChange={(e) => setPartyFilter(e.target.value)}>
          <option value="">All Parties / Accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="Private">Private</option>
          <option value="Commercial">Commercial</option>
        </select>
        <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          <option value="">All Services</option>
          {services.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {filteredJobs.length > 0 ? (
          <div className="table-wrap cards">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th className="hide-m">Date</th>
                  <th className="hide-m">Owner / Party</th>
                  <th className="hide-m">Services</th>
                  <th className="hide-m">File Return</th>
                  <th className="r hide-m">Charges</th>
                  <th className="r">Balance</th>
                  <th className="hide-m">Status</th>
                  <th className="hide-m" style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(j => {
                  const accObj = accounts.find(a => a.id === j.accountId);
                  const isDup = dupJobIds.has(j.id);
                  const dupCount = dupCountMap.get(j.id) || 1;
                  const bal = jobBal(j);
                  const nextTask = (j.tasks || []).find(t => !t.done);

                  return (
                    <tr 
                      key={j.id} 
                      className={`click ${isDup ? 'has-duplicate' : ''}`}
                    >
                      <td onClick={() => onSelectJob(j.id)}>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          <span className={`plate ${j.vtype === 'Commercial' ? 'com' : ''}`}>{j.oldReg}</span>
                          {j.newReg && <span className="plate new" style={{ marginLeft: '4px' }}>→ {j.newReg}</span>}
                        </span>

                        {isDup && (
                          <span className="badge badge-dup" style={{ marginLeft: '6px' }}>
                            ⚠️ DUP ({dupCount})
                          </span>
                        )}

                        {j.fileReturned && (
                          <span className="badge returned" style={{ marginLeft: '6px' }}>
                            ✔ Returned
                          </span>
                        )}

                        <div className="faint" style={{ fontSize: '12px', marginTop: '3px' }}>
                          {j.no} {j.vtype === 'Commercial' ? '· Commercial' : ''}
                        </div>

                        {/* Mobile summary view */}
                        <div className="show-m" style={{ fontSize: '12.5px', marginTop: '6px' }}>
                          <b>{j.owner || accObj?.name}</b>
                          {j.owner && accObj?.name ? ` · ${accObj.name}` : ''} · {fd(j.date)}
                          <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <span className={`badge ${j.status.toLowerCase().replace(/\s+/g, '')}`}>
                              {j.status}
                            </span>
                            {nextTask && j.status !== 'Completed' && (
                              <span className="badge pending">Next: {nextTask.key}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="hide-m num" onClick={() => onSelectJob(j.id)}>{fd(j.date)}</td>
                      <td className="hide-m" onClick={() => onSelectJob(j.id)}>
                        <b>{j.owner || accObj?.name}</b>
                        {j.owner && <div className="faint" style={{ fontSize: '12px' }}>{accObj?.name}</div>}
                      </td>
                      <td className="hide-m" onClick={() => onSelectJob(j.id)} style={{ maxWidth: '200px' }}>
                        {(j.services || []).map(s => (
                          <span key={s} className="badge" style={{ margin: '1px' }}>{s}</span>
                        ))}
                      </td>

                      {/* File Return Quick Button */}
                      <td className="hide-m">
                        <button
                          className={`btn sm ${j.fileReturned ? 'ghost' : 'ghost'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFileReturn(j);
                          }}
                          style={{
                            fontSize: '11.5px',
                            padding: '3px 8px',
                            color: j.fileReturned ? 'var(--ok)' : 'var(--muted)'
                          }}
                        >
                          {j.fileReturned ? <><IconCheck /> Returned</> : <><IconFile /> In Office</>}
                        </button>
                      </td>

                      <td className="r num hide-m" onClick={() => onSelectJob(j.id)}>{money(getJobTotal(j))}</td>
                      <td className={`r num ${bal > 0.5 ? 'bal-pos' : bal < -0.5 ? 'bal-neg' : 'bal-zero'}`} onClick={() => onSelectJob(j.id)}>
                        {money(bal)}
                      </td>
                      <td className="hide-m" onClick={() => onSelectJob(j.id)}>
                        <span className={`badge ${j.status.toLowerCase().replace(/\s+/g, '')}`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="hide-m" style={{ textAlign: 'center' }}>
                        {onDeleteJob && (
                          <button
                            className="btn ghost sm"
                            title="Delete vehicle file"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteJob(j.id);
                            }}
                            style={{ padding: '3px 6px', color: 'var(--danger, #dc2626)' }}
                          >
                            <IconTrash style={{ width: '13px', height: '13px' }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>{filteredJobs.length} files</td>
                  <td className="hide-m"></td>
                  <td className="hide-m"></td>
                  <td className="hide-m"></td>
                  <td className="hide-m"></td>
                  <td className="r num hide-m">{money(totalCharges)}</td>
                  <td className="r num">{money(totalBalance)}</td>
                  <td className="hide-m"></td>
                  <td className="hide-m"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="empty">
            No vehicle files match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
