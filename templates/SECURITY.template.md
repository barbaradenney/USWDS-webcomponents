# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
{{#each security.supportedVersions}}
| {{version}} | {{emoji}} |
{{/each}}

## Reporting a Vulnerability

We take the security of {{project.name}} seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Disclose Publicly

Please do not create a public GitHub issue for security vulnerabilities. This could put users at risk.

### 2. Report Privately

Send vulnerability reports to: **{{contact.security.email}}**

Include in your report:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)
- Your contact information

### 3. Response Timeline

We will acknowledge your email within **{{security.responseTimeline.acknowledgment.duration}}** and aim to:

- {{security.responseTimeline.confirmation.description}} within **{{security.responseTimeline.confirmation.duration}}**
- {{security.responseTimeline.fixTimeline.description}} within **{{security.responseTimeline.fixTimeline.duration}}**
- {{security.responseTimeline.patchRelease.description}} as soon as possible (typically within **{{security.responseTimeline.patchRelease.duration}}** {{security.responseTimeline.patchRelease.context}})

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
    "{{project.packageName}}": "{{project.version}}"  // ✅ Specific version
    // Not: "{{project.packageName}}": "*"  // ❌ Wildcard
  }
}
```

### Content Security Policy (CSP)

If using CSP headers, ensure they allow:
- Web Components (custom elements)
- Inline styles (required by {{technology.frameworks.primary}})

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
  src="https://cdn.example.com/{{project.packageName}}/{{project.version}}/index.js"
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
- **{{technology.frameworks.primary}}**: {{technology.dependencies.lit}}
- **{{technology.frameworks.designSystem}}**: {{technology.dependencies.uswds}}

We monitor these dependencies for security issues and update promptly.

### 4. Browser Support

We support modern browsers with Web Components support:
{{#each technology.browserSupport}}
- {{this}}
{{/each}}

Older browsers may have unpatched security vulnerabilities. Consider using polyfills only from trusted sources.

## Security Audit History

| Date       | Type                | Findings | Status   |
|------------|---------------------|----------|----------|
| {{meta.lastUpdated}} | Initial Release     | N/A      | Baseline |

## Vulnerability Disclosure Policy

### Our Commitments

We commit to:
- Respond to security reports within {{security.responseTimeline.acknowledgment.duration}}
- Keep reporters informed of progress
- Credit reporters (unless they prefer anonymity)
- Publish security advisories for confirmed vulnerabilities
- Release patches in a timely manner

### Scope

**In Scope:**
{{#each security.scope.inScope}}
- {{this}}
{{/each}}

**Out of Scope:**
{{#each security.scope.outOfScope}}
- {{this}}
{{/each}}

## Security Resources

- [OWASP Web Security Testing Guide]({{links.resources.owasp}})
- [NIST Cybersecurity Framework]({{links.resources.nist}})
- [CWE Common Weakness Enumeration]({{links.resources.cwe}})
- [USWDS Security Guidelines]({{links.documentation.uswds}})

## Contact

For security concerns, contact:
- **Email**: {{contact.security.email}}
{{#if contact.security.pgpKey}}
- **PGP Key**: {{contact.security.pgpKey}}
{{/if}}

For general questions, use [GitHub Discussions]({{project.repository.discussions}}).

---

**Last Updated**: {{meta.lastUpdated}}
**Policy Version**: {{meta.version}}

<!-- Generated from {{meta.generatedFrom}} on {{meta.lastUpdated}} -->
