import React, { useState, useRef, useEffect } from 'react';
import { 
  IconSearch, 
  IconCloud, 
  IconMoon, 
  IconSun, 
  IconPlus, 
  IconBack,
  IconUsers,
  IconDownload
} from './Icons';
import { Job, Account } from '../types';
import { up, fd } from '../constants';

interface HeaderProps {
  title: string;
  theme: string;
  onToggleTheme: () => void;
  syncStatus: 'connected' | 'syncing' | 'offline' | 'error';
  userEmail: string | null;
  userRole?: string;
  onOpenAuthModal: () => void;
  onOpenInstallModal: () => void;
  onNewJob: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
  jobs: Job[];
  accounts: Account[];
  onSelectJob: (id: string) => void;
  onSelectAccount: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  theme,
  onToggleTheme,
  syncStatus,
  userEmail,
  userRole,
  onOpenAuthModal,
  onOpenInstallModal,
  onNewJob,
  canGoBack,
  onGoBack,
  jobs,
  accounts,
  onSelectJob,
  onSelectAccount
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const norm = (s?: string) => up(s).replace(/[\s-]/g, '');
  const Q = norm(searchQuery);

  const matchedJobs = Q ? jobs.filter(j => {
    const hay = [j.no, j.oldReg, j.newReg, j.owner, j.chassis, j.engine, j.receiptNo, j.ownerPhone].map(norm).join('|');
    return hay.includes(Q);
  }).slice(0, 15) : [];

  const matchedAccounts = Q ? accounts.filter(a => {
    const hay = [a.name, a.phone, a.cnic].map(norm).join('|');
    return hay.includes(Q);
  }).slice(0, 10) : [];

  return (
    <header className="topbar">
      {canGoBack && (
        <button className="icon-btn" onClick={onGoBack} aria-label="Go back">
          <IconBack />
        </button>
      )}

      <h1>{title}</h1>

      {/* Global Search */}
      <div className="search" ref={searchRef}>
        <IconSearch />
        <input 
          placeholder="Search files, reg no, party, chassis…" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          autoComplete="off"
        />

        {showResults && searchQuery.trim() && (
          <div className="search-results">
            {matchedJobs.length === 0 && matchedAccounts.length === 0 ? (
              <div className="empty" style={{ padding: '20px' }}>No vehicle or account found</div>
            ) : (
              <>
                {matchedJobs.map(j => (
                  <div 
                    key={j.id} 
                    onClick={() => {
                      onSelectJob(j.id);
                      setShowResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap' }}>
                      <span className={`plate ${j.vtype === 'Commercial' ? 'com' : ''}`}>{j.oldReg}</span>
                      {j.newReg && <span className="plate new" style={{ marginLeft: '4px' }}>→ {j.newReg}</span>}
                    </span>
                    <span style={{ fontSize: '13px' }}>
                      <b>{j.owner || '—'}</b>
                      <small className="muted" style={{ display: 'block' }}>{j.no} · {fd(j.date)}</small>
                    </span>
                    <span style={{ marginLeft: 'auto' }} className={`badge ${j.status.toLowerCase().replace(/\s+/g, '')}`}>
                      {j.status}
                    </span>
                  </div>
                ))}

                {matchedAccounts.map(a => (
                  <div 
                    key={a.id} 
                    onClick={() => {
                      onSelectAccount(a.id);
                      setShowResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <IconUsers style={{ width: '18px', color: 'var(--primary)' }} />
                    <span style={{ fontSize: '13px' }}>
                      <b>{a.name}</b>
                      <small className="muted" style={{ display: 'block' }}>{a.kind} {a.phone ? `· ${a.phone}` : ''}</small>
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {/* Cloud & Realtime Status Pill */}
        <button 
          className="cloud-pill" 
          onClick={onOpenAuthModal} 
          title={userEmail ? `Signed in as ${userEmail} (${userRole || 'team'})` : 'Click to sign in with Google or Email'}
        >
          <IconCloud />
          <span className={`cloud-dot ${syncStatus}`}></span>
          <span className="hide-m">
            {syncStatus === 'connected' ? 'Firestore Live' : (syncStatus === 'syncing' ? 'Syncing…' : 'Offline')}
          </span>
        </button>

        {/* User Login / Team Account Indicator */}
        <button 
          className="btn sm" 
          onClick={onOpenAuthModal} 
          title={userEmail ? `User: ${userEmail}` : 'Sign In'}
          style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
        >
          <IconUsers style={{ width: '15px' }} />
          <span className="hide-m">{userEmail ? userEmail.split('@')[0] : 'Sign In'}</span>
        </button>

        {/* Theme Toggle */}
        <button 
          className="icon-btn" 
          onClick={onToggleTheme} 
          aria-label="Toggle theme" 
          title={`Switch theme (Current: ${theme})`}
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        {/* Install App Button */}
        <button 
          className="btn sm" 
          onClick={onOpenInstallModal} 
          title="Install application on Desktop PC or Mobile Phone"
          style={{ height: '36px', padding: '0 8px', fontSize: '12px' }}
        >
          <IconDownload style={{ width: '15px' }} />
          <span className="hide-m">Install</span>
        </button>

        {/* New File Quick Button */}
        <button className="btn primary hide-m" onClick={onNewJob}>
          <IconPlus />
          <span>New File</span>
        </button>
      </div>
    </header>
  );
};
