# TraceRoot Blockchain Setup Script (PowerShell)
# Run this in PowerShell: .\setup-blockchain.ps1

Write-Host "🚀 TraceRoot Blockchain Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing blockchain dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install core blockchain libraries
Write-Host "Installing ethers.js..." -ForegroundColor Cyan
npm install --save ethers@6.13.4

# Install development dependencies
Write-Host "Installing Hardhat and toolbox..." -ForegroundColor Cyan
npm install --save-dev hardhat@2.22.15 @nomicfoundation/hardhat-toolbox@5.0.0

# Optional: IPFS
$installIPFS = Read-Host "Install IPFS support? (y/n)"
if ($installIPFS -eq 'y' -or $installIPFS -eq 'Y') {
    npm install --save ipfs-http-client
    Write-Host "✅ IPFS support installed" -ForegroundColor Green
}

# Optional: Ganache
$installGanache = Read-Host "Install Ganache for local blockchain? (y/n)"
if ($installGanache -eq 'y' -or $installGanache -eq 'Y') {
    npm install --save-dev ganache
    Write-Host "✅ Ganache installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All dependencies installed!" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please update .env with your configuration!" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env with your blockchain credentials"
Write-Host "2. Get Infura API key: https://infura.io/"
Write-Host "3. Setup MetaMask wallet"
Write-Host "4. Get test ETH from faucet"
Write-Host "5. Deploy contracts: npm run hardhat:deploy:sepolia"
Write-Host "6. Test setup: npm run blockchain:test"
Write-Host ""
Write-Host "📚 See SECURITY_CONFIG.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
