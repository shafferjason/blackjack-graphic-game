import { defineConfig, devices } from '@playwright/test'

const MOBILE_VIEWPORTS = [
  { name: 'iPhone-SE', width: 320, height: 568 },
  { name: 'iPhone-13-Mini', width: 375, height: 812 },
  { name: 'iPhone-14-Pro', width: 390, height: 844 },
  { name: 'iPhone-14-Plus', width: 414, height: 896 },
]

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'off',
    trace: 'on-first-retry',
  },
  projects: MOBILE_VIEWPORTS.map((vp) => ({
    name: vp.name,
    use: {
      ...devices['Pixel 5'],
      viewport: { width: vp.width, height: vp.height },
      isMobile: true,
      hasTouch: true,
    },
  })),
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
