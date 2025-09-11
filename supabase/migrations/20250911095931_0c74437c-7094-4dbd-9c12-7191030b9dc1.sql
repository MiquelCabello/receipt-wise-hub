-- Add foreign key constraint between expenses and profiles
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraint for approver
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_approver_id_fkey 
FOREIGN KEY (approver_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Add foreign key constraint for category
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Add foreign key constraint for project code
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_project_code_id_fkey 
FOREIGN KEY (project_code_id) REFERENCES public.project_codes(id) ON DELETE SET NULL;

-- Add foreign key constraint for receipt file
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_receipt_file_id_fkey 
FOREIGN KEY (receipt_file_id) REFERENCES public.files(id) ON DELETE SET NULL;