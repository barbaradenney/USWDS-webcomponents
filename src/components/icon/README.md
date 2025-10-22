---
meta:
  title: USAIcon
  component: usa-icon
---

# USAIcon

A USWDS icon component built with Lit Element.

## Usage

```html
<!-- Basic usage with sprite file (recommended) -->
<usa-icon name="mail" size="5" aria-label="Email"></usa-icon>

<!-- Decorative icon (no aria-label needed) -->
<usa-icon name="search" decorative="true"></usa-icon>

<!-- Different sizes (3-9) -->
<usa-icon name="phone" size="3"></usa-icon>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/icon/index.js';
```

## Available Icons

The component supports **all 241 USWDS icons** from the official sprite file.

### Icon Naming Conventions

**IMPORTANT**: Always use official USWDS icon names (e.g., `mail`, not `email`).

Common icons include:
- Communication: `mail`, `phone`, `chat`, `comment`, `forum`
- Navigation: `arrow_forward`, `arrow_back`, `menu`, `close`, `expand_more`
- Actions: `search`, `edit`, `delete`, `add`, `remove`, `check`
- Status: `check_circle`, `error`, `warning`, `info`, `help`
- File: `file_download`, `file_upload`, `folder`, `attach_file`
- Social: `facebook`, `twitter`, `instagram`, `github`, `youtube`

For the complete list of all 241 icons, see:
- USWDS Icon Gallery: https://designsystem.digital.gov/components/icon/
- Icon Gallery story in Storybook: http://localhost:6006/?path=/story/data-display-icon--icon-gallery

### Migration from Old Names

If you previously used non-USWDS icon names:

| Old Name | ✅ Correct USWDS Name |
|----------|----------------------|
| `email` | `mail` |
| `e-mail` | `mail` |
| `envelope` | `mail` |

**Validation**: Run `npm run validate:icon-names` to check all icon references in your code.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `any` | `''` | Property description |
| `size` | `'' | '3' | '4' | '5' | '6' | '7' | '8' | '9'` | `''` | Property description |
| `decorative` | `'true' | 'false' | ''` | `''` | Property description |
| `spriteUrl` | `any` | `'/img/sprite.svg'` | Property description |
| `useSprite` | `any` | `true` | Property description |

## Events

| Event | Type | Description |
|-------|------|-------------|
| No custom events | | |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Icon - U.S. Web Design System](https://designsystem.digital.gov/components/icon/)
- [Icon Guidance](https://designsystem.digital.gov/components/icon/#guidance)
- [Icon Accessibility](https://designsystem.digital.gov/components/icon/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/icon/usa-icon.test.ts
```

## Storybook

View component examples: [USAIcon Stories](http://localhost:6006/?path=/story/components-icon)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-10-21_
