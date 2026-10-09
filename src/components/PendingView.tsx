import React, { useState } from 'react';
import { Job, Account } from '../types';
import { days } from '../constants';
import { IconCheck } from './Icons';

interface PendingViewProps {
  jobs: Job[];
  accounts: Account[];
  initialService?: string;
  onToggleTask: (jobId: string, taskIndex: number) => void;
  onSelectJob: (id: string) => void;
}

export const PendingView: React.FC<PendingViewProps> = ({
  jobs,
  accounts,
  initialService = 'all',
  onToggleTask,
  onSelectJob
}) => {
  const [selectedService, setSelectedService] = useState(initialService);

  const openJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');

  const pendingItems: { job: Job; taskIndex: number; key: string }[] = [];
  openJobs.forEach(j => {
    (j.tasks || []).forEach((t, idx) => {
      if (!t.done) {
        pendingItems.push({ job: j, taskIndex: idx, key: t.key });
      }
    });
  });

  const byKey: { [key: string]: number } = {};
  pendingItems.forEach(item => {
    byKey[item.key] = (byKey[item.key] || 0) + 1;
  });

  const availableKeys = Object.keys(byKey).sort();

  const filteredItems = selectedService === 'all'
    ? pendingItems
    : pendingItems.filter(item => item.key === selectedService);

  // Sort by oldest days open first
  filteredItems.sort((a, b) => days(b.job.date) - days(a.job.date));

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Pending Work Checklist</h2>
          <p>
            MVI, Fitness, NOC, Route Permit, and transfer tasks still open. Click the circle to mark completed.
          </p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${selectedService === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedService('all')}
        >
          All Tasks
          <span className="c">{pendingItems.length}</span>
        </button>

        {availableKeys.map(k => (
          <button
            key={k}
            className={`tab ${selectedService === k ? 'active' : ''}`}
            onClick={() => setSelectedService(k)}
          >
            {k}
            <span className="c">{byKey[k]}</span>
          </button>
        ))}
      </div>

      <div className="card">
        {filteredItems.length > 0 ? (
          <div className="table-wrap cards pend">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '48px' }}></th>
                  <th>Task Stage</th>
                  <th>Vehicle</th>
                  <th className="hide-m">Owner / Party</th>
                  <th className="hide-m">Progress</th>
                  <th className="r">Days Open</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(({ job: j, taskIndex, key }, idx) => {
                  const d = days(j.date);
                  const accObj = accounts.find(a => a.id === j.accountId);
                  const isNext = (j.tasks || []).find(t => !t.done)?.key === key;

                  return (
                    <tr key={`${j.id}-${taskIndex}-${idx}`}>
                      <td>
                        <button
                          className="check"
                          onClick={() => onToggleTask(j.id, taskIndex)}
                          aria-label={`Mark ${key} done`}
                        >
                          <IconCheck />
                        </button>
                      </td>

                      <td>
                        <b>{key}</b>
                        {isNext && <span className="badge pending" style={{ marginLeft: '6px' }}>Next</span>}
                      </td>

                      <td className="click" onClick={() => onSelectJob(j.id)} style={{ cursor: 'pointer' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          <span className={`plate ${j.vtype === 'Commercial' ? 'com' : ''}`}>{j.oldReg}</span>
                          {j.newReg && <span className="plate new" style={{ marginLeft: '4px' }}>→ {j.newReg}</span>}
                        </span>
                        <div className="show-m" style={{ fontSize: '12px', marginTop: '3px' }}>
                          {j.owner || accObj?.name}
                        </div>
                      </td>

                      <td className="hide-m">
                        <b>{j.owner || '—'}</b>
                        <div className="faint" style={{ fontSize: '12px' }}>{accObj?.name || '—'}</div>
                      </td>

                      {/* Workflow dots */}
                      <td className="hide-m">
                        {(j.tasks || []).map((t, i) => (
                          <span
                            key={i}
                            title={`${t.key}: ${t.done ? 'Done' : 'Pending'}`}
                            style={{
                              display: 'inline-block',
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              marginRight: '3px',
                              background: t.done ? 'var(--ok)' : (i === taskIndex ? 'var(--warn)' : 'var(--border-strong)')
                            }}
                          />
                        ))}
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
          <div className="empty">
            No pending tasks. Everything is up to date!
          </div>
        )}
      </div>
    </div>
  );
};
