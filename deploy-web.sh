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
echo "⚙️  Preparing deployment..."
echo ""

cd support-intelligence/web

# Build first to catch errors
echo "🔨 Building web application..."
npm run build 2>&1 || { echo "❌ Build failed!"; exit 1; }

echo ""
echo "✅ Build successful!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Run: vercel login"
echo "   (Opens browser to authenticate)"
echo ""
echo "2. Run: vercel --prod"
echo "   (Deploys to production)"
echo ""
echo "3. During deployment, Vercel will ask:"
echo "   - What's your project directory? → Enter: web"
echo ""
echo "4. After deployment, your site will be live!"
echo ""
echo "🎉 Your live URL: https://support-intelligence.vercel.app"
echo ""
echo "💡 Tip: After first deploy, just run 'vercel --prod' to update"
