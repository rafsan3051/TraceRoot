/**
 * Test Blockchain Connection
 * 
 * This script tests your blockchain configuration
 * Run: node scripts/test-blockchain.js
 * 
 * Note: Requires ethers.js to be installed
 */

require('dotenv').config();

async function testBlockchain() {
  console.log('\n🔍 Testing Blockchain Configuration...\n');
  console.log('='.repeat(60));

  // Test 1: Check environment variables
  console.log('\n📋 Step 1: Checking Environment Variables');
  console.log('-'.repeat(60));

  const requiredVars = [
    'BLOCKCHAIN_NETWORK',
    'ETHEREUM_TESTNET_RPC_URL',
    'BLOCKCHAIN_PRIVATE_KEY',
    'CHAIN_ID'
  ];

  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'YOUR_INFURA_PROJECT_ID' && value !== 'DUMMY_PROJECT_ID_REPLACE_ME' && value !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing or default value`);
      allVarsPresent = false;
    }
  });

  if (!allVarsPresent) {
    console.log('\n⚠️  Some environment variables are missing!');
    console.log('Please check SECURITY_CONFIG.md for setup instructions.\n');
    return;
  }

  // Test 2: Check if USE_REAL_BLOCKCHAIN is enabled
  console.log('\n📋 Step 2: Blockchain Mode');
  console.log('-'.repeat(60));
  const useRealBlockchain = process.env.USE_REAL_BLOCKCHAIN === 'true';
  console.log(`Mode: ${useRealBlockchain ? '🌐 Real Blockchain' : '🧪 Mock Mode'}`);

  if (!useRealBlockchain) {
    console.log('\n💡 To enable real blockchain, set USE_REAL_BLOCKCHAIN="true" in .env');
    console.log('✅ Current setup is working in MOCK MODE (no blockchain needed)\n');
    return;
  }

  // Test 3: Check if ethers is installed
  console.log('\n📋 Step 3: Checking Dependencies');
  console.log('-'.repeat(60));
  
  let ethers;
  try {
    ethers = require('ethers');
    console.log('✅ ethers.js is installed');
  } catch (error) {
    console.log('❌ ethers.js is NOT installed');
    console.log('\n💡 Install with: npm install ethers');
    console.log('Then run this test again.\n');
    return;
  }

  // Test 4: Test RPC connection
  console.log('\n📋 Step 4: Testing RPC Connection');
  console.log('-'.repeat(60));

  try {
    const rpcUrl = process.env.ETHEREUM_TESTNET_RPC_URL || process.env.ETHEREUM_RPC_URL;
    
    console.log(`Connecting to: ${rpcUrl.substring(0, 40)}...`);
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Latest block: ${blockNumber}`);

    // Test 5: Test wallet
    console.log('\n📋 Step 5: Testing Wallet');
    console.log('-'.repeat(60));
    
    const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
    console.log(`✅ Wallet address: ${wallet.address}`);
    
    // Get balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`💰 Wallet balance: ${balanceInEth} ETH`);
    
    if (parseFloat(balanceInEth) === 0) {
      console.log('\n⚠️  Warning: Wallet has no balance!');
      console.log('Get test ETH from:');
      console.log('  - Sepolia: https://sepoliafaucet.com/');
      console.log('  - Mumbai: https://faucet.polygon.technology/\n');
    }

    // Test 5: Test contract addresses
    console.log('\n📋 Step 5: Checking Contract Addresses');
    console.log('-'.repeat(60));
    
    const productRegistryAddress = process.env.PRODUCT_REGISTRY_CONTRACT_ADDRESS;
    const supplyChainAddress = process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS;
    
    if (productRegistryAddress && productRegistryAddress !== '0x0000000000000000000000000000000000000000') {
      console.log(`✅ ProductRegistry: ${productRegistryAddress}`);
      
      // Check if contract exists
      const code = await provider.getCode(productRegistryAddress);
      if (code === '0x') {
        console.log(`   ⚠️  No contract code found at this address!`);
      } else {
        console.log(`   ✅ Contract code verified`);
      }
    } else {
      console.log(`❌ ProductRegistry: Not deployed`);
    }
    
    if (supplyChainAddress && supplyChainAddress !== '0x0000000000000000000000000000000000000000') {
      console.log(`✅ SupplyChain: ${supplyChainAddress}`);
      
      const code = await provider.getCode(supplyChainAddress);
      if (code === '0x') {
        console.log(`   ⚠️  No contract code found at this address!`);
      } else {
        console.log(`   ✅ Contract code verified`);
      }
    } else {
      console.log(`❌ SupplyChain: Not deployed`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    const hasBalance = parseFloat(balanceInEth) > 0;
    const hasContracts = productRegistryAddress && supplyChainAddress && 
                        productRegistryAddress !== '0x0000000000000000000000000000000000000000' &&
                        supplyChainAddress !== '0x0000000000000000000000000000000000000000';
    
    if (hasBalance && hasContracts) {
      console.log('✅ All checks passed! Blockchain is ready to use.');
    } else {
      console.log('⚠️  Setup incomplete:');
      if (!hasBalance) {
        console.log('   - Get test tokens from faucet');
      }
      if (!hasContracts) {
        console.log('   - Deploy smart contracts:');
        console.log('     npm run hardhat:deploy:sepolia');
      }
    }
    
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error testing blockchain connection:');
    console.error(error.message);
    console.log('\nPlease check:');
    console.log('1. RPC URL is correct in .env');
    console.log('2. Network is accessible');
    console.log('3. Private key is valid\n');
  }
}

// Run test
testBlockchain().catch(console.error);
