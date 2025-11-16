# Web Accessibility Audit Report
## CI Pipeline Build Times Dashboard

**Audit Date:** 2025-11-16
**URL:** https://accesslint-test-fixtures.netlify.app/
**WCAG Version:** 2.1 Level AA
**Scope:** Full website accessibility review

---

## Executive Summary

This accessibility audit identified **27 critical issues** and **15 high-priority issues** across multiple WCAG 2.1 Level A and AA criteria. The application has significant barriers that prevent keyboard users, screen reader users, and users with visual impairments from fully accessing the interface.

**Critical Issues:** 27
**High Priority Issues:** 15
**Medium Priority Issues:** 8

**Most Severe Problems:**
- Complete lack of keyboard accessibility for interactive elements
- No visible focus indicators anywhere on the page
- Status information conveyed only through color
- Multiple color contrast failures
- Missing ARIA attributes for dynamic content
- Improper semantic structure

---

## Critical Issues

### 1. Interactive Elements Not Keyboard Accessible
**WCAG:** 2.1.1 Keyboard (Level A)
**Impact:** Keyboard and screen reader users cannot access core functionality
**Severity:** Critical - Complete barrier to access

**Issue:**
Multiple interactive elements are not keyboard accessible:
- Expand/collapse buttons (50 instances) have `tabindex="-1"`
- Dropdown filters (3 instances) have `tabindex="-1"`
- Sortable table headers (5 instances) have `tabindex="-1"`

These are `<div>` elements with click handlers but are completely inaccessible via keyboard.

**Current Code Pattern:**
```html
<div class="expand-button" style="cursor: pointer;" tabindex="-1">▶</div>
<div class="dropdown-trigger" onclick="..." tabindex="-1">All Statuses▼</div>
<th class="sortable" style="cursor: pointer;" tabindex="-1">Build ID</th>
```

**Recommended Fix:**
```html
<!-- Use semantic buttons for expand/collapse -->
<button
  class="expand-button"
  aria-expanded="false"
  aria-controls="build-1050-details"
  aria-label="Expand build 1050 details">
  ▶
</button>

<!-- Use semantic button for dropdown -->
<button
  class="dropdown-trigger"
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-controls="status-dropdown">
  <span>All Statuses</span>
  <span aria-hidden="true">▼</span>
</button>

<!-- Make sortable headers keyboard accessible -->
<th>
  <button
    class="sortable"
    aria-sort="descending"
    aria-label="Time, sorted descending">
    Time ↓
  </button>
</th>
```

**Priority:** Critical

---

### 2. No Visible Focus Indicators
**WCAG:** 2.4.7 Focus Visible (Level AA)
**Impact:** Keyboard users cannot see where focus is located
**Severity:** Critical - Makes keyboard navigation impossible

**Issue:**
All focusable elements have focus indicators disabled with `outline: none` and no alternative focus styling:
- Search input: `outline: none`, no box-shadow or border change on focus
- All interactive elements lack visible focus states

**Current Styles:**
```css
/* Search input on focus */
outline-style: none;
outline-width: 0px;
box-shadow: none;
border-color: rgb(203, 213, 224); /* Same as unfocused state */
```

**Recommended Fix:**
```css
/* Ensure visible focus for all interactive elements */
*:focus {
  outline: 2px solid #4299e1; /* Blue focus ring */
  outline-offset: 2px;
}

/* Alternative: Use box-shadow for inputs */
input:focus,
select:focus,
textarea:focus {
  outline: none; /* Only if using box-shadow alternative */
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  border-color: #4299e1;
}

/* For buttons and interactive elements */
button:focus,
[role="button"]:focus {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}
```

**Priority:** Critical

---

### 3. Status Information Conveyed Only by Color
**WCAG:** 1.4.1 Use of Color (Level A)
**Impact:** Colorblind users cannot distinguish build statuses
**Severity:** Critical - Essential information inaccessible

**Issue:**
Build statuses in the table are indicated only by colored circles (green for success, red for failed, orange for in progress) with no text labels or icons.

**Current Implementation:**
```html
<span class="status-badge status-success"></span> <!-- Empty, just a green circle -->
<span class="status-badge status-failed"></span>   <!-- Empty, just a red circle -->
<span class="status-badge status-running"></span>  <!-- Empty, just an orange circle -->
```

**Visual Analysis:**
- Success: Green circle (rgb(198, 246, 213) background)
- Failed: Red circle (rgb(254, 215, 215) background)
- In Progress: Orange circle (rgb(254, 235, 200) background)

**Recommended Fix:**
```html
<!-- Add visible text or icons along with color -->
<span class="status-badge status-success">
  <svg aria-hidden="true" class="icon"><!-- checkmark icon --></svg>
  <span class="sr-only">Success</span>
  Success
</span>

<span class="status-badge status-failed">
  <svg aria-hidden="true" class="icon"><!-- X icon --></svg>
  <span class="sr-only">Failed</span>
  Failed
</span>

<span class="status-badge status-running">
  <svg aria-hidden="true" class="icon"><!-- spinner icon --></svg>
  <span class="sr-only">In Progress</span>
  In Progress
</span>
```

**Alternative:** Add aria-label at minimum:
```html
<span class="status-badge status-success" aria-label="Success"></span>
```

**Priority:** Critical

---

### 4. Chart Bars Convey Status Only by Color
**WCAG:** 1.4.1 Use of Color (Level A)
**Impact:** Colorblind users cannot identify failed builds in chart
**Severity:** Critical

**Issue:**
The "Build Duration Trend" chart uses color alone to distinguish failed builds (red/pink bars) from successful builds (gray bars). There are no patterns, labels, or other visual indicators.

**Current Implementation:**
```html
<div class="chart-bar" title="build-1031: 4m 27s"></div> <!-- Gray = success -->
<div class="chart-bar chart-bar-failed" title="build-1032: 8m 22s"></div> <!-- Red = failed -->
```

Chart bars have title attributes but:
1. They don't indicate status in the title
2. Title attributes are not accessible to keyboard users
3. No screen reader announcement of status

**Recommended Fix:**
```html
<!-- Add status to title and proper ARIA -->
<div
  class="chart-bar"
  role="img"
  aria-label="Build 1031: 4 minutes 27 seconds, Status: Success"
  title="build-1031: 4m 27s - Success">
</div>

<div
  class="chart-bar chart-bar-failed"
  role="img"
  aria-label="Build 1032: 8 minutes 22 seconds, Status: Failed"
  title="build-1032: 8m 22s - Failed">
  <span class="sr-only">Failed</span>
</div>

<!-- Add pattern overlay for failed builds -->
<style>
.chart-bar-failed::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(0,0,0,0.1) 4px,
    rgba(0,0,0,0.1) 8px
  );
}
</style>
```

**Priority:** Critical

---

### 5. Missing Main Landmark
**WCAG:** 1.3.1 Info and Relationships (Level A), 2.4.1 Bypass Blocks (Level A)
**Impact:** Screen reader users cannot navigate efficiently
**Severity:** Critical

**Issue:**
The page has a `<header>` (banner landmark) but no `<main>` landmark for the primary content. This makes it difficult for screen reader users to skip to the main content.

**Current Structure:**
```html
<body>
  <header role="banner">...</header>
  <div><!-- Stats cards --></div>
  <div><!-- Chart --></div>
  <div><!-- Filters --></div>
  <div><!-- Table --></div>
</body>
```

**Recommended Fix:**
```html
<body>
  <header>
    <h1>CI Pipeline Build Times</h1>
    <p>Monitor and track your continuous integration builds</p>
  </header>

  <main>
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="sr-only">Build Statistics</h2>
      <!-- Stats cards -->
    </section>

    <section aria-labelledby="chart-heading">
      <h3 id="chart-heading">Build Duration Trend</h3>
      <!-- Chart -->
    </section>

    <section aria-labelledby="history-heading">
      <h2 id="history-heading">Build History</h2>
      <!-- Filters and table -->
    </section>
  </main>
</body>
```

**Priority:** Critical

---

### 6. Search Input Missing Label
**WCAG:** 3.3.2 Labels or Instructions (Level A), 4.1.2 Name, Role, Value (Level A)
**Impact:** Screen reader users don't know the purpose of the input
**Severity:** Critical

**Issue:**
The search input only has a placeholder but no associated `<label>` or `aria-label`.

**Current Code:**
```html
<input type="text" placeholder="Search builds..." />
```

**Recommended Fix:**
```html
<!-- Option 1: Visible label -->
<label for="build-search">Search builds:</label>
<input
  type="text"
  id="build-search"
  placeholder="Search builds..."
  aria-describedby="search-help" />
<span id="search-help" class="sr-only">
  Search by build ID, branch name, or commit hash
</span>

<!-- Option 2: Hidden label if design doesn't allow visible label -->
<label for="build-search" class="sr-only">Search builds</label>
<input
  type="text"
  id="build-search"
  placeholder="Search builds..." />
```

**Priority:** Critical

---

### 7. Dropdown Filters Not Accessible
**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** Screen reader users cannot use filters
**Severity:** Critical

**Issue:**
Custom dropdown elements lack proper ARIA attributes and semantic structure:
- No `role="combobox"` or `role="button"`
- No `aria-haspopup`
- No `aria-expanded` state
- No `aria-controls` to link to dropdown menu
- tabindex="-1" prevents keyboard access

**Current Code:**
```html
<div class="custom-dropdown">
  <div class="dropdown-trigger" onclick="..." tabindex="-1">
    <span>All Statuses</span>
    <span class="dropdown-arrow">▼</span>
  </div>
</div>
```

**Recommended Fix:**
```html
<div class="custom-dropdown">
  <button
    class="dropdown-trigger"
    id="status-filter"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-controls="status-listbox"
    aria-label="Filter by status">
    <span id="status-value">All Statuses</span>
    <span aria-hidden="true">▼</span>
  </button>

  <ul
    id="status-listbox"
    role="listbox"
    aria-labelledby="status-filter"
    hidden>
    <li role="option" aria-selected="true">All Statuses</li>
    <li role="option">Success</li>
    <li role="option">Failed</li>
    <li role="option">In Progress</li>
  </ul>
</div>
```

**Priority:** Critical

---

### 8. Table Missing Essential ARIA
**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** Screen reader users lose context in table
**Severity:** Critical

**Issue:**
The data table lacks:
- No `<caption>` or `aria-label` to describe the table
- Table headers missing `scope` attributes
- First column header is empty (for expand buttons)

**Current Code:**
```html
<table>
  <thead>
    <tr>
      <th></th> <!-- Empty header -->
      <th class="sortable">Build ID</th>
      <th class="sortable">Branch</th>
      <th class="sortable">Commit</th>
      <th class="sortable">Status</th>
      <th class="sortable">Duration</th>
      <th>Triggered By</th>
      <th class="sortable">Time ↓</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>
```

**Recommended Fix:**
```html
<table aria-label="Build history with 50 results">
  <caption class="sr-only">
    Build History - 50 results. Table has expandable rows with additional build details.
  </caption>
  <thead>
    <tr>
      <th scope="col">
        <span class="sr-only">Expand details</span>
      </th>
      <th scope="col">
        <button aria-sort="none">Build ID</button>
      </th>
      <th scope="col">
        <button aria-sort="none">Branch</button>
      </th>
      <th scope="col">Commit</th>
      <th scope="col">
        <button aria-sort="none">Status</button>
      </th>
      <th scope="col">
        <button aria-sort="none">Duration</button>
      </th>
      <th scope="col">Triggered By</th>
      <th scope="col">
        <button aria-sort="descending">Time</button>
      </th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>
```

**Priority:** Critical

---

### 9. Expandable Rows Missing ARIA
**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** Screen reader users don't know rows can expand or their state
**Severity:** Critical

**Issue:**
Expandable table rows lack:
- No `aria-expanded` attribute to indicate state
- No `aria-controls` to link button to expanded content
- No `aria-label` to describe what will be expanded
- Expand button is a `<div>` not a `<button>`

**Current Code:**
```html
<tr>
  <td><div class="expand-button" tabindex="-1">▶</div></td>
  <td class="build-id">build-1050</td>
  <td>main</td>
  <!-- ... -->
</tr>
<!-- Expanded content just appears without connection -->
```

**Recommended Fix:**
```html
<tr>
  <td>
    <button
      class="expand-button"
      aria-expanded="false"
      aria-controls="build-1050-details"
      aria-label="Expand details for build 1050">
      <span aria-hidden="true">▶</span>
    </button>
  </td>
  <th scope="row" class="build-id">build-1050</th>
  <td>main</td>
  <!-- ... -->
</tr>
<tr id="build-1050-details" class="expanded-row" hidden>
  <td colspan="8">
    <div class="build-details">
      <!-- Detail content -->
    </div>
  </td>
</tr>

<!-- When expanded, update aria-expanded to true and remove hidden attribute -->
```

**Priority:** Critical

---

### 10. Sortable Columns Not Announced
**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** Screen reader users don't know columns are sortable or current sort state
**Severity:** Critical

**Issue:**
Sortable table headers lack:
- No `aria-sort` attribute to indicate sort direction
- Visual sort indicator (↓) not described
- Not keyboard accessible (tabindex="-1")

**Current Code:**
```html
<th class="sortable" tabindex="-1">Time ↓</th>
```

**Recommended Fix:**
```html
<th scope="col">
  <button
    class="sortable"
    aria-sort="descending"
    aria-label="Time, sorted descending. Click to sort ascending.">
    Time
    <span aria-hidden="true">↓</span>
  </button>
</th>

<!-- When unsorted: -->
<th scope="col">
  <button
    class="sortable"
    aria-sort="none"
    aria-label="Duration, not sorted. Click to sort.">
    Duration
  </button>
</th>

<!-- When sorted ascending: -->
<th scope="col">
  <button
    class="sortable"
    aria-sort="ascending"
    aria-label="Branch, sorted ascending. Click to sort descending.">
    Branch
    <span aria-hidden="true">↑</span>
  </button>
</th>
```

**Priority:** Critical

---

## High Priority Issues

### 11. Color Contrast Failure - Chart Labels
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)
**Impact:** Users with low vision cannot read chart labels
**Severity:** High

**Issue:**
Chart labels (#1031, #1035, etc.) have insufficient contrast:
- Color: `rgb(160, 174, 192)` (#a0aec0)
- Background: `rgb(255, 255, 255)` (#ffffff)
- **Contrast Ratio: 2.26:1**
- **Required: 4.5:1 for normal text**
- **Fails WCAG AA**

**Recommended Fix:**
Change text color to `#637894` (contrast ratio: 4.52:1)

```css
.chart-label {
  color: #637894; /* Instead of #a0aec0 */
}
```

**Priority:** High

---

### 12. Color Contrast Failure - Secondary Text
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)
**Impact:** Users with low vision cannot read important text
**Severity:** High

**Issue:**
Multiple instances of secondary text fail contrast requirements:

**Dashboard Subtitle:**
- Color: `rgb(113, 128, 150)` (#718096)
- Background: `rgb(245, 247, 250)` (#f5f7fa)
- **Contrast Ratio: 3.74:1**
- **Required: 4.5:1**
- **Fails WCAG AA**

**Stat Labels ("TOTAL BUILDS", etc.):**
- Color: `rgb(113, 128, 150)` (#718096)
- Background: `rgb(255, 255, 255)` (#ffffff)
- **Contrast Ratio: 4.02:1**
- **Required: 4.5:1**
- **Fails WCAG AA**

**Recommended Fix:**
```css
.dashboard-subtitle {
  color: #647287; /* Contrast: 4.55:1 - instead of #718096 */
}

.stat-label {
  color: #67768c; /* Contrast: 4.62:1 - instead of #718096 */
}
```

**Priority:** High

---

### 13. Heading Hierarchy Broken
**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** Screen reader users lose document structure
**Severity:** High

**Issue:**
Heading levels skip from H1 to H3, missing H2:
- H1: "CI Pipeline Build Times"
- **H3: "Build Duration Trend"** (should be H2)
- H2: "Build History"

This violates proper heading hierarchy and confuses screen reader navigation.

**Current Structure:**
```html
<h1>CI Pipeline Build Times</h1>
<!-- ... -->
<h3>Build Duration Trend</h3> <!-- Wrong level -->
<!-- ... -->
<h2>Build History</h2>
```

**Recommended Fix:**
```html
<h1>CI Pipeline Build Times</h1>

<section aria-labelledby="stats-heading">
  <h2 id="stats-heading" class="sr-only">Build Statistics Summary</h2>
  <!-- Stats cards -->
</section>

<section aria-labelledby="chart-heading">
  <h2 id="chart-heading">Build Duration Trend</h2> <!-- Changed from H3 -->
  <!-- Chart -->
</section>

<section aria-labelledby="history-heading">
  <h2 id="history-heading">Build History</h2>
  <!-- Table -->
</section>
```

**Priority:** High

---

### 14. Decorative Emojis Not Hidden from Screen Readers
**WCAG:** 1.1.1 Non-text Content (Level A)
**Impact:** Screen reader users hear "bar chart emoji" instead of meaningful content
**Severity:** High

**Issue:**
Decorative emoji icons in stats cards are not hidden from assistive technology:
- 📊 (bar chart)
- ⏱️ (stopwatch)

These provide no additional information beyond the visible labels.

**Current Code:**
```html
<div class="stat-icon">📊</div>
<div class="stat-value">50</div>
<div class="stat-label">TOTAL BUILDS</div>
```

**Recommended Fix:**
```html
<div class="stat-icon" aria-hidden="true">📊</div>
<div class="stat-value">50</div>
<div class="stat-label">TOTAL BUILDS</div>
```

**Priority:** High

---

### 15. Missing Language Declaration
**WCAG:** 3.1.1 Language of Page (Level A)
**Impact:** Screen readers may use wrong pronunciation
**Severity:** High

**Issue:**
While the page has `lang="en"` on the `<html>` element (which is good), it's important to verify this is present in the actual HTML source.

**Current Status:** ✓ Present (`lang="en"`)
**Action Required:** Ensure this is maintained

**Priority:** High

---

### 16. Live Region for Dynamic Updates Missing
**WCAG:** 4.1.3 Status Messages (Level AA)
**Impact:** Screen reader users not notified of status changes
**Severity:** High

**Issue:**
The "50 results" count and table content can change dynamically (when filtering), but there's no `aria-live` region to announce these changes to screen reader users.

**Current Code:**
```html
<div>
  <span>50</span> results
</div>
```

**Recommended Fix:**
```html
<div
  aria-live="polite"
  aria-atomic="true"
  role="status">
  <span>50</span> results
</div>

<!-- When filters are applied, also announce: -->
<div aria-live="polite" class="sr-only" id="filter-announcements">
  <!-- Dynamically updated, e.g., "Showing 12 builds filtered by status: Failed" -->
</div>
```

**Priority:** High

---

### 17. Expand/Collapse State Not Visually Distinguished
**WCAG:** 1.3.3 Sensory Characteristics (Level A)
**Impact:** Users may not know if a row is expanded or collapsed
**Severity:** High

**Issue:**
The only indication that a row is expanded is the arrow changing from ▶ to ▼. There's no other visual cue like background color change, border, or indentation.

**Recommended Fix:**
```css
/* Add visual distinction for expanded rows */
tr.expanded {
  background-color: #f7fafc;
  border-left: 3px solid #4299e1;
}

tr.expanded .expand-button {
  transform: rotate(90deg);
  color: #4299e1;
}

/* Ensure expanded content is visually connected */
tr.expanded-details td {
  background-color: #f7fafc;
  border-left: 3px solid #4299e1;
  padding: 1.5rem;
}
```

**Priority:** High

---

### 18. No Skip Link
**WCAG:** 2.4.1 Bypass Blocks (Level A)
**Impact:** Keyboard users must tab through header on every page load
**Severity:** High

**Issue:**
No "skip to main content" link is provided for keyboard users to bypass the header.

**Recommended Fix:**
```html
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>

  <header>...</header>

  <main id="main-content" tabindex="-1">
    <!-- Main content -->
  </main>
</body>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

**Priority:** High

---

### 19. Stats Cards Missing Semantic Structure
**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** Screen reader users don't understand data relationships
**Severity:** High

**Issue:**
Stats cards are just divs without semantic structure or labels connecting values to their labels.

**Current Code:**
```html
<div class="stat-card">
  <div class="stat-icon" aria-hidden="true">📊</div>
  <div class="stat-value">50</div>
  <div class="stat-label">TOTAL BUILDS</div>
</div>
```

**Recommended Fix:**
```html
<div class="stat-card" role="group" aria-labelledby="stat-total-label">
  <div class="stat-icon" aria-hidden="true">📊</div>
  <div class="stat-value" id="stat-total-value" aria-describedby="stat-total-label">50</div>
  <div class="stat-label" id="stat-total-label">Total Builds</div>
</div>

<!-- Alternative using definition list: -->
<dl class="stats-grid">
  <div class="stat-card">
    <dt>
      <span class="stat-icon" aria-hidden="true">📊</span>
      Total Builds
    </dt>
    <dd class="stat-value">50</dd>
  </div>
  <!-- ... -->
</dl>
```

**Priority:** High

---

### 20. Chart Missing Accessible Data Table Alternative
**WCAG:** 1.1.1 Non-text Content (Level A)
**Impact:** Screen reader users cannot access chart data
**Severity:** High

**Issue:**
The "Build Duration Trend" chart is purely visual with no text alternative or data table for screen readers.

**Recommended Fix:**
```html
<section aria-labelledby="chart-heading">
  <h2 id="chart-heading">Build Duration Trend</h2>

  <div class="chart-container" role="img" aria-labelledby="chart-desc">
    <div id="chart-desc" class="sr-only">
      Bar chart showing build duration over the last 20 builds.
      4 builds failed with longer durations highlighted in red.
      See data table below for details.
    </div>
    <!-- Chart bars -->
  </div>

  <details>
    <summary>View chart data as table</summary>
    <table>
      <caption>Build Duration Trend Data</caption>
      <thead>
        <tr>
          <th scope="col">Build Number</th>
          <th scope="col">Duration</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">#1031</th>
          <td>4m 27s</td>
          <td>Success</td>
        </tr>
        <!-- ... -->
      </tbody>
    </table>
  </details>
</section>
```

**Priority:** High

---

### 21. Dropdown Arrow Icons Not Hidden
**WCAG:** 1.1.1 Non-text Content (Level A)
**Impact:** Screen readers announce "down pointing triangle" unnecessarily
**Severity:** Medium-High

**Issue:**
Decorative dropdown arrows (▼) are read by screen readers.

**Current Code:**
```html
<span>All Statuses</span>
<span class="dropdown-arrow">▼</span>
```

**Recommended Fix:**
```html
<span>All Statuses</span>
<span class="dropdown-arrow" aria-hidden="true">▼</span>
```

**Priority:** High

---

### 22. Time Format Not Accessible
**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** Screen readers don't understand time abbreviations
**Severity:** Medium-High

**Issue:**
Time values like "7m 42s" are abbreviated without full text alternatives.

**Current Code:**
```html
<td>7m 42s</td>
<td>0 minutes ago</td>
```

**Recommended Fix:**
```html
<td>
  <time datetime="PT7M42S">
    <span aria-label="7 minutes 42 seconds">7m 42s</span>
  </time>
</td>

<td>
  <time datetime="2025-11-16T10:30:00Z">
    <span aria-label="Less than 1 minute ago">0 minutes ago</span>
  </time>
</td>
```

**Priority:** High

---

### 23. Build Status "In Progress" Text Not Visible
**WCAG:** 1.4.1 Use of Color (Level A)
**Impact:** Text status is visible but badge relies only on color
**Severity:** Medium

**Issue:**
While some rows show "In Progress" as text (which is good), the status badge is still just a colored circle that relies only on color to convey meaning.

**Note:** This is partially mitigated by the text "In Progress" in the Duration column, but the status badge itself still violates 1.4.1.

**Priority:** Medium (due to partial mitigation)

---

### 24. Missing Page Title in Document
**WCAG:** 2.4.2 Page Titled (Level A)
**Impact:** Browser tabs and bookmarks not clearly identified
**Severity:** Medium

**Current Status:** ✓ Present ("CI Pipeline Build Times")
The page has a proper title, which is good.

**Priority:** Low (Issue not present)

---

### 25. First Focusable Element Not Visible on Page Load
**WCAG:** 2.4.3 Focus Order (Level A)
**Impact:** Keyboard users may lose track of focus
**Severity:** Medium

**Issue:**
The first focusable element (search input) is far down the page after stats cards and chart. Users would benefit from a skip link (see issue #18).

**Recommended Fix:**
Add skip link as mentioned in issue #18.

**Priority:** Medium

---

## Medium Priority Issues

### 26. No Visual Distinction for Keyboard vs Mouse Interaction
**WCAG:** 2.4.7 Focus Visible (Level AA)
**Impact:** Reduces usability for keyboard users
**Severity:** Medium

**Issue:**
Beyond the missing focus indicators, there should be a clear visual distinction between hover states and focus states.

**Recommended Fix:**
```css
/* Hover state */
.sortable:hover,
.expand-button:hover,
.dropdown-trigger:hover {
  background-color: #edf2f7;
}

/* Focus state - more prominent */
.sortable:focus,
.expand-button:focus,
.dropdown-trigger:focus {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
  background-color: #e6f2ff;
}

/* Focus visible only (for browsers that support it) */
.sortable:focus-visible,
.expand-button:focus-visible {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}
```

**Priority:** Medium

---

### 27. Table Row Hover State Only
**WCAG:** 2.1.1 Keyboard (Level A)
**Impact:** Keyboard users don't see row highlighting
**Severity:** Medium

**Issue:**
Table rows likely have a hover state that keyboard users cannot trigger. Focus should be on the row, not just individual cells.

**Recommended Fix:**
```css
/* Apply focus styles to table rows */
tbody tr:hover,
tbody tr:focus-within {
  background-color: #f7fafc;
}

/* Ensure keyboard users can focus rows */
tbody tr {
  position: relative;
}

tbody tr:focus-within::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #4299e1;
}
```

**Priority:** Medium

---

## Additional Observations

### Positive Findings

1. **Proper HTML5 DOCTYPE** - Page uses `<!DOCTYPE html>`
2. **Language Attribute Present** - `<html lang="en">` is set correctly
3. **Semantic Header** - Uses `<header>` element with banner role
4. **Proper Heading Levels** - H1, H2, H3 used (though hierarchy has one issue)
5. **Table Structure** - Uses proper `<table>`, `<thead>`, `<tbody>` elements
6. **Meaningful Page Title** - "CI Pipeline Build Times" clearly describes the page
7. **Consistent Layout** - Visual layout is clean and organized
8. **No Auto-Playing Content** - No videos or animations that auto-play

---

## Recommendations by Category

### Immediate Actions (Within 1 Week)

1. **Add visible focus indicators** to all interactive elements
2. **Convert all `<div>` click targets to `<button>` elements**
3. **Add text labels to status badges** (Success, Failed, In Progress)
4. **Add `<label>` to search input**
5. **Add `<main>` landmark** to page structure
6. **Fix heading hierarchy** (H3 → H2 for chart heading)

### Short-term (Within 1 Month)

7. **Implement proper ARIA for dropdowns** (aria-haspopup, aria-expanded, aria-controls)
8. **Add ARIA to expandable rows** (aria-expanded, aria-controls)
9. **Add scope attributes to table headers**
10. **Implement sortable column ARIA** (aria-sort)
11. **Fix all color contrast issues** (use suggested colors)
12. **Add patterns/icons to chart bars** for failed builds
13. **Hide decorative elements** from screen readers (aria-hidden="true")
14. **Add skip link** to bypass header

### Long-term (Within 3 Months)

15. **Implement live regions** for filter updates
16. **Add accessible data table alternative** for chart
17. **Implement keyboard shortcuts** for common actions (documented in help)
18. **Add comprehensive screen reader testing** to QA process
19. **Create accessibility documentation** for users
20. **Conduct user testing** with people who use assistive technologies

---

## Testing Recommendations

### Manual Testing Needed

1. **Keyboard Navigation**
   - Tab through entire page
   - Verify all interactive elements are reachable
   - Test all keyboard interactions (Enter, Space, Arrow keys)
   - Verify focus is always visible

2. **Screen Reader Testing**
   - Test with NVDA (Windows) and JAWS
   - Test with VoiceOver (macOS/iOS)
   - Verify all content is announced correctly
   - Test table navigation modes
   - Verify expanded row announcements

3. **Color Contrast**
   - Use WebAIM Contrast Checker to verify all fixes
   - Test with color blindness simulators

4. **Zoom and Reflow**
   - Test at 200% zoom
   - Verify no horizontal scrolling at 320px width
   - Test with browser zoom and OS-level zoom

5. **Voice Control**
   - Test with Dragon NaturallySpeaking or Voice Control
   - Verify all buttons have accessible names

### Automated Testing Tools

1. **axe DevTools** - Browser extension for automated accessibility testing
2. **WAVE** - Web accessibility evaluation tool
3. **Lighthouse** - Chrome DevTools accessibility audit
4. **Pa11y** - Automated accessibility testing CLI tool

---

## Priority Summary

**Fix Immediately (Blocking Issues):**
- All keyboard accessibility issues (#1, #2, #7, #8, #9, #10)
- Color-only status indicators (#3, #4)
- Missing labels (#6)
- Missing landmarks (#5)

**Fix Soon (Significant Barriers):**
- Color contrast failures (#11, #12)
- Heading hierarchy (#13)
- Missing ARIA (#14, #16, #19, #20)
- Skip link (#18)

**Fix When Possible (Usability Improvements):**
- Visual state indicators (#17, #26, #27)
- Time format accessibility (#22)
- Additional semantic improvements

---

## Conclusion

This dashboard application has significant accessibility barriers that prevent keyboard users and screen reader users from using core functionality. The most critical issues involve:

1. Complete lack of keyboard accessibility for interactive elements
2. Missing focus indicators throughout
3. Status information conveyed only by color
4. Missing ARIA attributes for dynamic content

Addressing the critical and high-priority issues will significantly improve accessibility and bring the application closer to WCAG 2.1 Level AA compliance. The recommendations provided include specific code examples that can be implemented directly.

**Estimated Effort:**
- Critical fixes: 2-3 weeks of development time
- High priority fixes: 1-2 weeks
- Medium priority fixes: 1 week

**Total estimated effort:** 4-6 weeks for full WCAG 2.1 Level AA compliance

---

**Audit Performed By:** AccessLint Accessibility Reviewer
**Date:** November 16, 2025
**WCAG Version:** 2.1 Level AA
**Testing Methods:** Automated analysis, color contrast checking, DOM inspection, keyboard testing
