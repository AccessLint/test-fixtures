# AccessLint Test Fixtures

A sample application repository for accessibility testing, designed to demonstrate and test the AccessLint tooling ecosystem.

## 🌐 Live Demo

**https://accesslint-test-fixtures.netlify.app/**

Use this live deployment to test accessibility features with AccessLint tools without any local setup required.

## 🔗 Related Projects

- **[accesslint/claude-marketplace](https://github.com/accesslint/claude-marketplace)** - AccessLint integration for Claude Code marketplace
- **[accesslint/mcp-server](https://github.com/accesslint/mcp-server)** - Model Context Protocol server for AccessLint

## 📋 What's Inside

This repository contains a **CI Dashboard** sample application built with Next.js and React. The dashboard displays build metrics and timing information, providing a realistic interface for testing accessibility features including:

- Color contrast compliance
- Interactive UI components
- Data visualization elements
- Navigation patterns
- Form controls and inputs

## 🧪 Using with AccessLint

### With Claude Code

1. Install the AccessLint plugin from the Claude Code marketplace
2. Open Claude Code and navigate to the live demo URL: `https://test-fixtures.netlify.app/`
3. Use AccessLint commands to analyze accessibility:
   - Check color contrast ratios
   - Identify WCAG violations
   - Get suggestions for accessible color alternatives

### With MCP Server

The AccessLint MCP server provides accessibility analysis tools that can be used to audit this sample application programmatically. See the [mcp-server repository](https://github.com/accesslint/mcp-server) for setup and usage instructions.

## 🔍 Accessibility Issues Demonstrated

This sample app intentionally includes common accessibility issues to demonstrate AccessLint's detection and remediation capabilities. Below are the categories and specific examples of failures present in the dashboard.

### Issue Summary

- **Critical Issues**: 8 (blocking keyboard/screen reader access)
- **High Priority Issues**: 6 (major usability barriers)
- **Medium Priority Issues**: 3 (usability enhancements)
- **Total WCAG Violations**: 17+ across multiple guidelines

The dashboard demonstrates violations across all four WCAG principles:
- **Perceivable**: Color contrast failures, missing text alternatives
- **Operable**: Non-keyboard accessible controls, missing focus indicators
- **Understandable**: Missing labels, unclear interactive states
- **Robust**: Improper use of ARIA, non-semantic HTML

### Color Contrast Violations (WCAG 2.1 Level AA)

The dashboard contains several color contrast failures that violate **WCAG 2.1 Guideline 1.4.3 Contrast (Minimum)**:

#### Low Contrast Text

1. **Subtle Gray Text on White** (`#718096` on `#ffffff`)
   - **Contrast Ratio**: 4.02:1 (fails, needs 4.5:1 minimum)
   - **Location**: Used in stat labels, timestamps, results count
   - **Impact**: Difficult to read for users with low vision or color blindness

2. **Light Gray Text** (`#a0aec0` on `#ffffff`)
   - **Contrast Ratio**: 2.26:1 (fails)
   - **Location**: Chart labels, placeholder text, dropdown arrows
   - **Impact**: Severely insufficient contrast, fails even large text requirements

3. **Gray Text on Light Background** (`#a0aec0` on `#f7fafc`)
   - **Contrast Ratio**: 2.15:1 (fails)
   - **Location**: Search input placeholders
   - **Impact**: Nearly invisible to users with visual impairments

4. **Medium Gray on Light Background** (`#718096` on `#f7fafc`)
   - **Contrast Ratio**: 3.83:1 (fails)
   - **Location**: Table header text, secondary labels
   - **Impact**: Below minimum threshold for normal text

#### Low Contrast UI Elements

5. **Subtle Borders** (`#cbd5e0` and `#e2e8f0` on `#ffffff`)
   - **Contrast Ratios**: 1.49:1 and 1.23:1 (fails)
   - **Location**: Card borders, table borders, input borders
   - **WCAG Requirement**: 3:1 for UI components
   - **Impact**: Difficult to perceive component boundaries

### Accessible Examples (For Comparison)

The dashboard also includes properly implemented accessible color combinations:

1. **Success Status Badge** (`#22543d` on `#c6f6d5`)
   - **Contrast Ratio**: 7.3:1 ✓ **Passes AA**

2. **Failed Status Badge** (`#742a2a` on `#fed7d7`)
   - **Contrast Ratio**: 7.55:1 ✓ **Passes AA**

3. **Running Status Badge** (`#7c2d12` on `#feebc8`)
   - **Contrast Ratio**: 8:1 ✓ **Passes AA**

### Keyboard Accessibility Violations (WCAG 2.1 Level A)

#### Critical Issues:

1. **Custom Dropdowns Not Keyboard Accessible**
   - **WCAG**: 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)
   - **Location**: Filter dropdowns (Status, Branch, Date Range)
   - **Issue**: Implemented with `<div>` elements, no keyboard support
   - **Impact**: Keyboard users cannot access filters at all

2. **Non-Semantic Interactive Elements**
   - **WCAG**: 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)
   - **Locations**:
     - Expand/collapse buttons (using `<div>`)
     - Action buttons: "View Logs", "Retry Build", "Download Artifacts" (using `<div>`)
   - **Impact**: Cannot be focused or activated via keyboard

3. **Table Sort Headers Missing ARIA**
   - **WCAG**: 4.1.2 Name, Role, Value (Level A)
   - **Issue**: Sortable columns lack `aria-sort` and proper labels
   - **Impact**: Screen readers cannot announce sort state

### Screen Reader Accessibility Violations

#### Critical Issues:

1. **Status Badges Missing Text Content**
   - **WCAG**: 1.1.1 Non-text Content (Level A)
   - **Location**: Build status column (success/failed/running)
   - **Issue**: Empty `<span>` elements with only color indicators
   - **Impact**: Screen readers announce nothing; users cannot determine build status

2. **Chart Not Accessible**
   - **WCAG**: 1.1.1 Non-text Content (Level A), 2.1.1 Keyboard (Level A)
   - **Location**: Build Duration Trend chart
   - **Issue**: Visual-only representation with no text alternative
   - **Impact**: Screen reader users miss all trend data

3. **Emoji Icons Without aria-hidden**
   - **WCAG**: 1.1.1 Non-text Content (Level A)
   - **Location**: Stat card icons (📊, ⏱️)
   - **Issue**: Screen readers announce "bar chart emoji" (confusing)
   - **Impact**: Unnecessary noise for screen reader users

4. **Missing Form Labels**
   - **WCAG**: 3.3.2 Labels or Instructions (Level A)
   - **Location**: Search input, filter dropdowns
   - **Issue**: No associated `<label>` elements
   - **Impact**: Screen readers don't announce field purpose

5. **Table Missing Caption**
   - **WCAG**: 1.3.1 Info and Relationships (Level A)
   - **Location**: Build history table
   - **Issue**: No `<caption>` element
   - **Impact**: Screen readers cannot describe table purpose

### Focus Management Issues

1. **Missing Focus Indicators**
   - **WCAG**: 2.4.7 Focus Visible (Level AA)
   - **Location**: Dropdown triggers, interactive elements
   - **Impact**: Keyboard users cannot see current focus position

2. **Focus Order Problems**
   - **WCAG**: 2.4.3 Focus Order (Level A)
   - **Location**: Expanded row details
   - **Impact**: Focus doesn't return to logical location after collapse

3. **No Skip Link**
   - **WCAG**: 2.4.1 Bypass Blocks (Level A)
   - **Impact**: Keyboard users must tab through all stats to reach content

### Semantic HTML & Structure Issues

1. **Interactive `<div>` Elements**
   - Action buttons, expand buttons, dropdown triggers all use `<div>` instead of `<button>`
   - **Impact**: Not recognized as interactive by assistive technologies

2. **Missing Live Regions**
   - **WCAG**: 4.1.3 Status Messages (Level AA)
   - **Location**: Results count, filter updates
   - **Impact**: Screen readers don't announce dynamic content changes

### Testing with AccessLint

AccessLint provides automated accessibility testing tools integrated into Claude Code. Use this demo app to practice detecting and fixing WCAG violations including color contrast issues, keyboard accessibility problems, missing ARIA attributes, and semantic HTML violations.

**Expected Findings**: 8 critical issues, 6 high priority issues, and 3 medium priority issues across color contrast, keyboard navigation, screen reader support, and semantic HTML.

For installation and usage instructions, see the **[AccessLint Claude Code plugin](https://github.com/accesslint/claude-marketplace)**.

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.
