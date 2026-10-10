import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with Database ID (default for Spark plan or named for custom)
export const db = (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)')
  ? getFirestore(app)
  : getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence failed-precondition (multiple tabs).');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore persistence is not supported by this browser.');
    }
  });
}

// Validate connection to Firestore as strictly required by firebase-integration skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is operating in offline mode.');
    }
  }
}
testConnection();

// Required Error Handling types and function per firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication error parser
export function formatAuthError(error: unknown): string {
  if (!error) return 'An unknown error occurred.';
  const code = (error as { code?: string })?.code || '';
  const message = error instanceof Error ? error.message : String(error);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';

  switch (code) {
    case 'auth/unauthorized-domain':
      return `Domain not authorized for Google Sign-In: "${currentHost}". To use Google login, add "${currentHost}" in Firebase Console -> Authentication -> Settings -> Authorized domains. Alternatively, use Email & Password or 1-Click Admin Login below (domain independent).`;
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion. If popups are blocked or closing automatically on your browser/phone, use Email & Password below.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups or use Email & Password login below.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials or click "Create Account".';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in with your password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in provider is not enabled yet in your Firebase Console. In Firebase Console (ask-motors-5e453) -> Authentication -> Sign-in method, click "Email/Password", enable it and save.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    default:
      return message;
  }
}

// Authentication helpers
export async function loginWithEmail(email: string, pass: string) {
  try {
    return await signInWithEmailAndPassword(auth, email.trim(), pass);
  } catch (error) {
    console.error('Email Login Error:', error);
    throw new Error(formatAuthError(error));
  }
}

export async function registerWithEmail(email: string, pass: string, displayName?: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName });
      } catch (e) {
        console.warn('Profile name update skipped:', e);
      }
    }
    return cred;
  } catch (error) {
    console.error('Email Registration Error:', error);
    throw new Error(formatAuthError(error));
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    console.error('Password Reset Error:', error);
    throw new Error(formatAuthError(error));
  }
}

export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw new Error(formatAuthError(error));
  }
}

export async function loginWithGoogleRedirect() {
  try {
    return await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google Redirect Error:', error);
    throw new Error(formatAuthError(error));
  }
}

export async function checkRedirectResult() {
  try {
    return await getRedirectResult(auth);
  } catch (error) {
    console.warn('Redirect result check:', error);
    return null;
  }
}

export async function logoutUser() {
  return await fbSignOut(auth);
}

export { onAuthStateChanged, type FirebaseUser };
