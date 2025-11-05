# Form Summary Pattern

USA Form Summary Pattern

**Type**: Workflow Pattern

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `sections` | `SummarySection[]` | Summary sections with data |
| `override` | `any` | Title for the summary |
| `showConfirmation` | `any` | Whether to show confirmation message |
| `confirmationTitle` | `any` | Confirmation message title |
| `confirmationType` | `'success' | 'info' | 'warning' | 'error'` | Confirmation message type (success, info, warning, error) |
| `showPrint` | `any` | Whether to show print button |
| `showDownload` | `any` | Whether to show download button |
| `showEdit` | `any` | Whether to show edit buttons on each field |
| `printButtonLabel` | `any` | Label for print button |
| `downloadButtonLabel` | `any` | Label for download button |

## Public API Methods

### `getSummaryData(): void`

Get current summary data

### `setSummaryData(sections: SummarySection[]): void`

Set summary data

### `addSection(section: SummarySection): void`

Add a section

### `clearSummary(): void`

Clear all sections

### `print(): void`

Trigger print

### `download(): void`

Trigger download

## Events

| Event | Type | Description |
|-------|------|-------------|
| `edit-field` | `CustomEvent` | Fired when user clicks edit on a field |
| `print-summary` | `CustomEvent` | Fired when user clicks print |
| `download-summary` | `CustomEvent` | Fired when user clicks download |
| `pattern-ready` | `CustomEvent` | Fired when pattern initializes |

## Examples

### Example 1

```typescript
interface SummarySection {
  heading: string;
  items: SummaryItem[];
}
```

### Example 2

```typescript
interface SummaryItem {
  label: string;
  value: string;
  onEdit?: () => void;
}
```

### Example 3

```html
<usa-form-summary-pattern
  .sections="${sections}"
></usa-form-summary-pattern>
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
- ✅ Event emission (pattern-ready, change events)
- ✅ USWDS component composition
- ✅ Data immutability

---

*Generated from pattern implementation and contract tests*
*Last updated: 2025-11-05*
