# HTML Entities Cleanup Guide

## Overview

This document outlines the cleanup of improper HTML entities in TSX/JSX files and provides guidelines for preventing this issue in the future.

## Problem

A previous developer incorrectly used HTML entities like `&apos;` in TSX files, which is unnecessary and incorrect. JSX/TSX handles these characters natively, so HTML entities are not needed and can cause issues.

## What Was Fixed

### Files Modified
- `src/app/page.tsx` - Replaced `&apos;` with `'` in user-facing text
- `src/app/feed/page.tsx` - Replaced `&ldquo;` and `&rdquo;` with `"` in quote display

### Specific Changes
```tsx
// Before
We&apos;ve sent a magic link...
Don&apos;t have an account?
&ldquo;{activity.content}&rdquo;

// After  
We've sent a magic link...
Don't have an account?
"{activity.content}"
```

## Tools Created

### 1. Cleanup Script
**Location**: `scripts/cleanup-html-entities.js`

**Usage**:
```bash
# Dry run to see what would be changed
npm run cleanup:html-entities:dry-run

# Apply changes
npm run cleanup:html-entities

# With verbose output
node scripts/cleanup-html-entities.js --verbose
```

**Features**:
- Detects unnecessary HTML entities in TSX/JSX files
- Supports dry-run mode for safe testing
- Provides detailed reporting
- Handles multiple entity types

### 2. ESLint Rule
**Location**: `eslint-rules/no-unnecessary-html-entities.js`

**Purpose**: Prevents future introduction of unnecessary HTML entities

**Entities Flagged**:
- `&apos;` → `'`
- `&quot;` → `"`
- `&amp;` → `&`
- `&lt;` → `<`
- `&gt;` → `>`
- `&ldquo;` / `&rdquo;` → `"`
- `&lsquo;` / `&rsquo;` → `'`
- `&hellip;` → `...`
- `&mdash;` → `—`
- `&ndash;` → `–`

## Best Practices

### ✅ Do This
```tsx
// Use regular characters directly
<p>We've sent a magic link...</p>
<p>Don't have an account?</p>
<p>"This is a quote"</p>
```

### ❌ Don't Do This
```tsx
// Don't use HTML entities unnecessarily
<p>We&apos;ve sent a magic link...</p>
<p>Don&apos;t have an account?</p>
<p>&ldquo;This is a quote&rdquo;</p>
```

### When HTML Entities ARE Needed

HTML entities should only be used when:
1. You need to display the literal entity text (e.g., teaching HTML)
2. You're in a context where JSX parsing might be an issue
3. You need to preserve specific encoding requirements

## Integration with Development Workflow

### Pre-commit Hook (Recommended)
Add this to your pre-commit hooks to catch issues early:

```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run cleanup:html-entities:dry-run
```

### CI/CD Integration
Add this to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Check for unnecessary HTML entities
  run: npm run cleanup:html-entities:dry-run
```

## Maintenance

### Regular Checks
Run the cleanup script periodically:
```bash
npm run cleanup:html-entities:dry-run
```

### Team Training
- Share this document with the team
- Include in onboarding materials
- Add to code review checklist

## Troubleshooting

### Common Issues

1. **Script not found**: Ensure `glob` dependency is installed
2. **Permission denied**: Make script executable: `chmod +x scripts/cleanup-html-entities.js`
3. **ESLint rule not working**: Ensure the rule is properly configured in your ESLint config

### Getting Help

If you encounter issues:
1. Check the script output for error messages
2. Verify file permissions
3. Ensure all dependencies are installed
4. Review the ESLint configuration

## Future Improvements

Consider these enhancements:
1. Add support for more file types (HTML, CSS)
2. Create a VS Code extension for real-time detection
3. Add automatic fixing in your IDE
4. Integrate with your code formatter (Prettier)

---

**Last Updated**: $(date)
**Maintained By**: Development Team 