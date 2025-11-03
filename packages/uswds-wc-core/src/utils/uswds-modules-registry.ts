/**
 * USWDS Modules Registry
 *
 * Central registry of all USWDS JavaScript modules using static imports.
 * This is required because Vite cannot resolve aliases in dynamic imports.
 *
 * DO NOT use dynamic imports for USWDS modules - they will fail in Vite/Storybook.
 * Instead, import statically here and export for use by uswds-loader.
 *
 * NOTE: This is the ONLY file where direct USWDS imports are allowed.
 * All other files should use the uswds-loader.ts utility.
 */

/* eslint-disable no-restricted-imports */
// This file is the central registry where USWDS imports are allowed

// Static imports using Vite-configured aliases
import accordion from '@uswds/uswds/js/usa-accordion';
import datePicker from '@uswds/uswds/js/usa-date-picker';
import inPageNavigation from '@uswds/uswds/js/usa-in-page-navigation';
import modal from '@uswds/uswds/js/usa-modal';
import comboBox from '@uswds/uswds/js/usa-combo-box';
import timePicker from '@uswds/uswds/js/usa-time-picker';
import header from '@uswds/uswds/js/usa-header';
import tooltip from '@uswds/uswds/js/usa-tooltip';
import skipnav from '@uswds/uswds/js/usa-skipnav';
import table from '@uswds/uswds/js/usa-table';
// @ts-expect-error - usa-search module lacks TypeScript definitions
import search from '@uswds/uswds/js/usa-search';
import characterCount from '@uswds/uswds/js/usa-character-count';
import fileInput from '@uswds/uswds/js/usa-file-input';
import dateRangePicker from '@uswds/uswds/js/usa-date-range-picker';

/* eslint-enable no-restricted-imports */

import type { USWDSModule } from './uswds-loader.js';

/**
 * Registry mapping module names to their imported modules
 */
export const USWDS_MODULES_REGISTRY: Record<string, USWDSModule> = {
  accordion: accordion,
  'date-picker': datePicker,
  'in-page-navigation': inPageNavigation,
  modal: modal,
  'combo-box': comboBox,
  'time-picker': timePicker,
  header: header,
  tooltip: tooltip,
  skipnav: skipnav,
  table: table,
  search: search,
  'character-count': characterCount,
  'file-input': fileInput,
  'date-range-picker': dateRangePicker,
};

/**
 * Get a USWDS module by name from the static registry
 */
export function getUSWDSModule(moduleName: string): USWDSModule | null {
  return USWDS_MODULES_REGISTRY[moduleName] || null;
}
