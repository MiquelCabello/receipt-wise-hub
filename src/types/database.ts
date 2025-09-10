export type AppRole = 'ADMIN' | 'EMPLOYEE';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'OTHER';
export type ExpenseSource = 'MANUAL' | 'AI_EXTRACTED';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: AppRole;
  department: string | null;
  region: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  budget_monthly: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCode {
  id: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  checksum_sha256: string;
  uploaded_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  employee_id: string;
  project_code_id: string | null;
  category_id: string;
  vendor: string;
  expense_date: string;
  amount_net: number;
  tax_vat: number;
  amount_gross: number;
  currency: string;
  payment_method: PaymentMethod;
  status: ExpenseStatus;
  approver_id: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  receipt_file_id: string | null;
  source: ExpenseSource;
  hash_dedupe: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ExpenseWithRelations extends Expense {
  employee?: Profile;
  category?: Category;
  project_code?: ProjectCode;
  receipt_file?: FileRecord;
  approver?: Profile;
}

export interface DashboardKPIs {
  total_expenses: number;
  pending_expenses: number;
  pending_amount: number;
  top_category: {
    name: string;
    amount: number;
    percentage: number;
  } | null;
  daily_average: number;
}

export interface ChartData {
  date: string;
  amount: number;
  status?: ExpenseStatus;
  category?: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  date_from?: string;
  date_to?: string;
  status?: ExpenseStatus;
  category_id?: string;
  employee_id?: string;
}