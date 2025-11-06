# Name Pattern

USA Name Pattern

**Type**: Data Collection Pattern

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | `'- Select -' },
      { value: 'Jr.', label: 'Jr.' },
      { value: 'Sr.', label: 'Sr.' },
      { value: 'II', label: 'II' },
      { value: 'III', label: 'III' },
      { value: 'IV', label: 'IV' },
      { value: 'V', label: 'V' },
    ]` | Label for the name section |
| `get` | `any` | Name format: 'full' (single field), 'separate' (given/family), 'flexible' (both options) |
| `required` | `any` | Whether name fields are required |
| `get` | `any` | Whether to show middle name field (only for 'separate' or 'flexible') |
| `get` | `any` | Whether to show suffix field (only for 'separate' or 'flexible') |
| `get` | `any` | Whether to show preferred name field |

## Public API Methods

### `getNameData(): void`

Get current name data

### `setNameData(data: NameData): void`

Set name data

### `clearName(): void`

Clear name

### `validateName(): void`

Validate name

### `getFormattedName(): void`

Get formatted name for display

### Standard Data Pattern APIs

As a data collection pattern, this pattern implements:

- `getData()` - Retrieve collected data
- `setData(data)` - Populate pattern with data
- `clear()` - Clear all collected data
- `validate()` - Validate collected data

## Events

| Event | Type | Description |
|-------|------|-------------|
| `name-change` | `CustomEvent` | Fired when name data changes |
| `pattern-ready` | `CustomEvent` | Fired when pattern initializes |

## Examples

### Example 1

```html
<usa-name-pattern
  format="full"
  required
></usa-name-pattern>
```

### Example 2

```html
<usa-name-pattern
  format="separate"
  show-middle
  show-suffix
  required
></usa-name-pattern>
```

### Example 3

```html
<usa-name-pattern
  format="separate"
  show-preferred
></usa-name-pattern>
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
