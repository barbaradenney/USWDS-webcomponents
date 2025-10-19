import { addons } from '@storybook/manager-api';

addons.setConfig({
  // Sidebar configuration
  sidebar: {
    showRoots: false,
    collapsedRoots: ['Documentation'],
  },
  // Enable keyboard shortcuts
  enableShortcuts: true,
  // Show the toolbar
  showToolbar: true,
});
