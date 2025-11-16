/**
 * Sidebar Performance Measurement Utilities
 * 
 * Tracks and reports performance metrics for the assistant settings sidebar
 * 
 * Requirements: 4.1
 */

import { performanceMonitor } from './performanceOptimization';

/**
 * Performance targets for the sidebar
 */
export const PERFORMANCE_TARGETS = {
  sidebarOpen: 300,      // < 300ms
  formValidation: 100,   // < 100ms
  draftSave: 50,         // < 50ms (non-blocking)
  characterCount: 16,    // < 16ms (60fps)
  emojiSelect: 50,       // < 50ms
  emojiScroll: 16        // < 16ms (60fps)
};

/**
 * Measure sidebar open time
 */
export function measureSidebarOpen(callback: () => void): void {
  const start = performance.now();
  
  callback();
  
  // Use requestAnimationFrame to measure after render
  requestAnimationFrame(() => {
    const end = performance.now();
    const duration = end - start;
    
    performanceMonitor.record('sidebar_open', duration);
    
    if (duration > PERFORMANCE_TARGETS.sidebarOpen) {
      console.warn(
        `[Performance] Sidebar open took ${duration.toFixed(2)}ms ` +
        `(target: ${PERFORMANCE_TARGETS.sidebarOpen}ms)`
      );
    } else {
      console.log(
        `[Performance] Sidebar open: ${duration.toFixed(2)}ms ` +
        `(target: ${PERFORMANCE_TARGETS.sidebarOpen}ms) ✓`
      );
    }
  });
}

/**
 * Measure form validation time
 */
export function measureValidation(field: string, callback: () => void): void {
  const start = performance.now();
  
  callback();
  
  const end = performance.now();
  const duration = end - start;
  
  performanceMonitor.record('validation', duration);
  
  if (duration > PERFORMANCE_TARGETS.formValidation) {
    console.warn(
      `[Performance] Validation for ${field} took ${duration.toFixed(2)}ms ` +
      `(target: ${PERFORMANCE_TARGETS.formValidation}ms)`
    );
  }
}

/**
 * Measure draft save time
 */
export function measureDraftSave(callback: () => void): void {
  const start = performance.now();
  
  callback();
  
  const end = performance.now();
  const duration = end - start;
  
  performanceMonitor.record('draft_save', duration);
  
  if (duration > PERFORMANCE_TARGETS.draftSave) {
    console.warn(
      `[Performance] Draft save took ${duration.toFixed(2)}ms ` +
      `(target: ${PERFORMANCE_TARGETS.draftSave}ms)`
    );
  }
}

/**
 * Measure character count update time
 */
export function measureCharacterCount(callback: () => void): void {
  const start = performance.now();
  
  callback();
  
  const end = performance.now();
  const duration = end - start;
  
  performanceMonitor.record('character_count', duration);
  
  if (duration > PERFORMANCE_TARGETS.characterCount) {
    console.warn(
      `[Performance] Character count update took ${duration.toFixed(2)}ms ` +
      `(target: ${PERFORMANCE_TARGETS.characterCount}ms for 60fps)`
    );
  }
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(): {
  summary: Record<string, any>;
  warnings: string[];
  passed: boolean;
} {
  const summary = performanceMonitor.getSummary();
  const warnings: string[] = [];
  let passed = true;

  // Check each metric against targets
  Object.entries(PERFORMANCE_TARGETS).forEach(([metric, target]) => {
    const data = summary[metric];
    if (data && data.avg > target) {
      warnings.push(
        `${metric}: ${data.avg.toFixed(2)}ms (target: ${target}ms) - FAILED`
      );
      passed = false;
    } else if (data) {
      console.log(
        `[Performance] ${metric}: ${data.avg.toFixed(2)}ms (target: ${target}ms) - PASSED ✓`
      );
    }
  });

  return {
    summary,
    warnings,
    passed
  };
}

/**
 * Log performance report to console
 */
export function logPerformanceReport(): void {
  console.log('\n=== Assistant Sidebar Performance Report ===\n');
  
  const report = generatePerformanceReport();
  
  console.log('Summary:');
  console.table(report.summary);
  
  if (report.warnings.length > 0) {
    console.warn('\nPerformance Warnings:');
    report.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`\nOverall: ${report.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
  console.log('\n==========================================\n');
}

/**
 * Clear all performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMonitor.clear();
  console.log('[Performance] Metrics cleared');
}

/**
 * Start performance monitoring session
 */
export function startPerformanceMonitoring(): void {
  clearPerformanceMetrics();
  console.log('[Performance] Monitoring started');
}

/**
 * End performance monitoring session and generate report
 */
export function endPerformanceMonitoring(): void {
  logPerformanceReport();
}
