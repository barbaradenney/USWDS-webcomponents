# 🚀 USWDS Web Components - Quick Reference

**FOR AI/CLAUDE**: This file provides quick access to all documentation when issues arise.

## 📚 Complete Documentation Map

### Core Guidelines
- **[CLAUDE.md](./CLAUDE.md)** - Complete development guidelines, testing requirements, architecture
- **[AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)** - Specific AI/LLM development rules and templates
- **[README.md](./README.md)** - Project overview, installation, usage examples

### Development Guides
- **[docs/COMPONENT_DEVELOPMENT_GUIDE.md](./docs/COMPONENT_DEVELOPMENT_GUIDE.md)** - Implementation patterns and examples
- **[docs/COMPONENT_CHECKLIST.md](./docs/COMPONENT_CHECKLIST.md)** - Quality checklist before commit
- **[docs/COMPONENT_TEMPLATE.md](./docs/COMPONENT_TEMPLATE.md)** - Template with documentation references

### Problem Solving
- **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Debug and troubleshoot issues
- **[stories/Debugging.stories.ts](./stories/Debugging.stories.ts)** - Interactive debugging tools

## 🧪 MANDATORY Testing (Before Any Commit)

```bash
# ALL MUST PASS before commit:
npm run test              # Unit tests
npm run typecheck         # TypeScript compilation  
npm run lint             # Code quality

# Quick quality check:
npm run quality:check     # Runs all three above
```

## 🔧 Quick Debug Enable

```javascript
// Add ?debug=true to URL OR run in console:
localStorage.setItem('uswds-debug', 'true');
location.reload();
```

## 📖 Documentation Commands

```bash
npm run docs:help         # Show all documentation files
npm run quality:check     # Run all required quality checks
npm run test:coverage     # Check test coverage
```

## ⚠️ Critical Rules Reminder

### ALWAYS Do:
1. ✅ Extend `USWDSBaseComponent` 
2. ✅ Write comprehensive unit tests (MANDATORY)
3. ✅ Run quality checks before commit
4. ✅ Use official USWDS CSS classes only
5. ✅ Include documentation references in component headers

### NEVER Do:
1. ❌ Commit without tests or with failing tests
2. ❌ Create custom CSS styles for USWDS components
3. ❌ Use Shadow DOM
4. ❌ Skip the component checklist

## 🎯 When Issues Arise

### Component Not Working:
1. Check [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Enable debug mode (`?debug=true`)
3. Use [stories/Debugging.stories.ts](./stories/Debugging.stories.ts)

### Testing Problems:
1. See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) → "Testing Issues"
2. Check [docs/COMPONENT_DEVELOPMENT_GUIDE.md](./docs/COMPONENT_DEVELOPMENT_GUIDE.md) → "Testing Approach"

### Development Questions:
1. Start with [CLAUDE.md](./CLAUDE.md)
2. Check [docs/COMPONENT_DEVELOPMENT_GUIDE.md](./docs/COMPONENT_DEVELOPMENT_GUIDE.md)
3. Follow [docs/COMPONENT_CHECKLIST.md](./docs/COMPONENT_CHECKLIST.md)

### AI/LLM Specific:
1. See [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) for templates and rules
2. Use [docs/COMPONENT_TEMPLATE.md](./docs/COMPONENT_TEMPLATE.md) for new components

---

**Remember**: This library prioritizes maintainability, testing, and USWDS compliance over rapid development.