#!/usr/bin/env node
/*
  TraceRoot - Fabric Chaincode Deployment Script (placeholder)

  This script outlines the steps to deploy the chaincode to a Fabric network.
  For a working deployment, integrate with fabric-samples/test-network lifecycle commands.
*/

const fs = require('fs')
const path = require('path')

function file(p) { return path.join(process.cwd(), p) }

function main() {
  const chaincodePath = file('chaincode/traceroot')
  const networkScript = file('fabric-network/network.sh')

  console.log('--- TraceRoot Fabric Chaincode Deployment ---')

  if (!fs.existsSync(chaincodePath)) {
    console.error('❌ Chaincode directory not found:', chaincodePath)
    process.exit(1)
  }

  if (!fs.existsSync(networkScript)) {
    console.error('❌ fabric-network/network.sh not found. Create or link to fabric-samples/test-network.')
    process.exit(1)
  }

  console.log('Next steps:')
  console.log('1) Start network:    npm run fabric:network:start')
  console.log('2) Package chaincode: peer lifecycle chaincode package')
  console.log('3) Install on peers:  peer lifecycle chaincode install')
  console.log('4) Approve/Commit:    peer lifecycle chaincode approveformyorg / commit')
  console.log('5) Invoke init (opt): peer chaincode invoke -n traceroot -C tracerootchannel -c "{\"Args\":[\"initLedger\"]}"')
  console.log('\nRefer to Hyperledger Fabric docs and fabric-samples for exact commands.')
}

main()
