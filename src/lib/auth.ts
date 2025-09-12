import { supabase } from "@/integrations/supabase/client";
import { AppRole, Organization, Invitation } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  organization_id: string | null;
  organization?: Organization;
}

export const signUp = async (email: string, password: string, name: string, organizationName?: string, invitationToken?: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const metadata: Record<string, unknown> = { name };
  if (organizationName) metadata.organization_name = organizationName;
  if (invitationToken) metadata.invitation_token = invitationToken;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: metadata
    }
  });

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    return null;
  }

  // Get the user profile with organization
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      organizations (
        id,
        name,
        slug
      )
    `)
    .eq('user_id', session.user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: session.user.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    organization_id: profile.organization_id,
    organization: profile.organizations ? {
      id: profile.organizations.id,
      name: profile.organizations.name,
      slug: profile.organizations.slug,
      created_at: '',
      updated_at: ''
    } : undefined
  };
};

// Invitation functions
export const createInvitation = async (email: string, role: AppRole = 'EMPLOYEE') => {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.organization_id) {
    return { data: null, error: { message: 'User not found or no organization' } };
  }

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email,
      role,
      token: crypto.randomUUID(),
      invited_by: currentUser.id,
      organization_id: currentUser.organization_id
    })
    .select()
    .single();

  return { data, error };
};

export const getInvitations = async () => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

export const getInvitationByToken = async (token: string) => {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      organizations (
        name
      )
    `)
    .eq('token', token)
    .eq('status', 'PENDING')
    .gt('expires_at', new Date().toISOString())
    .single();

  return { data, error };
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<{
  name: string;
  department: string;
  region: string;
}>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === 'ADMIN';
};

export const hasRole = (user: AuthUser | null, role: AppRole): boolean => {
  return user?.role === role;
};