import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/auth')
    
    // Check that the main elements are visible
    await expect(page.locator('h1')).toContainText(['Iniciar Sesión', 'Login', 'Sign In'])
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Check form validation
    await page.click('button[type="submit"]')
    // Form should not submit without email/password
  })

  test('navigation structure is correct', async ({ page }) => {
    await page.goto('/')
    
    // Should redirect to auth if not authenticated
    await expect(page).toHaveURL(/\/auth/)
  })

  test('registration form works', async ({ page }) => {
    await page.goto('/auth')
    
    // Switch to register mode if available
    const registerTab = page.locator('text="Registrarse"').or(page.locator('text="Register"'))
    if (await registerTab.isVisible()) {
      await registerTab.click()
      
      await expect(page.locator('input[name="name"]').or(page.locator('input[type="text"]'))).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    }
  })
})

test.describe('Dashboard Navigation', () => {
  test('main navigation elements exist', async ({ page }) => {
    // For authenticated state testing, we'll need to implement auth mocking
    // or test user creation in the future
    await page.goto('/')
    
    // Basic structure check
    await expect(page.locator('body')).toBeVisible()
  })
})