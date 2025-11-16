/**
 * Keyboard Shortcuts System Tests
 */

import {
  ShortcutsManager,
  ShortcutDefinition,
  formatShortcutKey,
  matchesShortcut,
  createDefaultShortcuts,
  getShortcutsManager,
  resetShortcutsManager
} from '@/lib/workflow/shortcuts';

describe('Keyboard Shortcuts System', () => {
  let manager: ShortcutsManager;

  beforeEach(() => {
    resetShortcutsManager();
    manager = new ShortcutsManager();
  });

  afterEach(() => {
    manager.clear();
  });

  describe('ShortcutsManager', () => {
    describe('register', () => {
      it('should register a shortcut', () => {
        const shortcut: ShortcutDefinition = {
          id: 'test',
          key: 's',
          ctrl: true,
          description: 'Test shortcut',
          category: 'general',
          action: jest.fn()
        };

        manager.register(shortcut);
        expect(manager.getShortcut('test')).toBe(shortcut);
      });

      it('should warn about conflicts', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const shortcut1: ShortcutDefinition = {
          id: 'test1',
          key: 's',
          ctrl: true,
          description: 'Test 1',
          category: 'general',
          action: jest.fn()
        };

        const shortcut2: ShortcutDefinition = {
          id: 'test2',
          key: 's',
          ctrl: true,
          description: 'Test 2',
          category: 'general',
          action: jest.fn()
        };

        manager.register(shortcut1);
        manager.register(shortcut2);

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('unregister', () => {
      it('should unregister a shortcut', () => {
        const shortcut: ShortcutDefinition = {
          id: 'test',
          key: 's',
          ctrl: true,
          description: 'Test',
          category: 'general',
          action: jest.fn()
        };

        manager.register(shortcut);
        manager.unregister('test');
        expect(manager.getShortcut('test')).toBeUndefined();
      });
    });

    describe('registerMany', () => {
      it('should register multiple shortcuts', () => {
        const shortcuts: ShortcutDefinition[] = [
          {
            id: 'test1',
            key: 's',
            ctrl: true,
            description: 'Test 1',
            category: 'general',
            action: jest.fn()
          },
          {
            id: 'test2',
            key: 'z',
            ctrl: true,
            description: 'Test 2',
            category: 'editing',
            action: jest.fn()
          }
        ];

        manager.registerMany(shortcuts);
        expect(manager.getShortcut('test1')).toBe(shortcuts[0]);
        expect(manager.getShortcut('test2')).toBe(shortcuts[1]);
      });
    });

    describe('getShortcutGroups', () => {
      it('should group shortcuts by category', () => {
        const shortcuts: ShortcutDefinition[] = [
          {
            id: 'save',
            key: 's',
            ctrl: true,
            description: 'Save',
            category: 'general',
            action: jest.fn()
          },
          {
            id: 'undo',
            key: 'z',
            ctrl: true,
            description: 'Undo',
            category: 'editing',
            action: jest.fn()
          },
          {
            id: 'load',
            key: 'o',
            ctrl: true,
            description: 'Load',
            category: 'general',
            action: jest.fn()
          }
        ];

        manager.registerMany(shortcuts);
        const groups = manager.getShortcutGroups();

        expect(groups).toHaveLength(2);
        expect(groups.find(g => g.category === 'general')?.shortcuts).toHaveLength(2);
        expect(groups.find(g => g.category === 'editing')?.shortcuts).toHaveLength(1);
      });

      it('should sort shortcuts within groups', () => {
        const shortcuts: ShortcutDefinition[] = [
          {
            id: 'z',
            key: 'z',
            description: 'Z action',
            category: 'general',
            action: jest.fn()
          },
          {
            id: 'a',
            key: 'a',
            description: 'A action',
            category: 'general',
            action: jest.fn()
          }
        ];

        manager.registerMany(shortcuts);
        const groups = manager.getShortcutGroups();
        const generalGroup = groups.find(g => g.category === 'general');

        expect(generalGroup?.shortcuts[0].id).toBe('a');
        expect(generalGroup?.shortcuts[1].id).toBe('z');
      });
    });

    describe('handleKeyDown', () => {
      it('should trigger matching shortcut', () => {
        const action = jest.fn();
        const shortcut: ShortcutDefinition = {
          id: 'test',
          key: 's',
          ctrl: true,
          description: 'Test',
          category: 'general',
          action
        };

        manager.register(shortcut);

        const event = new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true
        });

        const handled = manager.handleKeyDown(event);

        expect(handled).toBe(true);
        expect(action).toHaveBeenCalled();
      });

      it('should not trigger when disabled', () => {
        const action = jest.fn();
        const shortcut: ShortcutDefinition = {
          id: 'test',
          key: 's',
          ctrl: true,
          description: 'Test',
          category: 'general',
          action
        };

        manager.register(shortcut);
        manager.setEnabled(false);

        const event = new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true
        });

        const handled = manager.handleKeyDown(event);

        expect(handled).toBe(false);
        expect(action).not.toHaveBeenCalled();
      });

      it('should not trigger in input fields', () => {
        const action = jest.fn();
        const shortcut: ShortcutDefinition = {
          id: 'test',
          key: 's',
          ctrl: true,
          description: 'Test',
          category: 'general',
          action
        };

        manager.register(shortcut);

        const input = document.createElement('input');
        document.body.appendChild(input);

        const event = new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true
        });
        Object.defineProperty(event, 'target', { value: input, enumerable: true });

        const handled = manager.handleKeyDown(event);

        expect(handled).toBe(false);
        expect(action).not.toHaveBeenCalled();

        document.body.removeChild(input);
      });
    });

    describe('searchShortcuts', () => {
      it('should search by description', () => {
        const shortcuts: ShortcutDefinition[] = [
          {
            id: 'save',
            key: 's',
            ctrl: true,
            description: 'Save workflow',
            category: 'general',
            action: jest.fn()
          },
          {
            id: 'load',
            key: 'o',
            ctrl: true,
            description: 'Load workflow',
            category: 'general',
            action: jest.fn()
          }
        ];

        manager.registerMany(shortcuts);
        const results = manager.searchShortcuts('save');

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('save');
      });

      it('should search by key combination', () => {
        const shortcuts: ShortcutDefinition[] = [
          {
            id: 'save',
            key: 's',
            ctrl: true,
            description: 'Save',
            category: 'general',
            action: jest.fn()
          },
          {
            id: 'load',
            key: 'o',
            ctrl: true,
            description: 'Load',
            category: 'general',
            action: jest.fn()
          }
        ];

        manager.registerMany(shortcuts);
        const results = manager.searchShortcuts('ctrl+s');

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('save');
      });
    });

    describe('setShortcutEnabled', () => {
      it('should enable/disable specific shortcut', () => {
        const action = jest.fn();
        const shortcut: ShortcutDefinition = {
          id: 'test',
          key: 's',
          ctrl: true,
          description: 'Test',
          category: 'general',
          action
        };

        manager.register(shortcut);
        manager.setShortcutEnabled('test', false);

        const event = new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true
        });

        manager.handleKeyDown(event);
        expect(action).not.toHaveBeenCalled();

        manager.setShortcutEnabled('test', true);
        manager.handleKeyDown(event);
        expect(action).toHaveBeenCalled();
      });
    });
  });

  describe('formatShortcutKey', () => {
    it('should format simple key', () => {
      const shortcut: ShortcutDefinition = {
        id: 'test',
        key: 's',
        description: 'Test',
        category: 'general',
        action: jest.fn()
      };

      const formatted = formatShortcutKey(shortcut);
      expect(formatted).toBe('S');
    });

    it('should format key with modifiers', () => {
      const shortcut: ShortcutDefinition = {
        id: 'test',
        key: 's',
        ctrl: true,
        shift: true,
        description: 'Test',
        category: 'general',
        action: jest.fn()
      };

      const formatted = formatShortcutKey(shortcut);
      expect(formatted).toMatch(/Ctrl.*Shift.*S/);
    });
  });

  describe('matchesShortcut', () => {
    it('should match exact key combination', () => {
      const shortcut: ShortcutDefinition = {
        id: 'test',
        key: 's',
        ctrl: true,
        description: 'Test',
        category: 'general',
        action: jest.fn()
      };

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true
      });

      expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it('should not match different key', () => {
      const shortcut: ShortcutDefinition = {
        id: 'test',
        key: 's',
        ctrl: true,
        description: 'Test',
        category: 'general',
        action: jest.fn()
      };

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true
      });

      expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it('should not match different modifiers', () => {
      const shortcut: ShortcutDefinition = {
        id: 'test',
        key: 's',
        ctrl: true,
        description: 'Test',
        category: 'general',
        action: jest.fn()
      };

      const event = new KeyboardEvent('keydown', {
        key: 's',
        shiftKey: true
      });

      expect(matchesShortcut(event, shortcut)).toBe(false);
    });
  });

  describe('createDefaultShortcuts', () => {
    it('should create shortcuts for provided actions', () => {
      const save = jest.fn();
      const undo = jest.fn();

      const shortcuts = createDefaultShortcuts({ save, undo });

      expect(shortcuts.find(s => s.id === 'save')).toBeDefined();
      expect(shortcuts.find(s => s.id === 'undo')).toBeDefined();
    });

    it('should not create shortcuts for missing actions', () => {
      const save = jest.fn();

      const shortcuts = createDefaultShortcuts({ save });

      expect(shortcuts.find(s => s.id === 'save')).toBeDefined();
      expect(shortcuts.find(s => s.id === 'undo')).toBeUndefined();
    });

    it('should create all default shortcuts', () => {
      const actions = {
        save: jest.fn(),
        load: jest.fn(),
        export: jest.fn(),
        showHelp: jest.fn(),
        zoomIn: jest.fn(),
        zoomOut: jest.fn(),
        deleteSelected: jest.fn(),
        undo: jest.fn(),
        redo: jest.fn(),
        runWorkflow: jest.fn()
      };

      const shortcuts = createDefaultShortcuts(actions);

      expect(shortcuts.length).toBeGreaterThan(0);
      expect(shortcuts.find(s => s.id === 'save')).toBeDefined();
      expect(shortcuts.find(s => s.id === 'undo')).toBeDefined();
      expect(shortcuts.find(s => s.id === 'run')).toBeDefined();
    });
  });

  describe('getShortcutsManager', () => {
    it('should return singleton instance', () => {
      const manager1 = getShortcutsManager();
      const manager2 = getShortcutsManager();

      expect(manager1).toBe(manager2);
    });

    it('should create new instance after reset', () => {
      const manager1 = getShortcutsManager();
      resetShortcutsManager();
      const manager2 = getShortcutsManager();

      expect(manager1).not.toBe(manager2);
    });
  });
});
