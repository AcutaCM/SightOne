/**
 * NodeLibraryFooter Component
 * 
 * Footer component for the node library showing statistics and quick actions.
 * Part of the workflow UI redesign (Task 3.5).
 */

'use client';

import React, { useMemo } from 'react';
import { RefreshCw, Info } from 'lucide-react';
import { Tooltip } from '@heroui/tooltip';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/NodeLibraryFooter.module.css';

export interface NodeLibraryFooterProps {
  /**
   * Total number of nodes available
   */
  totalNodes: number;
  
  /**
   * Number of currently displayed nodes (after filtering)
   */
  displayedNodes: number;
  
  /**
   * Callback when refresh button is clicked
   */
  onRefresh?: () => void;
  
  /**
   * Callback when info button is clicked
   */
  onShowInfo?: () => void;
  
  /**
   * Whether refresh is in progress
   */
  isRefreshing?: boolean;
  
  /**
   * Additional statistics to display
   */
  additionalStats?: Array<{
    label: string;
    value: string | number;
  }>;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * NodeLibraryFooter Component
 */
export const NodeLibraryFooter: React.FC<NodeLibraryFooterProps> = ({
  totalNodes,
  displayedNodes,
  onRefresh,
  onShowInfo,
  isRefreshing = false,
  additionalStats = [],
  className = '',
}) => {
  const { theme } = useWorkflowTheme();
  
  // Check if filtering is active
  const isFiltered = useMemo(() => {
    return displayedNodes < totalNodes;
  }, [displayedNodes, totalNodes]);
  
  // Format statistics text
  const statsText = useMemo(() => {
    if (isFiltered) {
      return `显示 ${displayedNodes} / ${totalNodes} 个节点`;
    }
    return `共 ${totalNodes} 个节点`;
  }, [isFiltered, displayedNodes, totalNodes]);
  
  return (
    <div
      className={`${styles.container} ${className}`}
      data-theme={theme}
    >
      {/* Main statistics */}
      <div className={styles.statsSection}>
        <div className={styles.mainStat}>
          <span className={styles.statText}>{statsText}</span>
          {isFiltered && (
            <span className={styles.filterBadge}>已筛选</span>
          )}
        </div>
        
        {/* Additional statistics */}
        {additionalStats.length > 0 && (
          <div className={styles.additionalStats}>
            {additionalStats.map((stat, index) => (
              <div key={index} className={styles.additionalStat}>
                <span className={styles.additionalStatLabel}>{stat.label}:</span>
                <span className={styles.additionalStatValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className={styles.actionsSection}>
        {onRefresh && (
          <Tooltip
            content="刷新节点库"
            placement="top"
            delay={500}
          >
            <button
              className={styles.actionButton}
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="刷新节点库"
              data-refreshing={isRefreshing}
            >
              <RefreshCw
                size={16}
                className={`${styles.actionIcon} ${isRefreshing ? styles.spinning : ''}`}
              />
            </button>
          </Tooltip>
        )}
        
        {onShowInfo && (
          <Tooltip
            content="节点库信息"
            placement="top"
            delay={500}
          >
            <button
              className={styles.actionButton}
              onClick={onShowInfo}
              aria-label="显示节点库信息"
            >
              <Info size={16} className={styles.actionIcon} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default NodeLibraryFooter;
