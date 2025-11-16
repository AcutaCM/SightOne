# 工作流组件导入错误修复

## 错误信息

```
Error: Element type is invalid: expected a string (for built-in components) 
or a class/function (for composite components) but got: undefined. 
You likely forgot to export your component from the file it's defined in, 
or you might have mixed up default and named imports.
Check the render method of `NodeHeader`.
```

## 问题分析

这个错误通常由以下原因引起：
1. 组件未正确导出
2. 导入路径错误
3. 循环依赖
4. 浏览器缓存问题

## 已执行的修复

### 1. 移除未使用的导入
- 从 `NodeHeader.tsx` 中移除了未使用的 `ChevronUp` 导入

### 2. 验证导出
- ✅ `NodeHeader` 有默认导出
- ✅ `InlineParameterNode` 有默认导出
- ✅ `WorkflowEditor` 有默认导出
- ✅ `TelloWorkflowPanel` 有默认导出

### 3. 验证导入链
```
TelloWorkflowPanel
  └─> WorkflowEditor
       └─> InlineParameterNode
            └─> NodeHeader ✅
            └─> ParameterList ✅
            └─> ResizeHandle ✅
```

## 解决方案

### 步骤 1：清除缓存并重启

```bash
# 停止开发服务器 (Ctrl + C)

# 清除 Next.js 缓存
rm -rf .next
# 或 Windows:
rmdir /s /q .next

# 清除 node_modules/.cache (如果存在)
rm -rf node_modules/.cache
# 或 Windows:
rmdir /s /q node_modules\.cache

# 重新启动
npm run dev
```

### 步骤 2：强制刷新浏览器

- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- 或打开开发者工具，右键刷新按钮，选择"清空缓存并硬性重新加载"

### 步骤 3：检查浏览器控制台

1. 按 F12 打开开发者工具
2. 查看 Console 标签
3. 查看是否有其他错误信息
4. 查看 Network 标签确认文件已加载

## 备用方案

如果上述方法无效，尝试以下方案：

### 方案 A：使用旧版 WorkflowPanel

临时使用旧版组件，直到问题解决：

```typescript
// TelloWorkflowPanel.tsx
import WorkflowPanel from './WorkflowPanel';

const TelloWorkflowPanel: React.FC = () => {
  return <WorkflowPanel />;
};
```

### 方案 B：直接集成到主页面

在 `app/page.tsx` 中直接使用 `WorkflowEditor`：

```typescript
// 替换
import TelloWorkflowPanel from "@/components/TelloWorkflowPanel";

// 为
import WorkflowEditor from "@/components/WorkflowEditor";

// 然后在渲染时使用
<WorkflowEditor />
```

### 方案 C：检查 tsconfig.json

确保路径别名配置正确：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  }
}
```

## 验证修复

运行以下命令验证没有TypeScript错误：

```bash
npm run build
```

如果构建成功，问题可能是运行时缓存问题。

## 调试步骤

如果问题仍然存在，按以下步骤调试：

### 1. 添加调试日志

在 `InlineParameterNode.tsx` 顶部添加：

```typescript
import NodeHeader from './NodeHeader';
console.log('NodeHeader imported:', NodeHeader);
```

### 2. 检查导入

在浏览器控制台查看是否输出 `NodeHeader imported: function...`

如果输出 `undefined`，说明导入失败。

### 3. 检查文件路径

确认文件存在：
- `components/workflow/NodeHeader.tsx` ✅
- `components/workflow/InlineParameterNode.tsx` ✅
- `components/workflow/ParameterList.tsx` ✅
- `components/WorkflowEditor.tsx` ✅

### 4. 检查循环依赖

使用工具检查循环依赖：

```bash
npm install -g madge
madge --circular --extensions ts,tsx components/
```

## 常见问题

### Q: 为什么会出现这个错误？

A: 通常是因为：
1. 浏览器缓存了旧版本的代码
2. Next.js 的 .next 目录缓存了旧的构建
3. 热重载没有正确更新所有模块

### Q: 清除缓存后还是有问题？

A: 尝试：
1. 完全关闭浏览器并重新打开
2. 使用无痕模式测试
3. 尝试不同的浏览器

### Q: 构建成功但运行时报错？

A: 这通常是缓存问题。确保：
1. 删除 `.next` 目录
2. 重启开发服务器
3. 强制刷新浏览器

## 预防措施

为避免将来出现类似问题：

1. **定期清理缓存**
   ```bash
   npm run clean  # 如果有这个脚本
   rm -rf .next
   ```

2. **使用一致的导入方式**
   - 始终使用默认导出或命名导出
   - 不要混用

3. **避免循环依赖**
   - 定期检查依赖关系
   - 使用 madge 工具

4. **保持依赖更新**
   ```bash
   npm update
   ```

## 联系支持

如果问题仍未解决，请提供：
1. 完整的错误堆栈
2. 浏览器控制台截图
3. `npm run build` 的输出
4. Node.js 和 npm 版本

---

**更新时间：** 2024年  
**状态：** 🔧 修复中
