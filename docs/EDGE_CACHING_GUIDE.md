# Edge Caching & CDN Optimization Guide

> **Comprehensive guide to optimizing USWDS Web Components delivery through edge caching and CDN strategies.**

## Overview

Edge caching places your components closer to users globally, dramatically reducing latency and improving load times. This guide covers best practices for deploying USWDS Web Components with CDN optimization.

---

## 📊 Performance Impact

### Without Edge Caching
- **TTFB (Time to First Byte):** 200-500ms (US), 500-2000ms (International)
- **Cache Hit Rate:** 0% (every request hits origin)
- **Bandwidth Costs:** Full cost per request
- **Scalability:** Limited by origin server capacity

### With Edge Caching
- **TTFB:** 20-50ms globally
- **Cache Hit Rate:** 90-98%
- **Bandwidth Costs:** 90%+ reduction
- **Scalability:** Automatic via CDN distribution

### Real-World Example
```
User Location: Tokyo, Japan
Origin Server: AWS us-east-1

Without CDN:
- Latency: 180ms
- TTFB: 450ms
- Total Load: 1.2s

With CDN (Cloudflare/AWS CloudFront):
- Latency: 15ms
- TTFB: 30ms
- Total Load: 250ms

Improvement: 79% faster
```

---

## 🚀 Quick Start

### 1. Choose Your CDN Provider

**Recommended Options:**

| Provider | Best For | Pricing | Global POPs |
|----------|----------|---------|-------------|
| **Cloudflare** | Government sites, free tier | Free - $200/mo | 310+ |
| **AWS CloudFront** | AWS-hosted apps | Pay-per-use | 450+ |
| **Fastly** | Enterprise, real-time purging | $50+ /mo | 70+ |
| **Akamai** | Large government agencies | Enterprise | 4000+ |
| **BunnyCDN** | Cost-effective, good performance | $1+ /mo | 100+ |

**For Government Sites:** Cloudflare or AWS CloudFront (FedRAMP authorized)

### 2. Basic CDN Configuration

#### Cloudflare Example

```bash
# 1. Add your domain to Cloudflare
# 2. Update DNS to point to Cloudflare nameservers
# 3. Configure caching rules

# Cloudflare Page Rule for USWDS Components
URL Pattern: yourdomain.com/dist/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 4 hours
```

#### AWS CloudFront Example

```yaml
# cloudfront-distribution.yaml
Resources:
  USWDSDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: USWDSOrigin
            DomainName: your-bucket.s3.amazonaws.com
            S3OriginConfig:
              OriginAccessIdentity: ""
        DefaultCacheBehavior:
          TargetOriginId: USWDSOrigin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6  # CachingOptimized
          Compress: true
        CacheBehaviors:
          - PathPattern: /dist/*.js
            TargetOriginId: USWDSOrigin
            CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6
            Compress: true
            ViewerProtocolPolicy: https-only
          - PathPattern: /dist/*.css
            TargetOriginId: USWDSOrigin
            CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6
            Compress: true
            ViewerProtocolPolicy: https-only
```

---

## ⚙️ Cache Configuration

### Optimal Cache Headers

```javascript
// Express.js example
app.use('/dist', express.static('dist', {
  maxAge: '365d', // 1 year for versioned assets
  immutable: true,
  setHeaders: (res, path) => {
    // Versioned assets (with hash in filename)
    if (path.match(/\.[0-9a-f]{8,}\.(js|css|woff2?|png|jpg|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Non-versioned assets
    else {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // CORS for web components
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/uswds-components

# Gzip compression
gzip on;
gzip_types text/css application/javascript application/json image/svg+xml;
gzip_min_length 1000;
gzip_comp_level 6;

# Brotli compression (if module available)
brotli on;
brotli_types text/css application/javascript application/json;

location /dist/ {
    # Versioned assets (immutable)
    location ~* \.[0-9a-f]{8,}\.(js|css|woff2?|png|jpg|svg)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options "nosniff";
        expires 1y;
    }

    # Non-versioned assets
    add_header Cache-Control "public, max-age=3600, must-revalidate";
    expires 1h;
}

# HTML files
location ~* \.html$ {
    add_header Cache-Control "public, max-age=300, must-revalidate";
    expires 5m;
}
```

---

## 🎯 Asset Versioning Strategy

### File Naming Convention

```javascript
// vite.config.ts - Automatic hash-based versioning
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Add content hash to filenames
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      }
    }
  }
});
```

**Result:**
```
dist/
├── assets/
│   ├── index.a1b2c3d4.js          # Versioned
│   ├── button.e5f6g7h8.js         # Versioned
│   ├── styles.i9j0k1l2.css        # Versioned
│   └── uswds-icon.m3n4o5p6.svg    # Versioned
```

### Import Map Update

```html
<!-- Auto-generated import map with versioned URLs -->
<script type="importmap">
{
  "imports": {
    "uswds-webcomponents": "https://cdn.example.gov/dist/index.a1b2c3d4.js",
    "uswds-webcomponents/button": "https://cdn.example.gov/dist/button.e5f6g7h8.js"
  }
}
</script>
```

---

## 🔄 Cache Invalidation

### Strategies

**1. Version-Based (Recommended)**
```bash
# Deploy new version with new hash
dist/index.abc123.js  # Old version (still cached)
dist/index.def456.js  # New version (new URL, not cached)

# No invalidation needed - new URL = cache miss
```

**2. Manual Purge**
```bash
# Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://example.com/dist/index.js"]}'

# AWS CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/dist/*"
```

**3. Surrogate-Key Based (Fastly)**
```javascript
// Set surrogate keys on assets
res.setHeader('Surrogate-Key', 'uswds-components v1.2.3');

// Purge by key
curl -X PURGE https://api.fastly.com/service/SERVICE_ID/purge/v1.2.3 \
  -H "Fastly-Key: YOUR_API_KEY"
```

---

## 📈 Performance Optimization

### 1. HTTP/2 Server Push

```nginx
# Nginx HTTP/2 Push
location = /index.html {
    http2_push /dist/index.js;
    http2_push /dist/styles.css;
    http2_push /dist/button.js;
}
```

### 2. Preload Hints

```html
<!-- Preload critical resources -->
<link rel="preload" as="script" href="/dist/index.js" crossorigin>
<link rel="preload" as="style" href="/dist/styles.css">
<link rel="preload" as="font" href="/dist/fonts/source-sans-pro.woff2" type="font/woff2" crossorigin>

<!-- Prefetch likely-needed resources -->
<link rel="prefetch" as="script" href="/dist/modal.js">
<link rel="prefetch" as="script" href="/dist/date-picker.js">
```

### 3. DNS Prefetch

```html
<!-- Resolve CDN DNS early -->
<link rel="dns-prefetch" href="//cdn.example.gov">
<link rel="preconnect" href="https://cdn.example.gov" crossorigin>
```

### 4. Resource Hints in HTTP Headers

```javascript
// Express.js
app.use((req, res, next) => {
  res.setHeader('Link', [
    '</dist/index.js>; rel=preload; as=script; crossorigin',
    '</dist/styles.css>; rel=preload; as=style',
    '//cdn.example.gov; rel=dns-prefetch'
  ].join(', '));
  next();
});
```

---

## 🔒 Security Considerations

### Subresource Integrity (SRI)

```html
<!-- Generate SRI hash during build -->
<script
  src="https://cdn.example.gov/dist/index.abc123.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux9TLmPVmXxG7rDf3a3F5L9LM9V6F0K"
  crossorigin="anonymous"
></script>
```

**Generate SRI Hashes:**
```bash
# OpenSSL
cat dist/index.js | openssl dgst -sha384 -binary | openssl base64 -A

# Node.js
import crypto from 'crypto';
const hash = crypto.createHash('sha384')
  .update(fs.readFileSync('dist/index.js'))
  .digest('base64');
console.log(`sha384-${hash}`);
```

### Content Security Policy (CSP)

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.gov;
  style-src 'self' https://cdn.example.gov;
  font-src 'self' https://cdn.example.gov;
  img-src 'self' https://cdn.example.gov data:;
  connect-src 'self' https://api.example.gov;
```

---

## 📊 Monitoring & Analytics

### CloudFlare Analytics

```javascript
// Track CDN performance
fetch('https://api.cloudflare.com/client/v4/zones/{zone_id}/analytics/dashboard', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Cache Hit Rate:', data.result.cache_hit_rate);
    console.log('Bandwidth Saved:', data.result.bandwidth_saved);
  });
```

### Performance Tracking

```javascript
// Measure CDN performance
const perfObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.name.includes('cdn.example.gov')) {
      console.log('CDN Asset:', entry.name);
      console.log('Duration:', entry.duration, 'ms');
      console.log('Transfer Size:', entry.transferSize, 'bytes');
      console.log('From Cache:', entry.transferSize === 0);
    }
  });
});

perfObserver.observe({ entryTypes: ['resource'] });
```

---

## 🌍 Multi-Region Strategy

### Geographic Routing

```yaml
# Cloudflare Workers example
export default {
  async fetch(request, env) {
    const country = request.headers.get('CF-IPCountry');

    // Route to region-specific origin
    const origins = {
      'US': 'https://us-origin.example.gov',
      'EU': 'https://eu-origin.example.gov',
      'APAC': 'https://apac-origin.example.gov',
    };

    const region = ['US', 'CA', 'MX'].includes(country) ? 'US' :
                   ['GB', 'FR', 'DE', 'IT', 'ES'].includes(country) ? 'EU' : 'APAC';

    const originUrl = new URL(request.url);
    originUrl.hostname = new URL(origins[region]).hostname;

    return fetch(originUrl.toString(), request);
  }
}
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Add content hashes to filenames
- [ ] Generate SRI hashes for all assets
- [ ] Configure cache headers
- [ ] Test compression (Gzip/Brotli)
- [ ] Set up CORS headers
- [ ] Configure CSP headers

### CDN Setup
- [ ] Choose CDN provider
- [ ] Configure caching rules
- [ ] Set up SSL/TLS certificate
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Configure geographic routing (if needed)
- [ ] Test edge caching

### Post-Deployment
- [ ] Verify cache hit rates (target: >90%)
- [ ] Monitor performance metrics
- [ ] Test from multiple locations
- [ ] Set up alerts for cache misses
- [ ] Document invalidation procedures

---

## 💰 Cost Optimization

### Bandwidth Savings

```
Scenario: Government website with 1M monthly visitors

Without CDN:
- Total Requests: 10M (10 assets per page)
- Average Asset Size: 50 KB
- Total Bandwidth: 500 GB/month
- Cost: $45/month (AWS S3 transfer pricing)

With CDN (95% cache hit rate):
- Origin Requests: 500K (5% cache misses)
- CDN Bandwidth: 475 GB (served from edge)
- Origin Bandwidth: 25 GB
- Cost: $15/month (CDN) + $2.25 (origin)
- Savings: $27.75/month (62% reduction)

Annual Savings: $333
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Assets Not Caching**
```bash
# Check cache headers
curl -I https://cdn.example.gov/dist/index.js

# Look for:
Cache-Control: public, max-age=31536000, immutable
X-Cache: HIT  # or MISS on first request
```

**2. Stale Content After Deploy**
```bash
# Verify new version is deployed
curl https://cdn.example.gov/dist/index.js | grep VERSION

# Purge cache if needed
# (See Cache Invalidation section)
```

**3. CORS Errors**
```bash
# Check CORS headers
curl -H "Origin: https://your-app.gov" \
  -I https://cdn.example.gov/dist/index.js

# Should include:
Access-Control-Allow-Origin: *
```

---

## 📚 Additional Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/cache/
- **AWS CloudFront Best Practices:** https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/
- **Web Performance Working Group:** https://www.w3.org/webperf/
- **HTTP Caching RFC:** https://httpwg.org/specs/rfc7234.html

---

**With proper edge caching and CDN optimization, USWDS Web Components can be delivered globally with <50ms latency and 90%+ bandwidth savings.**
