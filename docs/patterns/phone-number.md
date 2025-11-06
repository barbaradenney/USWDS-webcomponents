# Phone Number Pattern

USA Phone Number Pattern

**Type**: Data Collection Pattern

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | `any` | Label for the phone number section |
| `required` | `any` | Whether phone number is required |
| `get` | `any` | Whether to show extension field |
| `get` | `any` | Whether to show phone type selector |
| `get` | `any` | Whether SMS capability is required |

## Public API Methods

### `getPhoneData(): void`

Get current phone data

### `setPhoneData(data: PhoneNumberData): void`

Set phone data

### `clearPhoneNumber(): void`

Clear phone number

### `validatePhoneNumber(): void`

Validate phone number

### `getFormattedPhoneNumber(): void`

Get formatted phone number

### `getRawPhoneNumber(): void`

Get raw phone digits (no formatting)

### Standard Data Pattern APIs

As a data collection pattern, this pattern implements:

- `getData()` - Retrieve collected data
- `setData(data)` - Populate pattern with data
- `clear()` - Clear all collected data
- `validate()` - Validate collected data

## Events

| Event | Type | Description |
|-------|------|-------------|
| `phone-change` | `CustomEvent` | Fired when phone data changes |
| `pattern-ready` | `CustomEvent` | Fired when pattern initializes |

## Examples

### Example 1

```html
<usa-phone-number-pattern
  label="Primary Phone"
  required
></usa-phone-number-pattern>
```

### Example 2

```html
<usa-phone-number-pattern
  label="Office Phone"
  show-extension
  show-type
></usa-phone-number-pattern>
```

### Example 3

```html
<usa-phone-number-pattern
  label="Mobile Phone"
  show-type
  sms-required
  required
></usa-phone-number-pattern>
```

## USWDS Alignment

This pattern aligns with USWDS design patterns:
- Uses official USWDS components
- Follows USWDS accessibility standards
- Implements USWDS structural patterns
- Maintains USWDS visual consistency

## Contract Compliance

This pattern passes all contract tests:
- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Standard data pattern APIs
- ✅ Required properties (label, required)
- ✅ Event emission (pattern-ready, change events)
- ✅ USWDS component composition
- ✅ Data immutability

---

*Generated from pattern implementation and contract tests*
*Last updated: 2025-11-05*
