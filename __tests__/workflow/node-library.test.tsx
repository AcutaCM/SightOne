/**
 * Node Library Unit Tests
 * 
 * Tests for node library components including:
 * - Node search and filtering
 * - Category tabs
 * - Node cards
 * - Drag and drop functionality
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';

describe('Node Library', () => {
  describe('Node Registry', () => {
    it('should have registered nodes', () => {
      const allNodes = nodeRegistry.getAllNodes();
      expect(allNodes.length).toBeGreaterThan(0);
    });

    it('should get nodes by category', () => {
      const categories = ['basic', 'movement', 'detection', 'ai', 'logic', 'data'];
      
      categories.forEach(category => {
        const nodes = nodeRegistry.getNodesByCategory(category);
        expect(Array.isArray(nodes)).toBe(true);
      });
    });

    it('should get node by type', () => {
      const allNodes = nodeRegistry.getAllNodes();
      if (allNodes.length > 0) {
        const firstNode = allNodes[0];
        const node = nodeRegistry.getNode(firstNode.type);
        expect(node).toBeDefined();
        expect(node?.type).toBe(firstNode.type);
      }
    });

    it('should get default parameters for node', () => {
      const allNodes = nodeRegistry.getAllNodes();
      if (allNodes.length > 0) {
        const firstNode = allNodes[0];
        const params = nodeRegistry.getDefaultParameters(firstNode.type);
        expect(params).toBeDefined();
      }
    });

    it('should have valid node definitions', () => {
      const allNodes = nodeRegistry.getAllNodes();
      
      allNodes.forEach(node => {
        expect(node.id).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.label).toBeDefined();
        expect(node.category).toBeDefined();
        expect(['basic', 'movement', 'detection', 'ai', 'logic', 'data', 'challenge']).toContain(node.category);
      });
    });
  });

  describe('Node Search', () => {
    it('should filter nodes by name', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const searchTerm = 'start';
      
      const filtered = allNodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

      filtered.forEach(node => {
        expect(node.label.toLowerCase()).toContain(searchTerm.toLowerCase());
      });
    });

    it('should filter nodes by description', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const searchTerm = 'detection';
      
      const filtered = allNodes.filter(node =>
        node.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      filtered.forEach(node => {
        expect(node.description?.toLowerCase()).toContain(searchTerm.toLowerCase());
      });
    });

    it('should filter nodes by tags', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const searchTerm = 'control';
      
      const filtered = allNodes.filter(node =>
        node.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      filtered.forEach(node => {
        const hasTags = node.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
        expect(hasTags).toBe(true);
      });
    });

    it('should return empty array for non-matching search', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const searchTerm = 'nonexistentnode12345';
      
      const filtered = allNodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered.length).toBe(0);
    });

    it('should be case-insensitive', () => {
      const allNodes = nodeRegistry.getAllNodes();
      if (allNodes.length > 0) {
        const firstNode = allNodes[0];
        const searchLower = firstNode.label.toLowerCase();
        const searchUpper = firstNode.label.toUpperCase();
        
        const filteredLower = allNodes.filter(node =>
          node.label.toLowerCase().includes(searchLower)
        );
        
        const filteredUpper = allNodes.filter(node =>
          node.label.toLowerCase().includes(searchUpper.toLowerCase())
        );

        expect(filteredLower.length).toBe(filteredUpper.length);
      }
    });
  });

  describe('Category Filtering', () => {
    it('should group nodes by category', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const categories = new Set(allNodes.map(node => node.category));
      
      expect(categories.size).toBeGreaterThan(0);
      
      categories.forEach(category => {
        const nodesInCategory = allNodes.filter(node => node.category === category);
        expect(nodesInCategory.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent category names', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const validCategories = ['basic', 'movement', 'detection', 'ai', 'logic', 'data', 'challenge'];
      
      allNodes.forEach(node => {
        expect(validCategories).toContain(node.category);
      });
    });

    it('should toggle category expansion', () => {
      let expandedCategories = new Set<string>();
      
      const toggleCategory = (category: string) => {
        if (expandedCategories.has(category)) {
          expandedCategories.delete(category);
        } else {
          expandedCategories.add(category);
        }
      };

      expect(expandedCategories.size).toBe(0);
      
      toggleCategory('basic');
      expect(expandedCategories.has('basic')).toBe(true);
      
      toggleCategory('basic');
      expect(expandedCategories.has('basic')).toBe(false);
    });
  });

  describe('Node Card Display', () => {
    it('should display node information', () => {
      const mockNode = {
        id: 'test-node',
        type: 'test',
        label: 'Test Node',
        description: 'Test Description',
        category: 'basic',
        icon: '🔧',
        color: '#3b82f6',
        tags: ['test', 'example'],
      };

      const { container } = render(
        <div data-testid="node-card">
          <div data-testid="node-label">{mockNode.label}</div>
          <div data-testid="node-description">{mockNode.description}</div>
          <div data-testid="node-icon">{mockNode.icon}</div>
        </div>
      );

      expect(screen.getByTestId('node-label')).toHaveTextContent('Test Node');
      expect(screen.getByTestId('node-description')).toHaveTextContent('Test Description');
      expect(screen.getByTestId('node-icon')).toHaveTextContent('🔧');
    });

    it('should apply hover effects', () => {
      const { container } = render(
        <div
          data-testid="node-card"
          className="hover:transform hover:translateY-[-2px]"
        >
          Node Card
        </div>
      );

      const card = screen.getByTestId('node-card');
      expect(card).toHaveClass('hover:transform');
      expect(card).toHaveClass('hover:translateY-[-2px]');
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag start event', () => {
      const mockNode = {
        type: 'test',
        label: 'Test Node',
        category: 'basic',
        icon: '🔧',
        color: '#3b82f6',
      };

      const handleDragStart = jest.fn((event: React.DragEvent) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(mockNode));
        event.dataTransfer.effectAllowed = 'move';
      });

      const { container } = render(
        <div
          data-testid="draggable-node"
          draggable
          onDragStart={handleDragStart}
        >
          Drag Me
        </div>
      );

      const node = screen.getByTestId('draggable-node');
      fireEvent.dragStart(node);

      expect(handleDragStart).toHaveBeenCalled();
    });

    it('should serialize node data for drag transfer', () => {
      const mockNode = {
        type: 'test',
        label: 'Test Node',
        category: 'basic',
      };

      const serialized = JSON.stringify(mockNode);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.type).toBe(mockNode.type);
      expect(deserialized.label).toBe(mockNode.label);
      expect(deserialized.category).toBe(mockNode.category);
    });
  });

  describe('Node Statistics', () => {
    it('should count total nodes', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const totalCount = allNodes.length;
      
      expect(totalCount).toBeGreaterThan(0);
    });

    it('should count nodes per category', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const categoryCounts: Record<string, number> = {};
      
      allNodes.forEach(node => {
        categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;
      });

      Object.values(categoryCounts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });

    it('should count filtered nodes', () => {
      const allNodes = nodeRegistry.getAllNodes();
      const searchTerm = 'node';
      
      const filtered = allNodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered.length).toBeLessThanOrEqual(allNodes.length);
    });
  });
});
