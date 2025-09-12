import { describe, test, expect } from 'vitest'
import { isAdmin, hasRole } from '../auth'
import type { AuthUser } from '../auth'

describe('Auth Utils', () => {
  const createMockUser = (role: 'ADMIN' | 'EMPLOYEE' = 'EMPLOYEE'): AuthUser => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role,
    organization_id: 'test-org-id',
  })

  describe('isAdmin', () => {
    test('returns true for ADMIN role', () => {
      const adminUser = createMockUser('ADMIN')
      expect(isAdmin(adminUser)).toBe(true)
    })

    test('returns false for EMPLOYEE role', () => {
      const employeeUser = createMockUser('EMPLOYEE')
      expect(isAdmin(employeeUser)).toBe(false)
    })

    test('returns false for null user', () => {
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe('hasRole', () => {
    test('returns true when user has matching role', () => {
      const user = createMockUser('EMPLOYEE')
      expect(hasRole(user, 'EMPLOYEE')).toBe(true)
    })

    test('returns false when user has different role', () => {
      const user = createMockUser('EMPLOYEE')
      expect(hasRole(user, 'ADMIN')).toBe(false)
    })

    test('returns false for null user', () => {
      expect(hasRole(null, 'ADMIN')).toBe(false)
    })
  })
})