import { render } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { Button } from '../../ui/button'

describe('Button Component', () => {
  test('renders button with text', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    expect(getByRole('button')).toHaveTextContent('Click me')
  })

  test('handles click events', () => {
    const handleClick = vi.fn()
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>)
    
    getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies variant styles', () => {
    const { rerender, getByRole } = render(<Button variant="default">Default</Button>)
    
    // Test different variants
    rerender(<Button variant="destructive">Destructive</Button>)
    expect(getByRole('button')).toBeInTheDocument()
    
    rerender(<Button variant="outline">Outline</Button>)
    expect(getByRole('button')).toBeInTheDocument()
  })

  test('can be disabled', () => {
    const { getByRole } = render(<Button disabled>Disabled Button</Button>)
    const button = getByRole('button')
    
    expect(button).toBeDisabled()
  })

  test('supports different sizes', () => {
    const { getByRole } = render(<Button size="lg">Large Button</Button>)
    expect(getByRole('button')).toBeInTheDocument()
  })
})