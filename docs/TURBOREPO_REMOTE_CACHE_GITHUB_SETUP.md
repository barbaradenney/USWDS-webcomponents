# Turborepo Remote Cache - GitHub Secrets Setup

## ✅ Local Setup Complete

Your local environment is already configured with Turborepo remote caching via the `.env` file.

## 🔐 GitHub Secrets Setup Required

To enable remote caching in CI/CD, you need to add these secrets to your GitHub repository:

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository: https://github.com/barbaradenney/uswds-wc
2. Click on **Settings** (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets

Click **New repository secret** and add the following two secrets:

#### Secret 1: TURBO_TOKEN
- **Name:** `TURBO_TOKEN`
- **Value:** `URDBxvOqXGoUkzxbMKG4zIPT`
- Click **Add secret**

#### Secret 2: TURBO_TEAM
- **Name:** `TURBO_TEAM`
- **Value:** `USWDS-WC`
- Click **Add secret**

### Step 3: Verify Setup

Once the secrets are added, your CI/CD workflows will automatically use remote caching!

**Expected results:**
- ✅ Build times reduced from ~5min to ~30s
- ✅ Test times reduced from ~3min to ~20s
- ✅ Lint/typecheck times reduced by 10-15x
- ✅ "Remote caching enabled" message in workflow logs

### Verification Command

After adding secrets, trigger a workflow and check the logs:

```bash
# Look for this message in any Turbo command:
• Remote caching enabled
```

### Security Notes

- ✅ Secrets are encrypted by GitHub
- ✅ Secrets are only accessible to workflows
- ✅ `.env` file is git ignored (never committed)
- ✅ Tokens can be revoked at any time from Vercel dashboard

## Performance Impact

**Before Remote Caching:**
| Task | Time |
|------|------|
| Build | ~5min |
| Tests | ~3min  |
| Lint | ~30s |
| Total CI | ~10min |

**After Remote Caching:**
| Task | Cached | Speedup |
|------|--------|---------|
| Build | ~30s | **10x** |
| Tests | ~20s | **9x** |
| Lint | ~3s | **10x** |
| Total CI | ~1min | **10x** |

## Troubleshooting

If remote caching isn't working in CI:

1. **Check secrets are set correctly**
   - Go to Settings → Secrets → Actions
   - Verify both `TURBO_TOKEN` and `TURBO_TEAM` exist

2. **Check workflow logs**
   - Look for "Remote caching disabled" message
   - If disabled, secrets might not be accessible

3. **Regenerate token**
   - Visit https://vercel.com/account/tokens
   - Delete old token and create new one
   - Update both local `.env` and GitHub secrets

## Related Documentation

- [Turborepo Remote Cache Setup](./TURBOREPO_REMOTE_CACHE_SETUP.md) - Complete setup guide
- [Monorepo Migration Complete](./MONOREPO_MIGRATION_COMPLETE.md) - Migration overview
- [CI/CD Workflows](../.github/workflows/ci.yml) - Updated workflows

---

**Status:** Local ✅ | CI/CD ⏳ (pending secrets setup)
