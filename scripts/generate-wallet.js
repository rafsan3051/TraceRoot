/**
 * Generate a new Ethereum wallet for development
 * Run: node scripts/generate-wallet.js
 */

const ethers = require('ethers');

console.log('🔐 Generating new Ethereum wallet...\n');

// Create random wallet
const wallet = ethers.Wallet.createRandom();

console.log('='.repeat(60));
console.log('✅ WALLET GENERATED');
console.log('='.repeat(60));
console.log('\n📍 Address:', wallet.address);
console.log('\n🔑 Private Key:');
console.log(wallet.privateKey);
console.log('\n💡 Mnemonic (Seed Phrase):');
console.log(wallet.mnemonic.phrase);
console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('─'.repeat(60));
console.log('1. NEVER share your private key or mnemonic');
console.log('2. Store them securely (password manager)');
console.log('3. This is for TESTNET only');
console.log('4. Add private key to .env file:');
console.log(`   PRIVATE_KEY="${wallet.privateKey}"`);
console.log('\n5. Get free Sepolia ETH at:');
console.log('   https://www.alchemy.com/faucets/ethereum-sepolia');
console.log('   https://sepoliafaucet.com/');
console.log('='.repeat(60) + '\n');
