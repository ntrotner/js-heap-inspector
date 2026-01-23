import {test} from '@playwright/test';

test('Extensive Otter Showcase', async ({page}) => {
  // grace period before recording starts
  await new Promise(resolve => setTimeout(resolve, 5000));

  await test.step('Go to showcase', async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.goto('http://localhost:4200/#/home');

    let counts = 0;

    while (counts < 5) {
      await page.getByRole('link', {name: 'Configuration'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', {name: 'Localization'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', {name: 'Design Tokens'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', {name: 'Dynamic content'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', {name: 'Component replacement'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', {name: 'Rules engine'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.getByRole('link', {name: 'Placeholder'}).click();
      await new Promise(resolve => setTimeout(resolve, 5000));

      counts++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 20000));
    // heap dump will be taken after this step. Wait for GC to settle
  });

  await new Promise(resolve => setTimeout(resolve, 30000));
});
