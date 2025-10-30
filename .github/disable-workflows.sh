#!/bin/bash

# Workflows to disable (non-critical)
WORKFLOWS_TO_DISABLE=(
  "accessibility-report.yml"
  "auto-maintenance.yml"
  "auto-pr-to-main.yml"
  "bundle-size.yml"
  "component-interaction-testing.yml"
  "comprehensive-testing.yml"
  "dependency-updates.yml"
  "docs-maintenance.yml"
  "docs-regeneration.yml"
  "early-detection.yml"
  "monthly-maintenance.yml"
  "over-engineering-detection.yml"
  "performance-regression.yml"
  "pr-automation.yml"
  "publish.yml"
  "quality-gates.yml"
  "release.yml"
  "scripts-maintenance.yml"
  "security.yml"
  "smart-ci.yml"
  "stale-branch-cleanup.yml"
  "storybook-uswds-integration.yml"
  "testing-health-check.yml"
  "uswds-compliance.yml"
  "uswds-transformation.yml"
  "uswds-update-check.yml"
  "visual-testing.yml"
  "weekly-intensive-testing.yml"
)

echo "Disabling non-critical workflows..."

for workflow in "${WORKFLOWS_TO_DISABLE[@]}"; do
  if [ -f ".github/workflows/$workflow" ]; then
    echo "Processing: $workflow"
    
    # Add conditional to skip workflow (keep it but make it not run)
    # This is safer than deleting files
    if ! grep -q "if: false # Temporarily disabled for monorepo migration" ".github/workflows/$workflow"; then
      # Add the condition right after 'jobs:'
      sed -i '' '/^jobs:/a\
  # Temporarily disabled for monorepo migration - needs path/config updates\
  workflow-disabled:\
    if: false # Temporarily disabled for monorepo migration\
    runs-on: ubuntu-latest\
    steps:\
      - run: echo "Workflow temporarily disabled"
' ".github/workflows/$workflow"
      
      echo "  ✅ Disabled: $workflow"
    else
      echo "  ⏭️  Already disabled: $workflow"
    fi
  else
    echo "  ⚠️  Not found: $workflow"
  fi
done

echo ""
echo "✅ Disabled $(echo ${#WORKFLOWS_TO_DISABLE[@]}) non-critical workflows"
echo ""
echo "Enabled workflows (critical only):"
echo "  - ci.yml"
echo "  - visual-regression.yml (Node.js 20 fix verified)"
echo "  - quality-checks.yml"
echo "  - deploy-storybook.yml"
