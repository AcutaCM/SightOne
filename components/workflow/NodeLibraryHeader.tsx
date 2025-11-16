/**
 * NodeLibraryHeader Component
 * 
 * Header component for the node library with search functionality.
 * Part of the workflow UI redesign (Task 3.2).
 * Optimized with debounced search (Task 10.3).
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@heroui/input';
import { Search, X } from 'lucide-react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import { useDebouncedCallback } from '@/lib/workflow/interactionOptimization';
import styles from '@/styles/NodeLibraryHeader.module.css';

export interface NodeLibraryHeaderProps {
  /**
   * Search query value
   */
  searchQuery?: string;
  
  /**
   * Callback when search query changes
   */
  onSearchChange?: (query: string) => void;
  
  /**
   * Title text
   */
  title?: string;
  
  /**
   * Whether to show the collapse button
   */
  showCollapseButton?: boolean;
  
  /**
   * Callback when collapse button is clicked
   */
  onCollapse?: () => void;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * NodeLibraryHeader Component
 */
export const NodeLibraryHeader: React.FC<NodeLibraryHeaderProps> = ({
  searchQuery: controlledSearchQuery,
  onSearchChange,
  title = '节点库',
  showCollapseButton = false,
  onCollapse,
  className = '',
}) => {
  const { theme } = useWorkflowTheme();
  
  // Internal state (used when not controlled)
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  
  // Use controlled or internal state
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  
  // Debounced search handler (300ms delay for optimal UX)
  const debouncedSearchChange = useDebouncedCallback((value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  }, 300);
  
  // Handle search change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    // Update local state immediately for responsive UI
    setInternalSearchQuery(value);
    // Debounce the actual search operation
    debouncedSearchChange(value);
  }, [debouncedSearchChange]);
  
  // Clear search
  const handleClearSearch = useCallback(() => {
    handleSearchChange('');
  }, [handleSearchChange]);
  
  // Check if search is active
  const hasSearchQuery = useMemo(() => {
    return searchQuery.trim().length > 0;
  }, [searchQuery]);
  
  return (
    <div
      className={`${styles.container} ${className}`}
      data-theme={theme}
    >
      {/* Title */}
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{title}</h3>
        {showCollapseButton && onCollapse && (
          <button
            className={styles.collapseBtn}
            onClick={onCollapse}
            title="折叠节点库"
            aria-label="折叠节点库"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* Search input */}
      <div className={styles.searchRow}>
        <Input
          placeholder="搜索节点..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          startContent={
            <Search size={18} className={styles.searchIcon} />
          }
          endContent={
            hasSearchQuery && (
              <button
                className={styles.clearButton}
                onClick={handleClearSearch}
                title="清除搜索"
                aria-label="清除搜索"
              >
                <X size={16} />
              </button>
            )
          }
          size="sm"
          classNames={{
            base: styles.searchInputBase,
            input: styles.searchInput,
            inputWrapper: styles.searchInputWrapper,
          }}
          aria-label="搜索节点"
        />
      </div>
    </div>
  );
};

export default NodeLibraryHeader;
