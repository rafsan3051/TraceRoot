/**
 * Deploy TraceRoot Smart Contracts to Sepolia Testnet
 * 
 * Prerequisites:
 * 1. Get free Sepolia ETH from: https://sepoliafaucet.com/
 * 2. Get Alchemy API key from: https://www.alchemy.com/ (free)
 * 3. Set environment variables in .env:
 *    - PRIVATE_KEY (your wallet private key)
 *    - SEPOLIA_RPC_URL (your Alchemy/Infura Sepolia RPC URL)
 * 
 * Run: npx hardhat run scripts/deploy-sepolia.js --network sepolia
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying TraceRoot contracts to Sepolia testnet...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ Error: No ETH in account!");
    console.log("Get free Sepolia ETH from: https://sepoliafaucet.com/");
    console.log("Or: https://www.alchemy.com/faucets/ethereum-sepolia");
    process.exit(1);
  }

  // Deploy ProductRegistry
  console.log("📦 Deploying ProductRegistry...");
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy();
  await productRegistry.waitForDeployment();
  const productRegistryAddress = await productRegistry.getAddress();
  console.log("✅ ProductRegistry deployed to:", productRegistryAddress);

  // Deploy SupplyChain
  console.log("\n📦 Deploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("✅ SupplyChain deployed to:", supplyChainAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ProductRegistry: {
        address: productRegistryAddress,
        abi: "artifacts/contracts/ProductRegistry.sol/ProductRegistry.json"
      },
      SupplyChain: {
        address: supplyChainAddress,
        abi: "artifacts/contracts/SupplyChain.sol/SupplyChain.json"
      }
    },
    explorer: {
      ProductRegistry: `https://sepolia.etherscan.io/address/${productRegistryAddress}`,
      SupplyChain: `https://sepolia.etherscan.io/address/${supplyChainAddress}`
    }
  };

  // Save to file
  const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses (add to Vercel env):");
  console.log("─".repeat(60));
  console.log("PRODUCT_REGISTRY_ADDRESS=" + productRegistryAddress);
  console.log("SUPPLY_CHAIN_ADDRESS=" + supplyChainAddress);
  console.log("BLOCKCHAIN_NETWORK=sepolia");
  console.log("USE_REAL_BLOCKCHAIN=true");
  
  console.log("\n🔍 View on Etherscan:");
  console.log("─".repeat(60));
  console.log("ProductRegistry:", deploymentInfo.explorer.ProductRegistry);
  console.log("SupplyChain:", deploymentInfo.explorer.SupplyChain);
  
  console.log("\n⚠️  IMPORTANT: Copy these addresses to your Vercel environment variables!");
  console.log("=".repeat(60) + "\n");

  // Test deployment
  console.log("🧪 Testing deployment...");
  try {
    const testProductId = "TEST-" + Date.now();
    const tx = await productRegistry.registerProduct(
      testProductId,
      "Test Product",
      "Test Origin",
      "Test Category"
    );
    await tx.wait();
    console.log("✅ Test transaction successful!");
    console.log("   TX Hash:", tx.hash);
    console.log("   View: https://sepolia.etherscan.io/tx/" + tx.hash);
  } catch (error) {
    console.log("⚠️  Test transaction failed (this is normal if contract needs time)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
