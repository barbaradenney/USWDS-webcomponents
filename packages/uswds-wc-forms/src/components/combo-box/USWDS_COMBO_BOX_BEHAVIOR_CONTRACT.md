# USWDS Combo Box Behavior Contract

**Component**: usa-combo-box
**USWDS Version**: 3.10.0
**Last Synced**: 2025-10-05
**Source**: https://github.com/uswds/uswds/blob/develop/packages/usa-combo-box/src/index.js
**Behavior File**: `src/components/combo-box/usa-combo-box-behavior.ts`

---

## Purpose

This document defines the behavioral contract between our vanilla JS implementation and the official USWDS combo box component. It maps every function, constant, and pattern from USWDS source to ensure 100% parity.

---

## Source Code Mapping

### Constants

| Constant | Source Lines | Value | Purpose |
|----------|--------------|-------|---------|
| PREFIX | 8 | `'usa'` | USWDS namespace prefix |
| COMBO_BOX_CLASS | 10 | `'usa-combo-box'` | Main combo box class |
| COMBO_BOX_PRISTINE_CLASS | 11 | `'usa-combo-box--pristine'` | Pristine state indicator |
| SELECT_CLASS | 12 | `'usa-combo-box__select'` | Hidden select element |
| INPUT_CLASS | 13 | `'usa-combo-box__input'` | Typeahead input |
| CLEAR_INPUT_BUTTON_CLASS | 14 | `'usa-combo-box__clear-input'` | Clear button |
| TOGGLE_LIST_BUTTON_CLASS | 16 | `'usa-combo-box__toggle-list'` | Toggle dropdown button |
| LIST_CLASS | 18 | `'usa-combo-box__list'` | Dropdown list |
| LIST_OPTION_CLASS | 19 | `'usa-combo-box__list-option'` | Individual option |
| LIST_OPTION_FOCUSED_CLASS | 20 | `'usa-combo-box__list-option--focused'` | Focused option |
| LIST_OPTION_SELECTED_CLASS | 21 | `'usa-combo-box__list-option--selected'` | Selected option |
| STATUS_CLASS | 22 | `'usa-combo-box__status'` | Screen reader status |
| DEFAULT_FILTER | 38 | `'.*{{query}}.*'` | Default regex filter pattern |

### Core Functions

#### changeElementValue()

- **Source**: Lines 44-54
- **Purpose**: Set element value and dispatch change event
- **Parameters**:
  - `el: HTMLInputElement | HTMLSelectElement` - Element to update
  - `value: string` - New value (default: '')
- **Returns**: void
- **Logic**:
  1. Set element.value
  2. Create CustomEvent('change') with bubbles, cancelable, and detail
  3. Dispatch event

#### getComboBoxContext()

- **Source**: Lines 79-111
- **Purpose**: Get all elements and state for a combo box
- **Parameters**:
  - `el: HTMLElement` - Any element within combo box
- **Returns**: ComboBoxContext object with all elements and flags
- **Logic**:
  1. Find closest `.usa-combo-box` container
  2. Query all child elements (select, input, list, buttons, etc.)
  3. Get state flags (isPristine, disableFiltering)
  4. Return context object
- **Throws**: Error if no combo box container found

#### enhanceComboBox()

- **Source**: Lines 160-282
- **Purpose**: Transform select element into enhanced combo box with input and dropdown
- **Parameters**:
  - `_comboBoxEl: HTMLElement` - Combo box container
- **Returns**: void
- **Logic**:
  1. Check if already enhanced (dataset.enhanced)
  2. Find select element and label
  3. Handle defaultValue and placeholder from data attributes
  4. Validate label exists and has correct 'for' attribute
  5. Hide and prepare select element (aria-hidden, tabindex, classes)
  6. Create and insert input element with ARIA attributes
  7. Insert buttons (clear, toggle) and list (ul) via sanitized HTML
  8. Set initial value if selectedOption exists
  9. Handle disabled and aria-disabled states
  10. Mark as enhanced

#### highlightOption()

- **Source**: Lines 294-327
- **Purpose**: Manage focused option in list during keyboard navigation
- **Parameters**:
  - `el: HTMLElement` - Element within combo box
  - `nextEl: HTMLElement | null` - Element to focus
  - `options: { skipFocus?: boolean, preventScroll?: boolean }` - Options
- **Returns**: void
- **Logic**:
  1. Remove focus class from current focused option
  2. If nextEl exists:
     - Set aria-activedescendant on input
     - Add focus class to nextEl
     - Scroll list if needed (unless preventScroll)
     - Focus nextEl (unless skipFocus)
  3. If nextEl is null, clear aria-activedescendant and focus input

#### generateDynamicRegExp()

- **Source**: Lines 336-359
- **Purpose**: Create regex for filtering options based on query
- **Parameters**:
  - `filter: string` - Filter pattern with {{query}} placeholder
  - `query: string` - User input query
  - `extras: Record<string, any>` - Additional filter patterns
- **Returns**: RegExp for matching options
- **Logic**:
  1. Escape special regex characters in query
  2. Replace {{template}} patterns in filter
  3. Handle custom filters from extras
  4. Create case-insensitive regex

#### displayList()

- **Source**: Lines 366-549
- **Purpose**: Show dropdown list with filtered options
- **Parameters**:
  - `el: HTMLElement` - Element within combo box
- **Returns**: void
- **Logic**:
  1. Get combo box context and input value
  2. Generate regex filter
  3. Build filtered options array:
     - Options starting with query first
     - Options containing query second
     - All options if pristine or filtering disabled
  4. Create list option elements with:
     - aria-setsize, aria-posinset
     - aria-selected, role="option"
     - data-value, textContent
     - Proper classes and tabindex
  5. Show "No results found" if no matches
  6. Update aria-expanded, status text
  7. Highlight selected or first option

#### hideList()

- **Source**: Lines 556-570
- **Purpose**: Hide dropdown list
- **Parameters**:
  - `el: HTMLElement` - Element within combo box
- **Returns**: void
- **Logic**:
  1. Clear status text
  2. Set aria-expanded="false"
  3. Clear aria-activedescendant
  4. Remove focused class from option
  5. Reset list scrollTop
  6. Hide list

#### selectItem()

- **Source**: Lines 577-585
- **Purpose**: Select a list option
- **Parameters**:
  - `listOptionEl: HTMLElement` - List option element
- **Returns**: void
- **Logic**:
  1. Get combo box context
  2. Set select value from option data-value
  3. Set input value from option textContent
  4. Add pristine class
  5. Hide list
  6. Focus input

#### clearInput()

- **Source**: Lines 592-603
- **Purpose**: Clear input and select values
- **Parameters**:
  - `clearButtonEl: HTMLElement` - Clear button element
- **Returns**: void
- **Logic**:
  1. Get combo box context
  2. Clear select value if exists
  3. Clear input value if exists
  4. Remove pristine class
  5. Re-display list if it was shown
  6. Focus input

#### resetSelection()

- **Source**: Lines 610-632
- **Purpose**: Reset input to match current select value
- **Parameters**:
  - `el: HTMLElement` - Element within combo box
- **Returns**: void
- **Logic**:
  1. Get select value and input value
  2. If select has value:
     - Find matching option
     - Update input if text doesn't match
     - Add pristine class
  3. If no select value but input has value:
     - Clear input

#### completeSelection()

- **Source**: Lines 642-662
- **Purpose**: Complete selection based on input value or focused option
- **Parameters**:
  - `el: HTMLElement` - Element within combo box
- **Returns**: void
- **Logic**:
  1. Clear status text
  2. Get input value
  3. If input value matches option text exactly:
     - Select that option
     - Add pristine class
  4. Otherwise reset selection

### Event Handlers

#### handleEscape

- **Source**: Lines 669-675
- **Purpose**: Handle Escape key
- **Logic**: Hide list, reset selection, focus input

#### handleDownFromInput

- **Source**: Lines 682-698
- **Purpose**: Handle ArrowDown/Down from input
- **Logic**: Display list if hidden, highlight first/focused option, preventDefault

#### handleEnterFromInput

- **Source**: Lines 705-716
- **Purpose**: Handle Enter key from input
- **Logic**: Complete selection, hide list if shown, preventDefault

#### handleDownFromListOption

- **Source**: Lines 723-732
- **Purpose**: Handle ArrowDown/Down from list option
- **Logic**: Highlight next sibling option, preventDefault

#### handleSpaceFromListOption

- **Source**: Lines 739-742
- **Purpose**: Handle Space key from list option
- **Logic**: Select item, preventDefault

#### handleEnterFromListOption

- **Source**: Lines 749-752
- **Purpose**: Handle Enter key from list option
- **Logic**: Select item, preventDefault

#### handleUpFromListOption

- **Source**: Lines 759-775
- **Purpose**: Handle ArrowUp/Up from list option
- **Logic**: Highlight previous sibling, hide list if no previous, preventDefault

#### handleMouseover

- **Source**: Lines 783-793
- **Purpose**: Handle mouseover on list option
- **Logic**: Highlight option if not already focused, preventScroll

#### toggleList

- **Source**: Lines 800-810
- **Purpose**: Toggle list visibility
- **Logic**: Display if hidden, hide if shown, focus input

#### handleClickFromInput

- **Source**: Lines 817-823
- **Purpose**: Handle click on input
- **Logic**: Display list if hidden

### Initialization

#### initializeComboBox()

- **Source**: Lines 825-900 (adapted for event delegation)
- **Purpose**: Initialize combo box behavior with event delegation
- **Parameters**:
  - `root: HTMLElement | Document` - Root element for event delegation
- **Returns**: Cleanup function
- **Logic**:
  1. Find all combo boxes in root
  2. Enhance each combo box
  3. Set up event delegation for:
     - click (input, toggle button, list option, clear button)
     - focusout (combo box)
     - keydown (combo box, input, list option)
     - input (input element)
     - mouseover (list option)
  4. Return cleanup function that removes all listeners

---

## Behavioral Requirements

### 1. Enhancement Process

**USWDS Pattern**: Transform select into enhanced combo box

1. ✅ Check for existing enhancement (dataset.enhanced)
2. ✅ Validate select and label elements exist
3. ✅ Hide original select with aria-hidden and screen reader classes
4. ✅ Create input with proper ARIA attributes
5. ✅ Insert clear button, toggle button, list, and status elements
6. ✅ Handle initial selection from defaultValue
7. ✅ Transfer disabled/aria-disabled states

### 2. Typeahead Filtering

**USWDS Pattern**: Filter options based on input with smart sorting

1. ✅ Use regex pattern from data-filter attribute (default: `.*{{query}}.*`)
2. ✅ Sort results: options starting with query first, then containing query
3. ✅ Respect disableFiltering flag
4. ✅ Show all options when pristine
5. ✅ Display "No results found" when no matches

### 3. Keyboard Navigation

**USWDS Pattern**: Full keyboard support

| Key | From Input | From List Option |
|-----|-----------|-----------------|
| ArrowDown/Down | Open list, focus first option | Focus next option |
| ArrowUp/Up | - | Focus previous option, close if at first |
| Enter | Complete selection, close list | Select option |
| Escape | Close list, reset selection | - |
| Space | - | Select option |
| Shift+Tab | - | No-op (prevent default handling) |

### 4. Focus Management

**USWDS Pattern**: Proper focus and aria-activedescendant

1. ✅ Set aria-activedescendant on input when option focused
2. ✅ Scroll list to keep focused option visible
3. ✅ Focus input when list closes
4. ✅ Support skipFocus and preventScroll options

### 5. State Management

**USWDS Pattern**: Track pristine, selected, and focused states

- **Pristine** (`usa-combo-box--pristine`): Has selected value, input matches
- **Selected** (`usa-combo-box__list-option--selected`): Current selection
- **Focused** (`usa-combo-box__list-option--focused`): Keyboard navigation focus

### 6. Value Synchronization

**USWDS Pattern**: Keep select and input in sync

1. ✅ Selecting option updates both select.value and input.value
2. ✅ Clearing input clears both values and removes pristine
3. ✅ Typing removes pristine class
4. ✅ Exact text match on Enter/blur selects that option
5. ✅ Resetting restores input to match current select value

### 7. Accessibility

**USWDS Pattern**: Full ARIA support and screen reader announcements

- ✅ role="combobox" on input
- ✅ aria-owns, aria-controls pointing to list
- ✅ aria-autocomplete="list"
- ✅ aria-expanded tracks list visibility
- ✅ aria-activedescendant tracks focused option
- ✅ role="listbox" on list
- ✅ role="option" on each option
- ✅ aria-setsize, aria-posinset on options
- ✅ aria-selected on selected option
- ✅ Live region status announcements (X results available)

### 8. Event Handling

**USWDS Pattern**: Event delegation from root element

1. ✅ Delegate click events to appropriate handlers
2. ✅ Check disabled state before handling
3. ✅ Use keymap utility for keyboard handling
4. ✅ Handle focusout to close list when focus leaves combo box
5. ✅ Handle input event to filter and display list

---

## Testing Validation

### Required Tests

- [ ] ✅ Enhancement creates all required elements
- [ ] ✅ Initial value from defaultValue works
- [ ] ✅ Placeholder from data attribute works
- [ ] ✅ Typeahead filtering (starts with, contains, no results)
- [ ] ✅ Regex filter patterns work
- [ ] ✅ Keyboard navigation (all keys)
- [ ] ✅ Click interactions (input, toggle, options, clear)
- [ ] ✅ Focus management and aria-activedescendant
- [ ] ✅ Pristine state management
- [ ] ✅ Value synchronization (select ↔ input)
- [ ] ✅ Reset selection behavior
- [ ] ✅ Complete selection (exact match)
- [ ] ✅ Disabled state handling
- [ ] ✅ Aria-disabled attribute support
- [ ] ✅ Screen reader announcements
- [ ] ✅ List scrolling behavior
- [ ] ✅ Mouseover highlighting
- [ ] ✅ Event delegation cleanup

### Edge Cases

- [ ] ✅ Missing label throws error
- [ ] ✅ Missing select throws error
- [ ] ✅ Already enhanced (no-op)
- [ ] ✅ Empty options list
- [ ] ✅ Disabled filtering mode
- [ ] ✅ Focus leaving combo box (focusout)
- [ ] ✅ Escape clears and refocuses
- [ ] ✅ Arrow up from first option closes list

---

## Implementation Notes

### USWDS-Specific Patterns

1. **Sanitizer Usage**: All HTML insertion uses `Sanitizer.escapeHTML` template tag
2. **Keymap Pattern**: Event handlers bound with `this` context using `keymap()` utility
3. **Event Delegation**: All events handled at root level, not per-element
4. **Context Pattern**: `getComboBoxContext()` provides unified access to all elements
5. **Pristine Class**: Indicates clean state with selected value

### Deviations from USWDS (None Expected)

This implementation should have ZERO deviations from USWDS behavior. Any differences must be:

1. Documented with rationale
2. Validated against USWDS source
3. Approved as necessary for web component architecture
4. Tested for behavioral parity

**Current Deviations**: None ✅

---

## Maintenance

### Sync Process

1. **Check USWDS version**: `npm list @uswds/uswds`
2. **Compare source**: `cat node_modules/@uswds/uswds/packages/usa-combo-box/src/index.js`
3. **Update behavior file**: Apply any USWDS changes line-by-line
4. **Update this contract**: Document any new functions or changes
5. **Update metadata**: Set @last-synced date and @uswds-version
6. **Run tests**: Ensure all behavioral tests pass
7. **Update sync status**: Mark as ✅ UP TO DATE

### Review Checklist

- [ ] All USWDS functions replicated
- [ ] All constants match USWDS
- [ ] Event handling matches USWDS
- [ ] ARIA updates match USWDS
- [ ] Class toggles match USWDS
- [ ] Keyboard navigation matches USWDS
- [ ] Focus management matches USWDS
- [ ] Value synchronization matches USWDS
- [ ] Filtering logic matches USWDS
- [ ] 100% behavioral test coverage
- [ ] No custom logic added
- [ ] Source attribution complete

---

**Status**: ✅ UP TO DATE
**Last Review**: 2025-10-05
**Next Review**: After USWDS 3.11.0 release or 90 days
