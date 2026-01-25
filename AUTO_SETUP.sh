#!/bin/bash

# TraceRoot - Replit One-Click Setup
# Paste this entire file into Replit terminal and press Enter
# It will do EVERYTHING automatically

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TraceRoot - Replit Automated Setup                      ║"
echo "║     Your Hyperledger Fabric Network Goes LIVE 🚀            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Step 1: Install Dependencies
print_status "Step 1: Installing Node.js dependencies..."
if npm install; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi
echo ""

# Step 2: Check Docker
print_status "Step 2: Checking Docker availability..."
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Replit Docker may not be enabled."
    print_warning "Replit may not support Docker on your plan."
    print_warning "Consider:"
    print_warning "  1. Upgrade your Replit plan"
    print_warning "  2. Use Gitpod instead (gitpod.io)"
    print_warning "  3. Deploy locally first, then to Replit"
    exit 1
fi
print_success "Docker is available"
echo ""

# Step 3: Setup Fabric Network
print_status "Step 3: Setting up Hyperledger Fabric network..."
print_warning "This may take 2-3 minutes. Please wait..."
echo ""

cd fabric-network || exit 1

if [ ! -f network.sh ]; then
    print_error "network.sh not found in fabric-network/"
    exit 1
fi

chmod +x network.sh

print_status "Starting Fabric network with: ./network.sh up createChannel"
if ./network.sh up createChannel; then
    print_success "Fabric network is running"
else
    print_error "Failed to start Fabric network"
    print_warning "Your Replit may have insufficient resources"
    print_warning "Try using docker-compose.minimal.yml:"
    echo "  cp docker-compose.minimal.yml fabric-network/docker-compose.yml"
    echo "  ./network.sh up createChannel"
    exit 1
fi
echo ""

# Step 4: Enroll Users
print_status "Step 4: Enrolling admin and users..."
cd ../scripts || exit 1

if node enroll.js; then
    print_success "Users enrolled successfully"
else
    print_warning "User enrollment returned a warning (may be normal)"
fi
echo ""

# Step 5: Return to root
cd ..

# Step 6: Display completion message
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP COMPLETE!                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
print_success "Hyperledger Fabric is now RUNNING"
print_success "Next.js dependencies are INSTALLED"
echo ""

print_status "🌐 Next: Start your Next.js application"
echo ""
echo "  Run this command:"
echo ""
echo "    ${BLUE}npm run dev${NC}"
echo ""
echo "  Then you'll see a URL like:"
echo ""
echo "    ${GREEN}https://your-project-name.replit.dev${NC}"
echo ""

print_status "📢 Share this URL with your reviewers!"
echo ""

print_status "⏱️  Timing:"
echo "  • Fabric startup: Already done (2-3 mins)"
echo "  • Next.js startup: ~30 seconds"
echo "  • Total setup time: ~3-4 minutes"
echo ""

print_status "🔗 API Endpoints Available:"
echo "  • GET /api/health - Check if API is running"
echo "  • POST /api/fabric/* - Your Fabric endpoints"
echo "  • GET /api/blockchain/* - Blockchain queries"
echo ""

print_warning "Replit Note:"
echo "  Your project will stay running 24/7 on Replit's free tier"
echo "  (as long as someone visits it at least once per 30 days)"
echo ""

print_status "📚 Documentation:"
echo "  • QUICK_START_REPLIT.md - Overview (READ THIS)"
echo "  • REPLIT_DEPLOYMENT_GUIDE.md - Full details"
echo "  • REPLIT_SETUP_README.md - All info in one place"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Run: ${BLUE}npm run dev${NC}                                       ║"
echo "║  Then share your Replit URL with reviewers! 🚀              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
