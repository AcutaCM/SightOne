# Tello工作流保存和加载系统

## 概述

本文档描述了Tello无人机工作流编排系统的保存和加载功能实现。该系统提供了完整的工作流持久化、版本管理、导入导出和历史记录功能。

## 功能特性

### 1. 工作流管理界面 ✅

**位置**: `components/WorkflowManagerModal.tsx`

**功能**:
- ✅ 工作流列表展示（卡片式布局）
- ✅ 搜索功能（支持名称、描述、标签搜索）
- ✅ 过滤功能（按工作流大小：小型/中型/大型）
- ✅ 排序功能（按日期/名称/节点数/连接数）
- ✅ 工作流预览（显示节点、连接、标签等信息）
- ✅ 快速操作（加载、复制、导出、删除）

**使用方法**:
```typescript
// 在TelloWorkflowPanel中打开管理器
<WorkflowManagerModal
  isOpen={isManagerOpen}
  onClose={onManagerClose}
  onLoadWorkflow={handleLoadWorkflow}
/>
```

### 2. 存储机制 ✅

**位置**: `lib/workflow/workflowStorage.ts`

**功能**:
- ✅ 标准化的JSON存储格式
- ✅ localStorage持久化
- ✅ 版本控制（当前版本: 1.0.0）
- ✅ 工作流验证（结构完整性检查）
- ✅ 自动迁移（兼容旧格式）

**数据结构**:
```typescript
interface WorkflowDefinition {
  metadata: {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    nodeCount: number;
    edgeCount: number;
  };
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  variables: Record<string, any>;
}
```

**API使用**:
```typescript
import { getWorkflowStorageManager } from '@/lib/workflow/workflowStorage';

const storageManager = getWorkflowStorageManager();

// 保存工作流
storageManager.saveWorkflow(workflow);

// 加载工作流
const workflow = storageManager.loadWorkflow(workflowId);

// 获取所有工作流
const workflows = storageManager.getAllWorkflows();

// 删除工作流
storageManager.deleteWorkflow(workflowId);

// 复制工作流
const duplicate = storageManager.duplicateWorkflow(workflowId, '新名称');
```

### 3. 导入导出功能 ✅

**位置**: `lib/workflow/workflowStorage.ts` + `components/WorkflowManagerModal.tsx`

**功能**:
- ✅ 导出为JSON文件
- ✅ 从JSON文件导入
- ✅ 格式验证
- ✅ 兼容性检查
- ✅ 错误提示和警告

**导出流程**:
1. 用户点击"导出"按钮
2. 系统生成标准JSON文件
3. 自动下载到本地

**导入流程**:
1. 用户选择JSON文件
2. 系统验证文件格式
3. 检查工作流完整性
4. 显示验证结果（错误/警告）
5. 保存到localStorage

**文件格式示例**:
```json
{
  "metadata": {
    "id": "workflow_1234567890_abc123",
    "name": "草莓检测工作流",
    "description": "自动检测和分析草莓",
    "version": "1.0.0",
    "author": "User",
    "tags": ["检测", "AI"],
    "createdAt": "2025-10-21T10:00:00.000Z",
    "updatedAt": "2025-10-21T10:30:00.000Z",
    "nodeCount": 8,
    "edgeCount": 7
  },
  "nodes": [...],
  "edges": [...],
  "variables": {}
}
```

### 4. 版本管理 ✅

**位置**: `lib/workflow/workflowHistory.ts` + `components/TelloWorkflowPanel.tsx`

**功能**:
- ✅ 检测工作流修改状态
- ✅ 提示用户保存未保存的更改
- ✅ 工作流历史记录
- ✅ 版本快照
- ✅ 历史恢复

**未保存更改检测**:
- 实时监控节点和连接的变化
- 在界面上显示"未保存"标识
- 保存按钮高亮提示
- 离开页面前警告

**历史记录功能**:
```typescript
import { getWorkflowHistoryManager } from '@/lib/workflow/workflowHistory';

const historyManager = getWorkflowHistoryManager();

// 添加历史记录
historyManager.addHistoryEntry({
  workflowId: 'workflow_123',
  workflowName: '我的工作流',
  changeType: 'updated',
  changeDescription: '更新节点配置',
  snapshot: workflow,
  nodeCount: 10,
  edgeCount: 9
});

// 获取工作流历史
const history = historyManager.getHistory('workflow_123');

// 获取最近历史
const recent = historyManager.getRecentHistory(10);

// 从历史恢复
const restored = historyManager.restoreFromHistory(historyId);
```

## 使用指南

### 保存工作流

1. 在工作流编辑器中创建或编辑工作流
2. 点击"保存工作流"按钮
3. 首次保存时输入工作流名称
4. 系统自动保存到localStorage

**注意**: 
- 工作流名称不能为空
- 空工作流无法保存
- 保存后会自动记录到历史

### 加载工作流

1. 点击"管理工作流"按钮
2. 在列表中浏览已保存的工作流
3. 使用搜索和过滤功能快速定位
4. 点击"加载"按钮加载工作流

**注意**:
- 加载前会检查未保存的更改
- 加载后会清空当前画布
- 加载操作会记录到历史

### 导出工作流

1. 在工作流管理器中选择工作流
2. 点击"导出"按钮
3. 文件自动下载到本地

**文件命名**: `工作流名称_时间戳.json`

### 导入工作流

1. 点击"导入"按钮
2. 选择JSON文件
3. 系统验证文件格式
4. 查看验证结果
5. 确认导入

**验证规则**:
- 必须包含metadata、nodes、edges
- 节点ID不能重复
- 连接必须引用存在的节点
- 建议包含start和end节点

### 复制工作流

1. 在工作流管理器中选择工作流
2. 点击"复制"按钮
3. 系统自动创建副本（名称后缀"(副本)"）

### 删除工作流

1. 在工作流管理器中选择工作流
2. 点击"删除"按钮
3. 确认删除操作

**注意**: 删除操作不可恢复

## 技术实现

### 存储架构

```
localStorage
├── tello_workflows (工作流数据)
│   └── WorkflowDefinition[]
└── tello_workflow_history (历史记录)
    └── WorkflowHistoryEntry[]
```

### 数据流

```
用户操作
    ↓
TelloWorkflowPanel
    ↓
WorkflowStorageManager
    ↓
localStorage
    ↓
WorkflowHistoryManager
```

### 验证流程

```
导入/保存
    ↓
validateWorkflow()
    ↓
检查metadata
    ↓
检查nodes
    ↓
检查edges
    ↓
返回验证结果
```

## 最佳实践

### 1. 定期保存
- 建议每次重要修改后保存
- 利用"未保存"提示及时保存

### 2. 使用标签
- 为工作流添加有意义的标签
- 便于搜索和分类

### 3. 导出备份
- 定期导出重要工作流
- 避免浏览器数据清除导致丢失

### 4. 命名规范
- 使用描述性的工作流名称
- 包含版本信息（如 v1.0）

### 5. 版本管理
- 重大修改前复制工作流
- 保留历史版本以便回滚

## 故障排除

### 问题: 工作流无法保存

**可能原因**:
- localStorage已满
- 工作流为空
- 浏览器禁用localStorage

**解决方案**:
1. 清理旧的工作流
2. 检查浏览器设置
3. 尝试导出到文件

### 问题: 导入失败

**可能原因**:
- 文件格式错误
- JSON语法错误
- 缺少必需字段

**解决方案**:
1. 检查文件格式
2. 使用JSON验证工具
3. 查看错误提示

### 问题: 未保存提示不消失

**可能原因**:
- 状态同步问题
- 保存未成功

**解决方案**:
1. 重新保存工作流
2. 刷新页面
3. 检查浏览器控制台

## API参考

### WorkflowStorageManager

```typescript
class WorkflowStorageManager {
  saveWorkflow(workflow: WorkflowDefinition): boolean
  loadWorkflow(id: string): WorkflowDefinition | null
  getAllWorkflows(): WorkflowDefinition[]
  deleteWorkflow(id: string): boolean
  duplicateWorkflow(id: string, newName?: string): WorkflowDefinition | null
  validateWorkflow(workflow: WorkflowDefinition): WorkflowValidationResult
  exportWorkflow(workflow: WorkflowDefinition): void
  importWorkflow(file: File): Promise<WorkflowDefinition>
  clearAllWorkflows(): boolean
  getStorageStats(): StorageStats
}
```

### WorkflowHistoryManager

```typescript
class WorkflowHistoryManager {
  addHistoryEntry(entry: Omit<WorkflowHistoryEntry, 'id' | 'timestamp'>): void
  getHistory(workflowId?: string): WorkflowHistoryEntry[]
  getRecentHistory(limit?: number): WorkflowHistoryEntry[]
  clearWorkflowHistory(workflowId: string): void
  clearAllHistory(): void
  getWorkflowVersions(workflowId: string): WorkflowVersion[]
  restoreFromHistory(historyId: string): WorkflowDefinition | null
  getHistoryStats(): HistoryStats
}
```

## 未来改进

- [ ] 云端同步
- [ ] 协作编辑
- [ ] 工作流模板市场
- [ ] 自动保存
- [ ] 版本对比
- [ ] 批量操作
- [ ] 工作流分享链接

## 相关文件

- `components/TelloWorkflowPanel.tsx` - 主工作流面板
- `components/WorkflowManagerModal.tsx` - 工作流管理器
- `lib/workflow/workflowStorage.ts` - 存储管理器
- `lib/workflow/workflowHistory.ts` - 历史管理器
- `lib/workflowEngine.ts` - 工作流执行引擎

## 更新日志

### v1.0.0 (2025-10-21)
- ✅ 实现工作流管理界面
- ✅ 实现存储机制
- ✅ 实现导入导出功能
- ✅ 实现版本管理
- ✅ 添加未保存更改检测
- ✅ 添加历史记录功能
