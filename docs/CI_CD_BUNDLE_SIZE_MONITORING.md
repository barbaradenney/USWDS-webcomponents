# CI/CD Bundle Size Monitoring

This guide shows how to integrate bundle size monitoring into your CI/CD pipeline.

## Quick Setup

### 1. Install size-limit (Recommended)

```bash
npm install -D size-limit @size-limit/file
```

### 2. Add to package.json

```json
{
  "scripts": {
    "size": "size-limit",
    "size:why": "size-limit --why"
  },
  "size-limit": [
    {
      "name": "Full Bundle (gzip)",
      "path": "dist/index.js",
      "limit": "95 KB",
      "gzip": true
    },
    {
      "name": "Full Bundle (brotli)",
      "path": "dist/index.js",
      "limit": "70 KB",
      "brotli": true
    },
    {
      "name": "CSS (brotli)",
      "path": "dist/uswds-webcomponents.css",
      "limit": "30 KB",
      "brotli": true
    }
  ]
}
```

### 3. Add to CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run size
```

---

## GitHub Actions Integration

### Size Limit Action (with PR Comments)

```yaml
# .github/workflows/size-limit.yml
name: Bundle Size

on:
  pull_request:
    branches: [main]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

**Result**: Automatic PR comments with size changes!

---

## Alternative: bundlesize

### Setup

```bash
npm install -D bundlesize
```

### Configuration

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/index.js",
      "maxSize": "95 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/uswds-webcomponents.css",
      "maxSize": "32 KB",
      "compression": "gzip"
    }
  ]
}
```

### GitHub Actions

```yaml
- run: npm run build
- run: npx bundlesize
  env:
    BUNDLESIZE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Custom Size Tracking Script

Create `scripts/check-bundle-size.js`:

```javascript
#!/usr/bin/env node
import { readFileSync } from 'fs';
import { gzipSync, brotliCompressSync } from 'zlib';

const limits = {
  'dist/index.js': { gzip: 95 * 1024, brotli: 70 * 1024 },
  'dist/uswds-webcomponents.css': { gzip: 32 * 1024, brotli: 30 * 1024 },
};

let failed = false;

for (const [file, limit] of Object.entries(limits)) {
  try {
    const content = readFileSync(file);
    const gzipped = gzipSync(content).length;
    const brotlied = brotliCompressSync(content).length;

    console.log(`\n📦 ${file}:`);
    console.log(`  Gzip: ${(gzipped / 1024).toFixed(2)} KB / ${(limit.gzip / 1024).toFixed(0)} KB`);
    console.log(`  Brotli: ${(brotlied / 1024).toFixed(2)} KB / ${(limit.brotli / 1024).toFixed(0)} KB`);

    if (gzipped > limit.gzip) {
      console.error(`  ❌ Gzip size exceeds limit!`);
      failed = true;
    }
    if (brotlied > limit.brotli) {
      console.error(`  ❌ Brotli size exceeds limit!`);
      failed = true;
    }
  } catch (error) {
    console.error(`❌ Failed to check ${file}:`, error.message);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`\n✅ All bundle sizes within limits!`);
```

### Usage

```json
{
  "scripts": {
    "size:check": "node scripts/check-bundle-size.js"
  }
}
```

---

## GitLab CI

```yaml
# .gitlab-ci.yml
bundle-size:
  stage: test
  script:
    - npm ci
    - npm run build
    - npm run size
  only:
    - merge_requests
```

---

## CircleCI

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  bundle-size:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run: npm ci
      - run: npm run build
      - run: npm run size

workflows:
  test:
    jobs:
      - bundle-size
```

---

## Monitoring Over Time

### Track Size History

Create `scripts/track-size-history.js`:

```javascript
import { readFileSync, writeFileSync } from 'fs';
import { gzipSync, brotliCompressSync } from 'zlib';

const history = JSON.parse(readFileSync('size-history.json', 'utf-8') || '[]');

const files = {
  js: readFileSync('dist/index.js'),
  css: readFileSync('dist/uswds-webcomponents.css'),
};

const entry = {
  date: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local',
  sizes: {
    js: {
      raw: files.js.length,
      gzip: gzipSync(files.js).length,
      brotli: brotliCompressSync(files.js).length,
    },
    css: {
      raw: files.css.length,
      gzip: gzipSync(files.css).length,
      brotli: brotliCompressSync(files.css).length,
    },
  },
};

history.push(entry);
writeFileSync('size-history.json', JSON.stringify(history, null, 2));

console.log('📊 Size history updated!');
console.log(JSON.stringify(entry, null, 2));
```

### Visualize

Use Chart.js or similar to plot size trends over time.

---

## PR Size Comparison

### Automatic PR Comments

```yaml
name: Bundle Size Comparison

on: pull_request

jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.base_ref }}

      - name: Build base
        run: |
          npm ci
          npm run build
          mv dist dist-base

      - uses: actions/checkout@v3

      - name: Build PR
        run: |
          npm ci
          npm run build

      - name: Compare sizes
        run: |
          node scripts/compare-sizes.js dist-base dist

      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const comparison = fs.readFileSync('size-comparison.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.name,
              body: comparison
            });
```

---

## Size Budget Recommendations

### Conservative (Good for most apps)

```json
{
  "limits": {
    "index.js": "95 KB (gzip) / 70 KB (brotli)",
    "css": "32 KB (gzip) / 30 KB (brotli)",
    "total": "127 KB (gzip) / 100 KB (brotli)"
  }
}
```

### Aggressive (Performance-critical)

```json
{
  "limits": {
    "index.js": "80 KB (gzip) / 60 KB (brotli)",
    "css": "25 KB (gzip) / 20 KB (brotli)",
    "total": "105 KB (gzip) / 80 KB (brotli)"
  }
}
```

### Relaxed (Feature-rich apps)

```json
{
  "limits": {
    "index.js": "120 KB (gzip) / 90 KB (brotli)",
    "css": "40 KB (gzip) / 35 KB (brotli)",
    "total": "160 KB (gzip) / 125 KB (brotli)"
  }
}
```

---

## Alerts and Notifications

### Slack Notifications

```yaml
- name: Notify Slack on size increase
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "⚠️ Bundle size check failed on ${{ github.repository }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

Configure in your CI platform's settings.

---

## Best Practices

1. **Set Realistic Limits**: Start with current sizes + 10% buffer
2. **Monitor Trends**: Track sizes over time, not just limits
3. **Review Large Changes**: Investigate any >5% size increase
4. **Test Locally**: Run `npm run size` before committing
5. **Document Changes**: Explain size increases in PR descriptions

---

## Troubleshooting

### Size Check Fails After Update

```bash
# Check what changed
npm run size:why

# View bundle composition
npm run build:analyze:visual
```

### False Positives

Add tolerance to limits:

```json
{
  "limit": "95 KB",
  "tolerance": "5%"  // Allow 5% variance
}
```

---

## Resources

- [size-limit](https://github.com/ai/size-limit)
- [bundlesize](https://github.com/siddharthkp/bundlesize)
- [Bundle Visualizer](../dist/stats.html)
- [Optimization Guide](./BUNDLE_SIZE_OPTIMIZATION_GUIDE.md)
