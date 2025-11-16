/**
 * Shortcuts Help Button
 * 
 * A button that opens the keyboard shortcuts help panel.
 */

'use client';

import React, { useState } from 'react';
import { Button, Tooltip } from '@heroui/react';
import { Keyboard } from 'lucide-react';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from '@/styles/ShortcutsHelpButton.module.css';

export interface ShortcutsHelpButtonProps {
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isIconOnly?: boolean;
  className?: string;
}

/**
 * Shortcuts Help Button Component
 */
export function ShortcutsHelpButton({
  variant = 'light',
  size = 'md',
  isIconOnly = false,
  className
}: ShortcutsHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getShortcutGroups } = useKeyboardShortcuts({
    enabled: true,
    shortcuts: [
      {
        id: 'toggle-shortcuts-help',
        key: '?',
        shift: true,
        description: 'Show keyboard shortcuts',
        category: 'general',
        action: () => setIsOpen(prev => !prev)
      }
    ]
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip content="Keyboard Shortcuts (Shift + ?)" placement="bottom">
        <Button
          variant={variant}
          size={size}
          isIconOnly={isIconOnly}
          onPress={handleOpen}
          className={`${styles.button} ${className || ''}`}
          startContent={!isIconOnly ? <Keyboard size={18} /> : undefined}
        >
          {isIconOnly ? <Keyboard size={18} /> : 'Shortcuts'}
        </Button>
      </Tooltip>

      <KeyboardShortcutsPanel
        isOpen={isOpen}
        onClose={handleClose}
        shortcutGroups={getShortcutGroups()}
      />
    </>
  );
}

export default ShortcutsHelpButton;
