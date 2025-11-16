/**
 * Workflow Keyboard Shortcuts System
 * 
 * Provides a centralized keyboard shortcut management system for the workflow editor.
 * Supports shortcut registration, conflict detection, and help panel display.
 */

export interface ShortcutDefinition {
  id: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category: ShortcutCategory;
  action: () => void;
  enabled?: boolean;
}

export type ShortcutCategory = 
  | 'general'
  | 'canvas'
  | 'nodes'
  | 'editing'
  | 'navigation'
  | 'workflow';

export interface ShortcutGroup {
  category: ShortcutCategory;
  label: string;
  icon: string;
  shortcuts: ShortcutDefinition[];
}

/**
 * Format a shortcut key combination for display
 */
export function formatShortcutKey(shortcut: ShortcutDefinition): string {
  const keys: string[] = [];
  
  // Use platform-specific modifier keys
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (shortcut.ctrl) keys.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) keys.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) keys.push(isMac ? '⌥' : 'Alt');
  if (shortcut.meta) keys.push(isMac ? '⌘' : 'Win');
  
  keys.push(shortcut.key.toUpperCase());
  
  return keys.join(isMac ? '' : '+');
}

/**
 * Check if a keyboard event matches a shortcut definition
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: ShortcutDefinition
): boolean {
  const key = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();
  
  // Check if the key matches
  if (key !== shortcutKey) return false;
  
  // Check modifiers
  if (!!shortcut.ctrl !== (event.ctrlKey || event.metaKey)) return false;
  if (!!shortcut.shift !== event.shiftKey) return false;
  if (!!shortcut.alt !== event.altKey) return false;
  
  return true;
}

/**
 * Keyboard Shortcuts Manager
 */
export class ShortcutsManager {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private listeners: Set<(event: KeyboardEvent) => void> = new Set();
  private enabled: boolean = true;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: ShortcutDefinition): void {
    // Check for conflicts
    const existing = Array.from(this.shortcuts.values()).find(s => 
      s.key === shortcut.key &&
      s.ctrl === shortcut.ctrl &&
      s.shift === shortcut.shift &&
      s.alt === shortcut.alt &&
      s.meta === shortcut.meta
    );

    if (existing) {
      console.warn(`Shortcut conflict: ${formatShortcutKey(shortcut)} is already registered for "${existing.description}"`);
    }

    this.shortcuts.set(shortcut.id, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  /**
   * Register multiple shortcuts at once
   */
  registerMany(shortcuts: ShortcutDefinition[]): void {
    shortcuts.forEach(shortcut => this.register(shortcut));
  }

  /**
   * Get all registered shortcuts grouped by category
   */
  getShortcutGroups(): ShortcutGroup[] {
    const groups: Map<ShortcutCategory, ShortcutDefinition[]> = new Map();

    this.shortcuts.forEach(shortcut => {
      if (!groups.has(shortcut.category)) {
        groups.set(shortcut.category, []);
      }
      groups.get(shortcut.category)!.push(shortcut);
    });

    const categoryLabels: Record<ShortcutCategory, { label: string; icon: string }> = {
      general: { label: 'General', icon: '⚡' },
      canvas: { label: 'Canvas', icon: '🎨' },
      nodes: { label: 'Nodes', icon: '📦' },
      editing: { label: 'Editing', icon: '✏️' },
      navigation: { label: 'Navigation', icon: '🧭' },
      workflow: { label: 'Workflow', icon: '🔄' }
    };

    return Array.from(groups.entries()).map(([category, shortcuts]) => ({
      category,
      label: categoryLabels[category].label,
      icon: categoryLabels[category].icon,
      shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description))
    }));
  }

  /**
   * Handle keyboard event
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
    ) {
      return false;
    }

    // Find matching shortcut
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.enabled !== false && matchesShortcut(event, shortcut)) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        return true;
      }
    }

    return false;
  }

  /**
   * Enable or disable all shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Enable or disable a specific shortcut
   */
  setShortcutEnabled(id: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = enabled;
    }
  }

  /**
   * Clear all registered shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
  }

  /**
   * Get a shortcut by ID
   */
  getShortcut(id: string): ShortcutDefinition | undefined {
    return this.shortcuts.get(id);
  }

  /**
   * Search shortcuts by description
   */
  searchShortcuts(query: string): ShortcutDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.shortcuts.values()).filter(shortcut =>
      shortcut.description.toLowerCase().includes(lowerQuery) ||
      formatShortcutKey(shortcut).toLowerCase().includes(lowerQuery)
    );
  }
}

/**
 * Default workflow shortcuts
 */
export function createDefaultShortcuts(actions: {
  // General
  save?: () => void;
  load?: () => void;
  export?: () => void;
  showHelp?: () => void;
  
  // Canvas
  zoomIn?: () => void;
  zoomOut?: () => void;
  zoomToFit?: () => void;
  resetView?: () => void;
  toggleMinimap?: () => void;
  toggleGrid?: () => void;
  
  // Nodes
  deleteSelected?: () => void;
  duplicateSelected?: () => void;
  selectAll?: () => void;
  deselectAll?: () => void;
  copySelected?: () => void;
  pasteNodes?: () => void;
  
  // Editing
  undo?: () => void;
  redo?: () => void;
  
  // Navigation
  panLeft?: () => void;
  panRight?: () => void;
  panUp?: () => void;
  panDown?: () => void;
  
  // Workflow
  runWorkflow?: () => void;
  stopWorkflow?: () => void;
  validateWorkflow?: () => void;
  clearWorkflow?: () => void;
  
  // Alignment
  alignLeft?: () => void;
  alignRight?: () => void;
  alignTop?: () => void;
  alignBottom?: () => void;
  alignCenter?: () => void;
  alignMiddle?: () => void;
  distributeHorizontally?: () => void;
  distributeVertically?: () => void;
}): ShortcutDefinition[] {
  const shortcuts: ShortcutDefinition[] = [];

  // General shortcuts
  if (actions.save) {
    shortcuts.push({
      id: 'save',
      key: 's',
      ctrl: true,
      description: 'Save workflow',
      category: 'general',
      action: actions.save
    });
  }

  if (actions.load) {
    shortcuts.push({
      id: 'load',
      key: 'o',
      ctrl: true,
      description: 'Load workflow',
      category: 'general',
      action: actions.load
    });
  }

  if (actions.export) {
    shortcuts.push({
      id: 'export',
      key: 'e',
      ctrl: true,
      shift: true,
      description: 'Export workflow',
      category: 'general',
      action: actions.export
    });
  }

  if (actions.showHelp) {
    shortcuts.push({
      id: 'help',
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      category: 'general',
      action: actions.showHelp
    });
  }

  // Canvas shortcuts
  if (actions.zoomIn) {
    shortcuts.push({
      id: 'zoom-in',
      key: '+',
      ctrl: true,
      description: 'Zoom in',
      category: 'canvas',
      action: actions.zoomIn
    });
  }

  if (actions.zoomOut) {
    shortcuts.push({
      id: 'zoom-out',
      key: '-',
      ctrl: true,
      description: 'Zoom out',
      category: 'canvas',
      action: actions.zoomOut
    });
  }

  if (actions.zoomToFit) {
    shortcuts.push({
      id: 'zoom-fit',
      key: '0',
      ctrl: true,
      description: 'Zoom to fit',
      category: 'canvas',
      action: actions.zoomToFit
    });
  }

  if (actions.resetView) {
    shortcuts.push({
      id: 'reset-view',
      key: 'r',
      ctrl: true,
      description: 'Reset view',
      category: 'canvas',
      action: actions.resetView
    });
  }

  if (actions.toggleMinimap) {
    shortcuts.push({
      id: 'toggle-minimap',
      key: 'm',
      ctrl: true,
      description: 'Toggle minimap',
      category: 'canvas',
      action: actions.toggleMinimap
    });
  }

  if (actions.toggleGrid) {
    shortcuts.push({
      id: 'toggle-grid',
      key: 'g',
      ctrl: true,
      description: 'Toggle grid',
      category: 'canvas',
      action: actions.toggleGrid
    });
  }

  // Node shortcuts
  if (actions.deleteSelected) {
    shortcuts.push({
      id: 'delete',
      key: 'Delete',
      description: 'Delete selected nodes',
      category: 'nodes',
      action: actions.deleteSelected
    });
  }

  if (actions.duplicateSelected) {
    shortcuts.push({
      id: 'duplicate',
      key: 'd',
      ctrl: true,
      description: 'Duplicate selected nodes',
      category: 'nodes',
      action: actions.duplicateSelected
    });
  }

  if (actions.selectAll) {
    shortcuts.push({
      id: 'select-all',
      key: 'a',
      ctrl: true,
      description: 'Select all nodes',
      category: 'nodes',
      action: actions.selectAll
    });
  }

  if (actions.deselectAll) {
    shortcuts.push({
      id: 'deselect-all',
      key: 'Escape',
      description: 'Deselect all nodes',
      category: 'nodes',
      action: actions.deselectAll
    });
  }

  if (actions.copySelected) {
    shortcuts.push({
      id: 'copy',
      key: 'c',
      ctrl: true,
      description: 'Copy selected nodes',
      category: 'nodes',
      action: actions.copySelected
    });
  }

  if (actions.pasteNodes) {
    shortcuts.push({
      id: 'paste',
      key: 'v',
      ctrl: true,
      description: 'Paste nodes',
      category: 'nodes',
      action: actions.pasteNodes
    });
  }

  // Editing shortcuts
  if (actions.undo) {
    shortcuts.push({
      id: 'undo',
      key: 'z',
      ctrl: true,
      description: 'Undo',
      category: 'editing',
      action: actions.undo
    });
  }

  if (actions.redo) {
    shortcuts.push({
      id: 'redo',
      key: 'y',
      ctrl: true,
      description: 'Redo',
      category: 'editing',
      action: actions.redo
    });
  }

  // Navigation shortcuts
  if (actions.panLeft) {
    shortcuts.push({
      id: 'pan-left',
      key: 'ArrowLeft',
      shift: true,
      description: 'Pan left',
      category: 'navigation',
      action: actions.panLeft
    });
  }

  if (actions.panRight) {
    shortcuts.push({
      id: 'pan-right',
      key: 'ArrowRight',
      shift: true,
      description: 'Pan right',
      category: 'navigation',
      action: actions.panRight
    });
  }

  if (actions.panUp) {
    shortcuts.push({
      id: 'pan-up',
      key: 'ArrowUp',
      shift: true,
      description: 'Pan up',
      category: 'navigation',
      action: actions.panUp
    });
  }

  if (actions.panDown) {
    shortcuts.push({
      id: 'pan-down',
      key: 'ArrowDown',
      shift: true,
      description: 'Pan down',
      category: 'navigation',
      action: actions.panDown
    });
  }

  // Workflow shortcuts
  if (actions.runWorkflow) {
    shortcuts.push({
      id: 'run',
      key: 'Enter',
      ctrl: true,
      description: 'Run workflow',
      category: 'workflow',
      action: actions.runWorkflow
    });
  }

  if (actions.stopWorkflow) {
    shortcuts.push({
      id: 'stop',
      key: 'Escape',
      ctrl: true,
      description: 'Stop workflow',
      category: 'workflow',
      action: actions.stopWorkflow
    });
  }

  if (actions.validateWorkflow) {
    shortcuts.push({
      id: 'validate',
      key: 'v',
      ctrl: true,
      shift: true,
      description: 'Validate workflow',
      category: 'workflow',
      action: actions.validateWorkflow
    });
  }

  if (actions.clearWorkflow) {
    shortcuts.push({
      id: 'clear',
      key: 'Delete',
      ctrl: true,
      shift: true,
      description: 'Clear workflow',
      category: 'workflow',
      action: actions.clearWorkflow
    });
  }

  // Alignment shortcuts
  if (actions.alignLeft) {
    shortcuts.push({
      id: 'align-left',
      key: 'ArrowLeft',
      ctrl: true,
      shift: true,
      description: 'Align nodes left',
      category: 'nodes',
      action: actions.alignLeft
    });
  }

  if (actions.alignRight) {
    shortcuts.push({
      id: 'align-right',
      key: 'ArrowRight',
      ctrl: true,
      shift: true,
      description: 'Align nodes right',
      category: 'nodes',
      action: actions.alignRight
    });
  }

  if (actions.alignTop) {
    shortcuts.push({
      id: 'align-top',
      key: 'ArrowUp',
      ctrl: true,
      shift: true,
      description: 'Align nodes top',
      category: 'nodes',
      action: actions.alignTop
    });
  }

  if (actions.alignBottom) {
    shortcuts.push({
      id: 'align-bottom',
      key: 'ArrowDown',
      ctrl: true,
      shift: true,
      description: 'Align nodes bottom',
      category: 'nodes',
      action: actions.alignBottom
    });
  }

  if (actions.alignCenter) {
    shortcuts.push({
      id: 'align-center',
      key: 'h',
      ctrl: true,
      shift: true,
      description: 'Align nodes center horizontally',
      category: 'nodes',
      action: actions.alignCenter
    });
  }

  if (actions.alignMiddle) {
    shortcuts.push({
      id: 'align-middle',
      key: 'v',
      ctrl: true,
      shift: true,
      alt: true,
      description: 'Align nodes middle vertically',
      category: 'nodes',
      action: actions.alignMiddle
    });
  }

  if (actions.distributeHorizontally) {
    shortcuts.push({
      id: 'distribute-h',
      key: 'd',
      ctrl: true,
      shift: true,
      description: 'Distribute nodes horizontally',
      category: 'nodes',
      action: actions.distributeHorizontally
    });
  }

  if (actions.distributeVertically) {
    shortcuts.push({
      id: 'distribute-v',
      key: 'd',
      ctrl: true,
      shift: true,
      alt: true,
      description: 'Distribute nodes vertically',
      category: 'nodes',
      action: actions.distributeVertically
    });
  }

  return shortcuts;
}

// Singleton instance
let globalShortcutsManager: ShortcutsManager | null = null;

/**
 * Get the global shortcuts manager instance
 */
export function getShortcutsManager(): ShortcutsManager {
  if (!globalShortcutsManager) {
    globalShortcutsManager = new ShortcutsManager();
  }
  return globalShortcutsManager;
}

/**
 * Reset the global shortcuts manager
 */
export function resetShortcutsManager(): void {
  globalShortcutsManager = null;
}
