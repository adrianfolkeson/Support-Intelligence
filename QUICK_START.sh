#!/bin/bash
# Support Intelligence - Quick Start Script
# Run this after installing Node.js and Docker

set -e  # Exit on error

echo "🚀 Support Intelligence - Quick Start"
echo "======================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install:"
    echo "   brew install node"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop:"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ npm $(npm --version) found"
echo "✅ Docker $(docker --version | cut -d' ' -f3) found"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "   Copy .env.example to .env and add your ANTHROPIC_API_KEY"
    exit 1
fi

# Check for API key
if ! grep -q "sk-ant-" .env 2>/dev/null; then
    echo "⚠️  WARNING: ANTHROPIC_API_KEY not set in .env"
    echo "   Get your key from https://console.anthropic.com/"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "🐳 Starting PostgreSQL in Docker..."
docker-compose up -d postgres

echo ""
echo "⏳ Waiting for PostgreSQL to start (10 seconds)..."
sleep 10

echo ""
echo "🗄️  Running database migrations..."
npm run migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Create an organization:"
echo "   docker exec -it support-intelligence-db psql -U postgres -d support_intelligence"
echo "   Then run:"
echo "   INSERT INTO organizations (name, external_api_key, external_api_url)"
echo "   VALUES ('My Company', 'test_key', 'https://api.example.com/tickets')"
echo "   RETURNING id;"
echo ""
echo "2. Insert test tickets (see INSTALL_INSTRUCTIONS.md Step 7)"
echo ""
echo "3. Run analysis:"
echo "   npm run analyze <org_id>"
echo ""
echo "4. Generate report:"
echo "   npm run report <org_id>"
echo ""
echo "5. Start the system:"
echo "   npm start"
echo ""
echo "📚 Full documentation: README.md"
echo ""
