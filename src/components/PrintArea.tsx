import React from 'react';
import { Job, Payment, Account, AppSettings } from '../types';
import { CHARGE_HEADS, num, money, moneyPlain, words, fd, today, getJobTotal } from '../constants';
import { Logo } from './Icons';
import { LedgerRow } from './AccountDetailView';

export interface PrintData {
  type: 'job' | 'receipt' | 'statement' | null;
  job?: Job;
  payment?: Payment;
  account?: Account;
  ledgerRows?: LedgerRow[];
  opening?: number;
  closing?: number;
  from?: string;
  to?: string;
}

interface PrintAreaProps {
  data: PrintData;
  settings: AppSettings;
}

export const PrintArea: React.FC<PrintAreaProps> = ({ data, settings }) => {
  if (!data.type) return null;

  const owner = settings.owner || {};
  const showOwner = owner.onPrint !== false;

  const renderHeader = (title: string, rightText?: React.ReactNode) => (
    <div className="pr-head">
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Logo style={{ width: '48px', height: '48px' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{settings.bizName}</h1>
          {settings.tagline && <div style={{ fontSize: '11px', color: '#555' }}>{settings.tagline}</div>}
          <div style={{ fontSize: '12px', marginTop: '2px' }}>
            {owner.address || settings.address} {settings.phone ? `· Ph: ${settings.phone}` : ''}
          </div>
          {showOwner && owner.name && (
            <div style={{ fontSize: '11.5px', marginTop: '2px' }}>
              Proprietor: <b>{owner.name}</b> {owner.mobile ? `· ${owner.mobile}` : ''}
            </div>
          )}
          {showOwner && (owner.bank || owner.jazzcash) && (
            <div style={{ fontSize: '11px', color: '#555', marginTop: '1px' }}>
              {owner.bank ? `${owner.bank} ${owner.iban ? ': ' + owner.iban : ''}` : ''}
              {owner.bank && owner.jazzcash ? ' · ' : ''}
              {owner.jazzcash ? `JazzCash: ${owner.jazzcash}` : ''}
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <b style={{ fontSize: '16px', display: 'block' }}>{title}</b>
        <div style={{ fontSize: '12px', marginTop: '3px' }}>{rightText}</div>
      </div>
    </div>
  );

  // 1. Payment Receipt
  if (data.type === 'receipt' && data.payment) {
    const p = data.payment;
    const a = data.account;
    const j = data.job;

    return (
      <div id="print-area">
        <div className="pr">
          {renderHeader('PAYMENT RECEIPT', (
            <>
              Receipt No: <b>{p.no}</b><br />
              Date: {fd(p.date)}
            </>
          ))}

          <table>
            <tbody>
              <tr>
                <th style={{ width: '32%' }}>Received with thanks from</th>
                <td className="big">{a?.name || '—'}</td>
              </tr>
              <tr>
                <th>Amount</th>
                <td className="big">{money(p.amount)}</td>
              </tr>
              <tr>
                <th>Amount in words</th>
                <td>Rupees {words(p.amount)} Only</td>
              </tr>
              <tr>
                <th>Payment method</th>
                <td>{p.method} {p.ref ? `· Ref: ${p.ref}` : ''}</td>
              </tr>
              {j && (
                <tr>
                  <th>Against vehicle file</th>
                  <td>
                    {j.oldReg} {j.newReg ? `→ ${j.newReg}` : ''} · {j.owner || '—'}
                  </td>
                </tr>
              )}
              {p.notes && (
                <tr>
                  <th>Notes</th>
                  <td>{p.notes}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="sig">
            <div>Office Signature &amp; Stamp</div>
            <div>Customer Signature</div>
          </div>

          {settings.note && (
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#666' }}>
              {settings.note}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. Job Slip
  if (data.type === 'job' && data.job) {
    const j = data.job;
    const a = data.account;
    const total = getJobTotal(j);

    return (
      <div id="print-area">
        <div className="pr">
          {renderHeader('VEHICLE REGISTRATION JOB SLIP', (
            <>
              File No: <b>{j.no}</b><br />
              Date: {fd(j.date)}
            </>
          ))}

          <table>
            <tbody>
              <tr>
                <th style={{ width: '30%' }}>Party / Account</th>
                <td><b>{a?.name || '—'}</b></td>
              </tr>
              <tr>
                <th>Vehicle Owner</th>
                <td>
                  {j.owner || '—'} {j.ownerPhone ? `· Ph: ${j.ownerPhone}` : ''} {j.ownerCnic ? `· CNIC: ${j.ownerCnic}` : ''}
                </td>
              </tr>
              <tr>
                <th>Registration</th>
                <td className="big">
                  {j.oldReg} {j.newReg ? `→ ${j.newReg}` : ''}
                </td>
              </tr>
              <tr>
                <th>Type / Make</th>
                <td>{j.vtype} · {j.make || '—'}</td>
              </tr>
              <tr>
                <th>Chassis / Engine</th>
                <td>{j.chassis || '—'} / {j.engine || '—'}</td>
              </tr>
              <tr>
                <th>Services Required</th>
                <td>{(j.services || []).join(', ')}</td>
              </tr>
              {CHARGE_HEADS.filter(([k]) => num(j.charges?.[k])).map(([k, label]) => (
                <tr key={k}>
                  <th>{label}</th>
                  <td>{money(num(j.charges[k]))}</td>
                </tr>
              ))}
              <tr>
                <th>Total Charges</th>
                <td className="big">{money(total)}</td>
              </tr>
              {j.notes && (
                <tr>
                  <th>Notes</th>
                  <td>{j.notes}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="sig">
            <div>Officer Signature</div>
            <div>Customer Signature</div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Statement
  if (data.type === 'statement' && data.account) {
    const a = data.account;
    const rows = data.ledgerRows || [];
    const open = data.opening || 0;
    const close = data.closing || 0;

    return (
      <div id="print-area">
        <div className="pr">
          {renderHeader('ACCOUNT STATEMENT', (
            <>
              {data.from ? fd(data.from) : 'Start'} to {data.to ? fd(data.to) : fd(today())}
            </>
          ))}

          <p style={{ margin: '8px 0 12px' }}>
            Account: <b>{a.name}</b> {a.phone ? `· ${a.phone}` : ''} {a.address ? `· ${a.address}` : ''}
          </p>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref</th>
                <th>Details</th>
                <th style={{ textAlign: 'right' }}>Debit (Charged)</th>
                <th style={{ textAlign: 'right' }}>Credit (Paid)</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.from ? fd(data.from) : '—'}</td>
                <td></td>
                <td><b>Opening Balance</b></td>
                <td></td>
                <td></td>
                <td style={{ textAlign: 'right' }}><b>{moneyPlain(open)}</b></td>
              </tr>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{fd(r.date)}</td>
                  <td>{r.ref}</td>
                  <td>{r.desc}</td>
                  <td style={{ textAlign: 'right' }}>{r.dr ? moneyPlain(r.dr) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{r.cr ? moneyPlain(r.cr) : ''}</td>
                  <td style={{ textAlign: 'right' }}>{moneyPlain(r.bal)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700 }}>
                  Closing Balance Due
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{money(close)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};
