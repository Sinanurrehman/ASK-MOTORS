import React, { useState } from 'react';
import { 
  Logo, 
  IconMail, 
  IconLock, 
  IconEye, 
  IconEyeOff, 
  IconGoogle, 
  IconCheck, 
  IconAlert 
} from './Icons';
import { 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword, 
  loginWithGoogle, 
  loginWithGoogleRedirect 
} from '../firebase';
import { OWNER_EMAIL, DEFAULT_OWNER_PASS } from '../constants';

interface LoginScreenProps {
  onDemoMode: () => void;
  showToast: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onDemoMode, showToast }) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googlePopupFailed, setGooglePopupFailed] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  // Quick fill owner credentials
  const handleQuickFillOwner = () => {
    setEmail(OWNER_EMAIL);
    setPassword(DEFAULT_OWNER_PASS);
    setErrorMsg(null);
    setSuccessMsg(`Admin credentials pre-filled (${OWNER_EMAIL}). Click "Sign In" or "1-Click Instant Owner Login" below.`);
  };

  // 1-Click Instant Owner Login for seamless access without popup issues
  const handleInstantOwnerLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGooglePopupFailed(false);

    try {
      // 1. Try signing in with primary password
      try {
        await loginWithEmail(OWNER_EMAIL, DEFAULT_OWNER_PASS);
        showToast('Welcome ASK Motors! Signed in as Admin / Owner.');
        return;
      } catch (firstErr) {
        // Try fallback pass
        const firstMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
        if (firstMsg.includes('invalid-credential') || firstMsg.includes('Invalid email or password')) {
          try {
            await loginWithEmail(OWNER_EMAIL, 'Askmotors@548');
            showToast('Welcome ASK Motors! Signed in as Admin / Owner.');
            return;
          } catch {
            // Re-throw to handle registration or provider check
          }
        }
        throw firstErr;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // 2. If user doesn't exist yet, auto-register admin account in Firebase Auth!
      if (
        msg.includes('user-not-found') || 
        msg.includes('Invalid email or password') || 
        msg.includes('invalid-credential') ||
        msg.includes('INVALID_LOGIN_CREDENTIALS')
      ) {
        try {
          await registerWithEmail(OWNER_EMAIL, DEFAULT_OWNER_PASS, 'ASK Motors Admin');
          showToast('ASK Motors Admin account created & signed in!');
          return;
        } catch (regErr: unknown) {
          const regMsg = regErr instanceof Error ? regErr.message : String(regErr);
          if (regMsg.includes('not enabled') || regMsg.includes('operation-not-allowed') || regMsg.includes('restricted')) {
            setErrorMsg('Firebase Console Action Required: "Email/Password" sign-in provider is not enabled yet in your Firebase console. Please go to Firebase Console (ask-motors-5e453) -> Authentication -> Sign-in method, click "Email/Password", toggle Enable and Save. Or click "Preview in Offline Demo Mode" below to access the app immediately!');
            return;
          }
          if (regMsg.includes('already exists') || regMsg.includes('email-already-in-use')) {
            setEmail(OWNER_EMAIL);
            setPassword(DEFAULT_OWNER_PASS);
            setTab('signin');
            setErrorMsg(`Admin account (${OWNER_EMAIL}) already exists in Firebase. Enter your account password to sign in, or click "Forgot password?".`);
            return;
          }
          setErrorMsg(regMsg);
          return;
        }
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGooglePopupFailed(false);

    try {
      await loginWithEmail(email, password);
      showToast('Signed in successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Seamless first-time registration fallback for admin
      if (
        (msg.includes('user-not-found') || 
         msg.includes('Invalid email or password') || 
         msg.includes('invalid-credential')) &&
        email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase() &&
        password.length >= 6
      ) {
        try {
          await registerWithEmail(email, password, 'Owner');
          showToast('Admin account automatically created and signed in!');
          return;
        } catch (regErr: unknown) {
          const regMsg = regErr instanceof Error ? regErr.message : String(regErr);
          if (regMsg.includes('not enabled') || regMsg.includes('operation-not-allowed') || regMsg.includes('restricted')) {
            setErrorMsg('Firebase Console Action Required: "Email/Password" sign-in is disabled. In Firebase Console (ask-motors-5e453) -> Authentication -> Sign-in method, enable "Email/Password".');
            return;
          }
          setErrorMsg(regMsg);
          return;
        }
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please provide your email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await registerWithEmail(email, password, displayName.trim());
      showToast('Account created and signed in!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address to receive a password reset link.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await resetPassword(email);
      setSuccessMsg(`Password reset link sent to ${email}. Check your inbox/spam folder.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGooglePopupFailed(false);

    try {
      await loginWithGoogle();
      showToast('Signed in with Google successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setGooglePopupFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirectLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogleRedirect();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 12px'
    }}>
      <div style={{
        maxWidth: '430px',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '24px 18px',
        textAlign: 'center'
      }}>
        {/* Logo & Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <Logo size={50} />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '0.5px' }}>
          ASK MOTORS
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 16px' }}>
          Vehicle Registration &amp; Accounts Management
        </p>

        {/* Info Banner */}
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          padding: '10px 12px',
          fontSize: '11.5px',
          lineHeight: '1.45',
          color: 'var(--muted)',
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <b>Private Office Workspace:</b> Sign in to sync vehicle files, customer receipts, and expense ledgers.
        </div>

        {/* Auth Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: 'var(--surface-2)',
          padding: '4px',
          borderRadius: 'var(--r)',
          marginBottom: '18px'
        }}>
          <button
            type="button"
            onClick={() => { setTab('signin'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: tab === 'signin' ? 700 : 500,
              color: tab === 'signin' ? '#fff' : 'var(--muted)',
              background: tab === 'signin' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In (Email)
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: tab === 'signup' ? 700 : 500,
              color: tab === 'signup' ? '#fff' : 'var(--muted)',
              background: tab === 'signup' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Instant Owner Access */}
        {tab !== 'forgot' && (
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleInstantOwnerLogin}
              style={{
                background: 'linear-gradient(135deg, rgba(229, 72, 77, 0.15) 0%, rgba(229, 72, 77, 0.08) 100%)',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--r)',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                boxShadow: '0 2px 8px rgba(229, 72, 77, 0.15)'
              }}
            >
              1-Click Instant Admin Login ({OWNER_EMAIL})
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--muted)', padding: '0 2px' }}>
              <span>Direct master access with live cloud Firestore sync</span>
              <button
                type="button"
                onClick={handleQuickFillOwner}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: '11.5px',
                  fontWeight: 600
                }}
              >
                Auto-fill Inputs
              </button>
            </div>
          </div>
        )}

        {/* Inline Alerts */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            padding: '10px 12px',
            borderRadius: 'var(--r)',
            fontSize: '12px',
            textAlign: 'left',
            marginBottom: '16px',
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <IconAlert style={{ flexShrink: 0, marginTop: '2px', width: '16px', height: '16px' }} />
            <div style={{ flex: 1 }}>
              <div>{errorMsg}</div>
              {(googlePopupFailed || errorMsg.includes('Domain not authorized') || errorMsg.includes('unauthorized-domain')) && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(239,68,68,0.3)', color: 'var(--text)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: '#ef4444' }}>
                    Google Sign-In Domain Setup:
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>
                    Firebase console me ye domain add karein ya neeche Email login use karein:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'var(--surface-2)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <code style={{ fontSize: '11px', flex: 1, wordBreak: 'break-all', color: 'var(--text)' }}>
                      {typeof window !== 'undefined' ? window.location.hostname : ''}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.hostname);
                          setDomainCopied(true);
                          setTimeout(() => setDomainCopied(false), 2000);
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {domainCopied ? 'Copied!' : 'Copy Domain'}
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.4 }}>
                    <b>How to add:</b> Firebase Console (ask-motors-5e453) &rarr; Authentication &rarr; Settings &rarr; Authorized domains &rarr; Add domain.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            padding: '10px 12px',
            borderRadius: 'var(--r)',
            fontSize: '12px',
            textAlign: 'left',
            marginBottom: '16px',
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IconCheck style={{ flexShrink: 0, width: '16px', height: '16px' }} />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Form: Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleEmailSignIn} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <IconMail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <IconLock size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 36px',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                height: '42px',
                fontSize: '14px',
                fontWeight: 700,
                marginTop: '12px',
                boxShadow: '0 4px 12px rgba(229, 72, 77, 0.25)'
              }}
            >
              {loading ? 'Authenticating…' : 'Sign In with Email'}
            </button>
          </form>
        )}

        {/* Form: Create Account / Sign Up */}
        {tab === 'signup' && (
          <form onSubmit={handleEmailSignUp} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="Full Name (e.g. Asim Khan)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <IconMail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Create Password (min 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <IconLock size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 36px',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPass ? <IconEyeOff style={{ width: '16px' }} /> : <IconEye style={{ width: '16px' }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                height: '42px',
                fontSize: '14px',
                fontWeight: 700,
                marginTop: '12px',
                boxShadow: '0 4px 12px rgba(229, 72, 77, 0.25)'
              }}
            >
              {loading ? 'Creating Account…' : 'Create Account & Sign In'}
            </button>
          </form>
        )}

        {/* Form: Forgot Password */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ textAlign: 'left' }}>
            <p className="muted" style={{ fontSize: '12.5px', margin: '0 0 12px' }}>
              Enter your email address and we'll send you an encrypted link to reset your password.
            </p>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <IconMail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                height: '42px',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              {loading ? 'Sending Link…' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => { setTab('signin'); setErrorMsg(null); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '12.5px',
                width: '100%',
                textAlign: 'center',
                marginTop: '12px',
                cursor: 'pointer'
              }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* OR Divider */}
        <div style={{ margin: '20px 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '11px', color: 'var(--faint)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        {/* Google Sign-in button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            height: '44px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            color: 'var(--text)',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          <IconGoogle />
          <span>Sign in with Google</span>
        </button>
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.4 }}>
          (Domain security policy applies. Agar popup band ho jaye to upar <b>1-Click Owner Login</b> use karein)
        </div>

        {/* Offline Demo Button */}
        <div style={{ marginTop: '16px', background: 'var(--surface-2)', padding: '12px', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginBottom: '8px', textAlign: 'center' }}>
            Firebase credentials ya configuration ke baghair chalana chahte hain?
          </div>
          <button
            type="button"
            className="btn ghost"
            onClick={onDemoMode}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text)',
              border: '1px dashed var(--border)',
              padding: '8px 12px',
              background: 'var(--surface)'
            }}
          >
            Bypass Login &amp; Open App (Offline / Standalone Mode) →
          </button>
        </div>
      </div>
    </div>
  );
};
