import React, { useState } from 'react';
import { OwnerProfile, AppSettings } from '../types';
import { IconWhatsApp, IconEdit, IconCheck } from './Icons';

interface OwnerViewProps {
  owner: OwnerProfile;
  settings: AppSettings;
  onSaveOwner: (updated: OwnerProfile) => void;
}

export const OwnerView: React.FC<OwnerViewProps> = ({
  owner,
  settings,
  onSaveOwner
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<OwnerProfile>({ ...owner });

  const initials = (owner.name || settings.bizName || 'A').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const handleShareCard = () => {
    const lines = [
      `*${settings.bizName}*`,
      settings.tagline,
      owner.name ? `${owner.name}${owner.designation ? ' (' + owner.designation + ')' : ''}` : '',
      owner.mobile ? `Mobile: ${owner.mobile}` : '',
      owner.whatsapp ? `WhatsApp: ${owner.whatsapp}` : '',
      owner.landline ? `Office: ${owner.landline}` : '',
      owner.email ? `Email: ${owner.email}` : '',
      (owner.address || settings.address) ? `Address: ${owner.address || settings.address}` : '',
      owner.bank ? `Bank: ${owner.bank}${owner.iban ? ' — ' + owner.iban : ''}` : '',
      owner.jazzcash ? `JazzCash/Easypaisa: ${owner.jazzcash}` : ''
    ].filter(Boolean).join('\n');

    let p = String(owner.whatsapp || owner.mobile || '').replace(/\D/g, '');
    if (p.startsWith('0')) p = '92' + p.slice(1);
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(lines)}`, '_blank');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOwner(formData);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Owner &amp; Business Profile</h2>
          <p>Proprietor contact and bank details shown on print receipts, slips, and customer statements.</p>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={() => setIsEditing(!isEditing)}>
            <IconEdit /> {isEditing ? 'Cancel Edit' : 'Edit Details'}
          </button>
          <button className="btn primary" onClick={handleShareCard}>
            <IconWhatsApp /> Share Card on WhatsApp
          </button>
        </div>
      </div>

      <div className="grid two">
        {/* Left: Hero Preview Card */}
        <div className="card owner-card">
          <div className="owner-hero">
            <div className="owner-av">
              {owner.photo ? <img src={owner.photo} alt={owner.name} /> : initials}
            </div>
            <div>
              <h3>{owner.name || 'Proprietor Name'}</h3>
              <div className="muted">{owner.designation || 'Proprietor'} · {settings.bizName}</div>
              <div className="btn-row" style={{ marginTop: '10px' }}>
                {owner.mobile && (
                  <a className="btn sm" href={`tel:${owner.mobile}`}>
                    Call {owner.mobile}
                  </a>
                )}
                {owner.whatsapp && (
                  <button className="btn sm" onClick={handleShareCard}>
                    <IconWhatsApp /> WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card-b">
            <div className="kv" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {owner.cnic && <div><small>CNIC No</small><b>{owner.cnic}</b></div>}
              {owner.father && <div><small>Father / Husband</small>{owner.father}</div>}
              {owner.mobile && <div><small>Mobile Phone</small>{owner.mobile}</div>}
              {owner.whatsapp && <div><small>WhatsApp</small>{owner.whatsapp}</div>}
              {owner.landline && <div><small>Office Landline</small>{owner.landline}</div>}
              {owner.email && <div><small>Email Address</small>{owner.email}</div>}
              {owner.ntn && <div><small>NTN / Tax ID</small>{owner.ntn}</div>}
              {owner.license && <div><small>Dealer / Agent Licence</small>{owner.license}</div>}
              {owner.bank && <div><small>Bank Name</small>{owner.bank}</div>}
              {owner.iban && <div><small>Account / IBAN</small>{owner.iban}</div>}
              {owner.jazzcash && <div><small>JazzCash / Easypaisa</small>{owner.jazzcash}</div>}
              {(owner.address || settings.address) && (
                <div style={{ gridColumn: 'span 2' }}>
                  <small>Office Address</small>
                  {owner.address || settings.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="card">
          <div className="card-h">
            <h3>{isEditing ? 'Edit Profile Details' : 'Proprietor Information'}</h3>
          </div>
          <div className="card-b">
            <form onSubmit={handleSave} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="f s2">
                <label>Proprietor Name</label>
                <input 
                  className="upper" 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SINAN UR REHMAN"
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>Designation</label>
                <input 
                  value={formData.designation || ''} 
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Proprietor / Managing Director"
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>CNIC</label>
                <input 
                  value={formData.cnic || ''} 
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  placeholder="xxxxx-xxxxxxx-x"
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>Mobile Number</label>
                <input 
                  type="tel"
                  value={formData.mobile || ''} 
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="03xx-xxxxxxx"
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>WhatsApp Number</label>
                <input 
                  type="tel"
                  value={formData.whatsapp || ''} 
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="03xx-xxxxxxx"
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>Bank Name</label>
                <input 
                  value={formData.bank || ''} 
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  placeholder="e.g. Meezan Bank / HBL"
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>Account / IBAN</label>
                <input 
                  value={formData.iban || ''} 
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="PK..."
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>JazzCash / Easypaisa</label>
                <input 
                  value={formData.jazzcash || ''} 
                  onChange={(e) => setFormData({ ...formData, jazzcash: e.target.value })}
                  placeholder="03xx-xxxxxxx"
                  disabled={!isEditing}
                />
              </div>

              <div className="f">
                <label>Agent / Dealer Licence</label>
                <input 
                  value={formData.license || ''} 
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <label className="f s2 check-line" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.onPrint !== false} 
                  onChange={(e) => setFormData({ ...formData, onPrint: e.target.checked })}
                  disabled={!isEditing}
                />
                Show owner name, contact and bank details on printed slips &amp; receipts
              </label>

              {isEditing && (
                <div className="f s2 btn-row">
                  <button type="submit" className="btn primary">
                    <IconCheck /> Save Owner Details
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
