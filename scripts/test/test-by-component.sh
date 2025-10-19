#!/bin/bash

# Component-Based Test Runner
# Runs tests component-by-component for better visibility and progress tracking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get all component directories
COMPONENT_DIRS=$(find src/components -mindepth 1 -maxdepth 1 -type d | sort)
TOTAL_COMPONENTS=$(echo "$COMPONENT_DIRS" | wc -l | tr -d ' ')

# Counters
CURRENT=0
PASSED=0
FAILED=0
FAILED_COMPONENTS=()

# Report file
REPORT_FILE="test-reports/component-test-results.txt"
mkdir -p test-reports
echo "Component Test Run - $(date)" > "$REPORT_FILE"
echo "==========================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Component-Based Test Runner${NC}"
echo -e "${BLUE}Total Components: $TOTAL_COMPONENTS${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Process each component
for COMPONENT_DIR in $COMPONENT_DIRS; do
  CURRENT=$((CURRENT + 1))
  COMPONENT_NAME=$(basename "$COMPONENT_DIR")

  echo -e "${BLUE}[$CURRENT/$TOTAL_COMPONENTS]${NC} Testing: ${YELLOW}$COMPONENT_NAME${NC}"

  # Check if component has tests
  TEST_FILES=$(find "$COMPONENT_DIR" -name "*.test.ts" 2>/dev/null || true)

  if [ -z "$TEST_FILES" ]; then
    echo -e "  ${YELLOW}⊘ No tests found${NC}"
    echo "[$CURRENT/$TOTAL_COMPONENTS] $COMPONENT_NAME: No tests found" >> "$REPORT_FILE"
    continue
  fi

  # Count test files
  TEST_COUNT=$(echo "$TEST_FILES" | wc -l | tr -d ' ')
  echo -e "  Found $TEST_COUNT test file(s)"

  # Run tests for this component
  if npm test -- "$COMPONENT_NAME" 2>&1 | tee -a "$REPORT_FILE" | tail -5; then
    PASSED=$((PASSED + 1))
    echo -e "  ${GREEN}✓ PASSED${NC}"
    echo "" >> "$REPORT_FILE"
  else
    FAILED=$((FAILED + 1))
    FAILED_COMPONENTS+=("$COMPONENT_NAME")
    echo -e "  ${RED}✗ FAILED${NC}"
    echo "  FAILURE DETAILS:" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi

  echo "" # Blank line between components
done

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Components: $TOTAL_COMPONENTS"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

echo "" >> "$REPORT_FILE"
echo "==========================================" >> "$REPORT_FILE"
echo "SUMMARY" >> "$REPORT_FILE"
echo "==========================================" >> "$REPORT_FILE"
echo "Total: $TOTAL_COMPONENTS" >> "$REPORT_FILE"
echo "Passed: $PASSED" >> "$REPORT_FILE"
echo "Failed: $FAILED" >> "$REPORT_FILE"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo -e "${RED}Failed Components:${NC}"
  for COMP in "${FAILED_COMPONENTS[@]}"; do
    echo -e "  - $COMP"
    echo "  - $COMP" >> "$REPORT_FILE"
  done
  echo ""
  echo -e "${YELLOW}Full report: $REPORT_FILE${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}All component tests passed!${NC}"
  echo "" >> "$REPORT_FILE"
  echo "All component tests passed!" >> "$REPORT_FILE"
  exit 0
fi
