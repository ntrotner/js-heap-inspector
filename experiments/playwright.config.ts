import {defineConfig, devices} from '@playwright/test';

const PlaywrightPerformanceReporterOptions = {
  outputDir: './performance-report',
  outputFile: `${Date.now()}.json`,
  deleteOnFailure: false,
  browsers: {
    chromium: {
      onTestStep: {
        metrics: ['heapObjectsTracking', 'heapProfilerSampling'],
      }
    }
  }
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['playwright-performance-reporter', PlaywrightPerformanceReporterOptions]
  ],
  timeout: 6000000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: false,
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: '/home/nikita/git/chromium/src/out/Default/chrome',
      headless: false,
      args: [
        '--remote-debugging-port=9222',
        '--js-flags="--predictable-gc-schedule --gc-interval=1000"'
      ]
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'], launchOptions: {
          executablePath: '/home/nikita/git/chromium/src/out/Default/chrome',
          headless: false,
          args: [
            '--remote-debugging-port=9222',
            '--js-flags="--predictable-gc-schedule --gc-interval=1000"'
          ]
        }
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
