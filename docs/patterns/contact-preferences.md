# Contact Preferences Pattern

USA Contact Preferences Pattern

**Type**: Data Collection Pattern

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Label for the contact preferences section |
| `hint` | `any` | Hint text explaining contact expectations |
| `required` | `any` | Whether at least one method selection is required |
| `showAdditionalInfo` | `any` | Whether to show additional information textarea |
| `methods` | `any` | Custom contact methods (if not provided, uses default) |

## Public API Methods

### `getPreferencesData(): void`

Get current preferences data

### `setPreferencesData(data: ContactPreferencesData): void`

Set preferences data

### `clearPreferences(): void`

Clear preferences

### `getSelectedMethodCount(): void`

Get selected method count

### `isMethodSelected(method: string): void`

Check if specific method is selected

### `validatePreferences(): void`

Validate preferences

### Standard Data Pattern APIs

As a data collection pattern, this pattern implements:

- `getData()` - Retrieve collected data
- `setData(data)` - Populate pattern with data
- `clear()` - Clear all collected data
- `validate()` - Validate collected data

## Events

| Event | Type | Description |
|-------|------|-------------|
| `preferences-change` | `CustomEvent` | Fired when preferences change |
| `pattern-ready` | `CustomEvent` | Fired when pattern initializes |

## Examples

### Example 1

```html
<usa-contact-preferences-pattern
  label="How would you like to be contacted?"
></usa-contact-preferences-pattern>
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
