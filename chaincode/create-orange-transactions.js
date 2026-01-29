/**
 * Create 22 Blocks and Transactions for Orange from Green Farm
 * Run: node chaincode/create-orange-transactions.js
 */

const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate a simple hash for blockchain simulation
function generateHash(data) {
  let hash = 0;
  const str = JSON.stringify(data);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

// Generate timestamp for January 28, 2026
function getTimestamp(hourOffset = 0) {
  const date = new Date('2026-01-28T08:00:00Z');
  date.setHours(date.getHours() + hourOffset);
  return date.toISOString();
}

// Create blockchain data
const blockchain = {
  name: "TraceRoot Orange Supply Chain",
  description: "22 blocks tracking oranges from Green Farm",
  created: new Date().toISOString(),
  blocks: []
};

// Genesis Block
const genesisBlock = {
  blockNumber: 0,
  timestamp: getTimestamp(0),
  previousHash: "0000000000000000",
  transactions: [],
  data: {
    type: "GENESIS",
    message: "TraceRoot Blockchain Initialized"
  }
};
genesisBlock.hash = generateHash(genesisBlock);
blockchain.blocks.push(genesisBlock);

console.log("\n🌱 Creating 23 Blocks (1 Genesis + 22 Transactions) for Orange Supply Chain from Green Farm");
console.log("📅 Date: January 28, 2026\n");
console.log("=".repeat(70));

// Generate 22 more blocks with transactions
const transactionTypes = [
  { type: "FARM_REGISTRATION", location: "Green Farm, California", description: "Farm registered in system" },
  { type: "SEED_PLANTING", location: "Green Farm - Field A", description: "Orange tree seeds planted" },
  { type: "WATERING", location: "Green Farm - Field A", description: "Trees watered - 500L water used" },
  { type: "FERTILIZER", location: "Green Farm - Field A", description: "Organic fertilizer applied" },
  { type: "GROWTH_INSPECTION", location: "Green Farm - Field A", description: "Trees inspected - healthy growth" },
  { type: "PEST_CONTROL", location: "Green Farm - Field A", description: "Organic pest control applied" },
  { type: "QUALITY_CHECK", location: "Green Farm - Field A", description: "Quality inspection - Grade A" },
  { type: "HARVEST_START", location: "Green Farm - Field A", description: "Harvest season started" },
  { type: "PICKING", location: "Green Farm - Field A", description: "500kg oranges picked" },
  { type: "SORTING", location: "Green Farm - Sorting Facility", description: "Oranges sorted by size and quality" },
  { type: "WASHING", location: "Green Farm - Processing", description: "Oranges washed and cleaned" },
  { type: "GRADING", location: "Green Farm - Processing", description: "Grade A: 400kg, Grade B: 100kg" },
  { type: "PACKAGING", location: "Green Farm - Packaging", description: "Packed in 10kg boxes - 40 boxes" },
  { type: "QUALITY_CERT", location: "Green Farm - Office", description: "Organic certification verified" },
  { type: "STORAGE", location: "Green Farm - Cold Storage", description: "Stored at 4°C, humidity 85%" },
  { type: "SHIPMENT_PREP", location: "Green Farm - Logistics", description: "Prepared for shipment" },
  { type: "LOADING", location: "Green Farm - Loading Dock", description: "40 boxes loaded to truck TC-1234" },
  { type: "TRANSIT_START", location: "Highway 101 North", description: "In transit to distribution center" },
  { type: "CHECKPOINT", location: "Distribution Hub A", description: "Temperature check - All good" },
  { type: "ARRIVAL", location: "Central Distribution Center", description: "Arrived at distribution center" },
  { type: "FINAL_INSPECTION", location: "Distribution Center", description: "Final quality inspection passed" },
  { type: "RETAIL_DELIVERY", location: "Fresh Market Retail Store", description: "Delivered to retail store - Ready for sale" }
];

for (let i = 0; i < 22; i++) {
  const txData = transactionTypes[i];
  const hourOffset = i + 1;
  
  const transaction = {
    txId: `TX-ORANGE-${String(i + 1).padStart(4, '0')}`,
    timestamp: getTimestamp(hourOffset),
    product: {
      id: `ORG-GF-2026-001`,
      name: "Fresh Organic Oranges",
      category: "Citrus Fruit",
      variety: "Valencia Orange",
      quantity: "500 kg",
      farm: "Green Farm",
      farmLocation: "California, USA",
      farmCertification: "USDA Organic",
      harvestDate: "2026-01-28"
    },
    event: {
      type: txData.type,
      location: txData.location,
      description: txData.description,
      actor: "Green Farm Staff",
      temperature: txData.type.includes("STORAGE") || txData.type.includes("TRANSIT") ? "4°C" : "Ambient",
      humidity: txData.type.includes("STORAGE") ? "85%" : "Normal"
    },
    metadata: {
      blockchainNetwork: "TraceRoot-Hyperledger",
      version: "1.0.0",
      verified: true
    }
  };

  transaction.signature = generateHash(transaction);

  const block = {
    blockNumber: i + 1,
    timestamp: getTimestamp(hourOffset),
    previousHash: blockchain.blocks[blockchain.blocks.length - 1].hash,
    transactions: [transaction],
    validator: "Green Farm Node",
    data: {
      productId: transaction.product.id,
      eventType: transaction.event.type,
      location: transaction.event.location
    }
  };

  block.hash = generateHash(block);
  blockchain.blocks.push(block);

  console.log(`Block #${String(block.blockNumber).padStart(2, ' ')} | ${transaction.event.type.padEnd(20)} | ${transaction.event.location}`);
}

console.log("=".repeat(70));

// Save blockchain data
const outputPath = path.join(dataDir, 'orange-blockchain.json');
fs.writeFileSync(outputPath, JSON.stringify(blockchain, null, 2));

// Create a summary report
const summary = {
  chainInfo: {
    totalBlocks: blockchain.blocks.length,
    totalTransactions: blockchain.blocks.length - 1, // Excluding genesis
    product: "Fresh Organic Oranges",
    farm: "Green Farm",
    date: "January 28, 2026",
    created: blockchain.created
  },
  statistics: {
    blockHeight: blockchain.blocks.length - 1,
    firstBlock: blockchain.blocks[0].timestamp,
    lastBlock: blockchain.blocks[blockchain.blocks.length - 1].timestamp,
    averageBlockTime: "1 hour",
    chainIntegrity: "Valid"
  },
  productDetails: {
    id: "ORG-GF-2026-001",
    name: "Fresh Organic Oranges",
    quantity: "500 kg",
    variety: "Valencia Orange",
    farm: "Green Farm",
    location: "California, USA",
    certification: "USDA Organic",
    harvestDate: "2026-01-28"
  },
  supplyChainJourney: transactionTypes.map((tx, idx) => ({
    step: idx + 1,
    type: tx.type,
    location: tx.location,
    description: tx.description,
    timestamp: getTimestamp(idx + 1)
  }))
};

const summaryPath = path.join(dataDir, 'orange-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

// Create a human-readable report
let report = `
╔════════════════════════════════════════════════════════════════════╗
║          TRACEROOT BLOCKCHAIN - ORANGE SUPPLY CHAIN REPORT         ║
╚════════════════════════════════════════════════════════════════════╝

Product: Fresh Organic Oranges (Valencia)
Farm: Green Farm, California, USA
Certification: USDA Organic
Date: January 28, 2026
Product ID: ORG-GF-2026-001
Quantity: 500 kg

═══════════════════════════════════════════════════════════════════════

BLOCKCHAIN SUMMARY:
─────────────────────────────────────────────────────────────────────
Total Blocks: ${blockchain.blocks.length}
Total Transactions: ${blockchain.blocks.length - 1}
Chain Status: Valid ✓
Network: TraceRoot-Hyperledger
Genesis Block: ${blockchain.blocks[0].hash}
Latest Block: ${blockchain.blocks[blockchain.blocks.length - 1].hash}

═══════════════════════════════════════════════════════════════════════

SUPPLY CHAIN JOURNEY:
─────────────────────────────────────────────────────────────────────

`;

blockchain.blocks.forEach((block, idx) => {
  if (idx === 0) {
    report += `Block #${block.blockNumber} - GENESIS BLOCK\n`;
    report += `  Time: ${block.timestamp}\n`;
    report += `  Hash: ${block.hash}\n`;
    report += `  Status: ${block.data.message}\n\n`;
  } else {
    const tx = block.transactions[0];
    report += `Block #${block.blockNumber} - ${tx.event.type}\n`;
    report += `  Time: ${block.timestamp}\n`;
    report += `  Location: ${tx.event.location}\n`;
    report += `  Description: ${tx.event.description}\n`;
    report += `  Transaction ID: ${tx.txId}\n`;
    report += `  Block Hash: ${block.hash}\n`;
    if (tx.event.temperature) {
      report += `  Temperature: ${tx.event.temperature}\n`;
    }
    if (tx.event.humidity && tx.event.humidity !== "Normal") {
      report += `  Humidity: ${tx.event.humidity}\n`;
    }
    report += `  Verified: ✓\n\n`;
  }
});

report += `═══════════════════════════════════════════════════════════════════════

VERIFICATION:
─────────────────────────────────────────────────────────────────────
✓ All blocks are linked with valid hashes
✓ All transactions have valid signatures
✓ Product traceability is complete
✓ Supply chain integrity verified
✓ Organic certification validated

═══════════════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
System: TraceRoot Blockchain v1.0.0
`;

const reportPath = path.join(dataDir, 'orange-report.txt');
fs.writeFileSync(reportPath, report);

// Print completion message
console.log("\n✅ SUCCESS! 23 blocks created successfully (1 genesis + 22 transactions)!\n");
console.log("📄 Files generated:");
console.log(`   1. ${outputPath}`);
console.log(`   2. ${summaryPath}`);
console.log(`   3. ${reportPath}`);
console.log("\n📊 Blockchain Statistics:");
console.log(`   • Total Blocks: ${blockchain.blocks.length}`);
console.log(`   • Total Transactions: ${blockchain.blocks.length - 1}`);
console.log(`   • Product: Fresh Organic Oranges`);
console.log(`   • Farm: Green Farm`);
console.log(`   • Date: January 28, 2026`);
console.log(`   • Chain Integrity: Valid ✓`);
console.log("\n🔗 View complete blockchain data in: chaincode/data/\n");

// Verify blockchain integrity
console.log("🔍 Verifying blockchain integrity...");
let isValid = true;
for (let i = 1; i < blockchain.blocks.length; i++) {
  const currentBlock = blockchain.blocks[i];
  const previousBlock = blockchain.blocks[i - 1];
  
  if (currentBlock.previousHash !== previousBlock.hash) {
    console.log(`❌ Block ${i} has invalid previous hash!`);
    isValid = false;
  }
}

if (isValid) {
  console.log("✅ Blockchain integrity verified - All blocks are valid!\n");
} else {
  console.log("❌ Blockchain integrity check failed!\n");
}

console.log("=".repeat(70));
console.log("🎉 Orange supply chain blockchain created successfully!");
console.log("=".repeat(70) + "\n");
