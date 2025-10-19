// TypeScript declarations for USWDS tree-shaking modules
// These modules are dynamically imported for tree-shaking optimization

// Main USWDS package declaration
declare module '@uswds/uswds' {
  const uswds: any;
  export default uswds;
}

declare module '@uswds/uswds/packages/usa-accordion/src/index.js' {
  const accordion: any;
  export default accordion;
}

declare module '@uswds/uswds/packages/usa-character-count/src/index.js' {
  const characterCount: any;
  export default characterCount;
}

declare module '@uswds/uswds/packages/usa-combo-box/src/index.js' {
  const comboBox: any;
  export default comboBox;
}

declare module '@uswds/uswds/packages/usa-date-picker/src/index.js' {
  const datePicker: any;
  export default datePicker;
}

declare module '@uswds/uswds/packages/usa-date-range-picker/src/index.js' {
  const dateRangePicker: any;
  export default dateRangePicker;
}

declare module '@uswds/uswds/packages/usa-file-input/src/index.js' {
  const fileInput: any;
  export default fileInput;
}

declare module '@uswds/uswds/packages/usa-footer/src/index.js' {
  const footer: any;
  export default footer;
}

declare module '@uswds/uswds/packages/usa-header/src/index.js' {
  const header: any;
  export default header;
}

declare module '@uswds/uswds/packages/usa-in-page-navigation/src/index.js' {
  const inPageNavigation: any;
  export default inPageNavigation;
}

declare module '@uswds/uswds/packages/usa-modal/src/index.js' {
  const modal: any;
  export default modal;
}

declare module '@uswds/uswds/packages/usa-search/src/index.js' {
  const search: any;
  export default search;
}

declare module '@uswds/uswds/packages/usa-table/src/index.js' {
  const table: any;
  export default table;
}

declare module '@uswds/uswds/packages/usa-text-input/src/index.js' {
  const textInput: any;
  export default textInput;
}

declare module '@uswds/uswds/packages/usa-textarea/src/index.js' {
  const textarea: any;
  export default textarea;
}

declare module '@uswds/uswds/packages/usa-time-picker/src/index.js' {
  const timePicker: any;
  export default timePicker;
}

declare module '@uswds/uswds/packages/usa-tooltip/src/index.js' {
  const tooltip: any;
  export default tooltip;
}

declare module '@uswds/uswds/packages/usa-pagination/src/index.js' {
  const pagination: any;
  export default pagination;
}

declare module '@uswds/uswds/packages/usa-language-selector/src/index.js' {
  const languageSelector: any;
  export default languageSelector;
}

declare module '@uswds/uswds/packages/usa-collection/src/index.js' {
  const collection: any;
  export default collection;
}

declare module '@uswds/uswds/packages/usa-banner/src/index.js' {
  const banner: any;
  export default banner;
}

declare module '@uswds/uswds/packages/usa-step-indicator/src/index.js' {
  const stepIndicator: any;
  export default stepIndicator;
}

// Note: Alert, button, card, checkbox, radio, select, skip-link, nav, and input
// are presentational components with no JavaScript behavior
// They don't have corresponding JavaScript modules in USWDS
