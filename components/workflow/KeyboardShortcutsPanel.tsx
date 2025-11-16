/**
 * Keyboard Shortcuts Help Panel
 * 
 * Displays all available keyboard shortcuts in a modal dialog.
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Tabs,
  Tab,
  Card,
  CardBody,
  Kbd
} from '@heroui/react';
import { Search, Keyboard, X } from 'lucide-react';
import {
  ShortcutGroup,
  ShortcutDefinition,
  formatShortcutKey
} from '@/lib/workflow/shortcuts';
import styles from '@/styles/KeyboardShortcutsPanel.module.css';

export interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  shortcutGroups: ShortcutGroup[];
}

/**
 * Render a keyboard shortcut key combination
 */
function ShortcutKey({ shortcut }: { shortcut: ShortcutDefinition }) {
  const keyString = formatShortcutKey(shortcut);
  const keys = keyString.split('+').map(k => k.trim());

  return (
    <div className={styles.shortcutKey}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <Kbd className={styles.kbd}>{key}</Kbd>
          {index < keys.length - 1 && <span className={styles.plus}>+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Render a single shortcut item
 */
function ShortcutItem({ shortcut }: { shortcut: ShortcutDefinition }) {
  return (
    <div className={styles.shortcutItem}>
      <div className={styles.shortcutDescription}>
        {shortcut.description}
      </div>
      <ShortcutKey shortcut={shortcut} />
    </div>
  );
}

/**
 * Render a group of shortcuts
 */
function ShortcutGroupCard({ group }: { group: ShortcutGroup }) {
  return (
    <Card className={styles.groupCard}>
      <CardBody>
        <div className={styles.groupHeader}>
          <span className={styles.groupIcon}>{group.icon}</span>
          <h3 className={styles.groupTitle}>{group.label}</h3>
          <span className={styles.groupCount}>
            {group.shortcuts.length} shortcuts
          </span>
        </div>
        <div className={styles.shortcutsList}>
          {group.shortcuts.map(shortcut => (
            <ShortcutItem key={shortcut.id} shortcut={shortcut} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Keyboard Shortcuts Help Panel Component
 */
export function KeyboardShortcutsPanel({
  isOpen,
  onClose,
  shortcutGroups
}: KeyboardShortcutsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter shortcuts based on search query and category
  const filteredGroups = useMemo(() => {
    let groups = shortcutGroups;

    // Filter by category
    if (selectedCategory !== 'all') {
      groups = groups.filter(group => group.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      groups = groups
        .map(group => ({
          ...group,
          shortcuts: group.shortcuts.filter(
            shortcut =>
              shortcut.description.toLowerCase().includes(query) ||
              formatShortcutKey(shortcut).toLowerCase().includes(query)
          )
        }))
        .filter(group => group.shortcuts.length > 0);
    }

    return groups;
  }, [shortcutGroups, searchQuery, selectedCategory]);

  // Get total shortcuts count
  const totalShortcuts = useMemo(() => {
    return shortcutGroups.reduce((sum, group) => sum + group.shortcuts.length, 0);
  }, [shortcutGroups]);

  // Get category tabs
  const categoryTabs = useMemo(() => {
    const tabs = [
      { key: 'all', label: 'All', count: totalShortcuts }
    ];

    shortcutGroups.forEach(group => {
      tabs.push({
        key: group.category,
        label: group.label,
        count: group.shortcuts.length
      });
    });

    return tabs;
  }, [shortcutGroups, totalShortcuts]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: styles.modal,
        header: styles.modalHeader,
        body: styles.modalBody,
        footer: styles.modalFooter
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Keyboard className={styles.headerIcon} size={24} />
              <h2>Keyboard Shortcuts</h2>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className={styles.closeButton}
            >
              <X size={20} />
            </Button>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Search Bar */}
          <div className={styles.searchBar}>
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search size={18} />}
              classNames={{
                base: styles.searchInput,
                inputWrapper: styles.searchInputWrapper
              }}
              isClearable
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Category Tabs */}
          <Tabs
            selectedKey={selectedCategory}
            onSelectionChange={(key) => setSelectedCategory(key as string)}
            classNames={{
              base: styles.tabs,
              tabList: styles.tabList,
              tab: styles.tab,
              cursor: styles.tabCursor,
              panel: styles.tabPanel
            }}
          >
            {categoryTabs.map(tab => (
              <Tab
                key={tab.key}
                title={
                  <div className={styles.tabTitle}>
                    <span>{tab.label}</span>
                    <span className={styles.tabCount}>{tab.count}</span>
                  </div>
                }
              />
            ))}
          </Tabs>

          {/* Shortcuts List */}
          <div className={styles.groupsList}>
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <ShortcutGroupCard key={group.category} group={group} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <Keyboard size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>
                  {searchQuery
                    ? `No shortcuts found for "${searchQuery}"`
                    : 'No shortcuts available'}
                </p>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Press <Kbd>?</Kbd> or <Kbd>Shift</Kbd> + <Kbd>?</Kbd> to toggle this panel
            </p>
            <Button
              color="primary"
              onPress={onClose}
              className={styles.closeFooterButton}
            >
              Close
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default KeyboardShortcutsPanel;
