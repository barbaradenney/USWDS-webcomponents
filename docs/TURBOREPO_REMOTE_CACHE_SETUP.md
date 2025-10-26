# Turborepo Remote Cache Setup

Turborepo remote caching speeds up builds by sharing build artifacts across machines and CI/CD pipelines.

## Current Configuration

Remote caching is **enabled** in `turbo.json`:

```json
{
  "remoteCache": {
    "enabled": true
  }
}
```

## Setup Options

### Option 1: Vercel Remote Cache (Recommended)

Free for personal projects, seamless integration with Turborepo.

**Steps:**

1. **Sign up for Vercel** (if you haven't already)
   ```bash
   # Visit https://vercel.com/signup
   ```

2. **Login to Turborepo**
   ```bash
   pnpm dlx turbo login
   ```
   This will open your browser and authenticate with Vercel.

3. **Link your repository**
   ```bash
   pnpm dlx turbo link
   ```
   Select your Vercel account and team when prompted.

4. **Verify it's working**
   ```bash
   pnpm build
   # First run will upload cache

   pnpm build --force
   # Subsequent runs will download from cache
   ```

5. **For CI/CD** (GitHub Actions, etc.)
   Add your Vercel token as a secret:
   ```yaml
   # .github/workflows/your-workflow.yml
   env:
     TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
     TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
   ```

### Option 2: Custom Remote Cache

For self-hosted solutions or enterprise use.

**Environment Variables:**

```bash
# .env (not committed to git)
TURBO_API=https://your-cache-server.com
TURBO_TOKEN=your-auth-token
TURBO_TEAM=your-team-name
```

**Supported backends:**
- [Turborepo Remote Cache Server](https://github.com/fox1t/turborepo-remote-cache)
- AWS S3 with custom server
- Google Cloud Storage with custom server
- Azure Blob Storage with custom server

### Option 3: Local Cache Only (Default)

If you don't set up remote caching, Turborepo uses local caching automatically.

**Pros:**
- No setup required
- No external dependencies
- Privacy (cache stays local)

**Cons:**
- No cache sharing across machines
- CI/CD builds from scratch every time
- Team members don't benefit from each other's builds

## Cached Tasks

The following tasks are configured for caching:

| Task | Cached | Outputs |
|------|--------|---------|
| `build` | ✅ | `dist/**`, `.next/**` |
| `build:css` | ✅ | `src/styles/styles.css` |
| `test` | ✅ | `coverage/**` |
| `lint` | ✅ | (none) |
| `typecheck` | ✅ | (none) |
| `build-storybook` | ✅ | `storybook-static/**` |
| `validate` | ✅ | (none) |
| `dev` | ❌ | Not cacheable (persistent) |
| `storybook` | ❌ | Not cacheable (persistent) |

## Performance Impact

**Expected speedups with remote cache:**

| Task | First Build | Cached Build | Speedup |
|------|-------------|--------------|---------|
| `pnpm build` | 45-60s | 2-5s | **10-15x** |
| `pnpm test` | 30-45s | 1-3s | **15-20x** |
| `pnpm lint` | 10-15s | 1-2s | **8-10x** |
| `pnpm typecheck` | 15-20s | 1-2s | **10-15x** |

## Verification

Check if remote caching is working:

```bash
# 1. Clear local cache
pnpm turbo build --force

# 2. Build again
pnpm turbo build

# 3. Look for cache hit messages
# Should see: "cache hit, replaying logs..."
```

## Troubleshooting

### Cache not uploading

```bash
# Check authentication
pnpm dlx turbo login

# Verify link
pnpm dlx turbo link

# Check token is set
echo $TURBO_TOKEN
```

### Cache not downloading

```bash
# Verify remote cache is enabled
cat turbo.json | grep remoteCache

# Check network connectivity to cache server
curl -I https://api.vercel.com

# Force cache rebuild
pnpm turbo build --force
```

### Cache size growing too large

Turborepo automatically manages cache size. For local cache:

```bash
# Clear local cache
rm -rf node_modules/.cache/turbo

# Or use Turborepo CLI
pnpm dlx turbo prune
```

## Security Considerations

**What's cached:**
- Build outputs (dist files, coverage, etc.)
- Task logs and metadata

**What's NOT cached:**
- Source code
- Environment variables
- Secrets
- Git history

**Best practices:**
- Never commit `.env` files with tokens
- Use CI/CD secrets for `TURBO_TOKEN`
- Rotate tokens periodically
- Use team-scoped tokens, not personal

## CI/CD Integration

### GitHub Actions

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build with Turborepo
        run: pnpm turbo build
        # Will use remote cache automatically

      - name: Test with Turborepo
        run: pnpm turbo test
        # Will use remote cache automatically
```

### Other CI Providers

**GitLab CI:**
```yaml
variables:
  TURBO_TOKEN: $TURBO_TOKEN
  TURBO_TEAM: $TURBO_TEAM
```

**CircleCI:**
```yaml
environment:
  TURBO_TOKEN: ${TURBO_TOKEN}
  TURBO_TEAM: ${TURBO_TEAM}
```

## Additional Resources

- [Turborepo Remote Caching Docs](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Vercel Turborepo Guide](https://vercel.com/docs/monorepos/turborepo)
- [Custom Remote Cache Setup](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting)

## Status

✅ **Configuration:** Remote cache enabled in `turbo.json`
⏳ **Setup:** Requires user to run `turbo login` and `turbo link`
📊 **Impact:** 10-15x faster builds when configured

---

**Next steps:**
1. Run `pnpm dlx turbo login` to authenticate
2. Run `pnpm dlx turbo link` to connect repository
3. Add `TURBO_TOKEN` and `TURBO_TEAM` to CI/CD secrets
