import React, { useState } from 'react';
import { IconX, IconCloud, IconUsers, IconTrash, IconCheck } from './Icons';
import { loginWithGoogle, logoutUser, FirebaseUser } from '../firebase';
import { TeamMember } from '../types';
import { OWNER_EMAIL } from '../constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userRole: 'owner' | 'staff' | null;
  teamMembers: TeamMember[];
  onAddTeamMember: (email: string) => Promise<void>;
  onRemoveTeamMember: (uid: string) => Promise<void>;
  syncStatus: 'connected' | 'syncing' | 'offline' | 'error';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userRole,
  teamMembers,
  onAddTeamMember,
  onRemoveTeamMember,
  syncStatus
}) => {
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = currentUser?.email === OWNER_EMAIL || userRole === 'owner';

  const handleLogin = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await loginWithGoogle();
      setFeedback('Successfully authenticated!');
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setFeedback('Signed out.');
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Sign out error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim()) return;
    setLoading(true);
    try {
      await onAddTeamMember(newStaffEmail.trim().toLowerCase());
      setNewStaffEmail('');
      setFeedback(`Team member ${newStaffEmail} invited.`);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-back">
      <div className="modal sm" role="dialog" aria-modal="true" aria-label="Team Authentication & Cloud Sync">
        <div className="modal-h">
          <h3>Cloud &amp; Team Authentication</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="modal-b">
          {/* Cloud Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: 'var(--r)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            marginBottom: '16px'
          }}>
            <IconCloud style={{ width: '22px', color: 'var(--primary)' }} />
            <div>
              <b style={{ fontSize: '13.5px', display: 'block' }}>
                {syncStatus === 'connected' ? 'Google Cloud Firestore: Connected' : 
                 syncStatus === 'syncing' ? 'Google Cloud Firestore: Syncing…' : 
                 'Offline-First Local Storage Active'}
              </b>
              <small className="muted">
                Encrypted multi-device sync across laptops, Android &amp; iOS.
              </small>
            </div>
          </div>

          {feedback && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--r)',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              fontSize: '12.5px',
              marginBottom: '14px',
              fontWeight: 600
            }}>
              {feedback}
            </div>
          )}

          {/* Current User Session */}
          {currentUser ? (
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--r)',
                background: 'var(--surface-3)',
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '16px'
                }}>
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: '14px' }}>
                    {currentUser.displayName || 'Authorized User'}
                  </b>
                  <span className="muted" style={{ fontSize: '12px', display: 'block', wordBreak: 'break-all' }}>
                    {currentUser.email}
                  </span>
                  <span className={`badge ${isOwner ? 'completed' : 'inprocess'}`} style={{ marginTop: '4px' }}>
                    {isOwner ? 'Owner / Administrator' : 'Authorized Staff'}
                  </span>
                </div>
                <button 
                  className="btn sm danger" 
                  onClick={handleLogout} 
                  disabled={loading}
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
              <p className="muted" style={{ marginTop: 0, fontSize: '13px' }}>
                Sign in with your verified Google Account to enable real-time cloud synchronization, access vehicle files, and collaborate with your team.
              </p>
              <button 
                className="btn primary" 
                onClick={handleLogin} 
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', height: '42px', fontSize: '14px' }}
              >
                <IconUsers />
                {loading ? 'Authenticating…' : 'Sign in with Google'}
              </button>
            </div>
          )}

          {/* Team Members Management (Visible to Owner) */}
          {isOwner && (
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)'
            }}>
              <b style={{ display: 'block', fontSize: '13.5px', marginBottom: '8px' }}>
                Team Members Access Control
              </b>
              <p className="muted" style={{ margin: '0 0 12px 0', fontSize: '12px' }}>
                Invite staff members by entering their Google email. Once added, they can securely log in to ASK MOTORS from any phone or computer.
              </p>

              <form onSubmit={handleAddStaff} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="email"
                  placeholder="staff.member@gmail.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    fontSize: '13px'
                  }}
                  required
                />
                <button type="submit" className="btn primary sm" disabled={loading}>
                  <IconCheck />
                  Add Staff
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--surface-2)',
                  fontSize: '12.5px'
                }}>
                  <div>
                    <b>{OWNER_EMAIL}</b>
                    <small className="muted" style={{ display: 'block' }}>Primary Owner</small>
                  </div>
                  <span className="badge completed">Owner</span>
                </div>

                {teamMembers.filter(m => m.email !== OWNER_EMAIL).map(m => (
                  <div key={m.uid} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--surface-2)',
                    fontSize: '12.5px'
                  }}>
                    <div>
                      <b>{m.email}</b>
                      <small className="muted" style={{ display: 'block' }}>Staff Member</small>
                    </div>
                    <button 
                      className="btn sm ghost danger" 
                      onClick={() => onRemoveTeamMember(m.uid)}
                      title="Revoke access"
                      style={{ padding: '3px 6px' }}
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-f">
          <button className="btn primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
