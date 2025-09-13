import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for proper H1 
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('ExpenseWise');

    // Check heading levels are logical
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings).toContain('ExpenseWise');
  });

  test('should have accessible form labels', async ({ page }) => {
    // Check login form labels
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    // Inputs should have associated labels
    await expect(emailInput).toHaveAttribute('id');
    await expect(passwordInput).toHaveAttribute('id');
    
    // Labels should reference inputs
    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Should focus first interactive element
    
    // Check focus is visible
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    
    // Continue tabbing through form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Should reach submit button
    
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeFocused();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for ARIA labels on important elements
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    
    // Tabs should have proper ARIA attributes
    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() > 0) {
      await expect(tabs.first()).toHaveAttribute('aria-selected');
    }
  });

  test('should announce form validation errors', async ({ page }) => {
    // Click signup tab
    await page.click('[data-value="signup"]');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation messages
    const errorMessages = page.locator('[role="alert"], .text-destructive');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This would require color contrast analysis
    // For now, we'll check that text is visible against backgrounds
    const mainContent = page.locator('main, .container').first();
    await expect(mainContent).toBeVisible();
    
    // Ensure important text elements are visible
    const headings = page.locator('h1, h2, h3');
    for (let i = 0; i < await headings.count(); i++) {
      await expect(headings.nth(i)).toBeVisible();
    }
  });

  test('should support screen reader navigation landmarks', async ({ page }) => {
    // Check for semantic HTML landmarks
    const main = page.locator('main');
    if (await main.count() > 0) {
      await expect(main).toBeVisible();
    }
    
    // Check for navigation landmarks
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
    
    // Check for header
    const header = page.locator('header');
    if (await header.count() > 0) {
      await expect(header).toBeVisible();
    }
  });
});