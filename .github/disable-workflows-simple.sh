#!/bin/bash

# Workflows to disable (non-critical for monorepo migration)
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

mkdir -p .github/workflows.disabled

echo "Disabling non-critical workflows by moving to .disabled folder..."

for workflow in "${WORKFLOWS_TO_DISABLE[@]}"; do
  if [ -f ".github/workflows/$workflow" ]; then
    mv ".github/workflows/$workflow" ".github/workflows.disabled/$workflow"
    echo "  ✅ Disabled: $workflow"
  else
    echo "  ⏭️  Not found: $workflow"
  fi
done

echo ""
echo "✅ Moved $(echo ${#WORKFLOWS_TO_DISABLE[@]}) workflows to .github/workflows.disabled/"
echo ""
echo "Enabled workflows (critical only):"
ls -1 .github/workflows/*.yml | xargs -n 1 basename
