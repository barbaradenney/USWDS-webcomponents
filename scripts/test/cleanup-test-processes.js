#!/usr/bin/env node

/**
 * Test Process Cleanup Script
 *
 * Safely kills any lingering test runner processes to prevent memory leaks
 * and system slowdowns from background test processes.
 */

import { execSync } from 'child_process';

class TestProcessCleanup {
  constructor() {
    this.processNames = [
      'vitest',
      'test-storybook',
      'playwright',
      'cypress'
    ];
  }

  /**
   * Clean up all test-related processes
   */
  async cleanup() {
    console.log('🧹 Cleaning up test processes...\n');

    let totalKilled = 0;

    for (const processName of this.processNames) {
      const killed = this.killProcessesByName(processName);
      totalKilled += killed;
    }

    if (totalKilled > 0) {
      console.log(`\n✅ Cleaned up ${totalKilled} test processes`);
      console.log('💡 Your system should be more responsive now\n');
    } else {
      console.log('✅ No lingering test processes found\n');
    }

    this.showResourceUsage();
  }

  /**
   * Kill processes by name pattern
   */
  killProcessesByName(processName) {
    try {
      // Find processes
      const findCmd = `ps aux | grep -i "${processName}" | grep -v grep | awk '{print $2}'`;
      const pids = execSync(findCmd, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

      if (pids.length === 0) {
        console.log(`✓ No ${processName} processes found`);
        return 0;
      }

      console.log(`🔍 Found ${pids.length} ${processName} process(es): ${pids.join(', ')}`);

      // Kill processes gracefully first
      for (const pid of pids) {
        try {
          execSync(`kill ${pid}`, { stdio: 'ignore' });
          console.log(`  ✓ Gracefully stopped process ${pid}`);
        } catch (error) {
          // If graceful kill fails, force kill
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`  ⚡ Force killed process ${pid}`);
          } catch (forceError) {
            console.log(`  ⚠️  Could not kill process ${pid} (may have already exited)`);
          }
        }
      }

      return pids.length;
    } catch (error) {
      console.log(`✓ No ${processName} processes found`);
      return 0;
    }
  }

  /**
   * Show current resource usage
   */
  showResourceUsage() {
    try {
      console.log('📊 Current system resource usage:');

      // Show memory usage
      const memInfo = execSync('ps aux | head -1 && ps aux | grep -E "(node|vitest|storybook)" | grep -v grep', { encoding: 'utf8' });
      if (memInfo.trim()) {
        console.log(memInfo);
      } else {
        console.log('✅ No test-related processes consuming resources');
      }
    } catch (error) {
      console.log('✅ System resources look clean');
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new TestProcessCleanup();
  cleanup.cleanup().catch(console.error);
}

export default TestProcessCleanup;