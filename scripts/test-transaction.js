/**
 * Test blockchain connection and send a test transaction
 * Run: npx hardhat run scripts/test-transaction.js --network sepolia
 */

const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Sepolia Connection...\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Using account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Get contract addresses
  const productRegistryAddress = process.env.PRODUCT_REGISTRY_ADDRESS;
  const supplyChainAddress = process.env.SUPPLY_CHAIN_ADDRESS;

  if (!productRegistryAddress || !supplyChainAddress) {
    console.error("❌ Contract addresses not found in .env!");
    console.log("Deploy contracts first: npx hardhat run scripts/deploy-sepolia.js --network sepolia");
    process.exit(1);
  }

  console.log("📦 Contract Addresses:");
  console.log("ProductRegistry:", productRegistryAddress);
  console.log("SupplyChain:", supplyChainAddress);
  console.log("");

  // Load contracts
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = ProductRegistry.attach(productRegistryAddress);

  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = SupplyChain.attach(supplyChainAddress);

  // Test 1: Register a product
  console.log("🧪 Test 1: Register Product");
  console.log("─".repeat(60));
  const testProductId = `TEST-${Date.now()}`;
  const testName = "Test Organic Coffee";
  const testOrigin = "Ethiopia";
  const testCategory = "Coffee";

  try {
    const tx1 = await productRegistry.registerProduct(
      testProductId,
      testName,
      testOrigin,
      testCategory
    );
    
    console.log("⏳ Transaction sent:", tx1.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt1 = await tx1.wait();
    console.log("✅ Product registered!");
    console.log("   Block:", receipt1.blockNumber);
    console.log("   Gas used:", receipt1.gasUsed.toString());
    console.log("   View: https://sepolia.etherscan.io/tx/" + tx1.hash);
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }

  // Test 2: Create supply chain entry
  console.log("\n🧪 Test 2: Create Supply Chain Entry");
  console.log("─".repeat(60));
  
  try {
    const tx2 = await supplyChain.createProduct(
      testProductId,
      "Farm in Ethiopia",
      JSON.stringify({ quality: "Grade A", certification: "Organic" })
    );
    
    console.log("⏳ Transaction sent:", tx2.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt2 = await tx2.wait();
    console.log("✅ Supply chain entry created!");
    console.log("   Block:", receipt2.blockNumber);
    console.log("   Gas used:", receipt2.gasUsed.toString());
    console.log("   View: https://sepolia.etherscan.io/tx/" + tx2.hash);
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }

  // Test 3: Read product data
  console.log("\n🧪 Test 3: Read Product Data");
  console.log("─".repeat(60));
  
  try {
    const product = await productRegistry.getProduct(testProductId);
    console.log("✅ Product found on blockchain:");
    console.log("   ID:", product[0]);
    console.log("   Name:", product[1]);
    console.log("   Origin:", product[2]);
    console.log("   Category:", product[3]);
    console.log("   Registered by:", product[5]);
    console.log("   Timestamp:", new Date(Number(product[4]) * 1000).toISOString());
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ ALL TESTS COMPLETED!");
  console.log("=".repeat(60));
  console.log("\nYour blockchain integration is working correctly! 🎉\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
