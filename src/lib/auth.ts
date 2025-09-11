import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
}

export const signUp = async (email: string, password: string, name: string, role: AppRole = 'ADMIN') => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        name,
        role
      }
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

  // Get the user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: session.user.id,
    email: profile.email,
    name: profile.name,
    role: profile.role
  };
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