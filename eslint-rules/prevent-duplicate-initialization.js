/**
 * ESLint Rule: Prevent Duplicate USWDS Initialization
 *
 * Catches patterns that can lead to duplicate initialization:
 * - USWDS initialization methods without guards
 * - Missing initialization flags
 * - Missing cleanup flag resets
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent duplicate USWDS initialization patterns',
      category: 'Best Practices',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingInitGuard: 'USWDS initialization method "{{methodName}}" should check for existing initialization before proceeding. Add: if (this.{{flagName}}) { return; }',
      missingInitFlag: 'Component with USWDS initialization should have an initialization flag property like "initialized" or "usingUSWDSEnhancement"',
      missingCleanupReset: 'Cleanup method should reset initialization flag to allow reinitialization. Add: this.{{flagName}} = false;',
      unsafeInitPattern: 'Direct USWDS method call "{{methodCall}}" without initialization guard can cause duplicates',
    },
  },

  create(context) {
    let hasUSWDSInit = false;
    let hasInitFlag = false;
    let initMethods = [];
    let cleanupMethods = [];
    let flagNames = [];

    return {
      // Check for USWDS initialization patterns
      'CallExpression[callee.property.name="on"][arguments.0.type="ThisExpression"]'(node) {
        // Found USWDS .on(this) call
        hasUSWDSInit = true;

        // Check if it's in a method with guard
        const method = findParentMethod(node);
        if (method && !hasGuardInMethod(method)) {
          context.report({
            node,
            messageId: 'unsafeInitPattern',
            data: {
              methodCall: getMethodCallString(node),
            },
          });
        }
      },

      // Track initialization methods
      'MethodDefinition[key.name=/^(initialize.*USWDS|initializeUSWDS.*)/]'(node) {
        initMethods.push(node);
        hasUSWDSInit = true;

        // Check if method has initialization guard
        if (!hasGuardInMethod(node.value)) {
          const flagName = findInitializationFlag(context.getScope()) || 'initialized';
          context.report({
            node: node.key,
            messageId: 'missingInitGuard',
            data: {
              methodName: node.key.name,
              flagName,
            },
            fix(fixer) {
              return fixer.insertTextAfter(
                node.value.body.body[0] || node.value.body,
                `\n    // Prevent multiple initializations\n    if (this.${flagName}) {\n      console.log(\`⚠️ Component already initialized, skipping duplicate initialization\`);\n      return;\n    }\n`
              );
            },
          });
        }
      },

      // Track cleanup methods
      'MethodDefinition[key.name=/^(cleanup.*USWDS|cleanupUSWDS.*|disconnectedCallback)/]'(node) {
        cleanupMethods.push(node);
      },

      // Track initialization flags
      'PropertyDefinition[key.name=/^(initialized|usingUSWDS.*Enhancement)$/]'(node) {
        hasInitFlag = true;
        flagNames.push(node.key.name);
      },

      'ClassDeclaration:exit'(node) {
        // If component has USWDS init but no flag, report it
        if (hasUSWDSInit && !hasInitFlag) {
          context.report({
            node: node.id,
            messageId: 'missingInitFlag',
          });
        }

        // Check cleanup methods for flag reset
        cleanupMethods.forEach(cleanup => {
          const hasReset = flagNames.some(flag =>
            hasPropertyReset(cleanup.value, flag)
          );

          if (!hasReset && flagNames.length > 0) {
            context.report({
              node: cleanup.key,
              messageId: 'missingCleanupReset',
              data: {
                flagName: flagNames[0],
              },
              fix(fixer) {
                const body = cleanup.value.body.body;
                const lastStatement = body[body.length - 1];
                return fixer.insertTextAfter(
                  lastStatement,
                  `\n\n    // Reset initialization flag to allow reinitialization\n    this.${flagNames[0]} = false;`
                );
              },
            });
          }
        });
      },
    };

    function findParentMethod(node) {
      let parent = node.parent;
      while (parent && parent.type !== 'MethodDefinition') {
        parent = parent.parent;
      }
      return parent;
    }

    function hasGuardInMethod(methodNode) {
      if (!methodNode || !methodNode.body || !methodNode.body.body) return false;

      return methodNode.body.body.some(statement => {
        if (statement.type === 'IfStatement') {
          return hasInitializationCheck(statement.test);
        }
        return false;
      });
    }

    function hasInitializationCheck(testNode) {
      if (!testNode) return false;

      if (testNode.type === 'MemberExpression') {
        return testNode.property.name.match(/^(initialized|usingUSWDS.*Enhancement)$/);
      }

      return false;
    }

    function hasPropertyReset(methodNode, flagName) {
      if (!methodNode || !methodNode.body || !methodNode.body.body) return false;

      return methodNode.body.body.some(statement => {
        if (statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'AssignmentExpression') {
          const left = statement.expression.left;
          return left.type === 'MemberExpression' &&
                 left.object.type === 'ThisExpression' &&
                 left.property.name === flagName &&
                 statement.expression.right.value === false;
        }
        return false;
      });
    }

    function findInitializationFlag(scope) {
      // Look for common initialization flag patterns
      const variables = scope.variables;
      for (const variable of variables) {
        if (variable.name.match(/^(initialized|usingUSWDS.*Enhancement)$/)) {
          return variable.name;
        }
      }
      return null;
    }

    function getMethodCallString(node) {
      if (node.callee.object && node.callee.property) {
        return `${getObjectString(node.callee.object)}.${node.callee.property.name}`;
      }
      return 'unknown';
    }

    function getObjectString(node) {
      if (node.type === 'MemberExpression') {
        return `${getObjectString(node.object)}.${node.property.name}`;
      }
      if (node.type === 'Identifier') {
        return node.name;
      }
      return 'unknown';
    }
  },
};