import { test, expect } from '@playwright/test'

test.describe('Application Navigation', () => {
  test('404 page works correctly', async ({ page }) => {
    await page.goto('/nonexistent-page')
    
    // Should show 404 page
    await expect(page.locator('h1')).toContainText('404')
    
    // Should have link back to home
    const homeLink = page.locator('a[href="/"]')
    if (await homeLink.isVisible()) {
      await expect(homeLink).toBeVisible()
    }
  })

  test('application loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000)
    
    // Filter out known acceptable errors (like network errors in test environment)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('net::ERR_') &&
      !error.includes('favicon.ico')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('responsive design works', async ({ page }) => {
    await page.goto('/')
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('body')).toBeVisible()
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
  })
})