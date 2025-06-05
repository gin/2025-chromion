// import { test, expect } from '@playwright/test';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../wallet-setup/basic.setup';

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Chromion/);
});

test('should show connect wallet button, when not connected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();
});

test('should connect wallet to app', async ({ page, context, metamaskPage, extensionId }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();

  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
  await page.getByTestId('rk-connect-button').click();
  await page.getByTestId('rk-wallet-option-io.metamask').waitFor({
    state: 'visible',
    timeout: 30000,
  });
  await page.getByTestId('rk-wallet-option-io.metamask').click();
  await metamask.connectToDapp();
})


// test('should connect wallet to the MetaMask Test Dapp', async ({
//   context,
//   page,
//   metamaskPage,
//   extensionId,
// }) => {
//   // Create a new MetaMask instance
//   const metamask = new MetaMask(
//     context,
//     metamaskPage,
//     basicSetup.walletPassword,
//     extensionId
//   )

//   // Navigate to the homepage
//   await page.goto('/')

//   // Click the connect button
//   // await page.locator('#connectButton').click()
//   await page.getByRole('button', { name: 'Connect Wallet' }).click()

//   // Connect MetaMask to the dapp
//   await metamask.connectToDapp()

//   // Verify the connected account address
//   await expect(page.locator('#accounts')).toHaveText(
//     '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
//   )

//   // Additional test steps can be added here, such as:
//   // - Sending transactions
//   // - Interacting with smart contracts
//   // - Testing dapp-specific functionality
// })
