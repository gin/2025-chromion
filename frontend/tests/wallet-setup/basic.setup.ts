// Import necessary Synpress modules
import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

// Define a test seed phrase and password
const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'Tester@1234'

// export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
const setup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, walletPage, PASSWORD)

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE)

  // Additional setup steps can be added here, such as:
  // - Adding custom networks
  // - Importing tokens
  // - Setting up specific account states
})

// Set the specific hash from the wallet-setup
// Bug in dependency? Generated has is different.
// Manually set it to the expected value, so that test can use MetaMask.
setup.hash = '532f685e346606c2a803'

export default setup
