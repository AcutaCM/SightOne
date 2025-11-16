/**
 * StatusIndicatorShowcase Component
 * 
 * Demonstration component showing all status indicator states
 * with the dark mode design system.
 * 
 * This component serves as:
 * - Visual reference for developers
 * - Testing component for status indicators
 * - Documentation of status indicator usage
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

'use client';

import React from 'react';
import StatusIndicator from './StatusIndicator';
import styles from '../styles/StatusIndicatorShowcase.module.css';

const StatusIndicatorShowcase: React.FC = () => {
  return (
    <div className={styles.showcase}>
      <div className={styles.header}>
        <h2 className={styles.title}>Status Indicators - Dark Mode Theme</h2>
        <p className={styles.subtitle}>
          Using white transparency hierarchy for visual feedback
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Success State (100% White Opacity)</h3>
        <p className={styles.sectionDescription}>
          Requirement 8.1: 100% white opacity with subtle glow effect
        </p>
        <div className={styles.examples}>
          <StatusIndicator 
            status="success" 
            message="Operation completed successfully" 
            size="sm"
          />
          <StatusIndicator 
            status="success" 
            message="Data saved successfully" 
            size="md"
          />
          <StatusIndicator 
            status="success" 
            message="Workflow executed successfully" 
            size="lg"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Warning State (80% White Opacity)</h3>
        <p className={styles.sectionDescription}>
          Requirement 8.2: 80% white opacity for warning indicators
        </p>
        <div className={styles.examples}>
          <StatusIndicator 
            status="warning" 
            message="Battery level is low" 
            size="sm"
          />
          <StatusIndicator 
            status="warning" 
            message="Connection unstable" 
            size="md"
          />
          <StatusIndicator 
            status="warning" 
            message="High temperature detected" 
            size="lg"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Error State (90% White Opacity)</h3>
        <p className={styles.sectionDescription}>
          Requirement 8.3: 90% white opacity with increased prominence
        </p>
        <div className={styles.examples}>
          <StatusIndicator 
            status="error" 
            message="Connection failed" 
            size="sm"
          />
          <StatusIndicator 
            status="error" 
            message="Workflow execution failed" 
            size="md"
          />
          <StatusIndicator 
            status="error" 
            message="Critical system error occurred" 
            size="lg"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Loading State (60% White Opacity)</h3>
        <p className={styles.sectionDescription}>
          Requirements 8.4, 8.5: 60% white opacity with pulsing animation
        </p>
        <div className={styles.examples}>
          <StatusIndicator 
            status="loading" 
            message="Loading data..." 
            size="sm"
          />
          <StatusIndicator 
            status="loading" 
            message="Processing workflow..." 
            size="md"
          />
          <StatusIndicator 
            status="loading" 
            message="Analyzing image..." 
            size="lg"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Info State (70% White Opacity)</h3>
        <p className={styles.sectionDescription}>
          Additional state for informational messages
        </p>
        <div className={styles.examples}>
          <StatusIndicator 
            status="info" 
            message="New update available" 
            size="sm"
          />
          <StatusIndicator 
            status="info" 
            message="System information" 
            size="md"
          />
          <StatusIndicator 
            status="info" 
            message="Helpful tip for users" 
            size="lg"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Icon Only</h3>
        <p className={styles.sectionDescription}>
          Status indicators without messages
        </p>
        <div className={styles.examples}>
          <StatusIndicator status="success" size="sm" />
          <StatusIndicator status="warning" size="md" />
          <StatusIndicator status="error" size="md" />
          <StatusIndicator status="loading" size="md" />
          <StatusIndicator status="info" size="lg" />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Inline Display</h3>
        <p className={styles.sectionDescription}>
          Status indicators in inline layout
        </p>
        <div className={styles.inlineExamples}>
          <p className={styles.inlineText}>
            <StatusIndicator status="success" inline size="sm" />
            Operation completed
          </p>
          <p className={styles.inlineText}>
            <StatusIndicator status="warning" inline size="sm" />
            Warning message
          </p>
          <p className={styles.inlineText}>
            <StatusIndicator status="error" inline size="sm" />
            Error occurred
          </p>
          <p className={styles.inlineText}>
            <StatusIndicator status="loading" inline size="sm" />
            Loading...
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          All status indicators use the dark mode design system with white transparency hierarchy.
          Colors are defined in <code>lib/design-tokens-dark.ts</code> and <code>styles/dark-mode-theme.css</code>.
        </p>
      </div>
    </div>
  );
};

export default StatusIndicatorShowcase;
