import React from 'react';
import { 
  Logo, 
  IconDash, 
  IconCar, 
  IconClock, 
  IconUsers, 
  IconCash, 
  IconChart, 
  IconId, 
  IconGear 
} from './Icons';
import { fd } from '../constants';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  bizName: string;
  tagline: string;
  pendingCount: number;
  totalJobs: number;
  totalAccounts: number;
  lastBackup?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  bizName,
  tagline,
  pendingCount,
  totalJobs,
  totalAccounts,
  lastBackup
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDash },
    { id: 'jobs', label: 'Vehicle Files', icon: IconCar },
    { id: 'pending', label: 'Pending Work', icon: IconClock, count: pendingCount },
    { id: 'accounts', label: 'Parties & Accounts', icon: IconUsers },
    { id: 'payments', label: 'Payments & Expenses', icon: IconCash },
    { id: 'reports', label: 'Reports', icon: IconChart },
    { id: 'owner', label: 'Owner Details', icon: IconId },
    { id: 'settings', label: 'Settings & Backup', icon: IconGear },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <Logo />
        <div>
          <b>{bizName || 'ASK MOTORS'}</b>
          <small>{tagline || 'Registration & Accounts'}</small>
        </div>
      </div>

      <nav className="nav">
        {navItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id || 
            (item.id === 'jobs' && currentTab === 'job') || 
            (item.id === 'accounts' && currentTab === 'account');

          return (
            <button
              key={item.id}
              className={isActive ? 'active' : ''}
              onClick={() => onSelectTab(item.id)}
            >
              <IconComponent />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="count">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="side-foot">
        <div>{totalJobs} files · {totalAccounts} accounts</div>
        <div style={{ marginTop: '3px' }}>
          {lastBackup ? `Last backup ${fd(lastBackup)}` : 'Cloud database active'}
        </div>
      </div>
    </aside>
  );
};
