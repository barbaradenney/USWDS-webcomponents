# Slot and Composition Testing Strategy

**Problem Solved**: Catches slot rendering issues, Light DOM composition problems, and layout bugs before they reach production.

## Issues We Need to Catch

1. **Slotted Content Not Rendering** - Content passed via slots doesn't appear in DOM
2. **Property Binding Failures** - `.options="${array}"` doesn't work in Light DOM
3. **Flex Layout Breaks** - Components with `display: block` break flex containers
4. **Component Composition** - Child components don't render or initialize correctly
5. **CSS Cascade Issues** - Styles don't apply to composed components in Light DOM

## Testing Strategy Layers

### Layer 1: Unit Tests (Vitest) - Component Rendering

**Purpose**: Verify component renders correct DOM structure with slotted content.

**What to Test**:
- Slotted content appears in final DOM
- Property bindings create expected elements
- Child components are present in DOM tree
- Light DOM structure is correct

**Example Test Pattern**:

```typescript
describe('usa-select - Slot Rendering', () => {
  it('should render slotted options in select element', async () => {
    const select = document.createElement('usa-select');
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    await select.updateComplete;

    // Verify slotted content rendered
    const nativeSelect = select.querySelector('select');
    const options = nativeSelect?.querySelectorAll('option');

    expect(options?.length).toBe(2);
    expect(options?.[0].textContent).toBe('Option 1');
    expect(options?.[1].value).toBe('2');
  });

  it('should render options from .options property', async () => {
    const select = document.createElement('usa-select');
    select.options = [
      { value: '01', text: '01 - January' },
      { value: '02', text: '02 - February' }
    ];
    document.body.appendChild(select);
    await select.updateComplete;

    const nativeSelect = select.querySelector('select');
    const options = nativeSelect?.querySelectorAll('option');

    expect(options?.length).toBe(2);
    expect(options?.[0].textContent).toBe('01 - January');
  });

  it('should render both property options and slotted options', async () => {
    const select = document.createElement('usa-select');
    select.options = [{ value: '1', text: 'From Property' }];
    select.innerHTML = `<option value="2">From Slot</option>`;
    document.body.appendChild(select);
    await select.updateComplete;

    const options = select.querySelectorAll('option');
    expect(options.length).toBe(2);
  });
});
```

### Layer 2: Component Integration Tests - Composition

**Purpose**: Verify components work correctly when composed together (patterns using form components).

**What to Test**:
- Child components initialize and render
- Event bubbling works through composition
- Data flows correctly between parent and children
- Child component APIs are accessible

**Example Test Pattern**:

```typescript
describe('usa-date-of-birth-pattern - Component Composition', () => {
  it('should render all child components', async () => {
    const pattern = document.createElement('usa-date-of-birth-pattern');
    document.body.appendChild(pattern);
    await pattern.updateComplete;

    // Verify child components exist and initialized
    const monthSelect = pattern.querySelector('usa-select[name="date_of_birth_month"]');
    const dayInput = pattern.querySelector('usa-text-input[name="date_of_birth_day"]');
    const yearInput = pattern.querySelector('usa-text-input[name="date_of_birth_year"]');

    expect(monthSelect).toBeTruthy();
    expect(dayInput).toBeTruthy();
    expect(yearInput).toBeTruthy();

    // Wait for child components to initialize
    await Promise.all([
      (monthSelect as any)?.updateComplete,
      (dayInput as any)?.updateComplete,
      (yearInput as any)?.updateComplete
    ]);

    // Verify child components rendered their internal structure
    expect(monthSelect?.querySelector('select')).toBeTruthy();
    expect(dayInput?.querySelector('input')).toBeTruthy();
    expect(yearInput?.querySelector('input')).toBeTruthy();
  });

  it('should propagate events from child components', async () => {
    const pattern = document.createElement('usa-date-of-birth-pattern');
    document.body.appendChild(pattern);
    await pattern.updateComplete;

    const changeEvents: any[] = [];
    pattern.addEventListener('dob-change', (e: Event) => {
      changeEvents.push((e as CustomEvent).detail);
    });

    // Trigger change on child component
    const monthSelect = pattern.querySelector('usa-select') as any;
    await monthSelect?.updateComplete;

    const nativeSelect = monthSelect?.querySelector('select');
    nativeSelect.value = '05';
    nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(changeEvents.length).toBeGreaterThan(0);
    expect(changeEvents[0].field).toBe('month');
    expect(changeEvents[0].value).toBe('05');
  });

  it('should allow programmatic access to child component APIs', async () => {
    const pattern = document.createElement('usa-date-of-birth-pattern');
    document.body.appendChild(pattern);
    await pattern.updateComplete;

    const monthSelect = pattern.querySelector('usa-select[name="date_of_birth_month"]') as any;

    // Verify child component public API works
    expect(typeof monthSelect?.reset).toBe('function');

    monthSelect.value = '05';
    await monthSelect.updateComplete;
    expect(monthSelect.value).toBe('05');

    monthSelect.reset();
    await monthSelect.updateComplete;
    expect(monthSelect.value).toBe('');
  });
});
```

### Layer 3: Layout Tests - Visual Structure

**Purpose**: Verify components render in correct layout (flex, grid, inline, etc).

**What to Test**:
- Components participate correctly in flex/grid layouts
- Width/height calculations are correct
- Display properties work as expected
- No layout shifts or reflows

**Example Test Pattern**:

```typescript
describe('usa-select - Layout Behavior', () => {
  it('should participate in flex layout correctly', async () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.innerHTML = `
      <usa-select name="month" style="flex: 1;"></usa-select>
      <usa-text-input name="day" style="flex: 1;"></usa-text-input>
      <usa-text-input name="year" style="flex: 1;"></usa-text-input>
    `;
    document.body.appendChild(container);

    const components = container.querySelectorAll('usa-select, usa-text-input');
    await Promise.all(Array.from(components).map((c: any) => c.updateComplete));

    // Verify components are flex items
    const styles = Array.from(components).map(c => window.getComputedStyle(c));
    styles.forEach(style => {
      expect(style.display).toBe('inline-block'); // Should be inline-block to work in flex
      expect(style.width).toBe('100%'); // Should fill available space
    });

    // Verify all components have similar heights (flex alignment)
    const heights = styles.map(s => parseInt(s.height));
    const maxHeight = Math.max(...heights);
    const minHeight = Math.min(...heights);
    expect(maxHeight - minHeight).toBeLessThan(5); // Within 5px
  });

  it('should maintain full width in block layout', async () => {
    const select = document.createElement('usa-select');
    document.body.appendChild(select);
    await select.updateComplete;

    const style = window.getComputedStyle(select);
    expect(style.width).toBe('100%');
  });

  it('should not cause layout shifts when initialized', async () => {
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.appendChild(container);

    const initialHeight = container.offsetHeight;

    const select = document.createElement('usa-select');
    select.label = 'Test';
    container.appendChild(select);

    const heightBeforeUpdate = container.offsetHeight;
    await select.updateComplete;
    const heightAfterUpdate = container.offsetHeight;

    // Height should only change once (when added), not after updateComplete
    expect(heightBeforeUpdate).toBe(heightAfterUpdate);
  });
});
```

### Layer 4: USWDS Compliance Tests - Structure

**Purpose**: Verify components match official USWDS HTML structure.

**What to Test**:
- Correct USWDS class names
- Proper element hierarchy
- ARIA attributes present
- Form structure (fieldset, legend, etc)

**Example Test Pattern**:

```typescript
describe('usa-date-of-birth-pattern - USWDS Structure Compliance', () => {
  it('should use correct USWDS memorable date structure', async () => {
    const pattern = document.createElement('usa-date-of-birth-pattern');
    document.body.appendChild(pattern);
    await pattern.updateComplete;

    // Verify top-level structure
    const fieldset = pattern.querySelector('fieldset.usa-fieldset');
    expect(fieldset).toBeTruthy();

    const legend = fieldset?.querySelector('legend.usa-legend.usa-legend--large');
    expect(legend).toBeTruthy();

    // Verify memorable date wrapper
    const memorableDate = fieldset?.querySelector('.usa-memorable-date');
    expect(memorableDate).toBeTruthy();

    // Verify form-group structure with modifiers
    const monthGroup = memorableDate?.querySelector('.usa-form-group.usa-form-group--month.usa-form-group--select');
    const dayGroup = memorableDate?.querySelector('.usa-form-group.usa-form-group--day');
    const yearGroup = memorableDate?.querySelector('.usa-form-group.usa-form-group--year');

    expect(monthGroup).toBeTruthy();
    expect(dayGroup).toBeTruthy();
    expect(yearGroup).toBeTruthy();

    // Verify each form-group contains the correct component
    expect(monthGroup?.querySelector('usa-select')).toBeTruthy();
    expect(dayGroup?.querySelector('usa-text-input')).toBeTruthy();
    expect(yearGroup?.querySelector('usa-text-input')).toBeTruthy();
  });

  it('should not have combo-box wrapper on month select', async () => {
    const pattern = document.createElement('usa-date-of-birth-pattern');
    document.body.appendChild(pattern);
    await pattern.updateComplete;

    const monthSelect = pattern.querySelector('usa-select[name="date_of_birth_month"]') as any;
    await monthSelect?.updateComplete;

    // Verify no-combo-box attribute is set
    expect(monthSelect?.hasAttribute('no-combo-box')).toBe(true);

    // Verify no combo-box wrapper in DOM
    const comboBox = monthSelect?.querySelector('.usa-combo-box');
    expect(comboBox).toBeFalsy();

    // Verify select is direct child of usa-select component
    const select = monthSelect?.querySelector('select.usa-select');
    expect(select).toBeTruthy();
    expect(select?.parentElement).toBe(monthSelect);
  });
});
```

### Layer 5: Visual Regression Tests (Playwright)

**Purpose**: Catch visual layout bugs with screenshot comparison.

**What to Test**:
- Component renders visually correct
- Layout matches USWDS design
- No overflow or clipping issues
- Responsive behavior

**Example Test Pattern**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Date of Birth Pattern - Visual Regression', () => {
  test('should render memorable date layout correctly', async ({ page }) => {
    await page.goto('/iframe.html?id=patterns-user-profile--date-of-birth');

    // Wait for components to render
    await page.waitForSelector('usa-date-of-birth-pattern');
    await page.waitForTimeout(500); // Allow USWDS JS to initialize

    // Take screenshot of pattern
    const pattern = await page.locator('usa-date-of-birth-pattern');
    await expect(pattern).toHaveScreenshot('date-of-birth-default.png');
  });

  test('should show month, day, year in horizontal row', async ({ page }) => {
    await page.goto('/iframe.html?id=patterns-user-profile--date-of-birth');
    await page.waitForSelector('usa-date-of-birth-pattern');

    const pattern = page.locator('usa-date-of-birth-pattern');
    const monthSelect = pattern.locator('usa-select[name="date_of_birth_month"]');
    const dayInput = pattern.locator('usa-text-input[name="date_of_birth_day"]');
    const yearInput = pattern.locator('usa-text-input[name="date_of_birth_year"]');

    // Verify all three are visible
    await expect(monthSelect).toBeVisible();
    await expect(dayInput).toBeVisible();
    await expect(yearInput).toBeVisible();

    // Verify they're in a horizontal row (similar Y coordinates)
    const monthBox = await monthSelect.boundingBox();
    const dayBox = await dayInput.boundingBox();
    const yearBox = await yearInput.boundingBox();

    expect(monthBox?.y).toBeDefined();
    expect(dayBox?.y).toBeDefined();
    expect(yearBox?.y).toBeDefined();

    // All should have similar Y coordinates (within 10px)
    const yCoords = [monthBox!.y, dayBox!.y, yearBox!.y];
    const maxY = Math.max(...yCoords);
    const minY = Math.min(...yCoords);
    expect(maxY - minY).toBeLessThan(10);

    // Month should be leftmost, year rightmost
    expect(monthBox!.x).toBeLessThan(dayBox!.x);
    expect(dayBox!.x).toBeLessThan(yearBox!.x);
  });
});
```

## Automated Test Utilities

Create reusable test utilities for common slot/composition scenarios:

```typescript
// packages/uswds-wc-test-utils/src/slot-testing-utils.ts

/**
 * Verify slotted content renders correctly
 */
export async function verifySlottedContent(
  component: HTMLElement,
  slotName: string | undefined,
  expectedContent: string
): Promise<void> {
  await (component as any).updateComplete;

  const slot = slotName
    ? component.querySelector(`slot[name="${slotName}"]`)
    : component.querySelector('slot');

  const assignedNodes = (slot as HTMLSlotElement)?.assignedNodes();
  const textContent = assignedNodes
    ?.map(node => node.textContent?.trim())
    .join(' ');

  expect(textContent).toContain(expectedContent);
}

/**
 * Verify component participates in flex layout
 */
export async function verifyFlexLayoutParticipation(
  component: HTMLElement
): Promise<void> {
  const style = window.getComputedStyle(component);

  // Should be inline-block to work in flex containers
  expect(['inline-block', 'inline-flex'].includes(style.display)).toBe(true);

  // Should fill available width
  expect(style.width).toBe('100%');
}

/**
 * Verify child component rendered and initialized
 */
export async function verifyChildComponent(
  parent: HTMLElement,
  selector: string
): Promise<HTMLElement> {
  const child = parent.querySelector(selector);
  expect(child).toBeTruthy();

  await (child as any)?.updateComplete;

  return child as HTMLElement;
}

/**
 * Verify USWDS structure compliance
 */
export async function verifyUSWDSStructure(
  pattern: HTMLElement,
  config: {
    fieldsetClass?: string;
    legendClass?: string;
    expectedChildren?: string[];
  }
): Promise<void> {
  const fieldset = pattern.querySelector('fieldset');
  expect(fieldset?.className).toBe(config.fieldsetClass || 'usa-fieldset');

  const legend = fieldset?.querySelector('legend');
  expect(legend?.className).toBe(config.legendClass || 'usa-legend usa-legend--large');

  if (config.expectedChildren) {
    for (const selector of config.expectedChildren) {
      const child = pattern.querySelector(selector);
      expect(child).toBeTruthy();
    }
  }
}
```

## CI/CD Integration

Add these tests to pre-commit and CI pipelines:

```bash
# .husky/pre-commit additions

# Run slot/composition tests for modified components
if [[ -n "$MODIFIED_COMPONENTS" ]]; then
  echo "🧪 Running slot/composition tests..."
  for component in $MODIFIED_COMPONENTS; do
    pnpm test -- "$component" --testNamePattern="(Slot|Composition|Layout)" || exit 1
  done
fi
```

## Test Coverage Metrics

Track specific metrics for slot/composition testing:

```json
{
  "coverage": {
    "slotRendering": {
      "description": "% of components with slot rendering tests",
      "target": 100,
      "current": 85
    },
    "componentComposition": {
      "description": "% of patterns with composition tests",
      "target": 100,
      "current": 70
    },
    "layoutBehavior": {
      "description": "% of components with layout tests",
      "target": 80,
      "current": 45
    },
    "visualRegression": {
      "description": "% of patterns with visual regression tests",
      "target": 100,
      "current": 60
    }
  }
}
```

## Implementation Checklist

- [ ] Add slot rendering tests to all form components
- [ ] Add composition tests to all patterns
- [ ] Add layout tests to components used in flex/grid layouts
- [ ] Create reusable slot-testing-utils
- [ ] Add visual regression tests for all patterns
- [ ] Update pre-commit to run slot/composition tests
- [ ] Document test patterns in component templates
- [ ] Add coverage tracking for slot/composition tests

## See Also

- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Complete testing documentation
- [COMPONENT_TEMPLATES.md](COMPONENT_TEMPLATES.md) - Component test templates
- [pattern-compliance-tests.ts](../packages/uswds-wc-patterns/src/test-utils/pattern-compliance-tests.ts) - Reusable pattern test utilities
