#!/bin/bash

# Security verification script
# Run this before pushing to git

echo "🔒 Security Verification Script"
echo "==============================="
echo ""

# Check 1: .env not tracked
echo "1. Checking if .env is tracked by git..."
if git ls-files | grep -q "^\.env$"; then
    echo "❌ FAIL: .env is tracked by git!"
    echo "   Run: git rm --cached .env"
    exit 1
else
    echo "✅ PASS: .env is not tracked"
fi

# Check 2: .env not staged
echo ""
echo "2. Checking if .env is staged..."
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ FAIL: .env is staged!"
    echo "   Run: git reset HEAD .env"
    exit 1
else
    echo "✅ PASS: .env is not staged"
fi

# Check 3: No API keys in staged files
echo ""
echo "3. Checking for API keys in staged changes..."
if git diff --cached | grep -qi "sk-ant-api03-\|ANTHROPIC_API_KEY.*sk-ant"; then
    echo "❌ FAIL: API keys found in staged changes!"
    echo "   Review: git diff --cached"
    exit 1
else
    echo "✅ PASS: No API keys in staged changes"
fi

# Check 4: .gitignore includes .env
echo ""
echo "4. Checking if .gitignore includes .env..."
if grep -q "^\.env$" .gitignore; then
    echo "✅ PASS: .env is in .gitignore"
else
    echo "❌ FAIL: .env not in .gitignore!"
    echo "   Add: echo '.env' >> .gitignore"
    exit 1
fi

echo ""
echo "==============================="
echo "✅ All security checks passed!"
echo ""
echo "⚠️  REMINDER: Have you rotated your API key?"
echo "   See SECURITY_NOTICE.md for instructions"
echo ""
