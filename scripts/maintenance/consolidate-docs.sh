#!/bin/bash

# Documentation Consolidation Script
# Reduces 146 docs files to ~20 essential files
# See docs/CONSOLIDATION_PLAN.md for detailed plan

set -e  # Exit on error

DOCS_DIR="/Users/barbaramiles/Documents/Github/USWDS-webcomponents/docs"
ARCHIVED_DIR="$DOCS_DIR/archived"
SRC_DIR="/Users/barbaramiles/Documents/Github/USWDS-webcomponents/src/components"
BACKUP_DIR="/tmp/docs-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Documentation Consolidation Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored output
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Create backup
echo -e "${BLUE}Step 1: Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$DOCS_DIR" "$BACKUP_DIR/"
print_step "Backup created at: $BACKUP_DIR"
echo ""

# Ensure archived directory exists
mkdir -p "$ARCHIVED_DIR"

# Step 2: Archive status/progress reports (42 files)
echo -e "${BLUE}Step 2: Archiving status and progress reports (42 files)...${NC}"
ARCHIVE_FILES=(
    # Status & Progress Reports (25 files)
    "ACCESSIBILITY_ENHANCEMENT_PROGRESS.md"
    "ACCESSIBILITY_STATUS_SUMMARY.md"
    "ACCESSIBILITY_WORK_SESSION_SUMMARY.md"
    "ACCORDION_REFACTORING_SUMMARY.md"
    "AGGRESSIVE_CLEANUP_SUMMARY.md"
    "AUTO_UPDATE_STATUS.md"
    "COMPLIANCE_STATUS_REPORT.md"
    "COMPONENT_REVIEW_STATUS.md"
    "CYPRESS_FINAL_SUMMARY.md"
    "CYPRESS_TESTING_STATUS.md"
    "CYPRESS_TESTING_SUMMARY.md"
    "NAVIGATION_TEST_FINAL_SUMMARY.md"
    "NAVIGATION_TEST_SUCCESS.md"
    "PERFORMANCE_SUMMARY.md"
    "PHASE_3_TIMING_SUMMARY.md"
    "PHASE_5_PROGRESS_SUMMARY.md"
    "QUALITY_CHECKS_ENHANCEMENT_SUMMARY.md"
    "STORYBOOK_INVESTIGATION_CONCLUSION.md"
    "STORYBOOK_NAVIGATION_TEST_FINAL_RESULTS.md"
    "STORYBOOK_NAVIGATION_TEST_REPORT.md"
    "TIMING_REGRESSION_COMPLETION_SUMMARY.md"
    "USWDS_COMPLIANCE_SUMMARY.md"
    "VALIDATION_SYSTEM_SUMMARY.md"
    "VISUAL_TESTING_STATUS.md"
    "REPOSITORY_CONSOLIDATION_COMPLETE.md"

    # Analysis & Investigation (8 files)
    "PHASE_2_TIMING_ISSUES_ANALYSIS.md"
    "DATE_PICKER_CLICK_OUTSIDE_INVESTIGATION.md"
    "STORYBOOK_CYPRESS_TIMING_ANALYSIS.md"
    "BEHAVIOR_CONTRACT_TESTING_GAPS.md"
    "CLICK_EVENT_TESTING_CHECKLIST.md"
    "ACCESSIBILITY_WCAG_COMPLIANCE_ROADMAP.md"
    "TESTING_ENHANCEMENT_CHECKLIST.md"
    "KEYBOARD_NAVIGATION_TESTING_IMPLEMENTATION.md"

    # Specific Strategy Documents (9 files)
    "COMPONENT_MONITORING_STRATEGY.md"
    "DEBUG_PAGES_MAINTENANCE_STRATEGY.md"
    "VANILLA_JS_MIGRATION_STRATEGY.md"
    "OPTION_B_PURE_GLOBAL_INIT.md"
    "SUSTAINABLE_USWDS_INTEGRATION_OPTIONS.md"
    "TREE_SHAKING_WITH_GLOBAL_INIT.md"
    "PRODUCTION_USAGE_GLOBAL_INIT.md"
    "CYPRESS_TESTING_EXPANSION_PLAN.md"
    "USWDS_VISUAL_COMPLIANCE_PLAN.md"
)

for file in "${ARCHIVE_FILES[@]}"; do
    if [ -f "$DOCS_DIR/$file" ]; then
        mv "$DOCS_DIR/$file" "$ARCHIVED_DIR/"
        print_step "Archived: $file"
    else
        print_warning "Not found: $file"
    fi
done
echo ""

# Step 3: Move component-specific docs (8 files)
echo -e "${BLUE}Step 3: Moving component-specific docs to component folders (8 files)...${NC}"

# Accordion
if [ -f "$DOCS_DIR/USWDS_ACCORDION_BEHAVIOR_CONTRACT.md" ]; then
    mv "$DOCS_DIR/USWDS_ACCORDION_BEHAVIOR_CONTRACT.md" "$SRC_DIR/accordion/"
    print_step "Moved: USWDS_ACCORDION_BEHAVIOR_CONTRACT.md → accordion/"
fi
if [ -f "$DOCS_DIR/ACCORDION_STANDARD_PATTERN_REVERT.md" ]; then
    mv "$DOCS_DIR/ACCORDION_STANDARD_PATTERN_REVERT.md" "$SRC_DIR/accordion/"
    print_step "Moved: ACCORDION_STANDARD_PATTERN_REVERT.md → accordion/"
fi

# Combo Box
if [ -f "$DOCS_DIR/USWDS_COMBO_BOX_BEHAVIOR_CONTRACT.md" ]; then
    mv "$DOCS_DIR/USWDS_COMBO_BOX_BEHAVIOR_CONTRACT.md" "$SRC_DIR/combo-box/"
    print_step "Moved: USWDS_COMBO_BOX_BEHAVIOR_CONTRACT.md → combo-box/"
fi
if [ -f "$DOCS_DIR/COMBO_BOX_REGRESSION_PREVENTION.md" ]; then
    mv "$DOCS_DIR/COMBO_BOX_REGRESSION_PREVENTION.md" "$SRC_DIR/combo-box/"
    print_step "Moved: COMBO_BOX_REGRESSION_PREVENTION.md → combo-box/"
fi

# Character Count
if [ -f "$DOCS_DIR/USWDS_CHARACTER_COUNT_BEHAVIOR_CONTRACT.md" ]; then
    mv "$DOCS_DIR/USWDS_CHARACTER_COUNT_BEHAVIOR_CONTRACT.md" "$SRC_DIR/character-count/"
    print_step "Moved: USWDS_CHARACTER_COUNT_BEHAVIOR_CONTRACT.md → character-count/"
fi

# Tooltip
if [ -f "$DOCS_DIR/TOOLTIP_TROUBLESHOOTING_PREVENTION_SYSTEM.md" ]; then
    mv "$DOCS_DIR/TOOLTIP_TROUBLESHOOTING_PREVENTION_SYSTEM.md" "$SRC_DIR/tooltip/"
    print_step "Moved: TOOLTIP_TROUBLESHOOTING_PREVENTION_SYSTEM.md → tooltip/"
fi

# Footer
if [ -f "$DOCS_DIR/USWDS_FOOTER_ALIGNMENT_GUIDE.md" ]; then
    mv "$DOCS_DIR/USWDS_FOOTER_ALIGNMENT_GUIDE.md" "$SRC_DIR/footer/"
    print_step "Moved: USWDS_FOOTER_ALIGNMENT_GUIDE.md → footer/"
fi

echo ""

# Step 4: Delete obsolete/duplicate files (24 files)
echo -e "${BLUE}Step 4: Deleting obsolete and duplicate files (24 files)...${NC}"
DELETE_FILES=(
    # True Duplicates
    "TROUBLESHOOTING.md"
    "DEVELOPMENT_STANDARDS.md"
    "DEVELOPMENT_WORKFLOW.md"
    "TESTING_DOCUMENTATION.md"
    "TESTING_INFRASTRUCTURE_SHOWCASE.md"
    "TESTING_REGISTRY_TEMPLATE.md"
    "ACCESSIBILITY_TESTING.md"

    # System/Template Files
    "COMPONENT_TEMPLATE.md"
    "COMPONENT_CHANGELOG_TEMPLATE.md"
    "AUTOMATED_DOCUMENTATION_SYSTEM.md"
    "CHANGELOG_MANAGEMENT.md"
    "SCRIPT_MAINTENANCE.md"

    # Validation Systems
    "ARCHITECTURE_VALIDATION_RULES.md"
    "COMPONENT_ARCHITECTURE_VALIDATION.md"
    "CODE_QUALITY_REVIEW_SYSTEM.md"
    "COMPONENT_INTERACTION_TESTING_INTEGRATION.md"

    # Miscellaneous Implementation Details
    "COMPONENT_MIGRATION_PLAN.md"
    "COMPONENT_RISK_ASSESSMENT.md"
    "COMPONENT_CHANGELOGS_INDEX.md"
    "PACKAGE_JSON_CONSOLIDATION.md"
    "PREVENTING_ATTRIBUTE_MAPPING_ISSUES.md"
    "IFRAME_DELEGATION_PREVENTION_SYSTEM.md"
    "MINIMAL_WRAPPER_ENFORCEMENT.md"
    "EARLY_ISSUE_DETECTION 2.md"
    "CSS_ARCHITECTURE.md"
    "LOGGING_SYSTEM.md"
)

for file in "${DELETE_FILES[@]}"; do
    if [ -f "$DOCS_DIR/$file" ]; then
        rm "$DOCS_DIR/$file"
        print_step "Deleted: $file"
    else
        print_warning "Not found: $file"
    fi
done
echo ""

# Step 5: Create consolidation scripts for new guides
echo -e "${BLUE}Step 5: Creating consolidated guides...${NC}"
print_warning "Consolidated guides require manual content merging"
print_warning "See docs/CONSOLIDATION_PLAN.md Section 2 for merge instructions"
echo ""
echo "Guides to create:"
echo "  - CYPRESS_GUIDE.md (merge 5 files)"
echo "  - ARCHITECTURE_PATTERNS.md (merge 6 files)"
echo "  - USWDS_INTEGRATION_GUIDE.md (merge 8 files)"
echo "  - JAVASCRIPT_GUIDE.md (merge 6 files)"
echo ""
echo "Guides to enhance:"
echo "  - guides/TESTING_GUIDE.md (merge 11 files)"
echo "  - guides/COMPLIANCE_GUIDE.md (merge 6 files)"
echo "  - PERFORMANCE_GUIDE.md (merge 2 files)"
echo "  - REGRESSION_PREVENTION_GUIDE.md (merge 5 files)"
echo ""

# Step 6: Report results
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Consolidation Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Count remaining files
REMAINING=$(ls "$DOCS_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
ARCHIVED=$(ls "$ARCHIVED_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')

echo -e "${GREEN}Results:${NC}"
echo "  • Docs remaining: $REMAINING files"
echo "  • Files archived: $ARCHIVED files"
echo "  • Backup location: $BACKUP_DIR"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review docs/CONSOLIDATION_PLAN.md Section 2"
echo "  2. Manually merge content into consolidated guides"
echo "  3. Update docs/README.md with new structure"
echo "  4. Validate all internal links"
echo "  5. Update CLAUDE.md if needed"
echo ""

echo -e "${GREEN}✓ Phase 1 Complete: Archiving, Moving, and Deleting${NC}"
echo -e "${YELLOW}⚠ Phase 2 Required: Manual Content Consolidation${NC}"
