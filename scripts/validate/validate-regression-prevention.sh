#!/bin/bash

# Regression Prevention Validation Script
#
# This script runs all regression prevention tests to ensure that critical
# patterns and infrastructure remain intact after changes.
#
# Usage: ./scripts/validate-regression-prevention.sh

set -e

echo "🔍 Starting Regression Prevention Validation..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

echo "🧪 Running Infrastructure Validation Tests..."
echo "----------------------------------------------"

# Browser Testing Infrastructure
echo "Testing browser testing infrastructure..."
npm run test __tests__/infrastructure/browser-testing-validation.test.ts --silent
print_status "Browser testing infrastructure validation"

# USWDS Pattern Validation
echo "Testing USWDS pattern compliance..."
npm run test __tests__/infrastructure/uswds-pattern-validation.test.ts --silent
print_status "USWDS pattern validation"

# Build Environment Validation
echo "Testing build environment integrity..."
npm run test __tests__/infrastructure/build-environment-validation.test.ts --silent
print_status "Build environment validation"

# Component Architecture Validation
echo "Testing component architecture consistency..."
npm run test __tests__/infrastructure/component-architecture-validation.test.ts --silent
print_status "Component architecture validation"

echo ""
echo "🎯 Running Critical System Tests..."
echo "-----------------------------------"

# TypeScript Compilation
echo "Validating TypeScript compilation..."
npm run typecheck > /dev/null 2>&1
print_status "TypeScript compilation"

# Linting
echo "Validating code quality (ESLint)..."
npm run lint > /dev/null 2>&1
print_status "Code quality (ESLint)"

# Build Process
echo "Validating build process..."
npm run build > /dev/null 2>&1
print_status "Build process"

echo ""
echo "🏃‍♂️ Running Sample Component Tests..."
echo "--------------------------------------"

# Test a few critical components to ensure test infrastructure is working
CRITICAL_COMPONENTS=("validation" "accordion" "button" "alert")

for component in "${CRITICAL_COMPONENTS[@]}"; do
    echo "Testing $component component..."
    npm run test "src/components/$component" --silent > /dev/null 2>&1
    print_status "$component component tests"
done

echo ""
echo "📊 Running Test Success Rate Monitoring..."
echo "------------------------------------------"

# This test includes more comprehensive checks
npm run test __tests__/infrastructure/test-success-rate-monitor.test.ts --silent
print_status "Test success rate monitoring"

echo ""
echo -e "${GREEN}🎉 All Regression Prevention Tests Passed!${NC}"
echo "============================================="
echo ""
echo "Summary:"
echo "✅ Browser testing infrastructure intact"
echo "✅ USWDS patterns maintained"
echo "✅ Build environment working"
echo "✅ Component architecture consistent"
echo "✅ TypeScript compilation successful"
echo "✅ Code quality standards met"
echo "✅ Build process functional"
echo "✅ Critical components testing successfully"
echo "✅ Test success rates maintained"
echo ""
echo -e "${YELLOW}📋 To run individual validation categories:${NC}"
echo "  Browser Testing: npm run test __tests__/infrastructure/browser-testing-validation.test.ts"
echo "  USWDS Patterns: npm run test __tests__/infrastructure/uswds-pattern-validation.test.ts"
echo "  Build Environment: npm run test __tests__/infrastructure/build-environment-validation.test.ts"
echo "  Component Architecture: npm run test __tests__/infrastructure/component-architecture-validation.test.ts"
echo "  Success Rate Monitoring: npm run test __tests__/infrastructure/test-success-rate-monitor.test.ts"
echo ""
echo -e "${GREEN}✨ Ready for production deployment!${NC}"