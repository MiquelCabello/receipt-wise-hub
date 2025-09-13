import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Expenses from '@/pages/Expenses';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Expense Flow Integration', () => {
  beforeEach(() => {
    // Reset any mocks or state
  });

  it('should render expenses page correctly', async () => {
    render(
      <TestWrapper>
        <Expenses />
      </TestWrapper>
    );

    expect(render(<TestWrapper><Expenses /></TestWrapper>).getByText('Gastos')).toBeTruthy();
  });

  it('should show empty state when no expenses', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Expenses />
      </TestWrapper>
    );

    expect(getByText('No hay gastos registrados')).toBeTruthy();
  });

  it('should show new expense button', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Expenses />
      </TestWrapper>
    );

    expect(getByText('Nuevo Gasto')).toBeTruthy();
  });
});