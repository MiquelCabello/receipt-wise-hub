-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE public.expense_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE public.payment_method AS ENUM ('CARD', 'CASH', 'TRANSFER', 'OTHER');
CREATE TYPE public.expense_source AS ENUM ('MANUAL', 'AI_EXTRACTED');
CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE public.category_status AS ENUM ('ACTIVE', 'INACTIVE');

-- Create users profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'EMPLOYEE',
  department TEXT,
  region TEXT,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create trigger for profiles updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'EMPLOYEE')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create project codes table
CREATE TABLE public.project_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status category_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_project_codes_updated_at
  BEFORE UPDATE ON public.project_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  budget_monthly DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(checksum_sha256)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_code_id UUID REFERENCES public.project_codes(id),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  vendor TEXT NOT NULL,
  expense_date DATE NOT NULL,
  amount_net DECIMAL(12,2) NOT NULL,
  tax_vat DECIMAL(12,2) DEFAULT 0,
  amount_gross DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method payment_method NOT NULL,
  status expense_status NOT NULL DEFAULT 'PENDING',
  approver_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  receipt_file_id UUID REFERENCES public.files(id),
  source expense_source NOT NULL DEFAULT 'MANUAL',
  hash_dedupe TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit log table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_expenses_employee_date ON public.expenses(employee_id, expense_date DESC);
CREATE INDEX idx_expenses_status_date ON public.expenses(status, expense_date DESC);
CREATE INDEX idx_expenses_category_date ON public.expenses(category_id, expense_date);
CREATE INDEX idx_expenses_project_date ON public.expenses(project_code_id, expense_date);
CREATE INDEX idx_expenses_hash_dedupe ON public.expenses(hash_dedupe);
CREATE INDEX idx_files_checksum ON public.files(checksum_sha256);
CREATE INDEX idx_audit_logs_actor_date ON public.audit_logs(actor_user_id, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS Policies for project_codes
CREATE POLICY "All authenticated users can view project codes" ON public.project_codes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage project codes" ON public.project_codes
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS Policies for categories
CREATE POLICY "All authenticated users can view categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS Policies for files
CREATE POLICY "Users can view files they uploaded" ON public.files
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can view all files" ON public.files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can upload files" ON public.files
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for expenses
CREATE POLICY "Employees can view their own expenses" ON public.expenses
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all expenses" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Employees can create their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update their pending expenses" ON public.expenses
  FOR UPDATE USING (
    employee_id = auth.uid() AND status = 'PENDING'
  );

CREATE POLICY "Admins can update any expense" ON public.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (actor_user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "All authenticated users can create audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (actor_user_id = auth.uid());

-- Insert default categories
INSERT INTO public.categories (name) VALUES
  ('Viajes'),
  ('Dietas'),
  ('Transporte'),
  ('Alojamiento'),
  ('Material'),
  ('Software'),
  ('Otros');

-- Insert default project codes
INSERT INTO public.project_codes (code, name) VALUES
  ('PRJ-001', 'Proyecto General'),
  ('PRJ-CLIENTE-A', 'Cliente A - Desarrollo'),
  ('INT-OPS', 'Operaciones Internas');