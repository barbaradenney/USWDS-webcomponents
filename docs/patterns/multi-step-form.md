# Multi Step Form Pattern

USA Multi-Step Form Pattern

**Type**: Workflow Pattern

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `steps` | `FormStep[]` | Array of form steps |
| `showNavigation` | `any` | Whether to show navigation buttons |
| `backButtonLabel` | `any` | Label for the back button |
| `nextButtonLabel` | `any` | Label for the next button |
| `skipButtonLabel` | `any` | Label for the skip button (shown for optional steps) |
| `submitButtonLabel` | `any` | Label for the submit button (shown on final step) |
| `persistState` | `any` | Whether to persist form state to localStorage |
| `storageKey` | `any` | LocalStorage key for persisting state |

## Public API Methods

### `setSteps(steps: FormStep[]): void`

Set form steps

### `goToStep(stepIndex: number): void`

Navigate to specific step by index

### `getCurrentStepIndex(): void`

Get current step index

### `getCurrentStepData(): void`

Get current step data

### `clearPersistedState(): void`

Clear persisted state

### `reset(): void`

Reset to first step

## Events

| Event | Type | Description |
|-------|------|-------------|
| `step-change` | `CustomEvent` | Fired when user navigates to a different step |
| `form-complete` | `CustomEvent` | Fired when user reaches the final step |
| `pattern-ready` | `CustomEvent` | Fired when pattern initializes |

## Examples

### Example 1

```typescript
interface FormStep {
  id: string;
  label: string;
  optional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}
```

### Example 2

```html
<usa-multi-step-form-pattern id="myForm">
  <div slot="step-personal-info">
    <h2>Personal Information</h2>
    <usa-text-input label="Full Name" required></usa-text-input>
    <usa-text-input label="Email" type="email" required></usa-text-input>
  </div>

  <div slot="step-address">
    <h2>Address</h2>
    <usa-address-pattern required></usa-address-pattern>
  </div>

  <div slot="step-review">
    <h2>Review Your Information</h2>
    <p>Please review your information before submitting.</p>
  </div>
</usa-multi-step-form-pattern>

<script>
  const form = document.getElementById('myForm');

  // Configure steps
  form.steps = [
    { id: 'personal-info', label: 'Personal Information' },
    { id: 'address', label: 'Address' },
    { id: 'review', label: 'Review' }
  ];
</script>
```

### Example 3

```html
<usa-multi-step-form-pattern id="myForm">
  <div slot="step-personal-info">
    <h2>Personal Information</h2>
    <usa-text-input id="name" label="Full Name" required></usa-text-input>
  </div>

  <div slot="step-contact">
    <h2>Contact Details</h2>
    <usa-text-input id="email" label="Email" type="email" required></usa-text-input>
  </div>
</usa-multi-step-form-pattern>

<script>
  const form = document.getElementById('myForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  form.steps = [
    {
      id: 'personal-info',
      label: 'Personal Information',
      validate: () => {
        return nameInput.value.trim().length > 0;
      }
    },
    {
      id: 'contact',
      label: 'Contact Details',
      validate: async () => {
        // Can be async for API validation
        const email = emailInput.value;
        return email.includes('@') && email.includes('.');
      }
    }
  ];
</script>
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
