import {test} from '@playwright/test';

test('Simple Otter Showcase', async ({page}) => {
  // grace period before recording starts
  await new Promise(resolve => setTimeout(resolve, 5000));

  await test.step('Go to showcase', async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.goto('http://localhost:4200/#/home');

    let counts = 0;

    while (counts < 10) {
      await page.getByRole('link', {name: 'Localization'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', {name: 'Configuration'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));

      counts++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 20000));
    // heap dump will be taken after this step. Wait for GC to settle
  });

  await new Promise(resolve => setTimeout(resolve, 30000));
});
