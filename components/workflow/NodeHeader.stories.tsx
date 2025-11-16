import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import NodeHeader from './NodeHeader';
import { 
  Plane, 
  Camera, 
  Zap, 
  Image as ImageIcon,
  MessageSquare,
  GitBranch,
  Repeat,
  Clock,
  Database,
  Settings as SettingsIcon
} from 'lucide-react';

/**
 * NodeHeader组件的Storybook故事
 * 
 * 展示NodeHeader组件在不同状态下的表现：
 * - 基础状态
 * - 折叠/展开状态
 * - 错误状态
 * - 不同参数数量
 * - 主题切换
 * - 交互效果
 */
const meta = {
  title: 'Workflow/NodeHeader',
  component: NodeHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
NodeHeader是工作流节点的头部组件，提供以下功能：

- **节点标识**: 显示节点图标和标题
- **折叠控制**: 展开/折叠参数列表
- **高级设置**: 打开节点配置模态框
- **状态指示**: 显示参数数量和错误状态
- **交互反馈**: 悬停、点击动画效果
- **可访问性**: 完整的键盘导航和ARIA支持

## 设计特点

### 黑白灰主题
- 使用极简的黑白灰配色
- 浅色主题：白色背景、深灰文字
- 深色主题：黑色背景、浅灰文字
- 唯一的彩色元素：红色错误指示器

### 交互动画
- 图标悬停：缩放和旋转效果
- 按钮悬停：背景色变化和缩放
- 折叠按钮：旋转动画
- 徽章：弹簧动画

### 性能优化
- React.memo避免不必要的重渲染
- useMemo缓存样式计算
- useCallback缓存事件处理
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      description: '节点图标组件（Lucide React图标）',
      control: false,
    },
    label: {
      description: '节点标题',
      control: 'text',
    },
    color: {
      description: '节点颜色（用于图标和边框）',
      control: 'color',
    },
    isCollapsed: {
      description: '是否折叠参数区域',
      control: 'boolean',
    },
    parameterCount: {
      description: '参数数量（折叠时显示）',
      control: { type: 'number', min: 0, max: 20 },
    },
    hasErrors: {
      description: '是否有验证错误',
      control: 'boolean',
    },
    onToggleCollapse: {
      description: '折叠/展开切换回调',
      action: 'toggle collapse',
    },
    onOpenAdvanced: {
      description: '打开高级设置回调',
      action: 'open advanced',
    },
  },
} satisfies Meta<typeof NodeHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基础状态 - 展开
 * 
 * 显示节点头部的默认展开状态，包含所有基本元素
 */
export const Default: Story = {
  args: {
    icon: Plane,
    label: '起飞',
    color: '#64FFDA',
    isCollapsed: false,
    parameterCount: 3,
    hasErrors: false,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '默认展开状态，显示节点图标、标题和操作按钮。参数列表处于展开状态。',
      },
    },
  },
};

/**
 * 折叠状态
 * 
 * 节点折叠时显示参数数量徽章
 */
export const Collapsed: Story = {
  args: {
    icon: Camera,
    label: '拍照',
    color: '#FF6B9D',
    isCollapsed: true,
    parameterCount: 5,
    hasErrors: false,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '折叠状态下，参数列表被隐藏，显示参数数量徽章（5个参数）。',
      },
    },
  },
};

/**
 * 错误状态
 * 
 * 有未配置的必填参数时显示错误指示器
 */
export const WithErrors: Story = {
  args: {
    icon: Zap,
    label: '条件判断',
    color: '#FFD93D',
    isCollapsed: false,
    parameterCount: 4,
    hasErrors: true,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '当节点有未配置的必填参数时，显示红色脉冲动画的错误指示器。这是唯一使用彩色的状态指示。',
      },
    },
  },
};

/**
 * 折叠状态 + 错误
 * 
 * 同时显示参数徽章和错误指示器
 */
export const CollapsedWithErrors: Story = {
  args: {
    icon: ImageIcon,
    label: 'YOLO检测',
    color: '#A78BFA',
    isCollapsed: true,
    parameterCount: 6,
    hasErrors: true,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '折叠状态下同时显示参数数量徽章和错误指示器，提醒用户需要配置参数。',
      },
    },
  },
};

/**
 * 无参数
 * 
 * 没有参数的节点（如起飞、降落等基础操作）
 */
export const NoParameters: Story = {
  args: {
    icon: Plane,
    label: '起飞',
    color: '#64FFDA',
    isCollapsed: true,
    parameterCount: 0,
    hasErrors: false,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '没有参数的节点，折叠时不显示参数徽章。',
      },
    },
  },
};

/**
 * 长标题
 * 
 * 测试标题过长时的省略显示
 */
export const LongTitle: Story = {
  args: {
    icon: MessageSquare,
    label: 'PureChat图像分析 - 使用AI模型进行智能图像识别和分析',
    color: '#60A5FA',
    isCollapsed: false,
    parameterCount: 8,
    hasErrors: false,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '标题过长时使用省略号显示，悬停时通过工具提示显示完整标题。',
      },
    },
  },
};

/**
 * 多参数节点
 * 
 * 参数数量较多的复杂节点
 */
export const ManyParameters: Story = {
  args: {
    icon: SettingsIcon,
    label: '高级配置',
    color: '#94A3B8',
    isCollapsed: true,
    parameterCount: 15,
    hasErrors: false,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '参数数量较多（15个）的节点，徽章使用等宽字体确保数字对齐。',
      },
    },
  },
};

/**
 * 交互式示例
 * 
 * 可以实际操作的交互式组件
 */
export const Interactive: Story = {
  render: (args) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hasErrors, setHasErrors] = useState(false);
    
    return (
      <div style={{ width: '400px' }}>
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px',
          background: 'var(--node-bg, #fff)',
          borderRadius: '8px',
          border: '1px solid var(--node-border, #e5e5e5)',
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>控制面板</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              checked={isCollapsed}
              onChange={(e) => setIsCollapsed(e.target.checked)}
            />
            折叠状态
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              checked={hasErrors}
              onChange={(e) => setHasErrors(e.target.checked)}
            />
            显示错误
          </label>
        </div>
        
        <div style={{
          background: 'var(--node-bg, #fff)',
          border: '2px solid var(--node-border, #e5e5e5)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <NodeHeader
            {...args}
            isCollapsed={isCollapsed}
            hasErrors={hasErrors}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onOpenAdvanced={() => alert('打开高级设置')}
          />
          {!isCollapsed && (
            <div style={{ 
              padding: '16px',
              color: 'var(--text-secondary, #666)',
              fontSize: '14px',
            }}>
              参数列表区域（展开状态）
            </div>
          )}
        </div>
      </div>
    );
  },
  args: {
    icon: GitBranch,
    label: '条件分支',
    color: '#F59E0B',
    parameterCount: 4,
  },
  parameters: {
    docs: {
      description: {
        story: '完全交互式的示例，可以切换折叠状态和错误状态，体验真实的用户交互。',
      },
    },
  },
};

/**
 * 不同图标展示
 * 
 * 展示各种不同类型的节点图标
 */
export const DifferentIcons: Story = {
  render: () => {
    const nodes = [
      { icon: Plane, label: '起飞', color: '#64FFDA', params: 0 },
      { icon: Camera, label: '拍照', color: '#FF6B9D', params: 3 },
      { icon: Zap, label: '条件判断', color: '#FFD93D', params: 4 },
      { icon: ImageIcon, label: 'YOLO检测', color: '#A78BFA', params: 6 },
      { icon: MessageSquare, label: 'AI对话', color: '#60A5FA', params: 5 },
      { icon: GitBranch, label: '分支', color: '#F59E0B', params: 2 },
      { icon: Repeat, label: '循环', color: '#10B981', params: 3 },
      { icon: Clock, label: '延时', color: '#EC4899', params: 1 },
      { icon: Database, label: '数据存储', color: '#8B5CF6', params: 4 },
    ];

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        width: '100%',
        maxWidth: '1200px',
      }}>
        {nodes.map((node, index) => (
          <div 
            key={index}
            style={{
              background: 'var(--node-bg, #fff)',
              border: '2px solid var(--node-border, #e5e5e5)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <NodeHeader
              icon={node.icon}
              label={node.label}
              color={node.color}
              isCollapsed={true}
              parameterCount={node.params}
              hasErrors={false}
              onToggleCollapse={() => console.log(`Toggle ${node.label}`)}
              onOpenAdvanced={() => console.log(`Advanced ${node.label}`)}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '展示不同类型节点的图标和配色方案，所有节点都使用黑白灰主题。',
      },
    },
  },
};

/**
 * 主题切换演示
 * 
 * 展示浅色和深色主题下的表现
 */
export const ThemeComparison: Story = {
  render: (args) => {
    return (
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* 浅色主题 */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ 
            marginBottom: '12px', 
            fontWeight: 600,
            color: '#1a1a1a',
          }}>
            浅色主题
          </div>
          <div 
            className="light"
            style={{
              background: '#ffffff',
              border: '2px solid #e5e5e5',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <NodeHeader
              {...args}
              isCollapsed={false}
            />
            <div style={{ 
              padding: '16px',
              color: '#666666',
              fontSize: '14px',
              borderTop: '1px solid #f0f0f0',
            }}>
              参数列表区域
            </div>
          </div>
        </div>

        {/* 深色主题 */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ 
            marginBottom: '12px', 
            fontWeight: 600,
            color: '#e5e5e5',
          }}>
            深色主题
          </div>
          <div 
            className="dark"
            style={{
              background: '#1a1a1a',
              border: '2px solid #333333',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <NodeHeader
              {...args}
              isCollapsed={false}
            />
            <div style={{ 
              padding: '16px',
              color: '#999999',
              fontSize: '14px',
              borderTop: '1px solid #2a2a2a',
            }}>
              参数列表区域
            </div>
          </div>
        </div>
      </div>
    );
  },
  args: {
    icon: Camera,
    label: '拍照',
    color: '#FF6B9D',
    parameterCount: 5,
    hasErrors: false,
    onToggleCollapse: () => console.log('Toggle collapse'),
    onOpenAdvanced: () => console.log('Open advanced'),
  },
  parameters: {
    docs: {
      description: {
        story: '对比浅色和深色主题下的视觉效果。两种主题都使用黑白灰配色，确保良好的对比度和可读性。',
      },
    },
  },
};

/**
 * 状态组合展示
 * 
 * 展示所有可能的状态组合
 */
export const AllStates: Story = {
  render: () => {
    const states = [
      { collapsed: false, errors: false, label: '展开 - 正常' },
      { collapsed: false, errors: true, label: '展开 - 错误' },
      { collapsed: true, errors: false, label: '折叠 - 正常' },
      { collapsed: true, errors: true, label: '折叠 - 错误' },
    ];

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        width: '100%',
      }}>
        {states.map((state, index) => (
          <div key={index}>
            <div style={{ 
              marginBottom: '8px', 
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary, #666)',
            }}>
              {state.label}
            </div>
            <div style={{
              background: 'var(--node-bg, #fff)',
              border: '2px solid var(--node-border, #e5e5e5)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <NodeHeader
                icon={Camera}
                label="拍照"
                color="#FF6B9D"
                isCollapsed={state.collapsed}
                parameterCount={5}
                hasErrors={state.errors}
                onToggleCollapse={() => console.log('Toggle')}
                onOpenAdvanced={() => console.log('Advanced')}
              />
              {!state.collapsed && (
                <div style={{ 
                  padding: '16px',
                  color: 'var(--text-secondary, #666)',
                  fontSize: '14px',
                }}>
                  参数列表区域
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '展示NodeHeader的所有可能状态组合：展开/折叠 × 正常/错误。',
      },
    },
  },
};

/**
 * 可访问性演示
 * 
 * 展示键盘导航和ARIA支持
 */
export const Accessibility: Story = {
  render: (args) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    return (
      <div style={{ width: '400px' }}>
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px',
          background: 'var(--node-bg, #fff)',
          borderRadius: '8px',
          border: '1px solid var(--node-border, #e5e5e5)',
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>可访问性特性</div>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            fontSize: '13px',
            color: 'var(--text-secondary, #666)',
            lineHeight: 1.6,
          }}>
            <li>使用 Tab 键在按钮间导航</li>
            <li>使用 Enter 或空格键激活按钮</li>
            <li>焦点状态有清晰的视觉指示</li>
            <li>所有元素都有 ARIA 标签</li>
            <li>错误状态使用 role="alert"</li>
            <li>工具提示提供额外的上下文信息</li>
          </ul>
        </div>
        
        <div style={{
          background: 'var(--node-bg, #fff)',
          border: '2px solid var(--node-border, #e5e5e5)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <NodeHeader
            {...args}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onOpenAdvanced={() => alert('打开高级设置')}
          />
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          padding: '12px',
          background: 'var(--param-bg, #f8f8f8)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--text-tertiary, #999)',
        }}>
          提示：尝试使用键盘操作此组件
        </div>
      </div>
    );
  },
  args: {
    icon: SettingsIcon,
    label: '高级配置',
    color: '#94A3B8',
    parameterCount: 8,
    hasErrors: true,
  },
  parameters: {
    docs: {
      description: {
        story: '展示完整的可访问性支持，包括键盘导航、ARIA标签和焦点管理。',
      },
    },
  },
};
