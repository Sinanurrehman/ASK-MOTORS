import React, { useState, useEffect } from 'react';
import { 
  Job, 
  Account, 
  Payment, 
  Expense, 
  JobCharges, 
  PaymentMethod 
} from '../types';
import { 
  CHARGE_HEADS, 
  STATUSES, 
  METHODS, 
  EXPENSE_CATEGORIES, 
  COMMERCIAL_FLOW, 
  today, 
  num, 
  money, 
  normVal,
  up 
} from '../constants';
import { IconX, IconPlus, IconCheck, IconTrash } from './Icons';

// -------------------------------------------------------------
// 1. Job Modal
// -------------------------------------------------------------
interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: Job | null;
  accounts: Account[];
  allJobs: Job[];
  services: string[];
  defaultAccountId?: string;
  onSaveJob: (jobData: Partial<Job>, advancePayment?: { amount: number; method: PaymentMethod; ref?: string }) => void;
  onQuickAddAccount: (name: string, kind: 'Party' | 'Customer' | 'Vendor') => Promise<string>;
  onAddCustomService: (name: string) => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  jobToEdit,
  accounts,
  allJobs,
  services,
  defaultAccountId = '',
  onSaveJob,
  onQuickAddAccount,
  onAddCustomService
}) => {
  const isNew = !jobToEdit;

  const [date, setDate] = useState(today());
  const [status, setStatus] = useState<Job['status']>('Pending');
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [owner, setOwner] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerCnic, setOwnerCnic] = useState('');
  const [ownerFather, setOwnerFather] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [oldReg, setOldReg] = useState('');
  const [newReg, setNewReg] = useState('');
  const [vtype, setVtype] = useState<Job['vtype']>('Private');
  const [make, setMake] = useState('');
  const [chassis, setChassis] = useState('');
  const [engine, setEngine] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [charges, setCharges] = useState<JobCharges>({});
  const [selectedServices, setSelectedServices] = useState<string[]>(['Transfer']);
  const [notes, setNotes] = useState('');
  const [remarks, setRemarks] = useState('');

  // Physical file return
  const [fileReturned, setFileReturned] = useState(false);
  const [fileReturnDate, setFileReturnDate] = useState('');
  const [fileReturnTo, setFileReturnTo] = useState('');

  // Advance on creation
  const [advAmount, setAdvAmount] = useState('');
  const [advMethod, setAdvMethod] = useState<PaymentMethod>('Cash');
  const [advRef, setAdvRef] = useState('');

  // Quick account add
  const [showQuickAccount, setShowQuickAccount] = useState(false);
  const [quickAccName, setQuickAccName] = useState('');
  const [quickAccKind, setQuickAccKind] = useState<'Party' | 'Customer' | 'Vendor'>('Party');

  // Quick custom service add
  const [customSvcName, setCustomSvcName] = useState('');

  useEffect(() => {
    if (jobToEdit) {
      setDate(jobToEdit.date);
      setStatus(jobToEdit.status);
      setAccountId(jobToEdit.accountId);
      setOwner(jobToEdit.owner || '');
      setOwnerPhone(jobToEdit.ownerPhone || '');
      setOwnerCnic(jobToEdit.ownerCnic || '');
      setOwnerFather(jobToEdit.ownerFather || '');
      setOwnerAddress(jobToEdit.ownerAddress || '');
      setOldReg(jobToEdit.oldReg);
      setNewReg(jobToEdit.newReg || '');
      setVtype(jobToEdit.vtype);
      setMake(jobToEdit.make || '');
      setChassis(jobToEdit.chassis || '');
      setEngine(jobToEdit.engine || '');
      setReceiptNo(jobToEdit.receiptNo || '');
      setReceiptDate(jobToEdit.receiptDate || '');
      setCharges(jobToEdit.charges || {});
      setSelectedServices(jobToEdit.services || ['Transfer']);
      setNotes(jobToEdit.notes || '');
      setRemarks(jobToEdit.remarks || '');
      setFileReturned(!!jobToEdit.fileReturned);
      setFileReturnDate(jobToEdit.fileReturnDate || '');
      setFileReturnTo(jobToEdit.fileReturnTo || '');
    } else {
      setDate(today());
      setStatus('Pending');
      setAccountId(defaultAccountId);
      setOwner('');
      setOwnerPhone('');
      setOwnerCnic('');
      setOwnerFather('');
      setOwnerAddress('');
      setOldReg('');
      setNewReg('');
      setVtype('Private');
      setMake('');
      setChassis('');
      setEngine('');
      setReceiptNo('');
      setReceiptDate('');
      setCharges({});
      setSelectedServices(['Transfer']);
      setNotes('');
      setRemarks('');
      setFileReturned(false);
      setFileReturnDate('');
      setFileReturnTo('');
      setAdvAmount('');
    }
  }, [jobToEdit, defaultAccountId, isOpen]);

  if (!isOpen) return null;

  // Live duplicate detector
  const oN = normVal(oldReg);
  const nN = normVal(newReg);
  const chN = normVal(chassis);

  const duplicateAlerts: { job: Job; reason: string }[] = [];
  if (oN || nN || chN) {
    allJobs.forEach(j => {
      if (jobToEdit && j.id === jobToEdit.id) return;
      const jo = normVal(j.oldReg);
      const jn = normVal(j.newReg);
      const jch = normVal(j.chassis);
      const reasons: string[] = [];

      if (oN && (jo === oN || jn === oN)) reasons.push(`Reg ${oldReg}`);
      if (nN && (jo === nN || jn === nN)) reasons.push(`New Reg ${newReg}`);
      if (chN && jch === chN) reasons.push(`Chassis ${chassis}`);

      if (reasons.length > 0) {
        duplicateAlerts.push({ job: j, reason: reasons.join(', ') });
      }
    });
  }

  const toggleService = (sName: string) => {
    setSelectedServices(prev => 
      prev.includes(sName) ? prev.filter(x => x !== sName) : [...prev, sName]
    );
  };

  const handleVtypeChange = (newType: Job['vtype']) => {
    setVtype(newType);
    if (newType === 'Commercial') {
      setSelectedServices(prev => Array.from(new Set([...prev, ...COMMERCIAL_FLOW])));
    }
  };

  const totalCharges = Object.values(charges).reduce((s: number, v: unknown) => s + num(v), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      alert('Please select a party or account.');
      return;
    }
    if (!oldReg.trim()) {
      alert('Registration number is required.');
      return;
    }

    const jobData: Partial<Job> = {
      date,
      status,
      accountId,
      owner: up(owner),
      ownerPhone: ownerPhone.trim(),
      ownerCnic: ownerCnic.trim(),
      ownerFather: up(ownerFather),
      ownerAddress: ownerAddress.trim(),
      oldReg: up(oldReg),
      newReg: up(newReg),
      vtype,
      make: make.trim(),
      chassis: up(chassis),
      engine: up(engine),
      receiptNo: receiptNo.trim(),
      receiptDate,
      charges,
      services: selectedServices,
      notes: notes.trim(),
      remarks: remarks.trim(),
      fileReturned,
      fileReturnDate: fileReturned ? (fileReturnDate || today()) : '',
      fileReturnTo: fileReturned ? (fileReturnTo.trim() || owner.trim()) : ''
    };

    let advancePayload = undefined;
    if (isNew && num(advAmount) > 0) {
      advancePayload = {
        amount: num(advAmount),
        method: advMethod,
        ref: advRef.trim()
      };
    }

    onSaveJob(jobData, advancePayload);
  };

  const handleQuickAdd = async () => {
    if (!quickAccName.trim()) return;
    try {
      const newId = await onQuickAddAccount(quickAccName.trim(), quickAccKind);
      setAccountId(newId);
      setQuickAccName('');
      setShowQuickAccount(false);
    } catch {
      // handled
    }
  };

  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-modal="true" aria-label={isNew ? 'New Vehicle File' : 'Edit Vehicle File'}>
        <div className="modal-h">
          <h3>{isNew ? 'New Vehicle File Docket' : `Edit File ${jobToEdit?.no}`}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="modal-b">
          <form id="job-modal-form" onSubmit={handleSubmit} className="form-grid">
            {/* Section 1: Party & Customer */}
            <div className="section-t">Party &amp; Vehicle Owner</div>

            <div className="f s2">
              <label>Party / Account *</label>
              <div className="input-inline">
                <select 
                  value={accountId} 
                  onChange={(e) => setAccountId(e.target.value)} 
                  required
                >
                  <option value="">Select party / customer…</option>
                  <optgroup label="Parties / Companies / Dealers">
                    {accounts.filter(a => a.kind === 'Party').map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Individual Customers">
                    {accounts.filter(a => a.kind === 'Customer').map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </optgroup>
                </select>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowQuickAccount(!showQuickAccount)}
                >
                  <IconPlus /> New
                </button>
              </div>

              {showQuickAccount && (
                <div className="input-inline" style={{ marginTop: '8px' }}>
                  <input 
                    className="upper" 
                    placeholder="Party / Dealer name" 
                    value={quickAccName}
                    onChange={(e) => setQuickAccName(e.target.value)}
                  />
                  <select 
                    value={quickAccKind} 
                    onChange={(e) => setQuickAccKind(e.target.value as 'Party' | 'Customer')}
                    style={{ flex: 'none', width: 'auto' }}
                  >
                    <option value="Party">Party</option>
                    <option value="Customer">Customer</option>
                  </select>
                  <button type="button" className="btn primary sm" onClick={handleQuickAdd}>
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="f">
              <label>Date Received *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="f">
              <label>File Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Job['status'])}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="f s2">
              <label>Vehicle Owner Name</label>
              <input 
                className="upper" 
                value={owner} 
                onChange={(e) => setOwner(e.target.value)} 
                placeholder="SHALIL KHAN"
              />
            </div>

            <div className="f">
              <label>Owner Phone</label>
              <input 
                type="tel" 
                value={ownerPhone} 
                onChange={(e) => setOwnerPhone(e.target.value)} 
                placeholder="0300-1234567"
              />
            </div>

            <div className="f">
              <label>Owner CNIC</label>
              <input 
                value={ownerCnic} 
                onChange={(e) => setOwnerCnic(e.target.value)} 
                placeholder="42101-xxxxxxx-x"
              />
            </div>

            <div className="f s2">
              <label>Father / Husband Name</label>
              <input 
                className="upper" 
                value={ownerFather} 
                onChange={(e) => setOwnerFather(e.target.value)} 
                placeholder="Father name"
              />
            </div>

            <div className="f s2">
              <label>Owner Address</label>
              <input 
                value={ownerAddress} 
                onChange={(e) => setOwnerAddress(e.target.value)} 
                placeholder="Residential or office address"
              />
            </div>

            {/* Section 2: Vehicle Details & Live Duplicate Alert */}
            <div className="section-t">Vehicle Identification</div>

            {duplicateAlerts.length > 0 && (
              <div className="dup-inline-alert" style={{ gridColumn: '1 / -1' }}>
                ⚠️ <b>DUPLICATE ALERT:</b> Yeh registration / chassis number pehle se in files mein mojood hai:
                {duplicateAlerts.map((d, i) => (
                  <div key={i} style={{ marginTop: '2px' }}>
                    • <b>{d.job.no}</b> — {d.job.oldReg} ({d.job.owner || '—'}) <i>({d.reason})</i>
                  </div>
                ))}
              </div>
            )}

            <div className="f">
              <label>Old / Current Reg No *</label>
              <input 
                className="upper" 
                value={oldReg} 
                onChange={(e) => setOldReg(e.target.value)} 
                placeholder="BJU-163" 
                required 
              />
            </div>

            <div className="f">
              <label>New Reg No (When Allotted)</label>
              <input 
                className="upper" 
                value={newReg} 
                onChange={(e) => setNewReg(e.target.value)} 
                placeholder="AAFU-075" 
              />
            </div>

            <div className="f">
              <label>Vehicle Type</label>
              <select value={vtype} onChange={(e) => handleVtypeChange(e.target.value as Job['vtype'])}>
                <option value="Private">Private</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="f">
              <label>Make / Model</label>
              <input 
                value={make} 
                onChange={(e) => setMake(e.target.value)} 
                placeholder="Suzuki Mehran" 
              />
            </div>

            <div className="f s2">
              <label>Chassis No</label>
              <input 
                className="upper" 
                value={chassis} 
                onChange={(e) => setChassis(e.target.value)} 
              />
            </div>

            <div className="f s2">
              <label>Engine No</label>
              <input 
                className="upper" 
                value={engine} 
                onChange={(e) => setEngine(e.target.value)} 
              />
            </div>

            {/* Section 3: Physical File Tracking */}
            <div className="section-t">Physical File Tracking</div>

            <label className="f s2 check-line" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={fileReturned} 
                onChange={(e) => setFileReturned(e.target.checked)} 
              />
              <b>Physical file delivered / returned to party</b>
            </label>

            {fileReturned && (
              <>
                <div className="f">
                  <label>Date Returned</label>
                  <input 
                    type="date" 
                    value={fileReturnDate || today()} 
                    onChange={(e) => setFileReturnDate(e.target.value)} 
                  />
                </div>
                <div className="f">
                  <label>Handed Over To</label>
                  <input 
                    value={fileReturnTo} 
                    onChange={(e) => setFileReturnTo(e.target.value)} 
                    placeholder="Recipient name" 
                  />
                </div>
              </>
            )}

            {/* Section 4: Services Checklist */}
            <div className="section-t">Services Required</div>

            <div className="f s4">
              <div className="chips">
                {services.map(s => (
                  <span
                    key={s}
                    className={`chip ${selectedServices.includes(s) ? 'on' : ''}`}
                    onClick={() => toggleService(s)}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="input-inline" style={{ marginTop: '8px' }}>
                <input 
                  placeholder="+ Type new service (e.g. Route Permit, Tax Clearance)..."
                  value={customSvcName}
                  onChange={(e) => setCustomSvcName(e.target.value)}
                  style={{ flex: 1, fontSize: '13px' }}
                />
                <button 
                  type="button" 
                  className="btn sm"
                  onClick={() => {
                    if (customSvcName.trim()) {
                      onAddCustomService(customSvcName.trim());
                      setSelectedServices(prev => [...prev, customSvcName.trim()]);
                      setCustomSvcName('');
                    }
                  }}
                >
                  <IconPlus /> Add Service
                </button>
              </div>
            </div>

            {/* Section 5: Charges */}
            <div className="section-t">Excise Charges &amp; Fees (Rs)</div>

            <div className="f">
              <label>Excise Receipt No</label>
              <input value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} />
            </div>

            <div className="f">
              <label>Receipt Date</label>
              <input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
            </div>

            {CHARGE_HEADS.map(([k, label]) => (
              <div key={k} className="f">
                <label>{label}</label>
                <input 
                  type="number"
                  inputMode="decimal"
                  value={charges[k] ?? ''}
                  onChange={(e) => setCharges({ ...charges, [k]: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            ))}

            <div className="total-box">
              <span>Total Charges</span>
              <b>{money(totalCharges)}</b>
            </div>

            {/* Advance payment option on creation */}
            {isNew && (
              <>
                <div className="section-t">Advance Payment Received Now (Optional)</div>
                <div className="f">
                  <label>Amount (Rs)</label>
                  <input 
                    type="number" 
                    value={advAmount} 
                    onChange={(e) => setAdvAmount(e.target.value)} 
                    placeholder="0" 
                  />
                </div>
                <div className="f">
                  <label>Payment Method</label>
                  <select value={advMethod} onChange={(e) => setAdvMethod(e.target.value as PaymentMethod)}>
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="f s2">
                  <label>Reference (Txn ID / Cheque)</label>
                  <input value={advRef} onChange={(e) => setAdvRef(e.target.value)} />
                </div>
              </>
            )}

            {/* Notes */}
            <div className="section-t">Notes &amp; Remarks</div>
            <div className="f s2">
              <label>Case Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="f s2">
              <label>Remarks</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
            </div>
          </form>
        </div>

        <div className="modal-f">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="job-modal-form" className="btn primary">
            <IconCheck /> {isNew ? 'Save Vehicle File' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. Account Modal (Party / Customer / Vendor)
// -------------------------------------------------------------
interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
  onSaveAccount: (data: Partial<Account>) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
  onSaveAccount
}) => {
  const isNew = !accountToEdit;
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Account['kind']>('Party');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [opening, setOpening] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setKind(accountToEdit.kind);
      setPhone(accountToEdit.phone || '');
      setCnic(accountToEdit.cnic || '');
      setOpening(String(accountToEdit.opening || 0));
      setAddress(accountToEdit.address || '');
      setNotes(accountToEdit.notes || '');
    } else {
      setName('');
      setKind('Party');
      setPhone('');
      setCnic('');
      setOpening('0');
      setAddress('');
      setNotes('');
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveAccount({
      name: up(name),
      kind,
      phone: phone.trim(),
      cnic: cnic.trim(),
      opening: num(opening),
      address: address.trim(),
      notes: notes.trim()
    });
  };

  return (
    <div className="modal-back">
      <div className="modal sm" role="dialog" aria-modal="true" aria-label="Account details">
        <div className="modal-h">
          <h3>{isNew ? 'Add Party / Customer / Vendor' : `Edit Account ${accountToEdit?.name}`}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="modal-b">
          <form id="acc-modal-form" onSubmit={handleSubmit} className="form-grid compact">
            <div className="f s2">
              <label>Name *</label>
              <input 
                className="upper" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Party / Company name" 
                required 
              />
            </div>

            <div className="f">
              <label>Account Type</label>
              <select value={kind} onChange={(e) => setKind(e.target.value as Account['kind'])}>
                <option value="Party">Party / Dealer / Company</option>
                <option value="Customer">Individual Customer</option>
                <option value="Vendor">Vendor / Agent (Insurance, MVI)</option>
              </select>
            </div>

            <div className="f">
              <label>Phone / WhatsApp</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="0300-1234567" 
              />
            </div>

            <div className="f">
              <label>CNIC</label>
              <input 
                value={cnic} 
                onChange={(e) => setCnic(e.target.value)} 
                placeholder="42101-xxxxxxx-x" 
              />
            </div>

            <div className="f">
              <label>Opening Balance (Rs)</label>
              <input 
                type="number" 
                value={opening} 
                onChange={(e) => setOpening(e.target.value)} 
                placeholder="0" 
              />
            </div>

            <div className="f s2">
              <label>Address</label>
              <input 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Office / Showroom address"
              />
            </div>

            <div className="f s2">
              <label>Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={2} 
                placeholder="Additional details..."
              />
            </div>
          </form>
        </div>

        <div className="modal-f">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="acc-modal-form" className="btn primary">
            <IconCheck /> Save Account
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. Payment Receipt Modal
// -------------------------------------------------------------
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentToEdit?: Payment | null;
  accounts: Account[];
  jobs: Job[];
  defaultAccountId?: string;
  defaultJobId?: string;
  onSavePayment: (data: Partial<Payment>) => void;
  onDeletePayment?: (id: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentToEdit,
  accounts,
  jobs,
  defaultAccountId = '',
  defaultJobId = '',
  onSavePayment,
  onDeletePayment
}) => {
  const isNew = !paymentToEdit;

  const [accountId, setAccountId] = useState(defaultAccountId);
  const [jobId, setJobId] = useState(defaultJobId);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (paymentToEdit) {
      setAccountId(paymentToEdit.accountId);
      setJobId(paymentToEdit.jobId || '');
      setAmount(String(paymentToEdit.amount));
      setDate(paymentToEdit.date);
      setMethod(paymentToEdit.method);
      setRef(paymentToEdit.ref || '');
      setNotes(paymentToEdit.notes || '');
    } else {
      setAccountId(defaultAccountId);
      setJobId(defaultJobId);
      setAmount('');
      setDate(today());
      setMethod('Cash');
      setRef('');
      setNotes('');
    }
  }, [paymentToEdit, defaultAccountId, defaultJobId, isOpen]);

  if (!isOpen) return null;

  const linkedJobs = jobs.filter(j => j.accountId === accountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) { alert('Select account'); return; }
    if (!num(amount)) { alert('Enter valid amount'); return; }

    onSavePayment({
      accountId,
      jobId: jobId || null,
      amount: num(amount),
      date,
      method,
      ref: ref.trim(),
      notes: notes.trim()
    });
  };

  return (
    <div className="modal-back">
      <div className="modal sm" role="dialog" aria-modal="true" aria-label="Receive payment">
        <div className="modal-h">
          <h3>{isNew ? 'Receive Customer Payment' : `Edit Receipt ${paymentToEdit?.no}`}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="modal-b">
          <form id="pay-modal-form" onSubmit={handleSubmit} className="form-grid compact">
            <div className="f s2">
              <label>Received From (Party / Customer) *</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                <option value="">Select party…</option>
                {accounts.filter(a => a.kind !== 'Vendor').map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="f s2">
              <label>Against Vehicle File (Optional)</label>
              <select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                <option value="">On Account (General Balance)</option>
                {linkedJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.no} — {j.oldReg} ({j.owner || '—'})</option>
                ))}
              </select>
            </div>

            <div className="f">
              <label>Amount (Rs) *</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0" 
                required 
              />
            </div>

            <div className="f">
              <label>Date Received *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="f">
              <label>Payment Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="f">
              <label>Reference (Txn ID / Slip)</label>
              <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. Chq # / Txn ID" />
            </div>

            <div className="f s2">
              <label>Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Receipt remarks..." />
            </div>
          </form>
        </div>

        <div className="modal-f">
          {!isNew && onDeletePayment && (
            <button 
              type="button" 
              className="btn danger" 
              onClick={() => onDeletePayment(paymentToEdit!.id)} 
              style={{ marginRight: 'auto' }}
            >
              <IconTrash /> Delete
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="pay-modal-form" className="btn primary">
            <IconCheck /> Save Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. Outsource Expense Modal (Pay Vendor / Agent)
// -------------------------------------------------------------
interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  vendors: Account[];
  jobs: Job[];
  defaultVendorId?: string;
  defaultJobId?: string;
  onSaveExpense: (data: Partial<Expense>) => void;
  onDeleteExpense?: (id: string) => void;
  onQuickAddVendor: (name: string) => Promise<string>;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  vendors,
  jobs,
  defaultVendorId = '',
  defaultJobId = '',
  onSaveExpense,
  onDeleteExpense,
  onQuickAddVendor
}) => {
  const isNew = !expenseToEdit;

  const [vendorId, setVendorId] = useState(defaultVendorId);
  const [jobId, setJobId] = useState(defaultJobId);
  const [category, setCategory] = useState('Insurance');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');

  const [showQuickVendor, setShowQuickVendor] = useState(false);
  const [quickVendorName, setQuickVendorName] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setVendorId(expenseToEdit.vendorId);
      setJobId(expenseToEdit.jobId || '');
      setCategory(expenseToEdit.category);
      setAmount(String(expenseToEdit.amount));
      setDate(expenseToEdit.date);
      setMethod(expenseToEdit.method);
      setRef(expenseToEdit.ref || '');
      setNotes(expenseToEdit.notes || '');
    } else {
      setVendorId(defaultVendorId);
      setJobId(defaultJobId);
      setCategory('Insurance');
      setAmount('');
      setDate(today());
      setMethod('Cash');
      setRef('');
      setNotes('');
    }
  }, [expenseToEdit, defaultVendorId, defaultJobId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) { alert('Select vendor or agent'); return; }
    if (!num(amount)) { alert('Enter valid amount'); return; }

    onSaveExpense({
      vendorId,
      jobId: jobId || null,
      category,
      amount: num(amount),
      date,
      method,
      ref: ref.trim(),
      notes: notes.trim()
    });
  };

  const handleQuickVendor = async () => {
    if (!quickVendorName.trim()) return;
    try {
      const newId = await onQuickAddVendor(quickVendorName.trim());
      setVendorId(newId);
      setQuickVendorName('');
      setShowQuickVendor(false);
    } catch {
      // handled
    }
  };

  return (
    <div className="modal-back">
      <div className="modal sm" role="dialog" aria-modal="true" aria-label="Pay vendor or agent">
        <div className="modal-h">
          <h3>{isNew ? 'Pay Vendor / Agent (Outsource Cost)' : `Edit Expense ${expenseToEdit?.no}`}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="modal-b">
          <form id="exp-modal-form" onSubmit={handleSubmit} className="form-grid compact">
            <div className="f s2">
              <label>Vendor / Subcontractor / Agent *</label>
              <div className="input-inline">
                <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
                  <option value="">Select vendor…</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <button type="button" className="btn" onClick={() => setShowQuickVendor(!showQuickVendor)}>
                  <IconPlus /> New
                </button>
              </div>

              {showQuickVendor && (
                <div className="input-inline" style={{ marginTop: '8px' }}>
                  <input 
                    className="upper" 
                    placeholder="Vendor / Agent name" 
                    value={quickVendorName} 
                    onChange={(e) => setQuickVendorName(e.target.value)} 
                  />
                  <button type="button" className="btn primary sm" onClick={handleQuickVendor}>
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="f s2">
              <label>Against Vehicle File (Optional)</label>
              <select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                <option value="">General Office Expense</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.no} — {j.oldReg} ({j.owner || '—'})</option>
                ))}
              </select>
            </div>

            <div className="f">
              <label>Work Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="f">
              <label>Amount Paid (Rs) *</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0" 
                required 
              />
            </div>

            <div className="f">
              <label>Payment Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="f">
              <label>Payment Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="f">
              <label>Challan / Slip Ref</label>
              <input value={ref} onChange={(e) => setRef(e.target.value)} />
            </div>

            <div className="f s2">
              <label>Details / Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </form>
        </div>

        <div className="modal-f">
          {!isNew && onDeleteExpense && (
            <button 
              type="button" 
              className="btn danger" 
              onClick={() => onDeleteExpense(expenseToEdit!.id)}
              style={{ marginRight: 'auto' }}
            >
              <IconTrash /> Delete
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="exp-modal-form" className="btn primary">
            <IconCheck /> Record Payment
          </button>
        </div>
      </div>
    </div>
  );
};
