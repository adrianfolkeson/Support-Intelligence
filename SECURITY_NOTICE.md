# 🚨 SECURITY NOTICE - ACTION REQUIRED

## Critical: API Key Exposed

Your Anthropic API key was visible in the `.env` file during the development session. While the `.env` file is properly excluded from git via `.gitignore`, the key should be rotated as a security precaution.

---

## Immediate Actions Required

### 1. Rotate Your Anthropic API Key (5 minutes)

**Step 1: Create New Key**
1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Name it: "Support Intelligence Production"
4. Copy the new key (starts with `sk-ant-api03-...`)

**Step 2: Update .env File**
1. Open `/Users/adrianfolkeson/Projekt/support-intelligence/.env`
2. Replace the value of `ANTHROPIC_API_KEY` with your new key
3. Save the file

**Step 3: Delete Old Key**
1. Go back to https://console.anthropic.com/settings/keys
2. Find your old key
3. Click "Delete" or "Revoke"
4. Confirm deletion

**Why?** The old key was visible in the AI conversation transcript. Rotating it ensures no unauthorized access.

---

### 2. Verify .env is Not Tracked (Already Done ✅)

```bash
# Check if .env is in git (should return nothing)
git ls-files | grep "^\.env$"

# Check if .env is staged (should return nothing)
git status | grep "\.env"
```

If either command shows `.env`, run:
```bash
# Remove from git tracking (doesn't delete the file)
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from git tracking"
```

**Status: Already verified - `.env` is NOT tracked by git.**

---

### 3. Before Every Git Push

Run this safety check:
```bash
# Check for accidentally staged secrets
git diff --cached | grep -i "api.*key\|password\|secret"
```

If this shows anything, you've accidentally staged secrets. Unstage them:
```bash
git reset HEAD <file>
```

---

## What's Protected Now

✅ `.env` is in `.gitignore` (verified)
✅ `.env` is NOT tracked by git (verified)
✅ `.env.example` template created (safe to commit)

---

## What You Need to Do

⚠️ **Rotate your Anthropic API key** (see Step 1 above)
⚠️ **Update `.env` with new key** (see Step 2 above)
⚠️ **Delete old key from console** (see Step 3 above)

---

## How to Share This Project Safely

**When sharing the repository:**
1. Ensure `.env` is never committed (already protected)
2. Share `.env.example` instead (safe template)
3. Provide instructions to copy: `cp .env.example .env`
4. Recipients must add their own API keys

**When deploying to production:**
1. Use environment variables (not `.env` files)
2. Store secrets in:
   - Vercel/Netlify: Project settings → Environment Variables
   - AWS: Secrets Manager or Parameter Store
   - Docker: Pass via `-e` flag or docker-compose secrets
   - Kubernetes: Use Secrets resources

---

## Additional Security Recommendations

### Short-Term
1. ✅ Rotate API key (see above)
2. Enable API key usage alerts in Anthropic console
3. Set spending limits if available

### Medium-Term
1. Implement per-organization API keys (instead of shared key)
2. Add API request logging for audit trail
3. Implement rate limiting per organization

### Long-Term
1. Use secret management service (AWS Secrets Manager, HashiCorp Vault)
2. Implement key rotation automation
3. Add anomaly detection on API usage

---

## Questions?

**Q: Can I commit `.env.example`?**
A: Yes! It contains no secrets, only placeholders.

**Q: What if I already pushed .env to GitHub?**
A: You need to:
1. Rotate your API key immediately
2. Remove `.env` from git history (use BFG Repo-Cleaner or git-filter-repo)
3. Force push the cleaned history (⚠️ breaks clones, coordinate with team)

**Q: How do I know if my key was compromised?**
A: Check Anthropic console for unexpected API usage. Look for:
- Unusual request volume
- Requests from unknown IPs
- Requests outside your normal hours

---

**Last Updated:** 2026-01-27
**Action Required By:** Immediately (before pushing to git)
