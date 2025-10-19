#!/bin/bash

echo "🚀 Starting Storybook..."
echo ""
echo "⏳ This takes about 10-20 seconds. Please wait..."
echo ""

# Start Storybook in background
npm run storybook 2>&1 | tee /tmp/storybook.log &
STORYBOOK_PID=$!

# Wait for "started" message in log
echo "⏳ Waiting for Storybook to compile..."
timeout=60
elapsed=0

while [ $elapsed -lt $timeout ]; do
  if grep -q "Storybook.*started" /tmp/storybook.log 2>/dev/null; then
    echo ""
    echo "✅ Storybook is ready!"
    echo ""
    echo "🌐 Open in browser: http://localhost:6006"
    echo ""
    echo "Press Ctrl+C to stop Storybook"

    # Keep script running so Storybook stays alive
    wait $STORYBOOK_PID
    exit 0
  fi

  sleep 1
  elapsed=$((elapsed + 1))

  # Show progress dots
  if [ $((elapsed % 3)) -eq 0 ]; then
    echo -n "."
  fi
done

echo ""
echo "⚠️  Timeout waiting for Storybook to start"
echo "Check the logs above for errors"
exit 1
