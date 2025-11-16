/**
 * Animation Showcase Component
 * Demonstrates all workflow animations for testing and documentation
 */

'use client';

import React, { useState } from 'react';
import styles from '@/styles/AnimationShowcase.module.css';

export const AnimationShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('fade');
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const demos = [
    { id: 'fade', name: 'Fade In/Out', class: 'workflow-animate-fade-in' },
    { id: 'slide-left', name: 'Slide In Left', class: 'workflow-animate-slide-in-left' },
    { id: 'slide-right', name: 'Slide In Right', class: 'workflow-animate-slide-in-right' },
    { id: 'scale', name: 'Scale In', class: 'workflow-animate-scale-in' },
    { id: 'bounce', name: 'Bounce In', class: 'workflow-animate-bounce-in' },
    { id: 'pulse', name: 'Pulse', class: 'workflow-animate-pulse' },
    { id: 'spin', name: 'Spin', class: 'workflow-animate-spin' },
    { id: 'float', name: 'Float', class: 'workflow-animate-float' },
  ];

  return (
    <div className={styles.showcase}>
      <div className={styles.header}>
        <h2 className={styles.title}>Workflow Animation Showcase</h2>
        <p className={styles.description}>
          Interactive demonstration of all workflow UI animations
        </p>
      </div>

      <div className={styles.content}>
        {/* Animation Selector */}
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Animations</h3>
          <div className={styles.demoList}>
            {demos.map((demo) => (
              <button
                key={demo.id}
                className={`${styles.demoButton} ${
                  activeDemo === demo.id ? styles.active : ''
                }`}
                onClick={() => setActiveDemo(demo.id)}
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Preview */}
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>
              {demos.find((d) => d.id === activeDemo)?.name}
            </h3>
            <button className={styles.triggerButton} onClick={triggerAnimation}>
              Trigger Animation
            </button>
          </div>

          <div className={styles.previewArea}>
            <div
              className={`${styles.previewBox} ${
                isAnimating
                  ? demos.find((d) => d.id === activeDemo)?.class
                  : ''
              }`}
            >
              <div className={styles.previewContent}>
                <svg
                  className={styles.previewIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p className={styles.previewText}>Animation Demo</p>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className={styles.codeSection}>
            <h4 className={styles.codeTitle}>CSS Class</h4>
            <pre className={styles.codeBlock}>
              <code>{demos.find((d) => d.id === activeDemo)?.class}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Utility Classes Demo */}
      <div className={styles.utilities}>
        <h3 className={styles.utilitiesTitle}>Utility Classes</h3>
        <div className={styles.utilityGrid}>
          <div className={styles.utilityCard}>
            <div className="workflow-hover-lift">
              <div className={styles.utilityDemo}>Hover Lift</div>
            </div>
            <code className={styles.utilityCode}>workflow-hover-lift</code>
          </div>

          <div className={styles.utilityCard}>
            <div className="workflow-hover-scale">
              <div className={styles.utilityDemo}>Hover Scale</div>
            </div>
            <code className={styles.utilityCode}>workflow-hover-scale</code>
          </div>

          <div className={styles.utilityCard}>
            <div className="workflow-hover-glow">
              <div className={styles.utilityDemo}>Hover Glow</div>
            </div>
            <code className={styles.utilityCode}>workflow-hover-glow</code>
          </div>

          <div className={styles.utilityCard}>
            <div className="workflow-transition-all">
              <div className={styles.utilityDemo}>Transition All</div>
            </div>
            <code className={styles.utilityCode}>workflow-transition-all</code>
          </div>
        </div>
      </div>

      {/* Component Examples */}
      <div className={styles.examples}>
        <h3 className={styles.examplesTitle}>Component Examples</h3>
        
        {/* Button Example */}
        <div className={styles.exampleSection}>
          <h4 className={styles.exampleTitle}>Buttons</h4>
          <div className={styles.exampleContent}>
            <button className={`${styles.exampleButton} ${styles.primary}`}>
              Primary Button
            </button>
            <button className={`${styles.exampleButton} ${styles.secondary}`}>
              Secondary Button
            </button>
            <button className={`${styles.exampleButton} ${styles.danger}`}>
              Danger Button
            </button>
          </div>
        </div>

        {/* Card Example */}
        <div className={styles.exampleSection}>
          <h4 className={styles.exampleTitle}>Cards</h4>
          <div className={styles.exampleContent}>
            <div className="workflow-card workflow-card-hover">
              <div className={styles.cardContent}>
                <h5 className={styles.cardTitle}>Hover Card</h5>
                <p className={styles.cardText}>
                  Hover over this card to see the animation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Example */}
        <div className={styles.exampleSection}>
          <h4 className={styles.exampleTitle}>Badges</h4>
          <div className={styles.exampleContent}>
            <span className="workflow-badge workflow-badge-primary">Primary</span>
            <span className="workflow-badge workflow-badge-success">Success</span>
            <span className="workflow-badge workflow-badge-error">Error</span>
            <span className="workflow-badge workflow-badge-warning">Warning</span>
          </div>
        </div>
      </div>
    </div>
  );
};
