import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './spec/e2e',
  fullyParallel: false, // run tests in files in series for now due to database setup
  forbidOnly: !!process.env.CI, // fail the build on CI if test.only exists.
  retries: process.env.CI ? 2 : 0, // retry on CI only
  workers: 1,
  reporter: 'html', // generate an HTML report
  use: {
    trace: 'on-first-retry', // collect trace when retrying a failed test
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
});
