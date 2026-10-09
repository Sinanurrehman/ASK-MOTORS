import React from 'react';
import { Job, Account, Payment, Expense } from '../types';
import { 
  CHARGE_HEADS, 
  STATUSES, 
  COMMERCIAL_FLOW, 
  num, 
  money, 
  fd, 
  days,
  normVal,
  getJobTotal 
} from '../constants';
import { 
  IconCheck, 
  IconEdit, 
  IconCash, 
  IconFile, 
  IconAlert, 
  IconPlus, 
  IconTrash, 
  IconPrint, 
  IconWhatsApp 
} from './Icons';

interface JobDetailViewProps {
  job: Job;
  accounts: Account[];
  payments: Payment[];
  expenses: Expense[];
  allJobs: Job[];
  onUpdateJobStatus: (newStatus: Job['status']) => void;
  onToggleTask: (index: number) => void;
  onToggleFileReturn: () => void;
  onEditJob: () => void;
  onDeleteJob: () => void;
  onReceivePayment: () => void;
  onPayVendor: () => void;
  onDeleteExpense: (expenseId: string) => void;
  onPrintJobSlip: () => void;
  onWhatsAppShare: () => void;
  onSelectJob: (id: string) => void;
  onSelectAccount: (id: string) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  accounts,
  payments,
  expenses,
  allJobs,
  onUpdateJobStatus,
  onToggleTask,
  onToggleFileReturn,
  onEditJob,
  onDeleteJob,
  onReceivePayment,
  onPayVendor,
  onDeleteExpense,
  onPrintJobSlip,
  onWhatsAppShare,
  onSelectJob,
  onSelectAccount
}) => {
  const accObj = accounts.find(a => a.id === job.accountId);
  const jobPayments = payments.filter(p => p.jobId === job.id);
  const jobExpensesList = expenses.filter(e => e.jobId === job.id);

  const totalCharged = getJobTotal(job);
  const totalReceived = jobPayments.reduce((s: number, p) => s + num(p.amount), 0);
  const balanceDue = totalCharged - totalReceived;

  const totalOutsourceCost = jobExpensesList.reduce((s: number, e) => s + num(e.amount), 0);
  const netOfficeMargin = totalCharged - totalOutsourceCost;

  const tasks = job.tasks || [];
  const nextTask = tasks.find(t => !t.done);

  // Duplicate detection
  const oNorm = normVal(job.oldReg);
  const nNorm = normVal(job.newReg);
  const chNorm = normVal(job.chassis);

  const duplicateMatches: { otherJob: Job; reason: string }[] = [];
  if (oNorm || nNorm || chNorm) {
    allJobs.forEach(other => {
      if (other.id === job.id) return;
      const oo = normVal(other.oldReg);
      const on = normVal(other.newReg);
      const och = normVal(other.chassis);
      const reasons: string[] = [];

      if (oNorm && (oo === oNorm || on === oNorm)) reasons.push(`Registration ${job.oldReg}`);
      if (nNorm && (oo === nNorm || on === nNorm)) reasons.push(`New Reg ${job.newReg}`);
      if (chNorm && och === chNorm) reasons.push(`Chassis ${job.chassis}`);

      if (reasons.length > 0) {
        duplicateMatches.push({ otherJob: other, reason: reasons.join(', ') });
      }
    });
  }

  // Commercial sequential workflow warning check
  let flowWarning = '';
  if (job.vtype === 'Commercial') {
    const taskMap: { [key: string]: boolean } = {};
    tasks.forEach(t => { taskMap[t.key] = t.done; });
    for (let i = 1; i < COMMERCIAL_FLOW.length; i++) {
      const k = COMMERCIAL_FLOW[i];
      const prev = COMMERCIAL_FLOW[i - 1];
      if (taskMap[k] && taskMap[prev] === false) {
        flowWarning = `${k} completed before ${prev}`;
        break;
      }
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ whiteSpace: 'nowrap' }}>
              <span className={`plate ${job.vtype === 'Commercial' ? 'com' : ''}`}>{job.oldReg}</span>
              {job.newReg && <span className="plate new" style={{ marginLeft: '4px' }}>→ {job.newReg}</span>}
            </span>

            <span className={`badge ${job.status.toLowerCase().replace(/\s+/g, '')}`}>
              {job.status}
            </span>

            {job.vtype === 'Commercial' && (
              <span className="badge com">Commercial</span>
            )}

            {duplicateMatches.length > 0 && (
              <span className="badge badge-dup">
                ⚠️ DUPLICATE DETECTED ({duplicateMatches.length})
              </span>
            )}

            {job.fileReturned && (
              <span className="badge returned">
                ✔ File Returned
              </span>
            )}
          </div>

          <h2>{job.owner || accObj?.name || 'Vehicle Docket'}</h2>
          <p>
            {job.no} · Opened {fd(job.date)}
            {job.status !== 'Completed' && job.status !== 'Cancelled' ? ` · ${days(job.date)} days in progress` : ''}
          </p>
        </div>

        <div className="btn-row">
          <select 
            className="btn" 
            value={job.status} 
            onChange={(e) => onUpdateJobStatus(e.target.value as Job['status'])}
            style={{ fontWeight: 600 }}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button className="btn" onClick={onEditJob}>
            <IconEdit /> Edit
          </button>

          <button className="btn danger" onClick={onDeleteJob} title="Delete this vehicle file">
            <IconTrash /> Delete
          </button>

          <button className="btn primary" onClick={onReceivePayment}>
            <IconCash /> Receive Payment
          </button>
        </div>
      </div>

      {/* Physical File Return Status Box */}
      <div className={`file-return-card ${job.fileReturned ? 'is-returned' : ''}`}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            {job.fileReturned ? (
              <span style={{ color: 'var(--ok)' }}><IconCheck /> Physical File Returned to Customer / Party</span>
            ) : (
              <span><IconFile /> Physical File Currently in Office (Not Handed Over)</span>
            )}
          </div>
          <small className="muted" style={{ display: 'block', marginTop: '2px' }}>
            {job.fileReturned ? (
              <>Delivered on <b>{fd(job.fileReturnDate)}</b> to <b>{job.fileReturnTo || job.owner || accObj?.name}</b></>
            ) : (
              'Case file has not been handed over yet. Click button once vehicle file is delivered.'
            )}
          </small>
        </div>

        <button 
          className={`btn sm ${job.fileReturned ? 'ghost' : 'primary'}`}
          onClick={onToggleFileReturn}
        >
          {job.fileReturned ? 'Mark In Office' : <><IconCheck /> Mark File Returned</>}
        </button>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateMatches.length > 0 && (
        <div className="dup-warning-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
            <IconAlert style={{ width: '20px', color: '#fbbf24' }} />
            ⚠️ DUPLICATE REGISTRATION / CHASSIS FOUND ({duplicateMatches.length} matching file{duplicateMatches.length > 1 ? 's' : ''})
          </div>
          <p style={{ margin: '6px 0 10px', fontSize: '12.5px' }}>
            This vehicle entry shares identical registration or chassis information with other files in the system:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {duplicateMatches.map((m, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px'
                }}
              >
                <div>
                  <b>{m.otherJob.no}</b> — {m.otherJob.oldReg} {m.otherJob.newReg ? `→ ${m.otherJob.newReg}` : ''} ({m.otherJob.owner || '—'}) · <span className="muted">{m.reason}</span>
                </div>
                <button 
                  className="btn sm" 
                  onClick={() => onSelectJob(m.otherJob.id)}
                  style={{ textDecoration: 'none' }}
                >
                  View File →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {flowWarning && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', background: 'var(--warn-soft)', color: 'var(--warn)', borderColor: 'transparent', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <IconAlert style={{ width: '18px' }} />
          <span><b>Workflow sequence warning:</b> {flowWarning}</span>
        </div>
      )}

      {/* Main Grid: Work Progress vs Balance & Outsource */}
      <div className="grid detail-grid">
        <div className="grid" style={{ alignContent: 'start' }}>
          {/* Work Progress Checklist */}
          <div className="card">
            <div className="card-h">
              <h3>Work Checklist Progress</h3>
              <div className="btn-row">
                <span className="muted">{tasks.filter(t => t.done).length}/{tasks.length} done</span>
              </div>
            </div>
            <div className="card-b" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
              {tasks.length > 0 ? (
                <div className="flow">
                  {tasks.map((t, idx) => {
                    const isNext = nextTask === t && job.status !== 'Completed';
                    return (
                      <div key={idx} className={`step ${isNext ? 'next' : ''}`}>
                        <button 
                          className={`check ${t.done ? 'done' : ''}`}
                          onClick={() => onToggleTask(idx)}
                          aria-label={`Mark ${t.key} ${t.done ? 'pending' : 'done'}`}
                        >
                          <IconCheck />
                        </button>
                        <div className="t">
                          <b>{t.key}</b>
                          <small>{t.done ? `Done ${fd(t.doneDate)}` : 'Pending'}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty" style={{ padding: '16px' }}>No services specified for this vehicle.</div>
              )}
            </div>
          </div>

          {/* Vehicle and Owner Details */}
          <div className="card">
            <div className="card-h">
              <h3>Vehicle &amp; Customer Information</h3>
            </div>
            <div className="card-b">
              <div className="kv">
                <div><small>Old Registration</small><b>{job.oldReg || '—'}</b></div>
                <div><small>New Registration</small><b>{job.newReg || 'Not allotted'}</b></div>
                <div><small>Vehicle Type</small>{job.vtype}</div>
                <div><small>Make / Model</small>{job.make || '—'}</div>
                <div><small>Chassis No</small><b>{job.chassis || '—'}</b></div>
                <div><small>Engine No</small><b>{job.engine || '—'}</b></div>
                <div><small>Owner Name</small><b>{job.owner || '—'}</b></div>
                <div><small>Owner Phone</small>{job.ownerPhone || '—'}</div>
                {job.ownerCnic && <div><small>Owner CNIC</small>{job.ownerCnic}</div>}
                {job.ownerFather && <div><small>Father / Husband</small>{job.ownerFather}</div>}
                {job.ownerAddress && <div><small>Owner Address</small>{job.ownerAddress}</div>}
                <div>
                  <small>Party / Account</small>
                  {accObj ? (
                    <a href={`#/account/${accObj.id}`} onClick={(e) => { e.preventDefault(); onSelectAccount(accObj.id); }}>
                      <b>{accObj.name}</b>
                    </a>
                  ) : '—'}
                </div>
                <div><small>Excise Receipt No</small>{job.receiptNo || '—'}</div>
                <div><small>Excise Receipt Date</small>{fd(job.receiptDate) || '—'}</div>
                <div><small>Date Completed</small>{fd(job.completedDate) || '—'}</div>
                <div>
                  <small>Physical File Status</small>
                  <b>{job.fileReturned ? `Returned (${fd(job.fileReturnDate)})` : 'In Office'}</b>
                </div>
              </div>

              {(job.notes || job.remarks) && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  {job.notes && (
                    <div style={{ marginBottom: '8px' }}>
                      <small className="muted">Case Notes</small>
                      <p style={{ margin: '2px 0', whiteSpace: 'pre-wrap' }}>{job.notes}</p>
                    </div>
                  )}
                  {job.remarks && (
                    <div>
                      <small className="muted">Remarks</small>
                      <p style={{ margin: '2px 0', whiteSpace: 'pre-wrap' }}>{job.remarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Charges & Outsource Cost */}
        <div className="grid" style={{ alignContent: 'start' }}>
          {/* Charges and Balance */}
          <div className="card">
            <div className="card-h">
              <h3>Charges &amp; Balance</h3>
            </div>
            <div className="card-b">
              <table className="lines">
                <tbody>
                  {CHARGE_HEADS.filter(([k]) => num(job.charges?.[k])).map(([k, label]) => (
                    <tr key={k}>
                      <td>{label}</td>
                      <td className="r num">{money(num(job.charges[k]))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="money-sum">
                <span>Total Charged</span>
                <span className="num">{money(totalCharged)}</span>
              </div>

              <div className="bal-card">
                <div>
                  <small>Charged</small>
                  <b>{money(totalCharged)}</b>
                </div>
                <div>
                  <small>Received</small>
                  <b style={{ color: 'var(--ok)' }}>{money(totalReceived)}</b>
                </div>
                <div>
                  <small>Balance</small>
                  <b className={balanceDue > 0.5 ? 'bal-pos' : balanceDue < -0.5 ? 'bal-neg' : 'bal-zero'}>
                    {money(balanceDue)}
                  </b>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Outsource Expenses & Net Margin */}
          <div className="card">
            <div className="card-h">
              <h3>Vendor Costs ({money(totalOutsourceCost)})</h3>
              <button className="btn sm" onClick={onPayVendor}>
                <IconPlus /> Pay Vendor
              </button>
            </div>
            <div className="card-b">
              {jobExpensesList.length > 0 ? (
                <>
                  <table className="lines">
                    <tbody>
                      {jobExpensesList.map(e => {
                        const vObj = accounts.find(a => a.id === e.vendorId);
                        return (
                          <tr key={e.id}>
                            <td>
                              <b>{e.category}</b> · <span className="muted">{vObj?.name || 'Vendor'}</span>
                              <div className="faint" style={{ fontSize: '11.5px' }}>
                                {fd(e.date)} · {e.method} {e.ref ? `· Ref: ${e.ref}` : ''}
                              </div>
                            </td>
                            <td className="r num" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                              -{money(e.amount)}
                            </td>
                            <td className="r" style={{ width: '32px' }}>
                              <button 
                                className="btn sm ghost danger" 
                                onClick={() => onDeleteExpense(e.id)}
                                style={{ padding: '2px 5px' }}
                                title="Delete expense"
                              >
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="money-sum" style={{ fontSize: '13px', marginTop: '6px' }}>
                    <span>Vendor Outflow Paid</span>
                    <span className="num" style={{ color: 'var(--danger)' }}>-{money(totalOutsourceCost)}</span>
                  </div>

                  <div className="money-sum" style={{ fontSize: '14px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                    <span>Net Office Margin</span>
                    <span className="num" style={{ color: 'var(--ok)' }}>{money(netOfficeMargin)}</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <p className="muted" style={{ margin: '0 0 8px', fontSize: '12.5px' }}>
                    No vendor payments recorded for this vehicle (insurance, MVI, etc.).
                  </p>
                  <button className="btn sm" onClick={onPayVendor}>
                    <IconPlus /> Pay Vendor (Insurance / MVI / Fitness)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payments list for this job */}
          <div className="card">
            <div className="card-h">
              <h3>Customer Receipts ({jobPayments.length})</h3>
            </div>
            {jobPayments.length > 0 ? (
              <table>
                <tbody>
                  {jobPayments.map(p => (
                    <tr key={p.id}>
                      <td>
                        <b style={{ color: 'var(--ok)' }}>{money(p.amount)}</b>
                        <div className="faint" style={{ fontSize: '12px' }}>
                          {fd(p.date)} · {p.method} {p.ref ? `· Ref: ${p.ref}` : ''}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty" style={{ padding: '16px' }}>No payments linked to this file yet.</div>
            )}
          </div>

          {/* Quick Action buttons */}
          <div className="btn-row" style={{ marginTop: '4px' }}>
            <button className="btn" onClick={onPrintJobSlip}>
              <IconPrint /> Print Job Slip
            </button>
            <button className="btn" onClick={onWhatsAppShare}>
              <IconWhatsApp /> WhatsApp Update
            </button>
            <button className="btn danger" onClick={onDeleteJob}>
              <IconTrash /> Delete File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
