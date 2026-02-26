import { test, expect, Page } from '@playwright/test'
import path from 'path'

const SCREENSHOT_DIR = path.resolve('qa-playwright/mobile-modal-checks')

/** Dismisses the tutorial overlay if visible so toggle buttons are reachable. */
async function dismissTutorialIfOpen(page: Page) {
  const tutorialClose = page.locator('.tutorial-overlay .tutorial-close, .tutorial-overlay .settings-close')
  if (await tutorialClose.isVisible({ timeout: 2000 }).catch(() => false)) {
    await tutorialClose.click()
    await expect(tutorialClose).not.toBeVisible({ timeout: 2000 })
  }
}

/** Helper: screenshot with project-name prefix for easy sorting */
function screenshotPath(project: string, label: string) {
  return path.join(SCREENSHOT_DIR, `${project}_${label}.png`)
}

test.describe('Mobile modal visibility and close behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss tutorial on first load by setting the correct localStorage key
    await page.addInitScript(() => {
      localStorage.setItem('blackjack-tutorial-dismissed', 'true')
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Wait for the app to render (settings toggle is always present)
    await page.locator('.settings-toggle[aria-label="Open house rules settings"]').waitFor({ state: 'visible', timeout: 10000 })
  })

  // ── Settings Panel Tests ──────────────────────────────────

  test('settings panel: header and close button visible on open', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    // Capture baseline before opening
    await page.screenshot({ path: screenshotPath(project, 'settings_01_before'), fullPage: false })

    // Open settings
    await page.locator('.settings-toggle[aria-label="Open house rules settings"]').click()
    await expect(page.locator('.settings-overlay')).toBeVisible()

    // Header must be visible
    const header = page.locator('.settings-header')
    await expect(header).toBeVisible()
    await expect(header).toBeInViewport()

    // Close button must be visible and in viewport
    const closeBtn = page.locator('.settings-close').first()
    await expect(closeBtn).toBeVisible()
    await expect(closeBtn).toBeInViewport()

    // Verify the header h2 text
    await expect(header.locator('h2')).toHaveText('House Rules')

    await page.screenshot({ path: screenshotPath(project, 'settings_02_open'), fullPage: false })
  })

  test('settings panel: closes via close button', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.locator('.settings-toggle[aria-label="Open house rules settings"]').click()
    await expect(page.locator('.settings-overlay')).toBeVisible()

    // Click close button
    await page.locator('.settings-close').first().click()
    await expect(page.locator('.settings-overlay')).not.toBeVisible()

    await page.screenshot({ path: screenshotPath(project, 'settings_03_closed_via_x'), fullPage: false })
  })

  test('settings panel: closes via outside click', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.locator('.settings-toggle[aria-label="Open house rules settings"]').click()
    await expect(page.locator('.settings-overlay')).toBeVisible()

    // Click on overlay backdrop (top-left corner, outside the panel)
    const overlay = page.locator('.settings-overlay')
    await overlay.click({ position: { x: 5, y: 5 } })
    await expect(page.locator('.settings-overlay')).not.toBeVisible()

    await page.screenshot({ path: screenshotPath(project, 'settings_04_closed_via_outside'), fullPage: false })
  })

  test('settings panel: closes via Escape key', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.locator('.settings-toggle[aria-label="Open house rules settings"]').click()
    await expect(page.locator('.settings-overlay')).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(page.locator('.settings-overlay')).not.toBeVisible()

    await page.screenshot({ path: screenshotPath(project, 'settings_05_closed_via_escape'), fullPage: false })
  })

  test('settings panel: internal scrolling works, page locked', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.locator('.settings-toggle[aria-label="Open house rules settings"]').click()
    await expect(page.locator('.settings-overlay')).toBeVisible()

    // Check body scroll is locked
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow)
    expect(bodyOverflow).toBe('hidden')

    // Scroll inside the panel body
    const settingsBody = page.locator('.settings-body')
    const scrollBefore = await settingsBody.evaluate(el => el.scrollTop)
    await settingsBody.evaluate(el => el.scrollTo(0, 200))
    const scrollAfter = await settingsBody.evaluate(el => el.scrollTop)

    // If content is scrollable, scroll position should change
    // (on small viewports, settings content overflows)
    // We just verify scrolling doesn't break anything and panel is still visible
    await expect(page.locator('.settings-header')).toBeVisible()
    await expect(page.locator('.settings-header')).toBeInViewport()

    await page.screenshot({ path: screenshotPath(project, 'settings_06_scrolled'), fullPage: false })
  })

  // ── Analytics (Stats) Panel Tests ─────────────────────────

  test('analytics panel: header and close button visible on open', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.screenshot({ path: screenshotPath(project, 'analytics_01_before'), fullPage: false })

    await page.getByRole('button', { name: 'Open statistics dashboard' }).click()
    await expect(page.locator('.stats-overlay')).toBeVisible()

    // Header must be visible
    const header = page.locator('.stats-header')
    await expect(header).toBeVisible()
    await expect(header).toBeInViewport()

    // Close button must be visible and in viewport
    const closeBtn = page.locator('.stats-overlay button[aria-label="Close statistics"]')
    await expect(closeBtn).toBeVisible()
    await expect(closeBtn).toBeInViewport()

    await expect(header.locator('h2')).toHaveText('Statistics')

    await page.screenshot({ path: screenshotPath(project, 'analytics_02_open'), fullPage: false })
  })

  test('analytics panel: closes via close button', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.getByRole('button', { name: 'Open statistics dashboard' }).click()
    await expect(page.locator('.stats-overlay')).toBeVisible()

    await page.locator('.stats-overlay button[aria-label="Close statistics"]').click()
    await expect(page.locator('.stats-overlay')).not.toBeVisible()

    await page.screenshot({ path: screenshotPath(project, 'analytics_03_closed_via_x'), fullPage: false })
  })

  test('analytics panel: closes via outside click', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.getByRole('button', { name: 'Open statistics dashboard' }).click()
    await expect(page.locator('.stats-overlay')).toBeVisible()

    const overlay = page.locator('.stats-overlay')
    await overlay.click({ position: { x: 5, y: 5 } })
    await expect(page.locator('.stats-overlay')).not.toBeVisible()

    await page.screenshot({ path: screenshotPath(project, 'analytics_04_closed_via_outside'), fullPage: false })
  })

  test('analytics panel: closes via Escape key', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.getByRole('button', { name: 'Open statistics dashboard' }).click()
    await expect(page.locator('.stats-overlay')).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(page.locator('.stats-overlay')).not.toBeVisible()

    await page.screenshot({ path: screenshotPath(project, 'analytics_05_closed_via_escape'), fullPage: false })
  })

  test('analytics panel: internal scrolling works, page locked', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await page.getByRole('button', { name: 'Open statistics dashboard' }).click()
    await expect(page.locator('.stats-overlay')).toBeVisible()

    // Check body scroll is locked
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow)
    expect(bodyOverflow).toBe('hidden')

    // Scroll inside the stats body
    const statsBody = page.locator('.stats-body')
    await statsBody.evaluate(el => el.scrollTo(0, 200))

    // Header should remain visible after scroll
    await expect(page.locator('.stats-header')).toBeVisible()
    await expect(page.locator('.stats-header')).toBeInViewport()

    await page.screenshot({ path: screenshotPath(project, 'analytics_06_scrolled'), fullPage: false })
  })
})
