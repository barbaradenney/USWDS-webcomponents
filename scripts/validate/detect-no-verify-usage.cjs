#!/usr/bin/env node

/**
 * Detects if --no-verify was used for the last commit
 *
 * This script determines if pre-commit hooks were bypassed by checking:
 * 1. Git reflog for --no-verify flag in commit command
 * 2. Commit message for explicit documentation of --no-verify
 * 3. Timing analysis (if commit was suspiciously fast)
 *
 * Exit codes:
 *   0 - --no-verify WAS used (hooks bypassed)
 *   1 - --no-verify was NOT used (normal commit)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COMMIT_HASH = process.argv[2] || 'HEAD';

/**
 * Check if --no-verify was explicitly mentioned in commit message
 */
function checkCommitMessage() {
  try {
    const commitMessage = execSync(`git log -1 --format=%B ${COMMIT_HASH}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    // Check for explicit mentions
    const patterns = [
      /--no-verify/i,
      /bypass.*hook/i,
      /skip.*validation/i,
      /used --no-verify/i
    ];

    return patterns.some(pattern => pattern.test(commitMessage));
  } catch (error) {
    return false;
  }
}

/**
 * Check if validation metrics file exists for this commit
 * (If pre-commit ran, it should have created metrics)
 */
function checkValidationMetrics() {
  const metricsFile = path.join(process.cwd(), '.git', 'validation-metrics.json');

  if (!fs.existsSync(metricsFile)) {
    // No metrics file means hooks might have been bypassed
    return false;
  }

  try {
    const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
    const commitTime = execSync(`git log -1 --format=%ct ${COMMIT_HASH}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    // Check if metrics timestamp is close to commit time (within 5 minutes)
    const metricsTimestamp = new Date(metrics.timestamp).getTime() / 1000;
    const commitTimestamp = parseInt(commitTime);
    const timeDiff = Math.abs(commitTimestamp - metricsTimestamp);

    return timeDiff < 300; // 5 minutes
  } catch (error) {
    return false;
  }
}

/**
 * Check for specific markers that indicate hooks ran
 */
function checkHookMarkers() {
  try {
    // Check if the commit has the data-web-component-managed marker
    // (Only added by pre-commit validation)
    const changedFiles = execSync(`git diff-tree --no-commit-id --name-only -r ${COMMIT_HASH}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim().split('\n');

    // If modifying TypeScript files, check if they were linted
    const tsFiles = changedFiles.filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));

    if (tsFiles.length > 0) {
      // Try to detect if ESLint ran (this is imperfect but helpful)
      const lintCacheExists = fs.existsSync(path.join(process.cwd(), '.eslintcache'));
      const lintCacheTime = lintCacheExists
        ? fs.statSync(path.join(process.cwd(), '.eslintcache')).mtimeMs / 1000
        : 0;

      const commitTime = parseInt(execSync(`git log -1 --format=%ct ${COMMIT_HASH}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim());

      // If lint cache is older than commit, hooks might have been bypassed
      if (lintCacheTime > 0 && commitTime - lintCacheTime > 60) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return true; // Assume hooks ran if we can't determine
  }
}

/**
 * Main detection logic
 */
function detectNoVerify() {
  const checks = {
    commitMessageMentions: checkCommitMessage(),
    validationMetricsPresent: checkValidationMetrics(),
    hookMarkersPresent: checkHookMarkers()
  };

  // If commit message explicitly mentions --no-verify, that's definitive
  if (checks.commitMessageMentions) {
    return {
      used: true,
      reason: 'Commit message explicitly mentions --no-verify',
      confidence: 'high',
      checks
    };
  }

  // If validation metrics are missing or stale, hooks were likely bypassed
  if (!checks.validationMetricsPresent) {
    return {
      used: true,
      reason: 'Validation metrics missing or stale (pre-commit hooks likely bypassed)',
      confidence: 'medium',
      checks
    };
  }

  // All evidence suggests hooks ran normally
  return {
    used: false,
    reason: 'All indicators suggest pre-commit hooks ran normally',
    confidence: 'high',
    checks
  };
}

// Run detection
const result = detectNoVerify();

// Output JSON for consumption by post-commit hook
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  // Human-readable output
  if (result.used) {
    console.log('⚠️  --no-verify was used');
    console.log(`   Reason: ${result.reason}`);
    console.log(`   Confidence: ${result.confidence}`);
  } else {
    console.log('✅ Normal commit (hooks ran)');
  }
}

// Exit code: 0 if --no-verify was used, 1 if not
process.exit(result.used ? 0 : 1);
