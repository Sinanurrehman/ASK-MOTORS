import React from 'react';
import { 
  IconDash, 
  IconCar, 
  IconClock, 
  IconUsers, 
  IconGear, 
  IconPlus 
} from './Icons';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingCount: number;
  onFabClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  onFabClick
}) => {
  return (
    <>
      <nav className="bottom-nav">
        <button 
          className={currentTab === 'dashboard' ? 'active' : ''} 
          onClick={() => onSelectTab('dashboard')}
        >
          <IconDash />
          Home
        </button>

        <button 
          className={currentTab === 'jobs' || currentTab === 'job' ? 'active' : ''} 
          onClick={() => onSelectTab('jobs')}
        >
          <IconCar />
          Files
        </button>

        <button 
          className={currentTab === 'pending' ? 'active' : ''} 
          onClick={() => onSelectTab('pending')}
        >
          <IconClock />
          Pending
          {pendingCount > 0 && <span className="count">{pendingCount}</span>}
        </button>

        <button 
          className={currentTab === 'accounts' || currentTab === 'account' ? 'active' : ''} 
          onClick={() => onSelectTab('accounts')}
        >
          <IconUsers />
          Accounts
        </button>

        <button 
          className={['payments', 'reports', 'settings', 'owner'].includes(currentTab) ? 'active' : ''} 
          onClick={() => onSelectTab('settings')}
        >
          <IconGear />
          Settings
        </button>
      </nav>

      <button className="fab" onClick={onFabClick} aria-label="Add new file or transaction">
        <IconPlus />
      </button>
    </>
  );
};
