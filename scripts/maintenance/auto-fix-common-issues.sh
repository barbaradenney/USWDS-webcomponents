#!/bin/bash

# Auto-Fix Common Recurring Issues Script
#
# This script automatically fixes the most common recurring issues we've identified
# to prevent developers from having to fix the same bugs repeatedly.
#
# Usage: ./scripts/auto-fix-common-issues.sh [component-name]

set -e

echo "🔧 Auto-Fix Common Issues Tool"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPONENT=$1
FIXED_COUNT=0

# Function to fix a component file
fix_component() {
    local file=$1
    local component_name=$(basename $(dirname $file))

    echo -e "${BLUE}Checking $component_name...${NC}"

    # Fix 1: Add missing initializeUSWDS method for interactive components
    INTERACTIVE_COMPONENTS="accordion modal date-picker combo-box file-input in-page-navigation language-selector search time-picker tooltip"
    if echo "$INTERACTIVE_COMPONENTS" | grep -q "$component_name"; then
        if ! grep -q "initializeUSWDS" "$file"; then
            echo -e "${YELLOW}  Adding initializeUSWDS() method...${NC}"

            # Add the method after connectedCallback
            sed -i.bak '/connectedCallback() {/,/^  }$/ {
                /^  }$/ a\
\
  private async initializeUSWDS() {\
    try {\
      if (typeof window !== '\''undefined'\'' && typeof (window as any).USWDS !== '\''undefined'\'') {\
        const USWDS = (window as any).USWDS;\
        if (USWDS.'$component_name' && typeof USWDS.'$component_name'.on === '\''function'\'') {\
          USWDS.'$component_name'.on(this);\
        }\
      }\
    } catch (error) {\
      console.warn('\''📋 '$component_name': USWDS integration failed:'\'', error);\
    }\
  }
            }' "$file"

            # Add call to initializeUSWDS in connectedCallback
            if ! grep -q "this.initializeUSWDS()" "$file"; then
                sed -i.bak '/super.connectedCallback();/ a\
    this.updateComplete.then(() => this.initializeUSWDS());' "$file"
            fi

            ((FIXED_COUNT++))
        fi
    fi

    # Fix 2: Remove dangerous innerHTML manipulation in light DOM components
    if grep -q "innerHTML = " "$file" && grep -q "createRenderRoot.*return this" "$file"; then
        echo -e "${YELLOW}  Removing unsafe innerHTML manipulation...${NC}"

        # Comment out innerHTML assignments
        sed -i.bak 's/\(.*\)innerHTML = /\1\/\/ UNSAFE: innerHTML = /' "$file"

        ((FIXED_COUNT++))
    fi

    # Fix 3: Fix firstUpdated signature
    if grep -q "firstUpdated()" "$file"; then
        echo -e "${YELLOW}  Fixing firstUpdated() signature...${NC}"

        sed -i.bak 's/firstUpdated()/firstUpdated(changedProperties: PropertyValues)/' "$file"

        # Add import if missing
        if ! grep -q "import.*PropertyValues" "$file"; then
            sed -i.bak '1 a\
import type { PropertyValues } from '\''lit'\'';' "$file"
        fi

        ((FIXED_COUNT++))
    fi

    # Fix 4: Fix forEach typing issues
    if grep -q "forEach((.*:.*)" "$file"; then
        echo -e "${YELLOW}  Fixing forEach typing pattern...${NC}"

        # Replace inline typing with proper pattern
        sed -i.bak -E 's/forEach\(\(([^:]+): ([^)]+)\)/forEach\(\(\1\) => { const typed = \1 as \2; \/\/ Fixed typing/g' "$file"

        ((FIXED_COUNT++))
    fi

    # Fix 5: Add missing light DOM implementation
    if ! grep -q "createRenderRoot" "$file" && grep -q "extends.*LitElement" "$file"; then
        echo -e "${YELLOW}  Adding light DOM implementation...${NC}"

        # Add createRenderRoot method
        sed -i.bak '/export class/ a\
  // Use light DOM for USWDS compatibility\
  protected override createRenderRoot(): HTMLElement {\
    return this as any;\
  }' "$file"

        ((FIXED_COUNT++))
    fi

    # Fix 6: Add missing PropertyValues import for components using it
    if grep -q "PropertyValues" "$file" && ! grep -q "import.*PropertyValues" "$file"; then
        echo -e "${YELLOW}  Adding PropertyValues import...${NC}"

        sed -i.bak '1 a\
import type { PropertyValues } from '\''lit'\'';' "$file"

        ((FIXED_COUNT++))
    fi

    # Clean up backup files
    rm -f "${file}.bak"
}

# Main execution
if [ -n "$COMPONENT" ]; then
    # Fix specific component
    if [ -f "src/components/$COMPONENT/usa-$COMPONENT.ts" ]; then
        fix_component "src/components/$COMPONENT/usa-$COMPONENT.ts"
    else
        echo -e "${RED}Component $COMPONENT not found${NC}"
        exit 1
    fi
else
    # Fix all components
    echo "Scanning all components for common issues..."
    echo ""

    for component_file in src/components/*/usa-*.ts; do
        # Skip test files (.test.ts, .browser.test.ts, .spec.ts)
        if [ -f "$component_file" ] && ! echo "$component_file" | grep -qE "\.(test|spec)\.ts$"; then
            fix_component "$component_file"
        fi
    done
fi

echo ""
echo "==============================="
if [ $FIXED_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Fixed $FIXED_COUNT issues automatically!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes with: git diff"
    echo "2. Run tests: npm test"
    echo "3. Run compliance check: npm run validate:uswds-compliance"
    echo "4. Commit the fixes"
else
    echo -e "${GREEN}✅ No common issues found - all good!${NC}"
fi

# Run quick validation
echo ""
echo "Running quick validation..."
npm run typecheck
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors detected - review and fix manually${NC}"
fi