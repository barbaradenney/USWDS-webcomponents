# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |

| 1.x.x | :white_check_mark: |

| < 1.0 | :x: |


## Reporting a Vulnerability

We take the security of USWDS Web Components seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Disclose Publicly

Please do not create a public GitHub issue for security vulnerabilities. This could put users at risk.

### 2. Report Privately

Send vulnerability reports to: **barbaradenney@users.noreply.github.com**

Include in your report:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)
- Your contact information

### 3. Response Timeline

We will acknowledge your email within **48 hours** and aim to:

- Confirm the vulnerability within **7 days**
- Provide a fix timeline within **14 days**
- Release a patch as soon as possible (typically within **30 days** for critical issues)

### 4. Credit

We will acknowledge your responsible disclosure in:
- The security advisory
- The CHANGELOG for the patched release
- Our project README (unless you prefer to remain anonymous)

## Security Best Practices for Users

### Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update to latest secure versions
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

### Use Specific Versions

Avoid wildcards in production:

```json
{
  "dependencies": {
    "uswds-webcomponents": "1.0.0"  // ✅ Specific version
    // Not: "uswds-webcomponents": "*"  // ❌ Wildcard
  }
}
```

### Content Security Policy (CSP)

If using CSP headers, ensure they allow:
- Web Components (custom elements)
- Inline styles (required by Lit Element)

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
```

### Subresource Integrity (SRI)

If loading from a CDN, use SRI hashes:

```html
<script
  src="https://cdn.example.com/uswds-webcomponents/1.0.0/index.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

## Known Security Considerations

### 1. Light DOM Usage

This library uses Light DOM (not Shadow DOM) to maintain USWDS compatibility. This means:

- Styles are not encapsulated
- User-provided content is not isolated
- **Always sanitize user input** before rendering

### 2. User-Provided Content

When using slots or properties that accept HTML:

```typescript
// ❌ UNSAFE - XSS vulnerability
<usa-alert>${unsafeUserInput}</usa-alert>

// ✅ SAFE - Sanitize first
import DOMPurify from 'dompurify';
<usa-alert>${DOMPurify.sanitize(userInput)}</usa-alert>
```

### 3. Third-Party Dependencies

This project depends on:
- **Lit Element**: ^3.0.0
- **U.S. Web Design System (USWDS)**: @uswds/uswds ^3.13.0

We monitor these dependencies for security issues and update promptly.

### 4. Browser Support

We support modern browsers with Web Components support:

- Chrome/Edge 67+

- Firefox 63+

- Safari 10.1+


Older browsers may have unpatched security vulnerabilities. Consider using polyfills only from trusted sources.

## Security Audit History

| Date       | Type                | Findings | Status   |
|------------|---------------------|----------|----------|
| 2025-10-18 | Initial Release     | N/A      | Baseline |

## Vulnerability Disclosure Policy

### Our Commitments

We commit to:
- Respond to security reports within 48 hours
- Keep reporters informed of progress
- Credit reporters (unless they prefer anonymity)
- Publish security advisories for confirmed vulnerabilities
- Release patches in a timely manner

### Scope

**In Scope:**

- Cross-Site Scripting (XSS)

- Code injection

- Authentication bypass

- Privilege escalation

- Denial of Service (DoS)

- Data exposure

- Dependency vulnerabilities


**Out of Scope:**

- Social engineering

- Physical attacks

- Spam or abuse of services

- Issues in third-party dependencies (report to them directly)

- Issues requiring compromised user credentials


## Security Resources

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Common Weakness Enumeration](https://cwe.mitre.org/)
- [USWDS Security Guidelines](https://designsystem.digital.gov/)

## Contact

For security concerns, contact:
- **Email**: barbaradenney@users.noreply.github.com


For general questions, use [GitHub Discussions](https://github.com/barbaradenney/USWDS-webcomponents/discussions).

---

**Last Updated**: 2025-10-18
**Policy Version**: 1.0.0

<!-- Generated from .project-metadata.json on 2025-10-18 -->
