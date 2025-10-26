# Pre-Push Security Checklist ✅

Run this checklist before pushing to GitHub to ensure no secrets are exposed.

## Quick Security Scan

### 1. Check for .env files in staging
```bash
git status | grep -i "\.env$"
```
**Expected**: Should NOT show `.env` (only `.env.example` is OK)

### 2. Verify .env is gitignored
```bash
git check-ignore .env
```
**Expected**: Should output `.env` (meaning it's ignored)

### 3. Search for hardcoded secrets in staged files
```bash
git diff --cached | grep -i "password.*=.*['\"]"
git diff --cached | grep -i "secret.*=.*['\"]"
git diff --cached | grep -i "api.*key.*=.*['\"]"
```
**Expected**: Should NOT find any hardcoded values (only `process.env` references are OK)

## Manual Verification

- [ ] `.env` file is NOT in `git status`
- [ ] No hardcoded passwords in source code
- [ ] No API keys in source code
- [ ] No private keys in source code
- [ ] All secrets use `process.env.VARIABLE_NAME`
- [ ] `.env.example` contains only placeholder/dummy values
- [ ] README or docs explain how to set up `.env`

## Safe Patterns ✅

These are SAFE to commit:
```javascript
// ✅ Using environment variables
const secret = process.env.JWT_SECRET
const password = process.env.SEED_ADMIN_PASSWORD

// ✅ Validation for required secrets
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required')
}

// ✅ Comments referencing env vars
// Set JWT_SECRET in your .env file
```

## Unsafe Patterns ❌

These should NEVER be committed:
```javascript
// ❌ Hardcoded secrets
const secret = 'my-secret-key-123'
const apiKey = 'sk-1234567890abcdef'

// ❌ Even in comments
// My password is: admin123

// ❌ Fallback to real values
const key = process.env.KEY || 'real-secret-here'
```

## If You Find a Secret

If you accidentally committed a secret:

1. **DO NOT** just remove it in a new commit
2. Contact the team lead immediately
3. Rotate/regenerate the exposed secret
4. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
5. Force push (with team coordination)

## Resources

- [Removing sensitive data from GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [gitignore.io](https://www.gitignore.io/) - Generate comprehensive .gitignore files
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent committing secrets

---

**Remember**: Once a secret is pushed to GitHub, assume it's compromised. Always rotate secrets immediately if accidentally exposed.
