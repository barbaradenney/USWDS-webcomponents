#!/bin/bash

# USWDS Script Tag Validation
# This script ensures the USWDS script tag is present in Storybook configuration
# to maintain the mandatory Script Tag Pattern architecture

PREVIEW_HEAD_FILE=".storybook/preview-head.html"
STATIC_SCRIPT_PATTERN='<script[^>]*src="[^"]*uswds.*\.js'
DYNAMIC_SCRIPT_PATTERN='script\.src\s*=.*uswds.*\.js'

echo "🔍 Validating USWDS script tag presence..."

# Check if preview-head.html exists
if [ ! -f "$PREVIEW_HEAD_FILE" ]; then
  echo "❌ ERROR: $PREVIEW_HEAD_FILE not found!"
  echo ""
  echo "The Storybook preview-head.html file is missing. This file is required"
  echo "to load USWDS via script tag for proper global initialization."
  exit 1
fi

# Check if script tag is present (static or dynamic)
HAS_STATIC=$(grep -qE "$STATIC_SCRIPT_PATTERN" "$PREVIEW_HEAD_FILE" && echo "yes" || echo "no")
HAS_DYNAMIC=$(grep -q "script.src.*uswds.*\.js" "$PREVIEW_HEAD_FILE" && echo "yes" || echo "no")

if [ "$HAS_STATIC" = "no" ] && [ "$HAS_DYNAMIC" = "no" ]; then
  echo "❌ ERROR: USWDS script loading missing from $PREVIEW_HEAD_FILE!"
  echo ""
  echo "CRITICAL: USWDS MUST be loaded via <script> tag in $PREVIEW_HEAD_FILE"
  echo ""
  echo "Option 1 - Static script tag:"
  echo '  <script src="https://unpkg.com/@uswds/uswds@latest/dist/js/uswds.min.js"></script>'
  echo ""
  echo "Option 2 - Dynamic script creation:"
  echo "  const script = document.createElement('script');"
  echo "  script.src = 'https://unpkg.com/@uswds/uswds@latest/dist/js/uswds.min.js';"
  echo "  document.head.appendChild(script);"
  echo ""
  echo "Why this is required:"
  echo "  1. Creates window.USWDS global object needed by all USWDS components"
  echo "  2. Prevents modal visibility issues and component initialization failures"
  echo "  3. Ensures consistent behavior across dev, Storybook, and production"
  echo ""
  echo "DO NOT use ES module imports - they break global USWDS initialization."
  echo ""
  echo "See docs/DEBUGGING_GUIDE.md for full documentation of this requirement."
  exit 1
fi

# Success message
if [ "$HAS_STATIC" = "yes" ]; then
  echo "✅ USWDS script tag validated successfully (static script tag)"
  echo "   Found in: $PREVIEW_HEAD_FILE"
elif [ "$HAS_DYNAMIC" = "yes" ]; then
  echo "✅ USWDS script tag validated successfully (dynamic script loading)"
  echo "   Found in: $PREVIEW_HEAD_FILE"
fi

exit 0
