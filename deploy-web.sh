#!/bin/bash

# Deploy Support Intelligence Web to Vercel
# Usage: ./deploy-web.sh

set -e

echo "🚀 Deploying Support Intelligence to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "⚙️  Configuring environment variables..."
echo "   You'll need to set these in Vercel dashboard:"
echo "   - NEXT_PUBLIC_API_URL (your API endpoint)"
echo ""

cd support-intelligence/web

# Build first to catch errors
echo "🔨 Building web application..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: vercel login"
echo "   2. Run: vercel --prod"
echo "   3. Add environment variables in Vercel dashboard"
echo "   4. Your site will be live at: https://support-intelligence.vercel.app"
echo ""
echo "🎉 Once deployed, use your live URL for Stripe registration!"
