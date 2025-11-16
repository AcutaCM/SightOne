// Lazy Node Loader - Dynamic import system for workflow nodes
// Reduces initial bundle size by loading node components on demand

import { lazy, ComponentType } from 'react';
import { NodeProps } from 'reactflow';

export interface LazyNodeConfig {
  preloadCommonNodes: boolean; // Preload frequently used nodes
  cacheLoadedNodes: boolean; // Cache loaded components
  loadTimeout: number; // Timeout for loading (ms)
}

export const DEFAULT_LAZY_NODE_CONFIG: LazyNodeConfig = {
  preloadCommonNodes: true,
  cacheLoadedNodes: true,
  loadTimeout: 5000
};

// Node component cache
const nodeComponentCache = new Map<string, ComponentType<NodeProps>>();

// Loading state tracker
const loadingNodes = new Set<string>();

// Common nodes that should be preloaded
const COMMON_NODE_TYPES = [
  'start',
  'end',
  'takeoff',
  'land',
  'move_forward',
  'move_backward',
  'wait',
  'hover'
];

/**
 * Lazy Node Loader Class
 */
export class LazyNodeLoader {
  private config: LazyNodeConfig;
  private preloadPromise: Promise<void> | null = null;

  constructor(config: Partial<LazyNodeConfig> = {}) {
    this.config = { ...DEFAULT_LAZY_NODE_CONFIG, ...config };
  }

  /**
   * Get node component path based on type
   */
  private getNodeComponentPath(nodeType: string): string {
    // Map node types to their component files
    const pathMap: Record<string, string> = {
      // Flow nodes
      'start': './nodes/flowNodes',
      'end': './nodes/flowNodes',
      
      // Basic control
      'takeoff': './nodes/basicNodes',
      'land': './nodes/basicNodes',
      'hover': './nodes/basicNodes',
      'wait': './nodes/basicNodes',
      
      // Movement
      'move_forward': './nodes/movementNodes',
      'move_backward': './nodes/movementNodes',
      'move_left': './nodes/movementNodes',
      'move_right': './nodes/movementNodes',
      'move_up': './nodes/movementNodes',
      'move_down': './nodes/movementNodes',
      'rotate_cw': './nodes/movementNodes',
      'rotate_ccw': './nodes/movementNodes',
      
      // AI nodes
      'purechat_chat': './nodes/PureChatChatNode',
      'purechat_image_analysis': './nodes/PureChatImageAnalysisNode',
      'unipixel_segmentation': './nodes/UniPixelSegmentationNode',
      'yolo_detection': './nodes/YOLODetectionNode',
      
      // Challenge nodes
      'challenge_8_flight': './nodes/Challenge8FlightNode',
      'challenge_obstacle': './nodes/ChallengeObstacleNode',
      'challenge_precision_land': './nodes/ChallengePrecisionLandNode',
      
      // Detection nodes
      'qr_scan': './nodes/QRScanNode',
      'strawberry_detection': './nodes/detectionNodes',
      
      // Logic nodes
      'condition_branch': './nodes/logicNodes',
      'if_else': './nodes/logicNodes',
      'loop': './nodes/logicNodes',
      
      // Data nodes
      'data_storage': './nodes/dataNodes',
      'data_transform': './nodes/dataNodes',
      'data_filter': './nodes/dataNodes'
    };

    return pathMap[nodeType] || './nodes/defaultNode';
  }

  /**
   * Load node component dynamically
   */
  async loadNodeComponent(nodeType: string): Promise<ComponentType<NodeProps>> {
    // Check cache first
    if (this.config.cacheLoadedNodes && nodeComponentCache.has(nodeType)) {
      return nodeComponentCache.get(nodeType)!;
    }

    // Check if already loading
    if (loadingNodes.has(nodeType)) {
      // Wait for existing load to complete
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (nodeComponentCache.has(nodeType)) {
            clearInterval(checkInterval);
            resolve(nodeComponentCache.get(nodeType)!);
          }
        }, 50);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error(`Timeout loading node: ${nodeType}`));
        }, this.config.loadTimeout);
      });
    }

    loadingNodes.add(nodeType);

    try {
      const componentPath = this.getNodeComponentPath(nodeType);
      
      // Dynamic import with timeout
      const loadPromise = import(`../../components/workflow/${componentPath}`);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout loading node component: ${nodeType}`));
        }, this.config.loadTimeout);
      });

      const module = await Promise.race([loadPromise, timeoutPromise]);
      
      // Extract the component (handle different export patterns)
      let component: ComponentType<NodeProps>;
      
      if (module.default) {
        component = module.default;
      } else if (module[nodeType]) {
        component = module[nodeType];
      } else {
        // Fallback to a generic node component
        component = module.GenericNode || module.DefaultNode;
      }

      if (!component) {
        throw new Error(`No component found for node type: ${nodeType}`);
      }

      // Cache the component
      if (this.config.cacheLoadedNodes) {
        nodeComponentCache.set(nodeType, component);
      }

      return component;
    } catch (error) {
      console.error(`Failed to load node component: ${nodeType}`, error);
      
      // Return a fallback component
      return this.getFallbackComponent(nodeType);
    } finally {
      loadingNodes.delete(nodeType);
    }
  }

  /**
   * Get fallback component for failed loads
   */
  private getFallbackComponent(nodeType: string): ComponentType<NodeProps> {
    // Return a simple fallback component
    return (props: NodeProps) => {
      return {
        type: 'div',
        props: {
          style: {
            padding: '10px',
            background: '#1E3A5F',
            border: '2px solid #EF4444',
            borderRadius: '8px',
            color: '#E6F1FF'
          },
          children: [
            {
              type: 'div',
              props: {
                style: { fontWeight: 'bold', marginBottom: '5px' },
                children: props.data.label || nodeType
              }
            },
            {
              type: 'div',
              props: {
                style: { fontSize: '12px', color: '#EF4444' },
                children: '组件加载失败'
              }
            }
          ]
        }
      } as any;
    };
  }

  /**
   * Preload common node components
   */
  async preloadCommonNodes(): Promise<void> {
    if (!this.config.preloadCommonNodes) {
      return;
    }

    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.preloadPromise = (async () => {
      const loadPromises = COMMON_NODE_TYPES.map(nodeType =>
        this.loadNodeComponent(nodeType).catch(err => {
          console.warn(`Failed to preload node: ${nodeType}`, err);
        })
      );

      await Promise.all(loadPromises);
      console.log(`Preloaded ${COMMON_NODE_TYPES.length} common node components`);
    })();

    return this.preloadPromise;
  }

  /**
   * Preload specific node types
   */
  async preloadNodes(nodeTypes: string[]): Promise<void> {
    const loadPromises = nodeTypes.map(nodeType =>
      this.loadNodeComponent(nodeType).catch(err => {
        console.warn(`Failed to preload node: ${nodeType}`, err);
      })
    );

    await Promise.all(loadPromises);
  }

  /**
   * Clear component cache
   */
  clearCache(): void {
    nodeComponentCache.clear();
    console.log('Node component cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    cachedNodes: number;
    loadingNodes: number;
    cacheEnabled: boolean;
  } {
    return {
      cachedNodes: nodeComponentCache.size,
      loadingNodes: loadingNodes.size,
      cacheEnabled: this.config.cacheLoadedNodes
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LazyNodeConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
let loaderInstance: LazyNodeLoader | null = null;

export function getLazyNodeLoader(config?: Partial<LazyNodeConfig>): LazyNodeLoader {
  if (!loaderInstance) {
    loaderInstance = new LazyNodeLoader(config);
  } else if (config) {
    loaderInstance.updateConfig(config);
  }
  return loaderInstance;
}

/**
 * React Hook for lazy loading nodes
 */
export function useLazyNodeLoader(config?: Partial<LazyNodeConfig>): {
  loadNode: (nodeType: string) => Promise<ComponentType<NodeProps>>;
  preloadCommonNodes: () => Promise<void>;
  preloadNodes: (nodeTypes: string[]) => Promise<void>;
  clearCache: () => void;
  stats: ReturnType<LazyNodeLoader['getCacheStats']>;
} {
  const loader = getLazyNodeLoader(config);

  return {
    loadNode: (nodeType: string) => loader.loadNodeComponent(nodeType),
    preloadCommonNodes: () => loader.preloadCommonNodes(),
    preloadNodes: (nodeTypes: string[]) => loader.preloadNodes(nodeTypes),
    clearCache: () => loader.clearCache(),
    stats: loader.getCacheStats()
  };
}

/**
 * Create lazy node component factory
 */
export function createLazyNode(nodeType: string): ComponentType<NodeProps> {
  return lazy(async () => {
    const loader = getLazyNodeLoader();
    const component = await loader.loadNodeComponent(nodeType);
    return { default: component };
  });
}
