import React, { useState } from 'react';
import { AppSettings } from '../types';
import { THEMES } from '../constants';
import { 
  IconCheck, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconDownload, 
  IconUpload, 
  IconCloud, 
  IconUsers,
  IconFile 
} from './Icons';

interface SettingsViewProps {
  settings: AppSettings;
  services: string[];
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onAddService: (serviceName: string) => void;
  onRenameService: (index: number, newName: string) => void;
  onRemoveService: (index: number) => void;
  onRestoreDefaultServices: () => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (file: File) => void;
  onExportExcel: () => void;
  onImportExcel: (file: File) => void;
  onOpenAuthModal: () => void;
  onOpenInstallModal: () => void;
  onResetAllData: () => void;
  lastBackupDate?: string | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  services,
  currentTheme,
  onSelectTheme,
  onSaveSettings,
  onAddService,
  onRenameService,
  onRemoveService,
  onRestoreDefaultServices,
  onDownloadBackup,
  onRestoreBackup,
  onExportExcel,
  onImportExcel,
  onOpenAuthModal,
  onOpenInstallModal,
  onResetAllData,
  lastBackupDate
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [newServiceName, setNewServiceName] = useState('');

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  const handleAddSvc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    onAddService(newServiceName.trim());
    setNewServiceName('');
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Settings &amp; System Configuration</h2>
          <p>Appearance themes, custom excise services checklist, team access, and database backups.</p>
        </div>
        <div className="btn-row">
          <button className="btn primary" onClick={onOpenAuthModal}>
            <IconCloud /> Cloud &amp; Team Access
          </button>
        </div>
      </div>

      <div className="grid two">
        <div className="grid" style={{ gap: '16px' }}>
          {/* 1. Appearance & Themes */}
          <div className="card">
            <div className="card-h">
              <h3>Appearance &amp; Themes</h3>
              <span className="badge completed">
                {THEMES.find(t => t.id === currentTheme)?.name || currentTheme}
              </span>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0 }}>
                Choose from 8 auto dealership &amp; excise office color themes with high-contrast legibility.
              </p>
              <div className="theme-grid">
                {THEMES.map(th => (
                  <div
                    key={th.id}
                    className={`theme-card ${currentTheme === th.id ? 'active' : ''}`}
                    onClick={() => onSelectTheme(th.id)}
                  >
                    <div className="theme-swatch">
                      <span style={{ background: th.bg }}></span>
                      <span style={{ background: th.surface }}></span>
                      <span style={{ background: th.primary }}></span>
                    </div>
                    <div className="theme-name">{th.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Services Required Checklist */}
          <div className="card">
            <div className="card-h">
              <h3>Excise Services Checklist ({services.length})</h3>
              <div className="btn-row">
                <button className="btn sm" onClick={onRestoreDefaultServices}>
                  Restore Defaults
                </button>
              </div>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0 }}>
                Add custom services or rename existing ones. These appear on every vehicle file creation docket.
              </p>

              <form onSubmit={handleAddSvc} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input 
                  placeholder="Service name (e.g. Smart Card)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn primary sm">
                  <IconPlus /> Add Service
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                {services.map((s, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <b>{s}</b>
                    <div className="btn-row">
                      <button 
                        className="btn sm ghost"
                        onClick={() => {
                          const res = prompt(`Rename service "${s}" to:`, s);
                          if (res && res.trim() && res.trim() !== s) {
                            onRenameService(idx, res.trim());
                          }
                        }}
                        title="Rename"
                      >
                        <IconEdit />
                      </button>
                      <button 
                        className="btn sm ghost danger"
                        onClick={() => {
                          if (confirm(`Remove "${s}" from checklist?`)) {
                            onRemoveService(idx);
                          }
                        }}
                        title="Delete"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Business details */}
          <div className="card">
            <div className="card-h">
              <h3>Business Information</h3>
            </div>
            <div className="card-b">
              <form onSubmit={handleSettingsSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="f s2">
                  <label>Business Name</label>
                  <input 
                    value={formData.bizName}
                    onChange={(e) => setFormData({ ...formData, bizName: e.target.value })}
                    required
                  />
                </div>

                <div className="f s2">
                  <label>Tagline</label>
                  <input 
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Vehicle Registration & Accounts"
                  />
                </div>

                <div className="f">
                  <label>Office Phone / WhatsApp</label>
                  <input 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="f">
                  <label>City / Office Address</label>
                  <input 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="f s2">
                  <label>Receipt Footer Note</label>
                  <input 
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Thank you for your business"
                  />
                </div>

                <div className="f s2">
                  <button type="submit" className="btn primary">
                    <IconCheck /> Save Business Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="grid" style={{ alignContent: 'start', gap: '16px' }}>
          {/* Team Access */}
          <div className="card">
            <div className="card-h">
              <h3>Cloud Sync &amp; Team Members</h3>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0 }}>
                Manage team authentication and permissions. All data is protected with Firestore security rules and encrypted Google Authentication.
              </p>
              <button className="btn primary" onClick={onOpenAuthModal}>
                <IconUsers /> Manage Team Access
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="card">
            <div className="card-h">
              <h3>Backup &amp; Restore (JSON)</h3>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0 }}>
                Download a complete, offline JSON backup of your vehicle files, accounts, and payments anytime.
              </p>
              <div className="btn-row">
                <button className="btn primary" onClick={onDownloadBackup}>
                  <IconDownload /> Download Backup
                </button>
                <label className="btn" style={{ cursor: 'pointer' }}>
                  <IconUpload /> Restore Backup
                  <input 
                    type="file" 
                    accept=".json,application/json" 
                    hidden 
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onRestoreBackup(f);
                    }}
                  />
                </label>
              </div>
              {lastBackupDate && (
                <small className="faint" style={{ display: 'block', marginTop: '10px' }}>
                  Last backup taken on {lastBackupDate}
                </small>
              )}
            </div>
          </div>

          {/* Excel Import / Export */}
          <div className="card">
            <div className="card-h">
              <h3>Excel Integration</h3>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0 }}>
                Import legacy spreadsheets from your Vehicle Registration Manager workbook or export current data to Microsoft Excel.
              </p>
              <div className="btn-row">
                <label className="btn" style={{ cursor: 'pointer' }}>
                  <IconFile /> Import Excel (.xlsx)
                  <input 
                    type="file" 
                    accept=".xlsx,.xls" 
                    hidden 
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onImportExcel(f);
                    }}
                  />
                </label>
                <button className="btn" onClick={onExportExcel}>
                  <IconDownload /> Export All to Excel
                </button>
              </div>
            </div>
          </div>

          {/* Desktop & Mobile Installation */}
          <div className="card">
            <div className="card-h">
              <h3>Desktop &amp; Mobile App Installation</h3>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0 }}>
                Install ASK MOTORS as a standalone desktop software on Windows/Mac, or mobile app on Android/iOS with offline support.
              </p>
              <button className="btn primary" onClick={onOpenInstallModal}>
                <IconDownload /> Install on Desktop / Mobile
              </button>
            </div>
          </div>

          {/* GitHub Push & Source Code Guide */}
          <div className="card">
            <div className="card-h">
              <h3>GitHub Push &amp; Source Code Updates</h3>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0, fontSize: '13px' }}>
                All source code files (React components, TypeScript types, Firebase rules, styling) are ready for version control on GitHub:
              </p>
              <pre style={{
                background: 'var(--surface-2)',
                padding: '12px',
                borderRadius: 'var(--r)',
                fontSize: '12px',
                overflowX: 'auto',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)'
              }}>
{`git init
git add .
git commit -m "ASK MOTORS full-stack production release"
git branch -M main
git remote add origin https://github.com/USERNAME/ask-motors.git
git push -u origin main`}
              </pre>
              <button 
                className="btn sm" 
                onClick={() => {
                  const cmd = `git init\ngit add .\ngit commit -m "ASK MOTORS full-stack production release"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME/ask-motors.git\ngit push -u origin main`;
                  navigator.clipboard.writeText(cmd).then(() => {
                    alert('Git commands copied to clipboard!');
                  });
                }}
                style={{ marginTop: '6px' }}
              >
                Copy Git Commands
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card">
            <div className="card-h">
              <h3>Danger Zone</h3>
            </div>
            <div className="card-b">
              <p className="muted" style={{ marginTop: 0 }}>
                Erase all vehicle files, payments, and account balances from the database.
              </p>
              <button className="btn danger" onClick={onResetAllData}>
                <IconTrash /> Erase All Database Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
