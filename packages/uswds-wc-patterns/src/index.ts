/**
 * USWDS Patterns - Web Component Compositions
 *
 * Patterns are multi-component user workflows that orchestrate existing
 * USWDS web components to solve common user tasks.
 *
 * Patterns vs Components:
 * - Components: Atomic, reusable UI elements
 * - Patterns: Higher-level workflows composed of multiple components
 *
 * Official USWDS Patterns:
 * - Language Selection: Help users select a language
 * - Multi-Step Form: Navigate multi-step form workflows
 * - Form Summary: Review and retain submitted information
 * - User Profile: Modular patterns for profile data collection
 */

// Form Workflow Patterns
export * from './patterns/language-selection/index.js';
export * from './patterns/multi-step-form/index.js';
export * from './patterns/form-summary/index.js';

// User Profile Patterns
export * from './patterns/address/index.js';
export * from './patterns/name/index.js';
export * from './patterns/phone-number/index.js';
export * from './patterns/contact-preferences/index.js';

// Future patterns
// export * from './patterns/form-trust/index.js';
