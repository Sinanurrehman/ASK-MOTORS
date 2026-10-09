export type VehicleType = 'Private' | 'Commercial';

export type JobStatus = 'Pending' | 'In Process' | 'Completed' | 'On Hold' | 'Cancelled';

export type AccountKind = 'Party' | 'Customer' | 'Vendor';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'JazzCash' | 'Easypaisa' | 'Cheque' | 'Online / IBFT' | 'Adjustment';

export interface TaskItem {
  key: string;
  done: boolean;
  doneDate?: string;
}

export interface JobCharges {
  receipt?: number;
  insurance?: number;
  mvi?: number;
  fitness?: number;
  noc?: number;
  permit?: number;
  alteration?: number;
  service?: number;
  other?: number;
  [key: string]: number | undefined;
}

export interface Job {
  id: string;
  no: string;
  date: string;
  accountId: string;
  owner?: string;
  ownerPhone?: string;
  ownerCnic?: string;
  ownerFather?: string;
  ownerAddress?: string;
  oldReg: string;
  newReg?: string;
  vtype: VehicleType;
  make?: string;
  chassis?: string;
  engine?: string;
  services: string[];
  tasks: TaskItem[];
  receiptNo?: string;
  receiptDate?: string;
  charges: JobCharges;
  status: JobStatus;
  completedDate?: string;
  notes?: string;
  remarks?: string;
  fileReturned?: boolean;
  fileReturnDate?: string;
  fileReturnTo?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  phone?: string;
  cnic?: string;
  opening?: number;
  address?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface Payment {
  id: string;
  no: string;
  date: string;
  accountId: string;
  jobId?: string | null;
  amount: number;
  method: PaymentMethod;
  ref?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface Expense {
  id: string;
  no: string;
  date: string;
  vendorId: string;
  jobId?: string | null;
  category: string;
  amount: number;
  method: PaymentMethod;
  ref?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface OwnerProfile {
  name?: string;
  father?: string;
  cnic?: string;
  designation?: string;
  mobile?: string;
  whatsapp?: string;
  landline?: string;
  email?: string;
  ntn?: string;
  license?: string;
  bank?: string;
  iban?: string;
  jazzcash?: string;
  address?: string;
  photo?: string;
  onPrint?: boolean;
}

export interface AppSettings {
  bizName: string;
  tagline: string;
  phone: string;
  address: string;
  note: string;
  theme: string;
  owner?: OwnerProfile;
}

export interface TeamMember {
  uid: string;
  email: string;
  displayName?: string;
  role: 'owner' | 'staff';
  addedAt?: string;
}

export interface AppConfig {
  settings: AppSettings;
  services: string[];
  seq: {
    job: number;
    pay: number;
    exp: number;
  };
  lastBackup?: string | null;
}
