# Tello 工作流面板集成修复

## 🐛 问题描述

**现象:** 在组件选择器中点击 "Tello工作流面板" 后，主页面没有出现该面板。

**根本原因:**
1. `TelloWorkflowPanel` 组件已经在 `app/page.tsx` 中导入
2. 但是主页面缺少组件映射逻辑，无法根据选择的组件ID渲染对应的组件
3. 组件选择器只是记录了选择状态，但没有实际渲染组件的机制

## 🔍 问题分析

### 当前状态
```tsx
// app/page.tsx
import TelloWorkflowPanel from "@/components/TelloWorkflowPanel";  // ✅ 已导入

// 但是没有以下逻辑：
// 1. 组件映射表（componentId -> Component）
// 2. 渲染选中组件的逻辑
// 3. 组件状态管理
```

### 缺失的功能
1. **组件映射表** - 将组件ID映射到实际的React组件
2. **组件渲染逻辑** - 根据选中的组件ID渲染对应组件
3. **组件状态管理** - 管理哪些组件被选中和显示
4. **组件布局管理** - 控制组件的位置和大小

## ✅ 解决方案

### 方案 1: 添加组件映射和渲染逻辑（推荐）

在主页面中添加组件映射表和渲染逻辑：

```tsx
// app/page.tsx

// 1. 创建组件映射表
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'tello-workflow-panel': TelloWorkflowPanel,
  'tello-intelligent-agent': TelloIntelligentAgent,
  'connection-control': ConnectionControlPanel,
  'mission-panel': MissionPadPanel,
  'detection-control': DetectionControlPanel,
  'help-panel': HelpPanel,
  'manual-control': ManualControlPanel,
  'video-stream': () => <div>Video Stream Component</div>,
  'strawberry-detection': StrawberryDetectionCard,
  'qr-scan': QRScanPanel,
  'virtual-position': VirtualPositionView,
  'ai-analysis-report': AIAnalysisReport,
  'battery-status': BatteryStatusPanel,
  'app-info': AppInfoPanel,
  'challenge-cruise': ChallengeCruisePanel,
  'ai-analysis-panel': AIAnalysisPanel,
  'tools-panel': ToolsPanel,
  'configuration-panel': ConfigurationPanel,
  'simulation-panel': SimulationPanel,
  'status-info-panel': StatusInfoPanel,
  'system-log-panel': SystemLogPanel,
  'video-control-panel': VideoControlPanel,
  'report-panel': ReportPanel,
  'drone-control-panel': TelloControlPanel,
  'chat-panel': PureChat,
  'yolo-model-manager': ModelManagerPanel,
  'enhanced-model-selector': EnhancedModelSelector,
  'plant-qr-generator': PlantQRGeneratorPanel,
};

// 2. 添加状态管理
const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
const [componentSelectorVisible, setComponentSelectorVisible] = useState(false);

// 3. 处理组件选择
const handleSelectComponent = (componentId: string) => {
  setSelectedComponents(prev => {
    if (prev.includes(componentId)) {
      return prev.filter(id => id !== componentId);
    } else {
      return [...prev, componentId];
    }
  });
};

// 4. 渲染选中的组件
const renderSelectedComponents = () => {
  return selectedComponents.map(componentId => {
    const Component = COMPONENT_MAP[componentId];
    if (!Component) return null;
    
    return (
      <DraggableContainer
        key={componentId}
        id={componentId}
        initialPosition={{ x: 100, y: 100 }}
      >
        <Component isConnected={droneStatus.connected} />
      </DraggableContainer>
    );
  });
};

// 5. 在JSX中使用
return (
  <div>
    {/* 其他内容 */}
    
    {/* 渲染选中的组件 */}
    {renderSelectedComponents()}
    
    {/* 组件选择器 */}
    <ComponentSelector
      isVisible={componentSelectorVisible}
      onSelectComponent={handleSelectComponent}
      onClose={() => setComponentSelectorVisible(false)}
      selectedComponents={selectedComponents}
    />
    
    {/* 打开组件选择器的按钮 */}
    <Button
      onPress={() => setComponentSelectorVisible(true)}
      className="fixed bottom-4 right-4 z-50"
    >
      添加组件
    </Button>
  </div>
);
```

### 方案 2: 使用布局系统（更完整）

如果项目已经有布局系统（LayoutContext），可以集成到布局系统中：

```tsx
// contexts/LayoutContext.tsx

interface LayoutContextType {
  components: Array<{
    id: string;
    componentId: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
  addComponent: (componentId: string) => void;
  removeComponent: (id: string) => void;
  updateComponentPosition: (id: string, position: { x: number; y: number }) => void;
}

// 在主页面中使用
const { components, addComponent } = useLayout();

const handleSelectComponent = (componentId: string) => {
  addComponent(componentId);
};

const renderComponents = () => {
  return components.map(comp => {
    const Component = COMPONENT_MAP[comp.componentId];
    if (!Component) return null;
    
    return (
      <DraggableContainer
        key={comp.id}
        id={comp.id}
        initialPosition={comp.position}
      >
        <Component isConnected={droneStatus.connected} />
      </DraggableContainer>
    );
  });
};
```

## 🔧 实施步骤

### 步骤 1: 添加组件映射表
在 `app/page.tsx` 中添加 `COMPONENT_MAP` 常量

### 步骤 2: 添加状态管理
添加 `selectedComponents` 状态和相关的处理函数

### 步骤 3: 实现渲染逻辑
创建 `renderSelectedComponents` 函数

### 步骤 4: 集成组件选择器
连接 `ComponentSelector` 的 `onSelectComponent` 回调

### 步骤 5: 添加触发按钮
添加一个按钮来打开组件选择器

### 步骤 6: 测试
1. 打开组件选择器
2. 选择 "Tello工作流面板"
3. 确认面板出现在页面上
4. 测试拖拽和关闭功能

## 📝 代码示例

### 完整的集成代码

```tsx
// app/page.tsx

export default function Home() {
  // ... 现有代码 ...
  
  // 添加组件选择器状态
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [componentSelectorVisible, setComponentSelectorVisible] = useState(false);
  
  // 组件映射表
  const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    'tello-workflow-panel': TelloWorkflowPanel,
    // ... 其他组件映射 ...
  };
  
  // 处理组件选择
  const handleSelectComponent = (componentId: string) => {
    setSelectedComponents(prev => {
      if (prev.includes(componentId)) {
        return prev.filter(id => id !== componentId);
      } else {
        return [...prev, componentId];
      }
    });
  };
  
  // 渲染选中的组件
  const renderSelectedComponents = () => {
    return selectedComponents.map((componentId, index) => {
      const Component = COMPONENT_MAP[componentId];
      if (!Component) return null;
      
      return (
        <DraggableContainer
          key={componentId}
          id={componentId}
          initialPosition={{ 
            x: 100 + (index * 50), 
            y: 100 + (index * 50) 
          }}
        >
          <div className="relative">
            {/* 关闭按钮 */}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="absolute top-2 right-2 z-10"
              onPress={() => {
                setSelectedComponents(prev => 
                  prev.filter(id => id !== componentId)
                );
              }}
            >
              ✕
            </Button>
            
            {/* 组件内容 */}
            <Component isConnected={droneStatus.connected} />
          </div>
        </DraggableContainer>
      );
    });
  };
  
  return (
    <DroneProvider>
      <LayoutProvider>
        <DropZonesProvider>
          <div className="relative min-h-screen">
            {/* 现有内容 */}
            
            {/* 渲染选中的组件 */}
            {renderSelectedComponents()}
            
            {/* 组件选择器 */}
            <ComponentSelector
              isVisible={componentSelectorVisible}
              onSelectComponent={handleSelectComponent}
              onClose={() => setComponentSelectorVisible(false)}
              selectedComponents={selectedComponents}
            />
            
            {/* 打开组件选择器的按钮 */}
            <Button
              isIconOnly
              color="primary"
              className="fixed bottom-4 right-4 z-50 shadow-lg"
              onPress={() => setComponentSelectorVisible(true)}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </div>
        </DropZonesProvider>
      </LayoutProvider>
    </DroneProvider>
  );
}
```

## 🧪 测试清单

- [ ] 组件选择器可以打开
- [ ] 可以选择 "Tello工作流面板"
- [ ] 选择后面板出现在页面上
- [ ] 面板可以拖拽
- [ ] 面板可以关闭
- [ ] 可以同时显示多个组件
- [ ] 组件位置不重叠
- [ ] 主题样式正确

## 🎯 预期效果

1. **点击添加按钮** → 组件选择器弹出
2. **选择工作流面板** → 面板添加到页面
3. **面板可拖拽** → 可以移动到任意位置
4. **点击关闭** → 面板从页面移除
5. **多个组件** → 可以同时显示多个不同的组件

## 📚 相关文件

- `app/page.tsx` - 主页面（需要修改）
- `components/ComponentSelector.tsx` - 组件选择器
- `components/TelloWorkflowPanel.tsx` - 工作流面板组件
- `components/DraggableContainer.tsx` - 可拖拽容器
- `contexts/LayoutContext.tsx` - 布局上下文（可选）

## 🔗 相关文档

- [组件选择器主题修复](./COMPONENT_SELECTOR_THEME_FIX.md)
- [组件选择器测试指南](./COMPONENT_SELECTOR_TEST_GUIDE.md)

---

**问题状态:** 🔴 待修复  
**优先级:** 高  
**预计工作量:** 1-2 小时  
**最后更新:** 2025-10-21
