#!/bin/bash

# Monitor Vitest Progress via results.json
# Usage: bash scripts/test/monitor-vitest-progress.sh [component-name]

COMPONENT=${1:-""}
RESULTS_FILE="node_modules/.vitest/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json"

echo "🔍 Vitest Progress Monitor"
echo "=========================================="

if [ -n "$COMPONENT" ]; then
  echo "Filtering for component: $COMPONENT"
fi

echo ""

while true; do
  clear
  echo "🔍 Vitest Progress Monitor - $(date +%H:%M:%S)"
  echo "=========================================="

  if [ ! -f "$RESULTS_FILE" ]; then
    echo "⏳ Waiting for test results..."
    sleep 2
    continue
  fi

  # Parse results with Python
  python3 <<EOF
import json
import sys

try:
    with open("$RESULTS_FILE") as f:
        data = json.load(f)

    results = data.get('results', [])

    if not results:
        print("⏳ No test results yet...")
        sys.exit(0)

    # Filter by component if specified
    filtered = results
    if "$COMPONENT":
        filtered = [r for r in results if "$COMPONENT" in r[0].lower()]

    # Count stats
    total = len(filtered)
    passed = sum(1 for r in filtered if r[1].get('duration', 0) > 0 and not r[1].get('failed'))
    failed = sum(1 for r in filtered if r[1].get('failed'))
    pending = total - passed - failed

    print(f"📊 Progress: {passed + failed}/{total} files completed")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   ⏳ Pending: {pending}")
    print("")

    # Show recent completed tests
    completed = [(r[0], r[1]) for r in filtered if r[1].get('duration', 0) > 0]
    completed.sort(key=lambda x: x[1].get('duration', 0), reverse=True)

    if completed:
        print("📝 Recently Completed (top 10):")
        for i, (test_file, result) in enumerate(completed[:10], 1):
            status = '✅' if not result.get('failed') else '❌'
            duration = result.get('duration', 0) / 1000
            name = test_file.split('/')[-1]
            print(f"   {status} ({duration:5.2f}s) {name}")

except Exception as e:
    print(f"❌ Error parsing results: {e}")
    import traceback
    traceback.print_exc()
EOF

  sleep 2
done
