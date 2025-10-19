/**
 * ESLint Rule: Prevent USWDS Component Issues
 *
 * Comprehensive rule to prevent common USWDS component initialization issues:
 * 1. Missing initialization guards
 * 2. Problematic import patterns
 * 3. Unsafe directive usage
 * 4. Missing cleanup patterns
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent USWDS component initialization and rendering issues',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingInitGuard: 'USWDS initialization ({{method}}) must have guard to prevent duplicates. Add: if (this.usingUSWDSEnhancement) return;',
      problematicImport: 'Avoid importing full USWDS bundle. Use specific module: @uswds/uswds/js/usa-{{component}}',
      unsafeDirective: 'unsafeHTML directive can cause initialization errors. Consider using plain text content.',
      missingCleanupFlag: 'USWDS cleanup method should reset initialization flag: this.usingUSWDSEnhancement = false;',
      missingErrorHandling: 'USWDS initialization should include try/catch error handling',
      missingGuardProperty: 'Components with USWDS initialization need guard property: private usingUSWDSEnhancement = false;'
    },
  },

  create(context) {
    let hasUSWDSInit = false;
    let hasGuardProperty = false;
    let hasGuardCheck = false;
    let initMethods = [];
    let cleanupMethods = [];

    function getComponentName(filename) {
      const match = filename.match(/usa-([^.]+)\.ts$/);
      return match ? match[1] : 'component';
    }

    function hasProperErrorHandling(node) {
      // Check if the method containing this node has try/catch
      let parent = node.parent;
      while (parent && parent.type !== 'MethodDefinition' && parent.type !== 'FunctionDeclaration') {
        if (parent.type === 'TryStatement') return true;
        parent = parent.parent;
      }
      return false;
    }

    function isInInitializationMethod(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'MethodDefinition' && parent.key.name) {
          const methodName = parent.key.name.toLowerCase();
          return methodName.includes('initialize') || methodName.includes('init');
        }
        parent = parent.parent;
      }
      return false;
    }

    function hasGuardInMethod(node) {
      // Look for guard check in the same method
      let method = node.parent;
      while (method && method.type !== 'MethodDefinition') {
        method = method.parent;
      }

      if (method && method.value && method.value.body) {
        const methodSource = context.getSourceCode().getText(method.value.body);
        return methodSource.includes('usingUSWDSEnhancement') ||
               methodSource.includes('initialized') ||
               methodSource.includes('Already initialized');
      }
      return false;
    }

    return {
      // Check for USWDS .on(this) calls
      'CallExpression[callee.property.name="on"][arguments.0.type="ThisExpression"]'(node) {
        hasUSWDSInit = true;
        initMethods.push(node);

        // Check for initialization guard
        if (!hasGuardInMethod(node)) {
          const methodCall = context.getSourceCode().getText(node);
          context.report({
            node,
            messageId: 'missingInitGuard',
            data: { method: methodCall },
            fix(fixer) {
              // Find the method start and add guard
              let method = node.parent;
              while (method && method.type !== 'MethodDefinition') {
                method = method.parent;
              }

              if (method && method.value && method.value.body && method.value.body.body[0]) {
                const firstStatement = method.value.body.body[0];
                const guardCode = `
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(\`⚠️ \${this.constructor.name}: Already initialized, skipping duplicate initialization\`);
      return;
    }
`;
                return fixer.insertTextBefore(firstStatement, guardCode);
              }
            }
          });
        }

        // Check for error handling
        if (!hasProperErrorHandling(node)) {
          context.report({
            node,
            messageId: 'missingErrorHandling',
          });
        }
      },

      // Check for problematic USWDS imports
      'ImportExpression[source.value="@uswds/uswds"]'(node) {
        const componentName = getComponentName(context.getFilename());
        context.report({
          node,
          messageId: 'problematicImport',
          data: { component: componentName },
          fix(fixer) {
            return fixer.replaceText(node.source, `"@uswds/uswds/js/usa-${componentName}"`);
          }
        });
      },

      // Check for unsafe directive usage
      'Identifier[name="unsafeHTML"]'(node) {
        context.report({
          node,
          messageId: 'unsafeDirective',
        });
      },

      // Check for USWDS .off(this) calls in cleanup
      'CallExpression[callee.property.name="off"][arguments.0.type="ThisExpression"]'(node) {
        cleanupMethods.push(node);
      },

      // Check for guard property declaration
      'PropertyDefinition[key.name="usingUSWDSEnhancement"]'(node) {
        hasGuardProperty = true;
      },

      'VariableDeclarator[id.name="usingUSWDSEnhancement"]'(node) {
        hasGuardProperty = true;
      },

      // Check for guard usage
      'MemberExpression[property.name="usingUSWDSEnhancement"]'(node) {
        hasGuardCheck = true;
      },

      // Final validation at program end
      'Program:exit'() {
        // If component has USWDS init but no guard property
        if (hasUSWDSInit && !hasGuardProperty) {
          context.report({
            node: context.getSourceCode().ast,
            messageId: 'missingGuardProperty',
            fix(fixer) {
              // Find class body and add property
              const classNode = context.getSourceCode().ast.body.find(
                node => node.type === 'ClassDeclaration'
              );

              if (classNode && classNode.body.body.length > 0) {
                const firstMember = classNode.body.body[0];
                const guardProperty = '  private usingUSWDSEnhancement = false;\n\n';
                return fixer.insertTextBefore(firstMember, guardProperty);
              }
            }
          });
        }

        // Check cleanup methods for flag reset
        cleanupMethods.forEach(cleanupNode => {
          let method = cleanupNode.parent;
          while (method && method.type !== 'MethodDefinition') {
            method = method.parent;
          }

          if (method && method.value && method.value.body) {
            const methodSource = context.getSourceCode().getText(method.value.body);
            if (!methodSource.includes('usingUSWDSEnhancement = false')) {
              context.report({
                node: cleanupNode,
                messageId: 'missingCleanupFlag',
                fix(fixer) {
                  // Add flag reset before method end
                  const methodBody = method.value.body;
                  const lastStatement = methodBody.body[methodBody.body.length - 1];
                  const flagReset = '\n    // Reset enhancement flag to allow reinitialization\n    this.usingUSWDSEnhancement = false;';
                  return fixer.insertTextAfter(lastStatement, flagReset);
                }
              });
            }
          }
        });
      }
    };
  },
};