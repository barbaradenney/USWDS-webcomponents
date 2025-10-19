/**
 * USWDS Web Components Library - Main Entry Point
 *
 * This library provides thin web component wrappers around USWDS components
 * using official USWDS CSS with minimal custom code for maximum maintainability.
 *
 * 📚 DOCUMENTATION & GUIDES:
 * @see README.md - Project overview, installation, and usage
 * @see CLAUDE.md - Complete development guidelines for AI/developers
 * @see AI_INSTRUCTIONS.md - Specific AI/LLM development rules
 * @see docs/COMPONENT_DEVELOPMENT_GUIDE.md - Implementation patterns
 * @see docs/COMPONENT_CHECKLIST.md - Quality checklist before commit
 * @see docs/TROUBLESHOOTING.md - Debug and troubleshoot issues
 *
 * 🧪 TESTING (MANDATORY):
 * All components require comprehensive unit tests before commit.
 * Commands: npm run test, npm run typecheck, npm run lint
 *
 * 🔧 DEBUGGING:
 * Enable debug mode: Add ?debug=true to URL or localStorage.setItem('uswds-debug', 'true')
 * @see stories/Debugging.stories.ts - Interactive debugging tools
 *
 * This file provides both auto-registration and manual registration options.
 */

// Export all components for manual registration
export * from './components/accordion';
export * from './components/button';
export * from './components/alert';
export * from './components/checkbox';
export * from './components/radio';
export * from './components/select';
export * from './components/text-input';
export * from './components/textarea';
export * from './components/card';
export * from './components/tag';
export * from './components/table';
export * from './components/modal';
export * from './components/icon';
export * from './components/button-group';
export * from './components/header';
export * from './components/footer';
export * from './components/breadcrumb';
export * from './components/pagination';
export * from './components/banner';
export * from './components/search';
export * from './components/date-picker';
export * from './components/file-input';
export * from './components/combo-box';
export * from './components/time-picker';
export * from './components/range-slider';
export * from './components/tooltip';
export * from './components/side-navigation';
export * from './components/date-range-picker';
export * from './components/step-indicator';
export * from './components/site-alert';
export * from './components/summary-box';
export * from './components/process-list';
export * from './components/input-prefix-suffix';
export * from './components/memorable-date';
export * from './components/language-selector';
export * from './components/collection';
export * from './components/identifier';
export * from './components/character-count';
export * from './components/in-page-navigation';
export * from './components/validation';
export * from './components/link';
export * from './components/list';
export * from './components/skip-link';
export * from './components/prose';
export * from './components/icon-list';

// Export types
export * from './types';

// Export utility functions and base component
export * from './utils/base-component';

// Auto-registration function for all components
export function registerAllComponents() {
  // Import and register all components
}

// Auto-register all components by default (can be disabled by importing individual components)
if (typeof window !== 'undefined') {
  registerAllComponents();
}
