#!/usr/bin/env node

/**
 * Runtime Error Detector for USWDS Web Components
 *
 * Detects JavaScript issues that might not be caught by TypeScript
 * but cause runtime errors in Storybook and browsers.
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const issues = [];
let fileCount = 0;

/**
 * Parse TypeScript file and analyze for runtime issues
 */
async function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Parse as TypeScript
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'decorators-legacy', 'classProperties']
    });

    const classInfo = {
      name: null,
      methods: new Map(),
      properties: new Set(),
      initCalls: []
    };

    // Traverse AST to find issues
    traverse.default(ast, {
      ClassDeclaration(path) {
        classInfo.name = path.node.id?.name;
      },

      ClassMethod(path) {
        const methodName = path.node.key.name;
        const location = path.node.loc?.start;

        // Check for duplicate methods
        if (classInfo.methods.has(methodName)) {
          issues.push({
            file: relativePath,
            line: location?.line || 0,
            type: 'duplicate-method',
            message: `Duplicate method definition: ${methodName}`,
            severity: 'error'
          });
        }

        classInfo.methods.set(methodName, {
          line: location?.line,
          async: path.node.async,
          static: path.node.static
        });
      },

      // Check for USWDS property access issues
      MemberExpression(path) {
        if (path.node.object?.name === 'USWDS') {
          const property = path.node.property;

          // Check for computed property access that should use brackets
          if (property?.type === 'Identifier' && property.name?.includes('-')) {
            const location = path.node.loc?.start;
            issues.push({
              file: relativePath,
              line: location?.line || 0,
              type: 'invalid-property-access',
              message: `Invalid property access: USWDS.${property.name} should use bracket notation`,
              severity: 'error'
            });
          }
        }
      },

      // Check for initialization method calls
      CallExpression(path) {
        if (path.node.callee?.type === 'MemberExpression') {
          const object = path.node.callee.object;
          const property = path.node.callee.property;

          if (object?.type === 'ThisExpression' &&
              property?.type === 'Identifier' &&
              property.name?.startsWith('initializeUSWDS')) {
            classInfo.initCalls.push({
              method: property.name,
              line: path.node.loc?.start?.line
            });
          }
        }
      },

      // Check for console statements that might indicate issues
      MemberExpression(path) {
        if (path.node.object?.name === 'console') {
          const method = path.node.property?.name;
          const location = path.node.loc?.start;

          if (method === 'warn' || method === 'error') {
            // Look at parent to get the message
            const parent = path.parent;
            if (parent?.type === 'CallExpression' && parent.arguments[0]) {
              const arg = parent.arguments[0];
              if (arg.type === 'StringLiteral' && arg.value?.includes('failed')) {
                issues.push({
                  file: relativePath,
                  line: location?.line || 0,
                  type: 'error-handling',
                  message: `Console ${method} suggests potential runtime issue: ${arg.value}`,
                  severity: 'warning'
                });
              }
            }
          }
        }
      }
    });

    // Verify init methods are defined
    for (const call of classInfo.initCalls) {
      if (!classInfo.methods.has(call.method)) {
        issues.push({
          file: relativePath,
          line: call.line || 0,
          type: 'undefined-method',
          message: `Called method ${call.method} is not defined`,
          severity: 'error'
        });
      }
    }

    fileCount++;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
  }
}

/**
 * Check for common runtime patterns that cause issues
 */
function checkRuntimePatterns(content, filePath) {
  const relativePath = path.relative(process.cwd(), filePath);

  // Pattern checks that don't need AST
  const patterns = [
    {
      // Unclosed try blocks
      regex: /try\s*\{[^}]*?(?:try\s*\{|$)/gm,
      type: 'malformed-try-catch',
      message: 'Potentially unclosed or nested try block'
    },
    {
      // Missing await on async operations
      regex: /this\.(updateComplete|requestUpdate)\s*(?!\.then|;|\))/gm,
      type: 'missing-await',
      message: 'Potentially missing await on async operation'
    },
    {
      // Direct DOM manipulation in constructors
      regex: /constructor[^}]*querySelector/gm,
      type: 'dom-in-constructor',
      message: 'DOM manipulation in constructor (elements not ready)'
    }
  ];

  patterns.forEach(({ regex, type, message }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      issues.push({
        file: relativePath,
        line: lines.length,
        type,
        message,
        severity: 'warning'
      });
    }
  });
}

async function main() {
  console.log('🔍 Detecting potential runtime errors...\n');

  // Find all TypeScript component files
  const files = globSync('src/components/**/*.ts', {
    ignore: ['**/*.test.ts', '**/*.stories.ts', '**/*.d.ts']
  });

  // Analyze each file
  for (const file of files) {
    await analyzeFile(file);
    const content = fs.readFileSync(file, 'utf8');
    checkRuntimePatterns(content, file);
  }

  console.log(`📊 Analyzed ${fileCount} files\n`);

  if (issues.length === 0) {
    console.log('✅ No runtime issues detected');
    process.exit(0);
  }

  // Group by severity
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  if (errors.length > 0) {
    console.log('❌ Runtime Errors Found:\n');
    errors.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    Type: ${issue.type}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  Runtime Warnings:\n');
    warnings.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    Type: ${issue.type}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  console.log(`\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings`);

  if (errors.length > 0) {
    console.log('\n💡 To fix these issues:');
    console.log('  1. Check for duplicate method definitions');
    console.log('  2. Ensure all initialization methods exist');
    console.log('  3. Use bracket notation for hyphenated properties');
    console.log('  4. Await async operations properly');
    process.exit(1);
  }
}

// Check if required dependencies are installed
try {
  require.resolve('@babel/parser');
  require.resolve('@babel/traverse');
} catch (error) {
  console.log('📦 Installing required dependencies...');
  const { execSync } = require('child_process');
  execSync('npm install --save-dev @babel/parser @babel/traverse', { stdio: 'inherit' });
}

main().catch(console.error);