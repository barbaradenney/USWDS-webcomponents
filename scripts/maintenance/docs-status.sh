#!/bin/bash

# Documentation Status Report
# Shows current state of docs consolidation

DOCS_DIR="/Users/barbaramiles/Documents/Github/USWDS-webcomponents/docs"
ARCHIVED_DIR="$DOCS_DIR/archived"
SRC_DIR="/Users/barbaramiles/Documents/Github/USWDS-webcomponents/src/components"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Documentation Consolidation Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Count files
TOTAL_DOCS=$(find "$DOCS_DIR" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')
ARCHIVED=$(find "$ARCHIVED_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
COMPONENT_DOCS=$(find "$SRC_DIR" -name "USWDS_*.md" -o -name "*BEHAVIOR*.md" -o -name "*REGRESSION*.md" | wc -l | tr -d ' ')

echo -e "${CYAN}Current Metrics:${NC}"
echo "  • Active docs: $TOTAL_DOCS files"
echo "  • Archived: $ARCHIVED files"
echo "  • Component-specific: $COMPONENT_DOCS files"
echo ""

# Target structure
echo -e "${CYAN}Target Structure (20 files):${NC}"
echo ""

# Essential files (12)
echo -e "${GREEN}Essential Files (12):${NC}"
ESSENTIAL=(
    "README.md"
    "DEBUGGING_GUIDE.md"
    "COMPONENT_DEVELOPMENT_GUIDE.md"
    "COMPONENT_STATUS.md"
    "ARCHITECTURE_DECISION_SCRIPT_TAG_VS_COMPONENT_INIT.md"
    "ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md"
    "JAVASCRIPT_INTEGRATION_STRATEGY.md"
    "USWDS_COMPLIANCE_METHODOLOGY.md"
    "USWDS_DOM_TRANSFORMATION_PATTERNS.md"
    "USWDS_TRANSFORMATION_PATTERNS.md"
    "STORYBOOK_BEST_PRACTICES.md"
    "NPM_SCRIPTS_REFERENCE.md"
)

for file in "${ESSENTIAL[@]}"; do
    if [ -f "$DOCS_DIR/$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done
echo ""

# New consolidated guides (6)
echo -e "${YELLOW}Consolidated Guides (6):${NC}"
NEW_GUIDES=(
    "CYPRESS_GUIDE.md"
    "ARCHITECTURE_PATTERNS.md"
    "USWDS_INTEGRATION_GUIDE.md"
    "JAVASCRIPT_GUIDE.md"
)

for file in "${NEW_GUIDES[@]}"; do
    if [ -f "$DOCS_DIR/$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ⚠ $file (NEEDS CREATION)"
    fi
done

# Enhanced existing guides
ENHANCED=(
    "guides/TESTING_GUIDE.md"
    "guides/COMPLIANCE_GUIDE.md"
)

for file in "${ENHANCED[@]}"; do
    if [ -f "$DOCS_DIR/$file" ]; then
        echo "  ✓ $file (EXISTS - needs enhancement)"
    else
        echo "  ✗ $file (MISSING)"
    fi
done
echo ""

# Legacy reference (5)
echo -e "${CYAN}Legacy Reference (5):${NC}"
LEGACY=(
    "THEMING_GUIDE.md"
    "DOM_REFERENCE_SAFETY_GUIDE.md"
    "LIT_DIRECTIVE_BEST_PRACTICES.md"
    "USWDS_ICON_GUIDELINES.md"
    "USWDS_IMPORT_STANDARDS.md"
)

for file in "${LEGACY[@]}"; do
    if [ -f "$DOCS_DIR/$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done
echo ""

# Progress calculation
ESSENTIAL_COUNT=0
for file in "${ESSENTIAL[@]}"; do
    [ -f "$DOCS_DIR/$file" ] && ((ESSENTIAL_COUNT++))
done

NEW_GUIDES_COUNT=0
for file in "${NEW_GUIDES[@]}"; do
    [ -f "$DOCS_DIR/$file" ] && ((NEW_GUIDES_COUNT++))
done

ENHANCED_COUNT=0
for file in "${ENHANCED[@]}"; do
    [ -f "$DOCS_DIR/$file" ] && ((ENHANCED_COUNT++))
done

LEGACY_COUNT=0
for file in "${LEGACY[@]}"; do
    [ -f "$DOCS_DIR/$file" ] && ((LEGACY_COUNT++))
done

TOTAL_EXPECTED=23  # 12 essential + 6 consolidated + 5 legacy
TOTAL_PRESENT=$((ESSENTIAL_COUNT + NEW_GUIDES_COUNT + ENHANCED_COUNT + LEGACY_COUNT))
PROGRESS=$((TOTAL_PRESENT * 100 / TOTAL_EXPECTED))

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Overall Progress: $PROGRESS% ($TOTAL_PRESENT/$TOTAL_EXPECTED files)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Next steps
if [ $NEW_GUIDES_COUNT -lt 4 ]; then
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Run: ./scripts/consolidate-docs.sh (Phase 1)"
    echo "  2. Follow: docs/CONSOLIDATION_MERGE_GUIDE.md (Phase 2)"
    echo "  3. Create consolidated guides (6 new files)"
    echo "  4. Enhance existing guides (2 files)"
    echo "  5. Update docs/README.md"
    echo "  6. Validate links and references"
elif [ $TOTAL_DOCS -gt 30 ]; then
    echo -e "${YELLOW}Status:${NC}"
    echo "  ⚠ Phase 1 (automated) may not be complete"
    echo "  • Current docs count: $TOTAL_DOCS (target: ~20)"
    echo "  • Review docs/CONSOLIDATION_PLAN.md"
else
    echo -e "${GREEN}Status:${NC}"
    echo "  ✓ Consolidation nearly complete!"
    echo "  • Validate all links work"
    echo "  • Update CLAUDE.md references if needed"
    echo "  • Create final documentation index"
fi
