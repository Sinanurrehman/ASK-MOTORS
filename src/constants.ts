export const DEFAULT_SERVICES = [
  'Transfer',
  'New Registration',
  'Alteration',
  'Conversion',
  'MVI',
  'Fitness',
  'NOC',
  'Permit',
  'Duplicate Book',
  'Smart Card',
  'Token Tax',
  'Other'
];

export const COMMERCIAL_FLOW = ['MVI', 'Fitness', 'NOC', 'Permit'];

export const CHARGE_HEADS: [string, string][] = [
  ['receipt', 'Receipt Amount (Excise)'],
  ['insurance', 'Insurance'],
  ['mvi', 'MVI'],
  ['fitness', 'Fitness'],
  ['noc', 'NOC'],
  ['permit', 'Permit'],
  ['alteration', 'Alteration / Conversion'],
  ['service', 'Service Charges'],
  ['other', 'Other Charges']
];

export const EXPENSE_CATEGORIES = [
  'Insurance',
  'MVI',
  'Fitness',
  'NOC',
  'Permit',
  'Excise / Tax',
  'Alteration / Conversion',
  'Courier / File Delivery',
  'Agent Fee',
  'Other Expense'
];

export const STATUSES = ['Pending', 'In Process', 'Completed', 'On Hold', 'Cancelled'] as const;

export const METHODS = [
  'Cash',
  'Bank Transfer',
  'JazzCash',
  'Easypaisa',
  'Cheque',
  'Online / IBFT',
  'Adjustment'
] as const;

export const THEMES = [
  { id: 'dark', name: 'Crimson Dark', bg: '#0c0c0c', surface: '#161515', primary: '#e5484d' },
  { id: 'light', name: 'Crimson Light', bg: '#f5f4f4', surface: '#ffffff', primary: '#c62828' },
  { id: 'midnight', name: 'Midnight Sapphire', bg: '#090d16', surface: '#0f172a', primary: '#3b82f6' },
  { id: 'emerald', name: 'Emerald Luxury', bg: '#07140e', surface: '#0c2017', primary: '#10b981' },
  { id: 'amber', name: 'Carbon & Amber', bg: '#0c0a06', surface: '#18140c', primary: '#f59e0b' },
  { id: 'violet', name: 'Cyber Violet', bg: '#0b0714', surface: '#140d24', primary: '#a855f7' },
  { id: 'slate', name: 'Industrial Slate', bg: '#0f1115', surface: '#181b20', primary: '#38bdf8' },
  { id: 'teal', name: 'Deep Sea Teal', bg: '#061114', surface: '#0b1d22', primary: '#14b8a6' }
];

export const OWNER_EMAIL = 'sinanurrehman@gmail.com';

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const num = (v: unknown): number => {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return isFinite(n) ? n : 0;
};

export const today = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const fd = (s?: string): string => {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d} ${MON[+m - 1]} ${y}`;
};

export const days = (s?: string): number => {
  if (!s) return 0;
  return Math.max(0, Math.floor((new Date(today()).getTime() - new Date(s).getTime()) / 864e5));
};

export const money = (n: number): string => {
  return (n < 0 ? '-' : '') + 'Rs ' + Math.round(Math.abs(n)).toLocaleString('en-US');
};

export const moneyPlain = (n: number): string => {
  return Math.round(n).toLocaleString('en-US');
};

export const up = (s?: string): string => String(s || '').trim().toUpperCase();

export const normVal = (s?: string): string => String(s || '').trim().toUpperCase().replace(/[\s-]/g, '');

export const getJobTotal = (j?: { charges?: Record<string, number | undefined> } | null): number => {
  if (!j || !j.charges) return 0;
  return Object.values(j.charges).reduce((s: number, v: unknown) => s + num(v), 0);
};

export function words(n: number): string {
  n = Math.round(Math.abs(n));
  if (!n) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x: number) => x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : '');
  const three = (x: number) => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : '');
  const out: string[] = [];
  const cr = Math.floor(n / 1e7); n %= 1e7;
  const lk = Math.floor(n / 1e5); n %= 1e5;
  const th = Math.floor(n / 1e3); n %= 1e3;
  if (cr) out.push(three(cr) + ' Crore');
  if (lk) out.push(two(lk) + ' Lakh');
  if (th) out.push(two(th) + ' Thousand');
  if (n) out.push(three(n));
  return out.join(' ');
}
