-- Create organizations table (tenants)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Add organization_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'EMPLOYEE',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
  token TEXT UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(user_id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Update the handle_new_user function to create organization for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
BEGIN
  -- Check if this is an invitation signup
  IF NEW.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
    -- Handle invitation signup
    UPDATE public.invitations 
    SET status = 'ACCEPTED'
    WHERE token = NEW.raw_user_meta_data->>'invitation_token'
    AND status = 'PENDING'
    AND expires_at > now()
    RETURNING organization_id INTO org_id;
    
    IF org_id IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired invitation token';
    END IF;
    
    -- Create profile with invited role
    INSERT INTO public.profiles (user_id, email, name, role, organization_id)
    SELECT 
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      inv.role,
      inv.organization_id
    FROM public.invitations inv 
    WHERE inv.token = NEW.raw_user_meta_data->>'invitation_token';
    
  ELSE
    -- Regular signup - create new organization
    org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', 
                        split_part(NEW.email, '@', 1) || '''s Organization');
    
    -- Create organization
    INSERT INTO public.organizations (name, slug)
    VALUES (org_name, lower(replace(org_name, ' ', '-')) || '-' || substr(gen_random_uuid()::text, 1, 8))
    RETURNING id INTO org_id;
    
    -- Create admin profile
    INSERT INTO public.profiles (user_id, email, name, role, organization_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      'ADMIN',
      org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create security definer function to get current user organization
CREATE OR REPLACE FUNCTION public.get_current_user_organization()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'ADMIN' FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" 
ON public.organizations 
FOR SELECT 
USING (id = get_current_user_organization());

CREATE POLICY "Admins can update their organization" 
ON public.organizations 
FOR UPDATE 
USING (id = get_current_user_organization() AND is_current_user_admin());

-- Update profiles RLS policies for tenant isolation
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view profiles in their organization" 
ON public.profiles 
FOR SELECT 
USING (organization_id = get_current_user_organization());

-- RLS Policies for invitations
CREATE POLICY "Admins can manage invitations in their organization" 
ON public.invitations 
FOR ALL
USING (organization_id = get_current_user_organization() AND is_current_user_admin());

CREATE POLICY "Users can view pending invitations by token" 
ON public.invitations 
FOR SELECT 
USING (status = 'PENDING' AND expires_at > now());

-- Update expenses RLS for tenant isolation
DROP POLICY IF EXISTS "Admins can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can update any expense" ON public.expenses;

CREATE POLICY "Users can view expenses in their organization" 
ON public.expenses 
FOR SELECT 
USING (
  employee_id IN (
    SELECT user_id FROM public.profiles 
    WHERE organization_id = get_current_user_organization()
  )
);

CREATE POLICY "Admins can update expenses in their organization" 
ON public.expenses 
FOR UPDATE 
USING (
  is_current_user_admin() AND 
  employee_id IN (
    SELECT user_id FROM public.profiles 
    WHERE organization_id = get_current_user_organization()
  )
);

-- Update audit_logs RLS for tenant isolation
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Users can view audit logs in their organization" 
ON public.audit_logs 
FOR SELECT 
USING (
  actor_user_id IN (
    SELECT user_id FROM public.profiles 
    WHERE organization_id = get_current_user_organization()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX idx_invitations_organization_id ON public.invitations(organization_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_status_expires ON public.invitations(status, expires_at);