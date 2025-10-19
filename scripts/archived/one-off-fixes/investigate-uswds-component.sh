#!/bin/bash
# USWDS Component Investigation Script
# Usage: ./scripts/investigate-uswds-component.sh <component-name>

COMPONENT=$1
if [ -z "$COMPONENT" ]; then
  echo "Usage: $0 <component-name>"
  echo "Example: $0 in-page-navigation"
  exit 1
fi

echo "🔍 INVESTIGATING USWDS COMPONENT: $COMPONENT"
echo "============================================"

# Check if USWDS package exists
USWDS_PKG_PATH="node_modules/@uswds/uswds/packages/usa-$COMPONENT"
if [ ! -d "$USWDS_PKG_PATH" ]; then
  echo "❌ USWDS package not found at: $USWDS_PKG_PATH"
  echo "📁 Available USWDS components:"
  ls node_modules/@uswds/uswds/packages/ | grep "usa-" | head -10
  exit 1
fi

echo "✅ Found USWDS package at: $USWDS_PKG_PATH"
echo ""

# 1. Main implementation file
echo "📂 MAIN IMPLEMENTATION FILE:"
MAIN_FILE="$USWDS_PKG_PATH/src/index.js"
if [ -f "$MAIN_FILE" ]; then
  echo "📄 $MAIN_FILE"
  echo "📏 File size: $(wc -l < "$MAIN_FILE") lines"
else
  echo "❌ Main file not found at $MAIN_FILE"
fi
echo ""

# 2. Configuration constants and defaults
echo "🎛️ CONFIGURATION CONSTANTS & DEFAULTS:"
if [ -f "$MAIN_FILE" ]; then
  echo "Found constants:"
  grep -n "const.*=" "$MAIN_FILE" | grep -E "(DEFAULT|CONFIG|THRESHOLD|MARGIN|SELECTOR)" | head -10
  echo ""
  echo "Found configuration patterns:"
  grep -n -E "(threshold|rootMargin|selector|offset)" "$MAIN_FILE" | head -5
else
  echo "❌ Cannot analyze - main file not found"
fi
echo ""

# 3. Data attributes
echo "📋 DATA ATTRIBUTES USED:"
if [ -f "$MAIN_FILE" ]; then
  echo "Data attributes in JavaScript:"
  grep -n "data-" "$MAIN_FILE" | head -10
  echo ""
  echo "getAttribute/setAttribute calls:"
  grep -n -E "(getAttribute|setAttribute)" "$MAIN_FILE" | head -5
else
  echo "❌ Cannot analyze - main file not found"
fi
echo ""

# 4. DOM selectors and structure
echo "🏗️ DOM STRUCTURE & SELECTORS:"
if [ -f "$MAIN_FILE" ]; then
  echo "CSS selectors used:"
  grep -n -E "(querySelector|querySelectorAll)" "$MAIN_FILE" | head -8
  echo ""
  echo "Class names referenced:"
  grep -o "usa-[a-zA-Z0-9_-]*" "$MAIN_FILE" | sort | uniq | head -10
else
  echo "❌ Cannot analyze - main file not found"
fi
echo ""

# 5. Event handling
echo "🎧 EVENT HANDLING:"
if [ -f "$MAIN_FILE" ]; then
  echo "Event listeners:"
  grep -n "addEventListener" "$MAIN_FILE" | head -5
  echo ""
  echo "Event types:"
  grep -o -E "'[a-zA-Z]+'" "$MAIN_FILE" | grep -E "(click|scroll|change|input)" | sort | uniq | head -5
else
  echo "❌ Cannot analyze - main file not found"
fi
echo ""

# 6. Our component comparison
echo "🔗 OUR COMPONENT IMPLEMENTATION:"
OUR_COMPONENT="src/components/$COMPONENT/usa-$COMPONENT.ts"
if [ -f "$OUR_COMPONENT" ]; then
  echo "✅ Our component exists at: $OUR_COMPONENT"
  echo "📏 Our file size: $(wc -l < "$OUR_COMPONENT") lines"
  echo ""
  echo "Our data attributes:"
  grep -n "data-" "$OUR_COMPONENT" | head -5
  echo ""
  echo "Our properties:"
  grep -n "@property" "$OUR_COMPONENT" | head -8
else
  echo "❌ Our component not found at: $OUR_COMPONENT"
  echo "📁 Available components:"
  ls src/components/ | head -10
fi
echo ""

# 7. Quick analysis summary
echo "📊 QUICK ANALYSIS SUMMARY:"
echo "=========================="
if [ -f "$MAIN_FILE" ]; then
  echo "🔍 Key insights for $COMPONENT:"

  # Look for common patterns
  if grep -q "IntersectionObserver" "$MAIN_FILE"; then
    echo "  📍 Uses IntersectionObserver"
    grep -n -A 2 -B 2 "IntersectionObserver" "$MAIN_FILE"
  fi

  if grep -q "threshold" "$MAIN_FILE"; then
    echo "  🎯 Has threshold configuration"
    grep -n "threshold" "$MAIN_FILE"
  fi

  if grep -q "rootMargin" "$MAIN_FILE"; then
    echo "  📐 Has rootMargin configuration"
    grep -n "rootMargin" "$MAIN_FILE"
  fi

  # Look for initialization patterns
  if grep -q "\.on\s*=" "$MAIN_FILE"; then
    echo "  🚀 Has 'on' initialization method"
  fi

  if grep -q "\.off\s*=" "$MAIN_FILE"; then
    echo "  🛑 Has 'off' cleanup method"
  fi
else
  echo "❌ Cannot provide analysis - main file not found"
fi
echo ""

echo "🎯 NEXT STEPS:"
echo "1. Review the constants and defaults above"
echo "2. Compare with our implementation in $OUR_COMPONENT"
echo "3. Check if we need to add/modify properties to match USWDS behavior"
echo "4. Ensure our data attributes align with USWDS expectations"
echo ""
echo "💡 To examine the full USWDS source:"
echo "   cat $MAIN_FILE"
echo ""
echo "🔧 To compare with our implementation:"
echo "   diff $MAIN_FILE $OUR_COMPONENT"