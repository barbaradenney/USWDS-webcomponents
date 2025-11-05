# Language Selection Pattern

USA Language Selector Pattern

**Type**: Workflow Pattern

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `variant` | `'two-languages' | 'dropdown' | 'unstyled'` | Variant of the language selector |
| `small` | `any` | Whether to show the small variant |
| `buttonText` | `any` | Text for the dropdown button |
| `persistPreference` | `any` | Whether to persist language preference to localStorage |
| `storageKey` | `any` | LocalStorage key for persisting language preference |
| `updateDocumentLang` | `any` | Whether to update document html[lang] attribute |

## Public API Methods

### `setLanguages(languages: Array<{ code: string; name: string; nativeName: string; href?: string }>): void`

Set available languages

### `getCurrentLanguageCode(): void`

Get current language code

### `getCurrentLanguage(): void`

Get current language object

### `changeLanguage(code: string): void`

Programmatically change language

### `clearPersistedPreference(): void`

Clear persisted preference

## Events

| Event | Type | Description |
|-------|------|-------------|
| `pattern-language-change` | `CustomEvent` | Fired when user selects a new language |
| `pattern-ready` | `CustomEvent` | Fired when pattern initializes with current language |

## Examples

### Example 1

```html
<usa-language-selector-pattern></usa-language-selector-pattern>
```

### Example 2

```html
<usa-language-selector-pattern
  persist-preference
></usa-language-selector-pattern>
```

### Example 3

```javascript
const selector = document.querySelector('usa-language-selector-pattern');
selector.setLanguages([
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' }
]);
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
