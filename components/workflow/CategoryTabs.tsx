/**
 * CategoryTabs Component
 * 
 * Category tabs for filtering nodes in the node library.
 * Part of the workflow UI redesign (Task 3.3).
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Chip } from '@heroui/chip';
import { LucideIcon } from 'lucide-react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import { NodeCategory } from '@/lib/workflow/nodeDefinitions';
import styles from '@/styles/CategoryTabs.module.css';

export interface CategoryInfo {
  key: NodeCategory | 'all';
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface CategoryTabsProps {
  /**
   * Available categories
   */
  categories: CategoryInfo[];
  
  /**
   * Selected category key
   */
  selectedCategory?: NodeCategory | 'all';
  
  /**
   * Callback when category changes
   */
  onCategoryChange?: (category: NodeCategory | 'all') => void;
  
  /**
   * Node count per category (optional)
   */
  nodeCounts?: Record<string, number>;
  
  /**
   * Whether to show node counts
   */
  showCounts?: boolean;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * CategoryTabs Component
 */
export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory: controlledSelectedCategory,
  onCategoryChange,
  nodeCounts = {},
  showCounts = false,
  className = '',
}) => {
  const { theme } = useWorkflowTheme();
  
  // Internal state (used when not controlled)
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<NodeCategory | 'all'>('all');
  
  // Use controlled or internal state
  const selectedCategory = controlledSelectedCategory ?? internalSelectedCategory;
  
  // Handle category change
  const handleCategoryChange = useCallback((category: NodeCategory | 'all') => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setInternalSelectedCategory(category);
    }
  }, [onCategoryChange]);
  
  // Get category count
  const getCategoryCount = useCallback((categoryKey: string): number => {
    return nodeCounts[categoryKey] || 0;
  }, [nodeCounts]);
  
  // Check if category is selected
  const isCategorySelected = useCallback((categoryKey: string): boolean => {
    return selectedCategory === categoryKey;
  }, [selectedCategory]);
  
  return (
    <div
      className={`${styles.container} ${className}`}
      data-theme={theme}
    >
      <ScrollShadow
        orientation="horizontal"
        className={styles.scrollContainer}
        hideScrollBar
      >
        <div className={styles.tabsWrapper}>
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = isCategorySelected(category.key);
            const count = getCategoryCount(category.key);
            
            return (
              <button
                key={category.key}
                className={`${styles.tab} ${isSelected ? styles.tabSelected : ''}`}
                onClick={() => handleCategoryChange(category.key)}
                data-selected={isSelected}
                aria-label={`选择 ${category.label} 类别`}
                aria-pressed={isSelected}
              >
                <div className={styles.tabContent}>
                  <div
                    className={styles.iconWrapper}
                    style={{
                      backgroundColor: isSelected ? category.color : 'transparent',
                    }}
                  >
                    <IconComponent
                      size={14}
                      className={styles.icon}
                      style={{
                        color: isSelected ? '#ffffff' : category.color,
                      }}
                    />
                  </div>
                  
                  <span className={styles.label}>
                    {category.label}
                  </span>
                  
                  {showCounts && count > 0 && (
                    <span className={styles.count}>
                      {count}
                    </span>
                  )}
                </div>
                
                {isSelected && (
                  <div
                    className={styles.activeIndicator}
                    style={{ backgroundColor: category.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </ScrollShadow>
    </div>
  );
};

export default CategoryTabs;
