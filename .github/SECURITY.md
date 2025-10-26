# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

**Note**: We recommend always using the latest stable version for the best security posture.

## Reporting a Vulnerability

We take the security of USWDS Web Components seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Navigate to the [Security tab](https://github.com/barbaradenney/uswds-wc/security)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**
   - Send details to: security@[your-domain].com
   - Use PGP key if available (see below)

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., XSS, CSRF, code injection, etc.)
- **Full path(s)** of source file(s) related to the vulnerability
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within **48 hours**

2. **Initial Assessment**: We will provide an initial assessment within **5 business days**, including:
   - Whether we've reproduced the issue
   - Severity classification
   - Estimated timeline for fix

3. **Progress Updates**: We will keep you informed of progress towards a fix and announcement

4. **Resolution**: Once the vulnerability is fixed:
   - We will notify you before public disclosure
   - We will credit you in the security advisory (unless you prefer to remain anonymous)
   - We will publish a security advisory on GitHub

### Severity Classification

We use the CVSS 3.1 scoring system to classify vulnerabilities:

- **Critical** (9.0-10.0): Immediate fix required, embargo until patch released
- **High** (7.0-8.9): Fix within 7 days, coordinated disclosure
- **Medium** (4.0-6.9): Fix within 30 days
- **Low** (0.1-3.9): Fix in next regular release

## Security Best Practices for Users

When using USWDS Web Components in your application:

### 1. Keep Dependencies Updated

```bash
# Check for security vulnerabilities
npm audit

# Update to latest secure versions
npm update

# Or with pnpm
pnpm audit
pnpm update
```

### 2. Content Security Policy (CSP)

Implement a strict CSP to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';">
```

**Note**: `unsafe-inline` and `unsafe-eval` are required for USWDS JavaScript functionality.

### 3. Input Validation

Always validate and sanitize user input before passing to components:

```typescript
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// ❌ UNSAFE - Direct user input
const unsafe = html`<usa-alert>${userInput}</usa-alert>`;

// ✅ SAFE - Sanitized input
import DOMPurify from 'dompurify';
const safe = html`<usa-alert>${DOMPurify.sanitize(userInput)}</usa-alert>`;
```

### 4. Subresource Integrity (SRI)

If loading from CDN, use SRI hashes:

```html
<script src="https://cdn.example.com/uswds-wc.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### 5. Regular Security Audits

- Run `npm audit` or `pnpm audit` regularly
- Enable Dependabot alerts in your repository
- Review dependency licenses and security advisories

## Security Features

USWDS Web Components includes the following security features:

### Built-in Protections

- **Light DOM** - No shadow DOM isolation issues
- **USWDS CSS** - Trusted, government-tested styles
- **Sanitized Attributes** - Proper attribute escaping
- **CSP Compatible** - Works with strict CSP (with exceptions noted)
- **No eval()** - No use of `eval()` or `Function()` constructors (except USWDS JS)

### Automated Security

- **CodeQL Analysis** - Automated code scanning on every commit
- **Dependency Scanning** - Daily security vulnerability checks
- **OWASP Dependency Check** - Weekly dependency vulnerability analysis
- **Snyk Security Scan** - Continuous security monitoring
- **Dependabot Alerts** - Automatic security update PRs

## Security Disclosure Policy

### Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent
3. **Day 3-7**: Initial assessment and fix development
4. **Day 7-30**: Fix testing and validation
5. **Day 30**: Public disclosure (or sooner if critical)

### Public Disclosure

After a fix is available:

1. We publish a **GitHub Security Advisory**
2. We release a **patch version** with the fix
3. We update this **SECURITY.md** with details (if appropriate)
4. We credit the reporter (unless anonymity requested)

### Embargo Period

For **critical vulnerabilities**, we request:

- **14-day embargo** minimum before public disclosure
- Coordination with us on disclosure timing
- Opportunity to prepare and distribute patches

## Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

<!-- Will be populated when we have security reports -->

_No vulnerabilities reported yet. Be the first to make our project more secure!_

## Security Resources

- **GitHub Security Advisories**: [View Advisories](https://github.com/barbaradenney/uswds-wc/security/advisories)
- **npm Advisories**: [View on npm](https://www.npmjs.com/package/uswds-webcomponents?activeTab=security)
- **USWDS Security**: [USWDS Security Guidance](https://designsystem.digital.gov/)

## Contact

- **Security Email**: security@[your-domain].com
- **GitHub Security**: Use [Security Advisories](https://github.com/barbaradenney/uswds-wc/security)
- **PGP Key**: Available upon request

## Acknowledgments

This security policy is based on industry best practices and draws inspiration from:

- [GitHub's Security Policy Template](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)
- [OWASP Vulnerability Disclosure Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

---

**Last Updated**: 2025-10-24
**Version**: 1.0
