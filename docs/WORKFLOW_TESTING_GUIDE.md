# Workflow UI Redesign - Testing Guide

## Overview

This guide provides comprehensive testing procedures for the workflow UI redesign before release.

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Performance Testing](#performance-testing)
6. [Accessibility Testing](#accessibility-testing)
7. [Cross-Browser Testing](#cross-browser-testing)
8. [Mobile Testing](#mobile-testing)
9. [User Acceptance Testing](#user-acceptance-testing)
10. [Release Checklist](#release-checklist)

## Pre-Testing Setup

### Environment Setup

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build project
npm run build
```

### Test Data Preparation

```bash
# Generate test workflows
npm run generate-test-data

# Seed database (if applicable)
npm run db:seed

# Clear cache
npm run cache:clear
```

## Unit Testing

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- WorkflowCanvas.test.tsx

# Run in watch mode
npm test -- --watch
```

### Test Coverage Requirements

- **Overall Coverage**: ≥ 80%
- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

### Critical Unit Tests

#### Theme System Tests

```bash
npm test -- theme-system.test.ts
```

**Verify:**
- [ ] Light theme loads correctly
- [ ] Dark theme loads correctly
- [ ] Theme switching works
- [ ] Theme persistence works
- [ ] CSS variables are applied
- [ ] All colors are accessible

#### Layout Components Tests

```bash
npm test -- layout-components.test.tsx
```

**Verify:**
- [ ] Three-column layout renders
- [ ] Panels collapse/expand
- [ ] Panel resizing works
- [ ] Layout state persists
- [ ] Responsive breakpoints work

#### Node Library Tests

```bash
npm test -- node-library.test.tsx
```

**Verify:**
- [ ] Nodes render correctly
- [ ] Search filters nodes
- [ ] Categories work
- [ ] Drag and drop works
- [ ] Node cards display properly

#### Control Panel Tests

```bash
npm test -- control-panel.test.tsx
```

**Verify:**
- [ ] Status indicators update
- [ ] Action buttons work
- [ ] Logs display correctly
- [ ] Results display correctly
- [ ] Export functions work

#### Canvas Tests

```bash
npm test -- workflow-canvas.test.tsx
```

**Verify:**
- [ ] Canvas renders
- [ ] Zoom works
- [ ] Pan works
- [ ] Node selection works
- [ ] Edge creation works
- [ ] Mini-map works

## Integration Testing

### Running Integration Tests

```bash
# Run all integration tests
npm test -- integration.test.tsx

# Run with debugging
npm test -- integration.test.tsx --verbose
```

### Critical Integration Tests

#### Workflow Creation Flow

**Test Steps:**
1. Open workflow editor
2. Add Start node
3. Add Takeoff node
4. Connect nodes
5. Configure parameters
6. Add End node
7. Save workflow
8. Verify saved

**Expected Results:**
- [ ] All nodes added successfully
- [ ] Connections created
- [ ] Parameters saved
- [ ] Workflow saved to storage
- [ ] No errors in console

#### Workflow Execution Flow

**Test Steps:**
1. Load existing workflow
2. Connect drone
3. Click Run button
4. Monitor execution
5. Verify completion
6. Check results

**Expected Results:**
- [ ] Workflow loads correctly
- [ ] Execution starts
- [ ] Nodes execute in order
- [ ] Status updates in real-time
- [ ] Results captured
- [ ] Logs generated

#### Theme Switching Flow

**Test Steps:**
1. Open workflow editor
2. Toggle theme
3. Verify all components update
4. Reload page
5. Verify theme persists

**Expected Results:**
- [ ] Theme switches smoothly
- [ ] All components update
- [ ] No visual glitches
- [ ] Theme persists after reload
- [ ] Transitions are smooth

#### Node Editing Flow

**Test Steps:**
1. Double-click node
2. Edit parameters
3. Save changes
4. Verify node updates
5. Undo changes
6. Verify undo works

**Expected Results:**
- [ ] Editor opens
- [ ] Parameters editable
- [ ] Validation works
- [ ] Changes save
- [ ] Node updates visually
- [ ] Undo/redo works

## E2E Testing

### Running E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run in headed mode
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- workflow-creation.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

### Critical E2E Scenarios

#### Complete Workflow Lifecycle

**Scenario:**
1. User opens application
2. Navigates to workflow editor
3. Creates new workflow
4. Adds and configures nodes
5. Saves workflow
6. Runs workflow
7. Views results
8. Exports workflow

**Verification:**
- [ ] All steps complete without errors
- [ ] UI is responsive
- [ ] Data persists correctly
- [ ] Results are accurate

#### Multi-User Workflow Sharing

**Scenario:**
1. User A creates workflow
2. User A exports workflow
3. User B imports workflow
4. User B modifies workflow
5. User B saves as new version

**Verification:**
- [ ] Export works correctly
- [ ] Import preserves data
- [ ] Modifications work
- [ ] Version control works

## Performance Testing

### Metrics to Measure

```bash
# Run performance tests
npm run test:performance
```

#### Load Time Metrics

- [ ] **Initial Load**: < 3 seconds
- [ ] **Time to Interactive**: < 5 seconds
- [ ] **First Contentful Paint**: < 1.5 seconds
- [ ] **Largest Contentful Paint**: < 2.5 seconds

#### Runtime Performance

- [ ] **Node Rendering**: < 100ms for 50 nodes
- [ ] **Canvas Zoom**: 60 FPS
- [ ] **Canvas Pan**: 60 FPS
- [ ] **Search Response**: < 300ms
- [ ] **Theme Switch**: < 300ms

#### Memory Usage

- [ ] **Initial Memory**: < 100MB
- [ ] **Peak Memory**: < 300MB
- [ ] **Memory Leaks**: None detected
- [ ] **Garbage Collection**: Efficient

### Performance Testing Tools

**Chrome DevTools:**
```bash
# Open DevTools
# Go to Performance tab
# Record workflow interaction
# Analyze results
```

**Lighthouse:**
```bash
# Run Lighthouse audit
npm run lighthouse

# Check scores:
# - Performance: ≥ 90
# - Accessibility: ≥ 95
# - Best Practices: ≥ 90
# - SEO: ≥ 90
```

**Bundle Analyzer:**
```bash
# Analyze bundle size
npm run analyze

# Verify:
# - Main bundle: < 500KB
# - Total size: < 2MB
# - No duplicate dependencies
```

## Accessibility Testing

### Automated Testing

```bash
# Run accessibility tests
npm run test:a11y

# Run axe-core tests
npm test -- accessibility.test.tsx
```

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] All actions keyboard accessible
- [ ] No keyboard traps
- [ ] Escape closes modals
- [ ] Enter activates buttons

#### Screen Reader Testing

**NVDA (Windows):**
```bash
# Download NVDA
# Enable screen reader
# Navigate workflow editor
# Verify all content announced
```

**VoiceOver (Mac):**
```bash
# Enable VoiceOver (Cmd+F5)
# Navigate workflow editor
# Verify all content announced
```

**Verification:**
- [ ] All images have alt text
- [ ] All buttons have labels
- [ ] Form fields have labels
- [ ] Status updates announced
- [ ] Error messages announced
- [ ] Dynamic content announced

#### Color Contrast

```bash
# Run contrast checker
npm run test:contrast
```

**Verify:**
- [ ] Text contrast ≥ 4.5:1
- [ ] Large text ≥ 3:1
- [ ] UI components ≥ 3:1
- [ ] Focus indicators ≥ 3:1
- [ ] Color not sole indicator

#### Touch Targets

- [ ] All targets ≥ 44x44px
- [ ] Adequate spacing (≥ 8px)
- [ ] No overlapping targets
- [ ] Touch feedback provided

## Cross-Browser Testing

### Supported Browsers

#### Desktop Browsers

**Chrome/Edge (≥ 90):**
- [ ] Layout correct
- [ ] Functionality works
- [ ] Performance acceptable
- [ ] No console errors

**Firefox (≥ 88):**
- [ ] Layout correct
- [ ] Functionality works
- [ ] Performance acceptable
- [ ] No console errors

**Safari (≥ 14):**
- [ ] Layout correct
- [ ] Functionality works
- [ ] Performance acceptable
- [ ] No console errors

#### Mobile Browsers

**Chrome Mobile:**
- [ ] Responsive layout
- [ ] Touch interactions work
- [ ] Performance acceptable

**Safari Mobile:**
- [ ] Responsive layout
- [ ] Touch interactions work
- [ ] Performance acceptable

### Browser Testing Tools

**BrowserStack:**
```bash
# Run on BrowserStack
npm run test:browserstack
```

**Local Testing:**
```bash
# Test on different browsers
# Use browser dev tools
# Check console for errors
# Verify functionality
```

## Mobile Testing

### Device Testing

#### iOS Devices

**iPhone (iOS 14+):**
- [ ] Layout responsive
- [ ] Touch gestures work
- [ ] Pinch zoom works
- [ ] Orientation changes work
- [ ] Performance acceptable

**iPad (iOS 14+):**
- [ ] Layout optimized
- [ ] Touch gestures work
- [ ] Split view works
- [ ] Performance acceptable

#### Android Devices

**Phone (Android 10+):**
- [ ] Layout responsive
- [ ] Touch gestures work
- [ ] Pinch zoom works
- [ ] Orientation changes work
- [ ] Performance acceptable

**Tablet (Android 10+):**
- [ ] Layout optimized
- [ ] Touch gestures work
- [ ] Performance acceptable

### Mobile-Specific Features

- [ ] Touch drag and drop works
- [ ] Pinch to zoom works
- [ ] Swipe gestures work
- [ ] Virtual keyboard doesn't break layout
- [ ] Orientation changes handled
- [ ] Touch targets adequate size

## User Acceptance Testing

### UAT Test Cases

#### Test Case 1: First-Time User

**Scenario:** New user creates their first workflow

**Steps:**
1. Open workflow editor
2. Follow tutorial (if shown)
3. Create simple workflow
4. Save workflow
5. Run workflow

**Success Criteria:**
- [ ] User completes without help
- [ ] UI is intuitive
- [ ] No confusion
- [ ] Workflow works as expected

#### Test Case 2: Power User

**Scenario:** Experienced user creates complex workflow

**Steps:**
1. Create workflow with 30+ nodes
2. Use advanced features
3. Use keyboard shortcuts
4. Optimize workflow
5. Export workflow

**Success Criteria:**
- [ ] All features work
- [ ] Performance acceptable
- [ ] Shortcuts work
- [ ] Export successful

#### Test Case 3: Mobile User

**Scenario:** User on tablet creates workflow

**Steps:**
1. Open on tablet
2. Create workflow using touch
3. Configure nodes
4. Save and run

**Success Criteria:**
- [ ] Touch interactions work
- [ ] Layout is usable
- [ ] Performance acceptable
- [ ] Workflow executes

### UAT Feedback Collection

**Feedback Form:**
- Ease of use (1-5)
- Performance (1-5)
- Visual design (1-5)
- Feature completeness (1-5)
- Overall satisfaction (1-5)
- Comments and suggestions

## Release Checklist

### Pre-Release Checks

#### Code Quality

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code reviewed
- [ ] Documentation complete

#### Functionality

- [ ] All features working
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Cross-browser compatible

#### Security

- [ ] Security audit passed
- [ ] No vulnerabilities
- [ ] Input validation working
- [ ] XSS prevention working
- [ ] CSRF protection enabled

#### Documentation

- [ ] User guide complete
- [ ] API documentation complete
- [ ] Release notes prepared
- [ ] Migration guide ready
- [ ] FAQ updated

### Release Process

#### 1. Version Bump

```bash
# Update version
npm version minor

# Update changelog
npm run changelog
```

#### 2. Build Production

```bash
# Clean build
npm run clean

# Production build
npm run build

# Verify build
npm run verify-build
```

#### 3. Deploy Staging

```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:smoke
```

#### 4. Final Verification

- [ ] Staging environment working
- [ ] All features functional
- [ ] Performance acceptable
- [ ] No errors in logs

#### 5. Deploy Production

```bash
# Deploy to production
npm run deploy:production

# Monitor deployment
npm run monitor
```

#### 6. Post-Deployment

- [ ] Verify production deployment
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Prepare hotfix if needed

### Rollback Plan

If issues are detected:

```bash
# Rollback to previous version
npm run rollback

# Verify rollback successful
npm run verify

# Investigate issues
npm run logs

# Prepare hotfix
npm run hotfix
```

## Testing Sign-off

### Test Results Summary

- **Unit Tests**: ✅ Passed (Coverage: XX%)
- **Integration Tests**: ✅ Passed
- **E2E Tests**: ✅ Passed
- **Performance Tests**: ✅ Passed
- **Accessibility Tests**: ✅ Passed
- **Cross-Browser Tests**: ✅ Passed
- **Mobile Tests**: ✅ Passed
- **UAT**: ✅ Passed

### Approvals

- [ ] **QA Lead**: [Name] - [Date]
- [ ] **Tech Lead**: [Name] - [Date]
- [ ] **Product Owner**: [Name] - [Date]
- [ ] **Accessibility Expert**: [Name] - [Date]
- [ ] **Security Team**: [Name] - [Date]

### Release Authorization

- [ ] All tests passed
- [ ] All approvals received
- [ ] Documentation complete
- [ ] Rollback plan ready
- [ ] Monitoring configured

**Authorized for Release**: [Name] - [Date]

---

**Last Updated:** 2024-01-15
**Version:** 2.0.0
**Status:** Ready for Release
