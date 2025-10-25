const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy ProductRegistry
  console.log("📦 Deploying ProductRegistry...");
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy();
  await productRegistry.waitForDeployment();
  const productRegistryAddress = await productRegistry.getAddress();
  console.log("✅ ProductRegistry deployed to:", productRegistryAddress);

  // Deploy SupplyChain
  console.log("\n🔗 Deploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("✅ SupplyChain deployed to:", supplyChainAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("ProductRegistry:", productRegistryAddress);
  console.log("SupplyChain:", supplyChainAddress);
  console.log("=".repeat(60));

  console.log("\n📝 Update your .env file with these addresses:");
  console.log(`PRODUCT_REGISTRY_CONTRACT_ADDRESS="${productRegistryAddress}"`);
  console.log(`SUPPLY_CHAIN_CONTRACT_ADDRESS="${supplyChainAddress}"`);

  console.log("\n🔍 Verify contracts on block explorer:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${productRegistryAddress}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${supplyChainAddress}`);

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
