# Address Pattern

USA Address Pattern

**Type**: Data Collection Pattern

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | `'- Select -' },
      { value: 'AL', label: 'Alabama' },
      { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' },
      { value: 'AR', label: 'Arkansas' },
      { value: 'CA', label: 'California' },
      { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' },
      { value: 'DE', label: 'Delaware' },
      { value: 'FL', label: 'Florida' },
      { value: 'GA', label: 'Georgia' },
      { value: 'HI', label: 'Hawaii' },
      { value: 'ID', label: 'Idaho' },
      { value: 'IL', label: 'Illinois' },
      { value: 'IN', label: 'Indiana' },
      { value: 'IA', label: 'Iowa' },
      { value: 'KS', label: 'Kansas' },
      { value: 'KY', label: 'Kentucky' },
      { value: 'LA', label: 'Louisiana' },
      { value: 'ME', label: 'Maine' },
      { value: 'MD', label: 'Maryland' },
      { value: 'MA', label: 'Massachusetts' },
      { value: 'MI', label: 'Michigan' },
      { value: 'MN', label: 'Minnesota' },
      { value: 'MS', label: 'Mississippi' },
      { value: 'MO', label: 'Missouri' },
      { value: 'MT', label: 'Montana' },
      { value: 'NE', label: 'Nebraska' },
      { value: 'NV', label: 'Nevada' },
      { value: 'NH', label: 'New Hampshire' },
      { value: 'NJ', label: 'New Jersey' },
      { value: 'NM', label: 'New Mexico' },
      { value: 'NY', label: 'New York' },
      { value: 'NC', label: 'North Carolina' },
      { value: 'ND', label: 'North Dakota' },
      { value: 'OH', label: 'Ohio' },
      { value: 'OK', label: 'Oklahoma' },
      { value: 'OR', label: 'Oregon' },
      { value: 'PA', label: 'Pennsylvania' },
      { value: 'RI', label: 'Rhode Island' },
      { value: 'SC', label: 'South Carolina' },
      { value: 'SD', label: 'South Dakota' },
      { value: 'TN', label: 'Tennessee' },
      { value: 'TX', label: 'Texas' },
      { value: 'UT', label: 'Utah' },
      { value: 'VT', label: 'Vermont' },
      { value: 'VA', label: 'Virginia' },
      { value: 'WA', label: 'Washington' },
      { value: 'WV', label: 'West Virginia' },
      { value: 'WI', label: 'Wisconsin' },
      { value: 'WY', label: 'Wyoming' },
    ]` | Label for the address section |
| `required` | `any` | Whether all fields are required |
| `get` | `any` | Whether to show street line 2 |
| `get` | `any` | Whether to support international addresses |

## Public API Methods

### `getAddressData(): void`

Get current address data

### `setAddressData(data: AddressData): void`

Set address data

### `clearAddress(): void`

Clear address

### `validateAddress(): void`

Validate address

### Standard Data Pattern APIs

As a data collection pattern, this pattern implements:

- `getData()` - Retrieve collected data
- `setData(data)` - Populate pattern with data
- `clear()` - Clear all collected data
- `validate()` - Validate collected data

## Events

| Event | Type | Description |
|-------|------|-------------|
| `address-change` | `CustomEvent` | Fired when address data changes |
| `pattern-ready` | `CustomEvent` | Fired when pattern initializes |

## Examples

### Example 1

```html
<usa-address-pattern
  label="Mailing Address"
  required
></usa-address-pattern>
```

### Example 2

```html
<usa-address-pattern
  label="Shipping Address"
  international
  required
></usa-address-pattern>
```

### Example 3

```html
<usa-address-pattern
  label="Billing Address"
  show-street2="false"
></usa-address-pattern>
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
