import { test } from '@playwright/test';

test('Otter Test Case', async ({ page }) => {
  // grace period before recording starts
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  await test.step('Go to profile', async () => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    await page.goto('http://localhost:4200/#/home')

    let counts = 0;
    
    while (counts < 30) {
      await page.getByRole('link', { name: 'Localization' }).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', { name: 'Configuration' }).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      counts++;
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
    // heap dump will be taken after this step
  });

  await new Promise(resolve => setTimeout(resolve, 60000));
});