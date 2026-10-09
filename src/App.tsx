import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc
} from 'firebase/firestore';
import * as XLSX from 'xlsx';

import { 
  db, 
  auth, 
  onAuthStateChanged, 
  loginWithGoogle,
  FirebaseUser, 
  OperationType, 
  handleFirestoreError 
} from './firebase';

import { 
  Job, 
  Account, 
  Payment, 
  Expense, 
  AppConfig, 
  TeamMember, 
  PaymentMethod,
  OwnerProfile
} from './types';

import { 
  DEFAULT_SERVICES, 
  OWNER_EMAIL, 
  today, 
  num, 
  up, 
  getJobTotal,
  CHARGE_HEADS,
  COMMERCIAL_FLOW
} from './constants';

import { INITIAL_VRM_SEED } from './seedData';
import { Logo } from './components/Icons';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { JobDetailView } from './components/JobDetailView';
import { PendingView } from './components/PendingView';
import { AccountsView } from './components/AccountsView';
import { AccountDetailView, LedgerRow, AccountStats } from './components/AccountDetailView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { OwnerView } from './components/OwnerView';
import { SettingsView } from './components/SettingsView';
import { InstallModal } from './components/InstallModal';
import { 
  JobModal, 
  AccountModal, 
  PaymentModal, 
  ExpenseModal 
} from './components/Modals';
import { PrintArea, PrintData } from './components/PrintArea';

const DEFAULT_CONFIG: AppConfig = {
  settings: {
    bizName: 'ASK MOTORS',
    tagline: 'Vehicle Registration & Transfer Services',
    phone: '',
    address: 'Karachi',
    note: 'Thank you for your business',
    theme: 'dark',
    owner: {
      name: 'SINAN UR REHMAN',
      designation: 'Proprietor',
      onPrint: true
    }
  },
  services: [...DEFAULT_SERVICES],
  seq: { job: 0, pay: 0, exp: 0 }
};

export default function App() {
  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [pendingFilterService, setPendingFilterService] = useState<string>('all');
  const [jobsFilterState, setJobsFilterState] = useState<string>('open');

  // Firebase Data Collections
  const [jobs, setJobs] = useState<Job[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Auth & Sync state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'owner' | 'staff' | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline' | 'error'>('syncing');

  // Modal dialog states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [defaultPaymentAccId, setDefaultPaymentAccId] = useState<string>('');
  const [defaultPaymentJobId, setDefaultPaymentJobId] = useState<string>('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [defaultExpenseVendorId, setDefaultExpenseVendorId] = useState<string>('');
  const [defaultExpenseJobId, setDefaultExpenseJobId] = useState<string>('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        showToast('App installation started!');
        setIsInstallModalOpen(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Printing & Toast
  const [printData, setPrintData] = useState<PrintData>({ type: null });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2800);
  }, []);

  // Demo state loader for offline evaluation
  const loadDemoState = useCallback(() => {
    const demoAccounts: Account[] = [];
    const demoJobs: Job[] = [];
    const partyMap = new Map<string, string>();

    INITIAL_VRM_SEED.forEach((r, idx) => {
      const pName = up(r.party || r.owner || 'WALK-IN');
      let aId = partyMap.get(pName);
      if (!aId) {
        aId = 'acc_demo_' + partyMap.size;
        partyMap.set(pName, aId);
        demoAccounts.push({
          id: aId,
          name: pName,
          kind: r.party ? 'Party' : 'Customer',
          opening: 0,
          createdAt: today()
        });
      }

      const services = r.type === 'Commercial' ? ['Transfer', ...COMMERCIAL_FLOW] : ['Transfer'];
      const wf = r.wf || [];
      const tasks = services.map(k => {
        let done = false;
        if (k === 'Transfer') done = !!r.newReg;
        const ci = COMMERCIAL_FLOW.indexOf(k);
        if (ci >= 0) done = !!wf[ci];
        return { key: k, done, doneDate: done ? (r.receiptDate || r.date) : '' };
      });

      demoJobs.push({
        id: 'job_demo_' + idx,
        no: 'JOB-' + String(idx + 1).padStart(4, '0'),
        date: r.date || today(),
        accountId: aId,
        owner: up(r.owner),
        oldReg: up(r.oldReg),
        newReg: up(r.newReg),
        vtype: r.type || 'Private',
        charges: {
          receipt: num(r.receipt),
          insurance: num(r.insurance),
          mvi: num(r.mvi),
          fitness: num(r.fitness),
          permit: num(r.permit),
          alteration: num(r.alt),
          service: num(r.other)
        },
        services,
        tasks,
        status: (tasks.every(t => t.done) ? 'Completed' : (tasks.some(t => t.done) ? 'In Process' : 'Pending')),
        createdAt: today()
      });
    });

    setAccounts(demoAccounts);
    setJobs(demoJobs);
  }, []);

  // 1. Auth Listener - Track readiness state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (user) {
        if (user.email === OWNER_EMAIL) {
          setUserRole('owner');
        } else {
          setUserRole('staff');
        }
        setSyncStatus('connected');

        // Upsert user profile document in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            role: user.email === OWNER_EMAIL ? 'owner' : 'staff',
            lastLogin: today()
          }, { merge: true });
        } catch (e) {
          console.warn('Profile write skipped:', e);
        }
      } else {
        setUserRole(null);
        setSyncStatus('offline');
      }
    });

    return () => unsub();
  }, []);

  // 2. Real-time Firestore Listeners - ONLY attach when authenticated!
  useEffect(() => {
    if (!authReady || !currentUser) {
      return;
    }

    setSyncStatus('syncing');

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const items: Job[] = [];
      snapshot.forEach((d) => items.push({ id: d.id, ...d.data() } as Job));
      setJobs(items);
      setSyncStatus('connected');
    }, (err) => {
      console.warn('Jobs snapshot listener:', err);
      if (err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, 'jobs');
      }
    });

    const unsubAccounts = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      const items: Account[] = [];
      snapshot.forEach((d) => items.push({ id: d.id, ...d.data() } as Account));
      setAccounts(items);
    }, (err) => {
      console.warn('Accounts snapshot listener:', err);
      if (err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, 'accounts');
      }
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      const items: Payment[] = [];
      snapshot.forEach((d) => items.push({ id: d.id, ...d.data() } as Payment));
      setPayments(items);
    }, (err) => {
      console.warn('Payments snapshot listener:', err);
      if (err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, 'payments');
      }
    });

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((d) => items.push({ id: d.id, ...d.data() } as Expense));
      setExpenses(items);
    }, (err) => {
      console.warn('Expenses snapshot listener:', err);
      if (err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, 'expenses');
      }
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'app_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppConfig;
        setConfig(prev => ({
          ...prev,
          ...data,
          settings: { ...prev.settings, ...data.settings },
          services: data.services || prev.services,
          seq: data.seq || prev.seq
        }));
      }
    }, (err) => {
      console.warn('Config snapshot listener:', err);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const items: TeamMember[] = [];
      snapshot.forEach((d) => items.push({ uid: d.id, ...d.data() } as TeamMember));
      setTeamMembers(items);
    }, (err) => {
      console.warn('Users snapshot listener:', err);
    });

    return () => {
      unsubJobs();
      unsubAccounts();
      unsubPayments();
      unsubExpenses();
      unsubConfig();
      unsubUsers();
    };
  }, [authReady, currentUser]);

  // 3. Online/Offline network events
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('connected');
      showToast('Network online — Real-time Firestore sync active');
    };
    const handleOffline = () => {
      setSyncStatus('offline');
      showToast('Working offline — Changes saved locally in cache');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = config.settings.theme || 'dark';
  }, [config.settings.theme]);

  // Helper sequences
  const nextJobNo = useCallback(() => {
    const n = (config.seq?.job || jobs.length) + 1;
    return 'JOB-' + String(n).padStart(4, '0');
  }, [config.seq, jobs.length]);

  const nextPayNo = useCallback(() => {
    const n = (config.seq?.pay || payments.length) + 1;
    return 'RCV-' + String(n).padStart(4, '0');
  }, [config.seq, payments.length]);

  const nextExpNo = useCallback(() => {
    const n = (config.seq?.exp || expenses.length) + 1;
    return 'EXP-' + String(n).padStart(4, '0');
  }, [config.seq, expenses.length]);

  // -------------------------------------------------------------
  // Data Mutators (Write to Cloud Firestore)
  // -------------------------------------------------------------
  const handleSaveJob = async (
    data: Partial<Job>, 
    advance?: { amount: number; method: PaymentMethod; ref?: string }
  ) => {
    const isNew = !jobToEdit;
    const jId = jobToEdit ? jobToEdit.id : (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
    const jNo = jobToEdit ? jobToEdit.no : nextJobNo();

    // Generate tasks based on services
    const currentTasks = jobToEdit?.tasks || [];
    const servicesList = data.services || (jobToEdit ? jobToEdit.services : ['Transfer']);
    const updatedTasks = servicesList.map(s => {
      const existing = currentTasks.find(t => t.key === s);
      return existing || { key: s, done: false };
    });

    const fullJob: Job = {
      id: jId,
      no: jNo,
      date: data.date || today(),
      accountId: data.accountId || '',
      owner: data.owner || '',
      ownerPhone: data.ownerPhone || '',
      ownerCnic: data.ownerCnic || '',
      ownerFather: data.ownerFather || '',
      ownerAddress: data.ownerAddress || '',
      oldReg: data.oldReg || '',
      newReg: data.newReg || '',
      vtype: data.vtype || 'Private',
      make: data.make || '',
      chassis: data.chassis || '',
      engine: data.engine || '',
      receiptNo: data.receiptNo || '',
      receiptDate: data.receiptDate || '',
      charges: data.charges || {},
      status: data.status || 'Pending',
      services: servicesList,
      tasks: updatedTasks,
      notes: data.notes || '',
      remarks: data.remarks || '',
      fileReturned: !!data.fileReturned,
      fileReturnDate: data.fileReturnDate || '',
      fileReturnTo: data.fileReturnTo || '',
      createdAt: jobToEdit?.createdAt || today(),
      createdBy: currentUser?.email || 'system',
      updatedAt: today()
    };

    try {
      await setDoc(doc(db, 'jobs', jId), fullJob);

      // Record advance payment if specified
      if (isNew && advance && advance.amount > 0) {
        const pId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const pNo = nextPayNo();
        const advPayment: Payment = {
          id: pId,
          no: pNo,
          date: fullJob.date,
          accountId: fullJob.accountId,
          jobId: jId,
          amount: advance.amount,
          method: advance.method,
          ref: advance.ref || '',
          notes: 'Advance at file opening',
          createdAt: today(),
          createdBy: currentUser?.email || 'system'
        };
        await setDoc(doc(db, 'payments', pId), advPayment);
      }

      // Increment sequence
      if (isNew) {
        await setDoc(doc(db, 'config', 'app_config'), {
          ...config,
          seq: {
            job: (config.seq?.job || 0) + 1,
            pay: (config.seq?.pay || 0) + (advance ? 1 : 0),
            exp: config.seq?.exp || 0
          }
        }, { merge: true });
      }

      setIsJobModalOpen(false);
      showToast(isNew ? `Vehicle file ${jNo} saved to cloud` : `File ${jNo} updated`);
      setSelectedJobId(jId);
      setCurrentTab('job');
    } catch (err: unknown) {
      console.error(err);
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `jobs/${jId}`);
    }
  };

  const handleToggleTask = async (jobId: string, taskIndex: number) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    const newTasks = [...(targetJob.tasks || [])];
    const item = newTasks[taskIndex];
    if (!item) return;

    item.done = !item.done;
    item.doneDate = item.done ? today() : '';

    let newStatus = targetJob.status;
    if (newTasks.every(t => t.done) && targetJob.status !== 'Completed' && targetJob.status !== 'Cancelled') {
      newStatus = 'Completed';
    } else if (!item.done && targetJob.status === 'Completed') {
      newStatus = 'In Process';
    } else if (item.done && targetJob.status === 'Pending') {
      newStatus = 'In Process';
    }

    try {
      await setDoc(doc(db, 'jobs', jobId), {
        ...targetJob,
        tasks: newTasks,
        status: newStatus,
        completedDate: newStatus === 'Completed' ? today() : (targetJob.completedDate || ''),
        updatedAt: today()
      }, { merge: true });

      showToast(`${item.key} marked ${item.done ? 'done' : 'pending'}`);
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.UPDATE, `jobs/${jobId}`);
    }
  };

  const handleToggleFileReturn = async (targetJob: Job) => {
    const isNowReturned = !targetJob.fileReturned;
    const recipient = isNowReturned 
      ? (targetJob.owner || accounts.find(a => a.id === targetJob.accountId)?.name || 'Customer')
      : '';

    try {
      await setDoc(doc(db, 'jobs', targetJob.id), {
        ...targetJob,
        fileReturned: isNowReturned,
        fileReturnDate: isNowReturned ? today() : '',
        fileReturnTo: recipient,
        updatedAt: today()
      }, { merge: true });

      showToast(isNowReturned ? `✔ File marked returned to ${recipient}` : 'File marked back In Office');
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.UPDATE, `jobs/${targetJob.id}`);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: Job['status']) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    try {
      await setDoc(doc(db, 'jobs', jobId), {
        ...targetJob,
        status,
        completedDate: status === 'Completed' ? today() : '',
        updatedAt: today()
      }, { merge: true });

      showToast(`Status changed to ${status}`);
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.UPDATE, `jobs/${jobId}`);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle file? Linked payments will remain on account.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      showToast('Vehicle file deleted');
      setSelectedJobId(null);
      setCurrentTab('jobs');
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.DELETE, `jobs/${jobId}`);
    }
  };

  const handleSaveAccount = async (data: Partial<Account>) => {
    const isNew = !accountToEdit;
    const aId = accountToEdit ? accountToEdit.id : (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));

    const fullAccount: Account = {
      id: aId,
      name: up(data.name) || '',
      kind: data.kind || 'Party',
      phone: data.phone || '',
      cnic: data.cnic || '',
      opening: num(data.opening),
      address: data.address || '',
      notes: data.notes || '',
      createdAt: accountToEdit?.createdAt || today(),
      createdBy: currentUser?.email || 'system'
    };

    try {
      await setDoc(doc(db, 'accounts', aId), fullAccount);
      setIsAccountModalOpen(false);
      showToast(isNew ? `Account ${fullAccount.name} added` : 'Account updated');
      setSelectedAccountId(aId);
      setCurrentTab('account');
    } catch (err: unknown) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `accounts/${aId}`);
    }
  };

  const handleQuickAddAccount = async (name: string, kind: 'Party' | 'Customer' | 'Vendor'): Promise<string> => {
    const aId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const newAcc: Account = {
      id: aId,
      name: up(name),
      kind,
      opening: 0,
      createdAt: today(),
      createdBy: currentUser?.email || 'system'
    };
    await setDoc(doc(db, 'accounts', aId), newAcc);
    showToast(`Account "${newAcc.name}" created`);
    return aId;
  };

  const handleDeleteAccount = async (accId: string) => {
    const linkedJobs = jobs.filter(j => j.accountId === accId);
    const linkedPays = payments.filter(p => p.accountId === accId);
    if (linkedJobs.length > 0 || linkedPays.length > 0) {
      alert(`Cannot delete account: ${linkedJobs.length} vehicle file(s) and ${linkedPays.length} payment(s) are linked to it. Delete them first.`);
      return;
    }
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteDoc(doc(db, 'accounts', accId));
      showToast('Account deleted');
      setSelectedAccountId(null);
      setCurrentTab('accounts');
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.DELETE, `accounts/${accId}`);
    }
  };

  const handleSavePayment = async (data: Partial<Payment>) => {
    const isNew = !paymentToEdit;
    const pId = paymentToEdit ? paymentToEdit.id : (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
    const pNo = paymentToEdit ? paymentToEdit.no : nextPayNo();

    const fullPayment: Payment = {
      id: pId,
      no: pNo,
      date: data.date || today(),
      accountId: data.accountId || '',
      jobId: data.jobId || null,
      amount: num(data.amount),
      method: data.method || 'Cash',
      ref: data.ref || '',
      notes: data.notes || '',
      createdAt: paymentToEdit?.createdAt || today(),
      createdBy: currentUser?.email || 'system'
    };

    try {
      await setDoc(doc(db, 'payments', pId), fullPayment);

      if (isNew) {
        await setDoc(doc(db, 'config', 'app_config'), {
          ...config,
          seq: {
            ...config.seq,
            pay: (config.seq?.pay || 0) + 1
          }
        }, { merge: true });
      }

      setIsPaymentModalOpen(false);
      showToast(`Receipt ${pNo} for Rs ${fullPayment.amount} recorded`);
      // Auto open print receipt
      handlePrintReceipt(fullPayment);
    } catch (err: unknown) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `payments/${pId}`);
    }
  };

  const handleDeletePayment = async (pId: string) => {
    if (!confirm('Delete this payment receipt? The party balance will increase.')) return;
    try {
      await deleteDoc(doc(db, 'payments', pId));
      setIsPaymentModalOpen(false);
      showToast('Payment deleted');
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.DELETE, `payments/${pId}`);
    }
  };

  const handleSaveExpense = async (data: Partial<Expense>) => {
    const isNew = !expenseToEdit;
    const eId = expenseToEdit ? expenseToEdit.id : (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
    const eNo = expenseToEdit ? expenseToEdit.no : nextExpNo();

    const fullExpense: Expense = {
      id: eId,
      no: eNo,
      date: data.date || today(),
      vendorId: data.vendorId || '',
      jobId: data.jobId || null,
      category: data.category || 'Insurance',
      amount: num(data.amount),
      method: data.method || 'Cash',
      ref: data.ref || '',
      notes: data.notes || '',
      createdAt: expenseToEdit?.createdAt || today(),
      createdBy: currentUser?.email || 'system'
    };

    try {
      await setDoc(doc(db, 'expenses', eId), fullExpense);

      if (isNew) {
        await setDoc(doc(db, 'config', 'app_config'), {
          ...config,
          seq: {
            ...config.seq,
            exp: (config.seq?.exp || 0) + 1
          }
        }, { merge: true });
      }

      setIsExpenseModalOpen(false);
      showToast(`Vendor expense ${eNo} for Rs ${fullExpense.amount} recorded`);
    } catch (err: unknown) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `expenses/${eId}`);
    }
  };

  const handleDeleteExpense = async (eId: string) => {
    if (!confirm('Delete this vendor expense payout?')) return;
    try {
      await deleteDoc(doc(db, 'expenses', eId));
      setIsExpenseModalOpen(false);
      showToast('Vendor payout deleted');
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.DELETE, `expenses/${eId}`);
    }
  };

  // Team Access Handlers
  const handleAddTeamMember = async (email: string) => {
    const uId = 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    const newMember: TeamMember = {
      uid: uId,
      email,
      role: 'staff',
      addedAt: today()
    };
    await setDoc(doc(db, 'users', uId), newMember);
  };

  const handleRemoveTeamMember = async (uId: string) => {
    if (!confirm('Revoke access for this team member?')) return;
    await deleteDoc(doc(db, 'users', uId));
    showToast('Team member removed');
  };

  // -------------------------------------------------------------
  // Seed Data Import (19 Perplexity Vehicles)
  // -------------------------------------------------------------
  const handleImportSeedData = async () => {
    if (!confirm(`Import ${INITIAL_VRM_SEED.length} vehicle entries from your previous records into Cloud Firestore?`)) {
      return;
    }

    try {
      let importedCount = 0;
      const accountCache = new Map<string, string>();
      accounts.forEach(a => accountCache.set(up(a.name), a.id));

      for (const r of INITIAL_VRM_SEED) {
        if (!r.oldReg && !r.newReg) continue;

        const partyName = up(r.party || r.owner || 'WALK-IN');
        let aId = accountCache.get(partyName);

        if (!aId) {
          aId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          const newAcc: Account = {
            id: aId,
            name: partyName,
            kind: r.party ? 'Party' : 'Customer',
            opening: 0,
            createdAt: today(),
            createdBy: currentUser?.email || 'seed'
          };
          await setDoc(doc(db, 'accounts', aId), newAcc);
          accountCache.set(partyName, aId);
        }

        const jId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + importedCount;
        const jNo = 'JOB-' + String(jobs.length + importedCount + 1).padStart(4, '0');

        const services = r.type === 'Commercial' ? ['Transfer', ...COMMERCIAL_FLOW] : ['Transfer'];
        const wf = r.wf || [];
        const tasks = services.map(k => {
          let done = false;
          if (k === 'Transfer') done = !!r.newReg;
          const ci = COMMERCIAL_FLOW.indexOf(k);
          if (ci >= 0) done = !!wf[ci];
          return { key: k, done, doneDate: done ? (r.receiptDate || r.date) : '' };
        });

        const status = (r.status as Job['status']) || (tasks.every(t => t.done) ? 'Completed' : (tasks.some(t => t.done) ? 'In Process' : 'Pending'));

        const jobEntry: Job = {
          id: jId,
          no: jNo,
          date: r.date || today(),
          accountId: aId,
          owner: up(r.owner),
          ownerPhone: '',
          oldReg: up(r.oldReg),
          newReg: up(r.newReg),
          vtype: r.type || 'Private',
          make: '',
          chassis: '',
          engine: '',
          services,
          tasks,
          receiptNo: '',
          receiptDate: r.receiptDate || '',
          charges: {
            receipt: num(r.receipt),
            insurance: num(r.insurance),
            mvi: num(r.mvi),
            fitness: num(r.fitness),
            noc: 0,
            permit: num(r.permit),
            alteration: num(r.alt),
            service: num(r.other),
            other: 0
          },
          status,
          notes: r.notes || '',
          remarks: r.remarks || '',
          fileReturned: false,
          createdAt: today(),
          createdBy: currentUser?.email || 'seed',
          updatedAt: today()
        };

        await setDoc(doc(db, 'jobs', jId), jobEntry);
        importedCount++;
      }

      showToast(`✅ Successfully imported ${importedCount} vehicle records into Cloud Firestore!`);
    } catch (err: unknown) {
      console.error('Seed import error:', err);
      showToast('Error importing seed records: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // -------------------------------------------------------------
  // Excel Export & Import
  // -------------------------------------------------------------
  const handleExportExcel = (subsetJobs?: Job[]) => {
    const list = subsetJobs || jobs;
    const wb = XLSX.utils.book_new();

    const jobsSheetData = list.map(j => {
      const acc = accounts.find(a => a.id === j.accountId);
      const jTotal = getJobTotal(j);
      const jPaid = payments.filter(p => p.jobId === j.id).reduce((s, p) => s + num(p.amount), 0);
      return {
        'File No': j.no,
        'Date': j.date,
        'Old Reg': j.oldReg,
        'New Reg': j.newReg,
        'Type': j.vtype,
        'Owner': j.owner,
        'Party': acc?.name || '—',
        'Chassis': j.chassis,
        'Engine': j.engine,
        'Services': (j.services || []).join(', '),
        'Status': j.status,
        'Total Charged': jTotal,
        'Total Paid': jPaid,
        'Balance Due': jTotal - jPaid,
        'File Returned': j.fileReturned ? 'YES' : 'NO',
        'Return Date': j.fileReturnDate || '',
        'Returned To': j.fileReturnTo || '',
        'Notes': j.notes
      };
    });

    const paysSheetData = payments.map(p => {
      const acc = accounts.find(a => a.id === p.accountId);
      const j = jobs.find(x => x.id === p.jobId);
      return {
        'Receipt No': p.no,
        'Date': p.date,
        'Account': acc?.name || '—',
        'Vehicle': j ? j.oldReg : 'On Account',
        'Amount': p.amount,
        'Method': p.method,
        'Reference': p.ref,
        'Notes': p.notes
      };
    });

    const wsJobs = XLSX.utils.json_to_sheet(jobsSheetData.length ? jobsSheetData : [{}]);
    const wsPays = XLSX.utils.json_to_sheet(paysSheetData.length ? paysSheetData : [{}]);

    XLSX.utils.book_append_sheet(wb, wsJobs, 'Vehicle Files');
    XLSX.utils.book_append_sheet(wb, wsPays, 'Customer Payments');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASK-MOTORS-${today()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Excel workbook exported');
  };

  const handleImportExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        if (!rows.length) {
          showToast('No rows found in this sheet');
          return;
        }

        let imported = 0;
        for (const r of rows) {
          const oldR = String(r['Old Reg'] || r['Old Registration No'] || r['Old Reg No'] || '').trim();
          const newR = String(r['New Reg'] || r['New Registration No'] || '').trim();
          if (!oldR && !newR) continue;

          const pName = up(String(r['Party'] || r['Party / Company'] || r['Customer Name'] || 'WALK-IN'));
          let aObj = accounts.find(a => up(a.name) === pName);
          let aId = aObj?.id;

          if (!aId) {
            aId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
            await setDoc(doc(db, 'accounts', aId), {
              id: aId,
              name: pName,
              kind: 'Party',
              opening: 0,
              createdAt: today(),
              createdBy: currentUser?.email || 'excel'
            });
          }

          const jId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + imported;
          const jNo = 'JOB-' + String(jobs.length + imported + 1).padStart(4, '0');

          const newJob: Job = {
            id: jId,
            no: jNo,
            date: today(),
            accountId: aId,
            owner: up(String(r['Owner'] || r['Customer Name'] || '')),
            oldReg: up(oldR),
            newReg: up(newR),
            vtype: (String(r['Type'] || r['Vehicle Type'] || '').includes('Com') ? 'Commercial' : 'Private'),
            make: String(r['Make'] || ''),
            chassis: up(String(r['Chassis'] || '')),
            engine: up(String(r['Engine'] || '')),
            services: ['Transfer'],
            tasks: [{ key: 'Transfer', done: !!newR }],
            charges: {
              receipt: num(r['Receipt'] || r['Receipt Amount']),
              insurance: num(r['Insurance']),
              service: num(r['Other'] || r['Service Charges'])
            },
            status: 'Pending',
            notes: String(r['Notes'] || ''),
            remarks: '',
            createdAt: today(),
            createdBy: currentUser?.email || 'excel',
            updatedAt: today()
          };

          await setDoc(doc(db, 'jobs', jId), newJob);
          imported++;
        }

        showToast(`Imported ${imported} vehicle files from Excel`);
      } catch (err: unknown) {
        showToast('Failed to import Excel: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // -------------------------------------------------------------
  // JSON Backup & Restore
  // -------------------------------------------------------------
  const handleDownloadBackup = () => {
    const backupData = {
      version: 2,
      exportDate: today(),
      settings: config.settings,
      services: config.services,
      jobs,
      accounts,
      payments,
      expenses
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASK-MOTORS-Backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('JSON backup downloaded');
  };

  const handleRestoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed.jobs) || !Array.isArray(parsed.accounts)) {
          alert('Invalid backup file structure.');
          return;
        }

        if (!confirm(`Restore ${parsed.jobs.length} files and ${parsed.accounts.length} accounts to Cloud Firestore?`)) {
          return;
        }

        for (const a of parsed.accounts) {
          await setDoc(doc(db, 'accounts', a.id), a);
        }
        for (const j of parsed.jobs) {
          await setDoc(doc(db, 'jobs', j.id), j);
        }
        if (Array.isArray(parsed.payments)) {
          for (const p of parsed.payments) {
            await setDoc(doc(db, 'payments', p.id), p);
          }
        }
        if (Array.isArray(parsed.expenses)) {
          for (const ex of parsed.expenses) {
            await setDoc(doc(db, 'expenses', ex.id), ex);
          }
        }

        showToast('Backup restored successfully');
      } catch (err: unknown) {
        showToast('Restore error: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = async () => {
    if (!confirm('DANGER: This will permanently erase ALL files, accounts, and payments from Cloud Firestore. Proceed?')) {
      return;
    }
    try {
      for (const j of jobs) await deleteDoc(doc(db, 'jobs', j.id));
      for (const a of accounts) await deleteDoc(doc(db, 'accounts', a.id));
      for (const p of payments) await deleteDoc(doc(db, 'payments', p.id));
      for (const e of expenses) await deleteDoc(doc(db, 'expenses', e.id));
      showToast('All records erased');
    } catch (err: unknown) {
      showToast('Erase failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // -------------------------------------------------------------
  // Printing Handlers
  // -------------------------------------------------------------
  const handlePrintReceipt = (p: Payment) => {
    const a = accounts.find(x => x.id === p.accountId);
    const j = jobs.find(x => x.id === p.jobId);
    setPrintData({
      type: 'receipt',
      payment: p,
      account: a,
      job: j
    });
    setTimeout(() => window.print(), 80);
  };

  const handlePrintJobSlip = (j: Job) => {
    const a = accounts.find(x => x.id === j.accountId);
    setPrintData({
      type: 'job',
      job: j,
      account: a
    });
    setTimeout(() => window.print(), 80);
  };

  const handlePrintStatement = (
    rows: LedgerRow[], 
    opening: number, 
    closing: number, 
    from: string, 
    to: string
  ) => {
    const a = accounts.find(x => x.id === selectedAccountId);
    setPrintData({
      type: 'statement',
      account: a,
      ledgerRows: rows,
      opening,
      closing,
      from,
      to
    });
    setTimeout(() => window.print(), 80);
  };

  // WhatsApp helpers
  const handleWhatsAppJob = (j: Job) => {
    const acc = accounts.find(a => a.id === j.accountId);
    const jTotal = getJobTotal(j);
    const jPaid = payments.filter(p => p.jobId === j.id).reduce((s, p) => s + num(p.amount), 0);
    const text = `*${config.settings.bizName}*\nVehicle: ${j.oldReg}${j.newReg ? ' → ' + j.newReg : ''}\nOwner: ${j.owner || '—'}\nWork: ${(j.services || []).join(', ')}\nStatus: ${j.status}${j.fileReturned ? ' (File Returned)' : ''}\nCharges: Rs ${jTotal} | Paid: Rs ${jPaid}\n*Balance Due: Rs ${jTotal - jPaid}*`;
    let p = String(j.ownerPhone || acc?.phone || '').replace(/\D/g, '');
    if (p.startsWith('0')) p = '92' + p.slice(1);
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWhatsAppStatement = (stats: AccountStats) => {
    const a = accounts.find(x => x.id === selectedAccountId);
    if (!a) return;
    const text = `*${config.settings.bizName}*\nAccount: ${a.name}\nTotal Charged: Rs ${stats.billed + stats.opening}\nReceived: Rs ${stats.paid}\n*Current Balance Due: Rs ${stats.bal}*\nOpen Files: ${stats.open}\n${config.settings.phone ? 'Contact: ' + config.settings.phone : ''}`;
    let p = String(a.phone || '').replace(/\D/g, '');
    if (p.startsWith('0')) p = '92' + p.slice(1);
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Selected item objects
  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // Compute pending count
  const pendingCount = useMemo(() => {
    return jobs
      .filter(j => j.status !== 'Completed' && j.status !== 'Cancelled')
      .reduce((n, j) => n + (j.tasks || []).filter(t => !t.done).length, 0);
  }, [jobs]);

  // Page title computation
  const pageTitle = useMemo(() => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard';
      case 'jobs': return 'Vehicle Files';
      case 'job': return selectedJob ? `${selectedJob.oldReg || selectedJob.no}` : 'Vehicle File';
      case 'pending': return 'Pending Work';
      case 'accounts': return 'Parties & Accounts';
      case 'account': return selectedAccount ? selectedAccount.name : 'Account Statement';
      case 'payments': return 'Payments & Expenses';
      case 'reports': return 'Reports & Analytics';
      case 'owner': return 'Owner Profile';
      case 'settings': return 'Settings & Backup';
      default: return 'ASK MOTORS';
    }
  }, [currentTab, selectedJob, selectedAccount]);

  // Auth Gate: Require sign in for proprietary workspace
  if (authReady && !currentUser && !isDemoMode) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px 28px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <Logo style={{ width: '68px', height: '68px' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '0.5px' }}>
            ASK MOTORS
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 24px' }}>
            Vehicle Registration &amp; Accounts Management
          </p>

          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '14px 16px',
            fontSize: '12.5px',
            lineHeight: '1.5',
            color: 'var(--muted)',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            🔒 <b>Private Office Workspace:</b> Sign in with your authorized Google Account to sync vehicle dockets, customer receipts, and excise ledgers in real-time.
          </div>

          <button 
            className="btn primary"
            onClick={async () => {
              try {
                await loginWithGoogle();
                showToast('Signed in successfully!');
              } catch (err) {
                console.error(err);
                showToast('Sign in failed: ' + (err instanceof Error ? err.message : String(err)));
              }
            }}
            style={{
              width: '100%',
              justifyContent: 'center',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(229, 72, 77, 0.25)'
            }}
          >
            Sign in with Google
          </button>

          <div style={{ margin: '18px 0 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            <span style={{ fontSize: '11px', color: 'var(--faint)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          </div>

          <button
            className="btn ghost"
            onClick={() => {
              loadDemoState();
              setIsDemoMode(true);
              showToast('Loaded local preview mode');
            }}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '12.5px',
              color: 'var(--muted)',
              border: '1px dashed var(--border)'
            }}
          >
            Preview in Offline Demo Mode →
          </button>

          {toastMessage && (
            <div className="toast">
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Sidebar for Desktop */}
      <Sidebar 
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedJobId(null);
          setSelectedAccountId(null);
          setCurrentTab(tab);
        }}
        bizName={config.settings.bizName}
        tagline={config.settings.tagline}
        pendingCount={pendingCount}
        totalJobs={jobs.length}
        totalAccounts={accounts.length}
        lastBackup={config.lastBackup}
      />

      {/* Main View Area */}
      <div className="main">
        {/* Top Header */}
        <Header 
          title={pageTitle}
          theme={config.settings.theme}
          onToggleTheme={() => {
            const newTh = config.settings.theme === 'light' ? 'dark' : 'light';
            setConfig(prev => ({
              ...prev,
              settings: { ...prev.settings, theme: newTh }
            }));
            setDoc(doc(db, 'config', 'app_config'), {
              settings: { theme: newTh }
            }, { merge: true }).catch(() => {});
          }}
          syncStatus={syncStatus}
          userEmail={currentUser?.email || null}
          userRole={userRole || undefined}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onNewJob={() => {
            setJobToEdit(null);
            setIsJobModalOpen(true);
          }}
          canGoBack={currentTab === 'job' || currentTab === 'account'}
          onGoBack={() => {
            if (currentTab === 'job') setCurrentTab('jobs');
            else if (currentTab === 'account') setCurrentTab('accounts');
          }}
          jobs={jobs}
          accounts={accounts}
          onSelectJob={(id) => {
            setSelectedJobId(id);
            setCurrentTab('job');
          }}
          onSelectAccount={(id) => {
            setSelectedAccountId(id);
            setCurrentTab('account');
          }}
        />

        {/* Content View */}
        <main className="content">
          {currentTab === 'dashboard' && (
            <DashboardView 
              jobs={jobs}
              accounts={accounts}
              payments={payments}
              expenses={expenses}
              onSelectJob={(id) => {
                setSelectedJobId(id);
                setCurrentTab('job');
              }}
              onSelectAccount={(id) => {
                setSelectedAccountId(id);
                setCurrentTab('account');
              }}
              onNavigateToTab={(tab, filter) => {
                if (tab === 'pending' && filter) {
                  setPendingFilterService(filter);
                } else if (tab === 'jobs' && filter) {
                  setJobsFilterState(filter);
                }
                setCurrentTab(tab);
              }}
              onNewJob={() => {
                setJobToEdit(null);
                setIsJobModalOpen(true);
              }}
              onNewPayment={() => {
                setPaymentToEdit(null);
                setDefaultPaymentAccId('');
                setDefaultPaymentJobId('');
                setIsPaymentModalOpen(true);
              }}
              onNewAccount={() => {
                setAccountToEdit(null);
                setIsAccountModalOpen(true);
              }}
            />
          )}

          {currentTab === 'jobs' && (
            <JobsView 
              jobs={jobs}
              accounts={accounts}
              payments={payments}
              services={config.services || DEFAULT_SERVICES}
              initialFilter={jobsFilterState}
              onSelectJob={(id) => {
                setSelectedJobId(id);
                setCurrentTab('job');
              }}
              onNewJob={() => {
                setJobToEdit(null);
                setIsJobModalOpen(true);
              }}
              onToggleFileReturn={handleToggleFileReturn}
              onExportExcel={handleExportExcel}
              onDeleteJob={handleDeleteJob}
            />
          )}

          {currentTab === 'job' && selectedJob && (
            <JobDetailView 
              job={selectedJob}
              accounts={accounts}
              payments={payments}
              expenses={expenses}
              allJobs={jobs}
              onUpdateJobStatus={(st) => handleUpdateJobStatus(selectedJob.id, st)}
              onToggleTask={(idx) => handleToggleTask(selectedJob.id, idx)}
              onToggleFileReturn={() => handleToggleFileReturn(selectedJob)}
              onEditJob={() => {
                setJobToEdit(selectedJob);
                setIsJobModalOpen(true);
              }}
              onDeleteJob={() => handleDeleteJob(selectedJob.id)}
              onReceivePayment={() => {
                setPaymentToEdit(null);
                setDefaultPaymentAccId(selectedJob.accountId);
                setDefaultPaymentJobId(selectedJob.id);
                setIsPaymentModalOpen(true);
              }}
              onPayVendor={() => {
                setExpenseToEdit(null);
                setDefaultExpenseVendorId('');
                setDefaultExpenseJobId(selectedJob.id);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onPrintJobSlip={() => handlePrintJobSlip(selectedJob)}
              onWhatsAppShare={() => handleWhatsAppJob(selectedJob)}
              onSelectJob={(id) => {
                setSelectedJobId(id);
                setCurrentTab('job');
              }}
              onSelectAccount={(id) => {
                setSelectedAccountId(id);
                setCurrentTab('account');
              }}
            />
          )}

          {currentTab === 'pending' && (
            <PendingView 
              jobs={jobs}
              accounts={accounts}
              initialService={pendingFilterService}
              onToggleTask={handleToggleTask}
              onSelectJob={(id) => {
                setSelectedJobId(id);
                setCurrentTab('job');
              }}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsView 
              accounts={accounts}
              jobs={jobs}
              payments={payments}
              expenses={expenses}
              onSelectAccount={(id) => {
                setSelectedAccountId(id);
                setCurrentTab('account');
              }}
              onNewAccount={() => {
                setAccountToEdit(null);
                setIsAccountModalOpen(true);
              }}
            />
          )}

          {currentTab === 'account' && selectedAccount && (
            <AccountDetailView 
              account={selectedAccount}
              jobs={jobs}
              payments={payments}
              expenses={expenses}
              onEditAccount={() => {
                setAccountToEdit(selectedAccount);
                setIsAccountModalOpen(true);
              }}
              onDeleteAccount={() => handleDeleteAccount(selectedAccount.id)}
              onNewJobForAccount={() => {
                setJobToEdit(null);
                setIsJobModalOpen(true);
              }}
              onReceivePayment={() => {
                setPaymentToEdit(null);
                setDefaultPaymentAccId(selectedAccount.id);
                setDefaultPaymentJobId('');
                setIsPaymentModalOpen(true);
              }}
              onPayVendor={() => {
                setExpenseToEdit(null);
                setDefaultExpenseVendorId(selectedAccount.id);
                setDefaultExpenseJobId('');
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onPrintStatement={handlePrintStatement}
              onWhatsAppStatement={handleWhatsAppStatement}
              onSelectJob={(id) => {
                setSelectedJobId(id);
                setCurrentTab('job');
              }}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView 
              payments={payments}
              expenses={expenses}
              accounts={accounts}
              jobs={jobs}
              onNewPayment={() => {
                setPaymentToEdit(null);
                setDefaultPaymentAccId('');
                setDefaultPaymentJobId('');
                setIsPaymentModalOpen(true);
              }}
              onNewExpense={() => {
                setExpenseToEdit(null);
                setDefaultExpenseVendorId('');
                setDefaultExpenseJobId('');
                setIsExpenseModalOpen(true);
              }}
              onEditPayment={(p) => {
                setPaymentToEdit(p);
                setIsPaymentModalOpen(true);
              }}
              onEditExpense={(e) => {
                setExpenseToEdit(e);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onPrintReceipt={handlePrintReceipt}
              onSelectJob={(id) => {
                setSelectedJobId(id);
                setCurrentTab('job');
              }}
              onSelectAccount={(id) => {
                setSelectedAccountId(id);
                setCurrentTab('account');
              }}
              onExportExcel={() => handleExportExcel()}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView 
              jobs={jobs}
              payments={payments}
              accounts={accounts}
              onSelectAccount={(id) => {
                setSelectedAccountId(id);
                setCurrentTab('account');
              }}
              onExportExcel={() => handleExportExcel()}
            />
          )}

          {currentTab === 'owner' && (
            <OwnerView 
              owner={config.settings.owner || {}}
              settings={config.settings}
              onSaveOwner={async (updated: OwnerProfile) => {
                const newSettings = {
                  ...config.settings,
                  owner: updated
                };
                setConfig(prev => ({ ...prev, settings: newSettings }));
                await setDoc(doc(db, 'config', 'app_config'), {
                  settings: newSettings
                }, { merge: true });
                showToast('Owner profile saved');
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView 
              settings={config.settings}
              services={config.services || DEFAULT_SERVICES}
              currentTheme={config.settings.theme}
              onSelectTheme={async (thId) => {
                const newSettings = { ...config.settings, theme: thId };
                setConfig(prev => ({ ...prev, settings: newSettings }));
                await setDoc(doc(db, 'config', 'app_config'), {
                  settings: newSettings
                }, { merge: true });
                showToast('Theme updated');
              }}
              onSaveSettings={async (newSet) => {
                setConfig(prev => ({ ...prev, settings: newSet }));
                await setDoc(doc(db, 'config', 'app_config'), {
                  settings: newSet
                }, { merge: true });
                showToast('Business details saved');
              }}
              onAddService={async (name) => {
                const list = [...(config.services || DEFAULT_SERVICES)];
                if (!list.includes(name)) {
                  list.push(name);
                  setConfig(prev => ({ ...prev, services: list }));
                  await setDoc(doc(db, 'config', 'app_config'), { services: list }, { merge: true });
                  showToast(`Service "${name}" added`);
                }
              }}
              onRenameService={async (idx, newName) => {
                const list = [...(config.services || DEFAULT_SERVICES)];
                const old = list[idx];
                list[idx] = newName;
                setConfig(prev => ({ ...prev, services: list }));
                await setDoc(doc(db, 'config', 'app_config'), { services: list }, { merge: true });
                showToast(`Service renamed from "${old}" to "${newName}"`);
              }}
              onRemoveService={async (idx) => {
                const list = [...(config.services || DEFAULT_SERVICES)];
                const removed = list.splice(idx, 1)[0];
                setConfig(prev => ({ ...prev, services: list }));
                await setDoc(doc(db, 'config', 'app_config'), { services: list }, { merge: true });
                showToast(`Service "${removed}" removed`);
              }}
              onRestoreDefaultServices={async () => {
                setConfig(prev => ({ ...prev, services: [...DEFAULT_SERVICES] }));
                await setDoc(doc(db, 'config', 'app_config'), { services: [...DEFAULT_SERVICES] }, { merge: true });
                showToast('Services checklist restored to defaults');
              }}
              onDownloadBackup={handleDownloadBackup}
              onRestoreBackup={handleRestoreBackup}
              onExportExcel={() => handleExportExcel()}
              onImportExcel={handleImportExcel}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              onResetAllData={handleResetAllData}
              lastBackupDate={config.lastBackup}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedJobId(null);
          setSelectedAccountId(null);
          setCurrentTab(tab);
        }}
        pendingCount={pendingCount}
        onFabClick={() => {
          setJobToEdit(null);
          setIsJobModalOpen(true);
        }}
      />

      {/* Modals */}
      <JobModal 
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        jobToEdit={jobToEdit}
        accounts={accounts}
        allJobs={jobs}
        services={config.services || DEFAULT_SERVICES}
        defaultAccountId={selectedAccountId || ''}
        onSaveJob={handleSaveJob}
        onQuickAddAccount={handleQuickAddAccount}
        onAddCustomService={async (name) => {
          const list = [...(config.services || DEFAULT_SERVICES)];
          if (!list.includes(name)) {
            list.push(name);
            setConfig(prev => ({ ...prev, services: list }));
            await setDoc(doc(db, 'config', 'app_config'), { services: list }, { merge: true });
          }
        }}
      />

      <AccountModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
        onSaveAccount={handleSaveAccount}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentToEdit={paymentToEdit}
        accounts={accounts}
        jobs={jobs}
        defaultAccountId={defaultPaymentAccId}
        defaultJobId={defaultPaymentJobId}
        onSavePayment={handleSavePayment}
        onDeletePayment={handleDeletePayment}
      />

      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseToEdit={expenseToEdit}
        vendors={accounts.filter(a => a.kind === 'Vendor')}
        jobs={jobs}
        defaultVendorId={defaultExpenseVendorId}
        defaultJobId={defaultExpenseJobId}
        onSaveExpense={handleSaveExpense}
        onDeleteExpense={handleDeleteExpense}
        onQuickAddVendor={async (name) => {
          return await handleQuickAddAccount(name, 'Vendor');
        }}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        userRole={userRole}
        teamMembers={teamMembers}
        onAddTeamMember={handleAddTeamMember}
        onRemoveTeamMember={handleRemoveTeamMember}
        syncStatus={syncStatus}
      />

      <InstallModal 
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onTriggerPwaInstall={handleTriggerPwa}
        canInstallPwa={!!deferredPrompt}
      />

      {/* Printable Paper Receipts / Slips */}
      <PrintArea 
        data={printData}
        settings={config.settings}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
