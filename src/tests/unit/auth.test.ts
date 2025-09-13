import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signIn, signUp, getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const mockResponse = { data: { user: { id: '1', email: 'test@example.com' } }, error: null };
      (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      const result = await signIn('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.error).toBeNull();
    });

    it('should return error for invalid credentials', async () => {
      const mockResponse = { data: null, error: { message: 'Invalid login credentials' } };
      (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      const result = await signIn('test@example.com', 'wrongpassword');

      expect(result.error?.message).toBe('Invalid login credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up user with valid data', async () => {
      const mockResponse = { data: { user: { id: '1', email: 'test@example.com' } }, error: null };
      (supabase.auth.signUp as any).mockResolvedValue(mockResponse);

      const result = await signUp('test@example.com', 'password123', 'Test User', 'Test Org');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
            organization_name: 'Test Org'
          }
        }
      });
      expect(result.error).toBeNull();
    });
  });
});