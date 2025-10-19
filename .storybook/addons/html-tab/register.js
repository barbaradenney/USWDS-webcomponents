import { addons, types } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import React from 'react';

const ADDON_ID = 'html-tab';
const PANEL_ID = `${ADDON_ID}/panel`;

// HTML Panel Component
const HtmlPanel = ({ active }) => {
  const [html, setHtml] = React.useState('');

  React.useEffect(() => {
    if (!active) return;

    // Listen for story changes and updates
    const channel = addons.getChannel();

    const updateHtml = () => {
      // Get HTML from the preview iframe
      const iframe = document.querySelector('#storybook-preview-iframe');
      if (iframe && iframe.contentDocument) {
        const storyRoot = iframe.contentDocument.getElementById('storybook-root');
        if (storyRoot) {
          const rawHtml = storyRoot.innerHTML;
          const formattedHtml = formatHTML(rawHtml);
          setHtml(formattedHtml);
        }
      }
    };

    // Update immediately and on story changes
    updateHtml();

    const timeoutId = setTimeout(updateHtml, 500);

    // Listen for story updates
    channel.on('storyChanged', updateHtml);
    channel.on('forceReRender', updateHtml);

    return () => {
      clearTimeout(timeoutId);
      channel.off('storyChanged', updateHtml);
      channel.off('forceReRender', updateHtml);
    };
  }, [active]);

  return React.createElement(
    'div',
    {
      style: {
        padding: '16px',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#ffffff',
      },
    },
    React.createElement(
      'pre',
      {
        style: {
          margin: 0,
          fontFamily: '"Monaco", "Menlo", "Consolas", monospace',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#333',
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
        },
      },
      html || 'Select a story to view its HTML output...'
    )
  );
};

// Format HTML helper function
function formatHTML(html) {
  if (!html) return '';

  let formatted = html;
  let indent = 0;
  const indentSize = 2;

  // Add newlines and indentation
  formatted = formatted.replace(/></g, '>\n<');

  const lines = formatted.split('\n');
  const result = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Decrease indent for closing tags
    if (line.startsWith('</')) {
      indent = Math.max(0, indent - indentSize);
    }

    // Add indentation
    result.push(' '.repeat(indent) + line);

    // Increase indent for opening tags (but not self-closing)
    if (
      line.startsWith('<') &&
      !line.startsWith('</') &&
      !line.endsWith('/>') &&
      !line.includes('</')
    ) {
      indent += indentSize;
    }
  }

  return result.join('\n');
}

// Register the addon
addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'HTML',
    render: ({ active, key }) => {
      return React.createElement(
        AddonPanel,
        { active, key },
        React.createElement(HtmlPanel, { active })
      );
    },
  });
});
