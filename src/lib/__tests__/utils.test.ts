import { describe, test, expect } from 'vitest'
import { cn } from '../utils'

describe('Utils', () => {
  describe('cn function', () => {
    test('combines class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    test('handles conditional classes', () => {
      const result = cn('base', { 'conditional': true, 'not-included': false })
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('not-included')
    })

    test('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'other')
      expect(result).toContain('base')
      expect(result).toContain('other')
    })

    test('merges tailwind classes correctly', () => {
      // This tests the tailwind-merge functionality
      const result = cn('p-2', 'p-4')
      // Should keep only the last p-* class
      expect(result).toContain('p-4')
      expect(result).not.toContain('p-2')
    })
  })
})
