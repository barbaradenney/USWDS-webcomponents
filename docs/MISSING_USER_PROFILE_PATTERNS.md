# Missing USWDS User Profile Patterns - Implementation Guide

## Overview

This document details the 5 missing user profile patterns from USWDS that need to be implemented to achieve complete parity with the official USWDS pattern library.

**Current Status**: 4/9 patterns implemented (44% complete)
**Missing**: 5 patterns (56%)

---

## Pattern 1: Email Address Pattern ⭐ TIER 1

**Priority**: HIGH - Essential for most user profiles
**Complexity**: LOW
**URL**: https://designsystem.digital.gov/patterns/create-a-user-profile/email-address/

### Fields Required:

```typescript
interface EmailAddressData {
  email: string;
  sensitiveInfoConsent?: 'yes-info' | 'no-info' | '';
}
```

### Field Specifications:

1. **Email Address Input**
   - Name: `email`
   - Type: `usa-text-input` with `type="email"`
   - Required: Yes
   - Attributes: `autocapitalize="off"`, `autocorrect="off"`
   - Validation: Must contain @ with characters before/after
   - Max length: 256 characters
   - Label: "Email address"

2. **Sensitive Information Consent** (Optional section)
   - Name: `sensitiveInfoConsent`
   - Type: `usa-radio` (radio button group)
   - Options:
     - `yes-info`: "Yes, you may send sensitive information via email"
     - `no-info`: "No, please do not send sensitive information via email"
   - When to show: Only when planning to send potentially sensitive content

### Properties:

```typescript
@property({ type: String }) label = 'Email address';
@property({ type: Boolean }) required = true;
@property({ type: Boolean, attribute: 'show-consent' }) showConsent = false;
@property({ type: String }) consentLabel = 'May we send sensitive information to this email?';
```

### Validation Rules:

- Email format validation (contains @ with characters before/after)
- Support common email provider misspellings (gmail.con → gmail.com)
- Allow characters: letters, numbers, hyphens, underscores, plus signs, periods
- No TLD restrictions (allow all valid TLDs)

### Special Considerations:

- Allow email pasting and autocomplete
- Explain why email is needed
- Privacy considerations for shared email addresses
- Email verification link for account creation

---

## Pattern 2: Date of Birth Pattern ⭐ TIER 1

**Priority**: HIGH - Very commonly required
**Complexity**: MEDIUM
**URL**: https://designsystem.digital.gov/patterns/create-a-user-profile/date-of-birth/

### Fields Required:

```typescript
interface DateOfBirthData {
  month: string;  // "01" through "12"
  day: string;    // "01" through "31"
  year: string;   // "YYYY" (4 digits)
}
```

### Field Specifications:

1. **Month Select**
   - Name: `date_of_birth_month`
   - Type: `usa-select`
   - Required: Yes
   - Options:
     - Default: "- Select -"
     - Values: "01 - January" through "12 - December"
   - Label: "Month"

2. **Day Input**
   - Name: `date_of_birth_day`
   - Type: `usa-text-input`
   - Required: Yes
   - Attributes: `type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`, `maxlength="2"`
   - Label: "Day"

3. **Year Input**
   - Name: `date_of_birth_year`
   - Type: `usa-text-input`
   - Required: Yes
   - Attributes: `type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`, `minlength="4"`, `maxlength="4"`
   - Label: "Year"

### Properties:

```typescript
@property({ type: String }) label = 'Date of birth';
@property({ type: Boolean }) required = true;
@property({ type: String }) hint = 'For example: January 19 2000';
```

### Validation Rules:

- Month: Must be 01-12
- Day: Must be 01-31 (validate based on month/year)
- Year: Must be 4 digits
- Date must be valid (e.g., no February 30)
- Consider leap years for February 29

### Accessibility Requirements:

- **CRITICAL**: Do NOT use JavaScript to auto-advance focus
- Use `type="text"` with `inputmode="numeric"` (NOT `type="number"`)
- Always include visible labels
- Avoid auto-submission
- Group fields in a fieldset with legend

---

## Pattern 3: Sex Pattern ⭐ TIER 2

**Priority**: MEDIUM - Required for certain government forms
**Complexity**: LOW
**URL**: https://designsystem.digital.gov/patterns/create-a-user-profile/sex/

### Fields Required:

```typescript
interface SexData {
  sex: 'male' | 'female' | '';
}
```

### Field Specifications:

1. **Sex Radio Group**
   - Name: `sex`
   - Type: `usa-radio` (radio button group)
   - Required: Depends on use case
   - Options:
     - `male`: "Male"
     - `female`: "Female"
   - Label: "Sex"
   - Hint: "Please select your sex from the following options. Why do we ask for sex information?"

### Properties:

```typescript
@property({ type: String }) label = 'Sex';
@property({ type: Boolean }) required = false;
@property({ type: Boolean, attribute: 'show-why-link' }) showWhyLink = true;
@property({ type: String, attribute: 'why-url' }) whyUrl = '';
```

### CRITICAL Requirements:

- **Use "sex" terminology ONLY** - Do NOT use "gender"
- **Only provide "Male" and "Female" options** - Do NOT include:
  - "Prefer not to answer"
  - "X" or non-binary options
  - Other options
- **Explain why you're asking** - Include helper text/modal explaining data usage
- If you're considering "prefer not to answer", reconsider if the question is needed at all

### Special Considerations:

- Use tested translations for multilingual forms
- Provide modal explaining why sex information is collected
- Explain how data will be shared/used

---

## Pattern 4: Social Security Number Pattern ⭐ TIER 2

**Priority**: MEDIUM - Important for government services
**Complexity**: MEDIUM (security considerations)
**URL**: https://designsystem.digital.gov/patterns/create-a-user-profile/social-security-number/

### Fields Required:

```typescript
interface SSNData {
  ssn: string;  // Format: XXX-XX-XXXX or XXXXXXXXX
}
```

### Field Specifications:

1. **SSN Input**
   - Name: `social-security-no`
   - Type: `usa-text-input` with `class="usa-input--xl"`
   - Required: Depends on use case
   - Attributes: `type="text"`, `inputmode="numeric"`, `pattern="[0-9-\\s]*"`
   - Label: "Social Security Number"
   - Hint: "For example, 555 11 0000"
   - Max length: 11 characters (with hyphens)

### Properties:

```typescript
@property({ type: String }) label = 'Social Security Number';
@property({ type: Boolean }) required = false;
@property({ type: Boolean, attribute: 'mask-input' }) maskInput = true;
@property({ type: Boolean, attribute: 'show-unmask-toggle' }) showUnmaskToggle = true;
@property({ type: String }) hint = 'For example, 555 11 0000';
```

### Format Requirements:

- Accept: `XXX-XX-XXXX`, `XXX XX XXXX`, or `XXXXXXXXX`
- Display format: `___ __ ____` (with masking)
- Maximum fault tolerance - accept with/without hyphens and spaces

### Security Requirements:

- **Input masking recommended** - Guide proper entry
- **Avoid obfuscation by default** - Don't hide characters like passwords
- **If obfuscation used**: Provide easy toggle to disable for verification
- **Client-side AND server-side validation**
- **Explain why SSN is needed** and how privacy will be protected

### CRITICAL Considerations:

- **Only collect when ABSOLUTELY required** for identification
- **Acknowledge some users lack SSNs** - Provide alternative verification methods
- **Clearly explain**:
  - Why information is needed
  - How privacy will be secured
  - What will be done with the data

---

## Pattern 5: Race and Ethnicity Pattern ⭐ TIER 3

**Priority**: MEDIUM - Demographic data collection
**Complexity**: HIGH (sensitive data, complex UI)
**URL**: https://designsystem.digital.gov/patterns/create-a-user-profile/race-and-ethnicity/

### Fields Required:

```typescript
interface RaceEthnicityData {
  races: string[];  // Multiple selection
  ethnicity?: string;  // Open-ended text
  preferNotToShare?: boolean;
}
```

### Field Specifications:

1. **Race Checkboxes**
   - Name: `race`
   - Type: `usa-checkbox` (multiple)
   - Required: No (opt-out available)
   - Options:
     - `american-indian`: "American Indian or Alaska Native"
     - `asian`: "Asian"
     - `black`: "Black or African American"
     - `middle-eastern`: "Middle Eastern or North African"
     - `pacific-islander`: "Native Hawaiian or Other Pacific Islander"
     - `white`: "White"
     - `other`: "Some other race"
   - Legend: "Which of the following race classifications best describe you?"
   - Hint: "Select all that apply. For example, 'Black or African American' and 'White'"

2. **Ethnicity Text Input**
   - Name: `ethnicity`
   - Type: `usa-text-input`
   - Required: No
   - Label: "I identify my ethnicity as:"
   - Hint: "You may report more than one ethnicity. For example, 'Hmong and Italian'"

3. **Opt-out Checkbox**
   - Name: `preferNotToShare`
   - Type: `usa-checkbox`
   - Label: "Prefer not to share my race and ethnicity"

### Properties:

```typescript
@property({ type: String }) label = 'Race and ethnicity';
@property({ type: Boolean }) required = false;
@property({ type: String }) raceLabel = 'Which of the following race classifications best describe you?';
@property({ type: String }) ethnicityLabel = 'I identify my ethnicity as:';
@property({ type: Boolean, attribute: 'show-opt-out' }) showOptOut = true;
```

### CRITICAL Requirements:

- **Allow multiple race selections** - Acknowledge multiracial backgrounds
- **Two-part question** - Separate race and ethnicity per OMB requirements
- **Open-ended ethnicity** - Don't restrict to predefined options
- **Provide opt-out** - "Prefer not to share" respects individual dignity
- **Explain why you're asking** - Transparency about data collection purpose
- **Use gender-neutral language** in all options

### Special Considerations:

- OMB standards for federal data collection
- Cultural sensitivity in option wording
- Privacy and dignity considerations
- Clear explanation of how data will be used

---

## Implementation Priority & Roadmap

### Phase 1: Essential Patterns (Week 1-2)
1. ✅ Email Address Pattern - Highest priority, simplest implementation
2. ✅ Date of Birth Pattern - High priority, moderate complexity

### Phase 2: Government Forms (Week 3-4)
3. ✅ Sex Pattern - Medium priority, simple but sensitive
4. ✅ SSN Pattern - Medium priority, security considerations

### Phase 3: Demographic Data (Week 5)
5. ✅ Race and Ethnicity Pattern - Complex, sensitive, opt-in for specific use cases

---

## Common Pattern Architecture

All patterns should follow this structure:

### File Structure:
```
packages/uswds-wc-patterns/src/patterns/{pattern-name}/
├── usa-{pattern-name}-pattern.ts       # Main component
├── usa-{pattern-name}-pattern.test.ts  # Unit tests
├── usa-{pattern-name}-pattern.cy.ts    # Cypress tests
├── usa-{pattern-name}-pattern.stories.ts # Storybook
├── README.mdx                          # Documentation
└── index.ts                            # Export
```

### Standard Pattern API:

```typescript
// Data getter
get{Pattern}Data(): {Pattern}Data

// Data setter
set{Pattern}Data(data: {Pattern}Data): void

// Clear/reset
clear{Pattern}(): void

// Validation
validate{Pattern}(): boolean

// Events
@fires {pattern}-change
@fires pattern-ready
```

### Properties All Patterns Should Have:

```typescript
@property({ type: String }) label = 'Pattern Label';
@property({ type: Boolean }) required = false;
@property({ type: String }) hint = '';
@property({ type: Boolean }) error = false;
@property({ type: String, attribute: 'error-message' }) errorMessage = '';
```

---

## Validation Integration

All new patterns must be added to:

1. **Field Completeness Validator**
   - File: `scripts/validate/validate-pattern-field-completeness.cjs`
   - Add pattern to `PATTERN_FIELD_REQUIREMENTS` object

2. **Pattern Contracts Tests**
   - File: `packages/uswds-wc-patterns/src/patterns/__tests__/pattern-contracts.test.ts`
   - Add to `DATA_PATTERNS` or `WORKFLOW_PATTERNS` arrays

3. **Pattern Standards Validator**
   - File: `scripts/validate/validate-pattern-standards.cjs`
   - Add to `PATTERNS` array

---

## Testing Requirements

Each pattern MUST have:

1. **Unit Tests** (Vitest)
   - Data getter/setter tests
   - Validation tests
   - Event emission tests
   - API contract tests

2. **Component Tests** (Cypress)
   - User interaction tests
   - Keyboard navigation tests
   - Form submission tests
   - Validation UI tests

3. **Accessibility Tests**
   - axe-core integration
   - ARIA attribute verification
   - Keyboard navigation validation

4. **Storybook Stories**
   - Default state
   - All variants
   - Error states
   - Interactive controls

---

## Next Steps

1. Review and approve implementation plan
2. Create pattern generator script for consistent structure
3. Implement patterns in priority order
4. Update validators as each pattern is completed
5. Document patterns in main README
6. Add to pattern showcase in Storybook

---

## References

- [USWDS Patterns Overview](https://designsystem.digital.gov/patterns/)
- [USWDS Create a User Profile Patterns](https://designsystem.digital.gov/patterns/create-a-user-profile/)
- [Existing Pattern Implementations](../../packages/uswds-wc-patterns/src/patterns/)
