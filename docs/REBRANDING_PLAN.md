# 项目重命名计划 - SIGHT ONE (瞰析 ONE)

## 品牌信息

- **旧名称**: 无人机分析器 / Drone Analyzer
- **新英文名**: SIGHT ONE
- **新中文名**: 瞰析 ONE
- **品牌定位**: 智能视觉分析平台

---

## 需要替换的内容

### 1. 用户界面文本

#### 中文界面
- "无人机分析器" → "瞰析 ONE"
- "无人机后端服务" → "SIGHT ONE 后端服务"
- "无人机控制" → "设备控制"
- "无人机状态" → "设备状态"

#### 英文界面
- "Drone Analyzer" → "SIGHT ONE"
- "Drone Backend" → "SIGHT ONE Backend"
- "Drone Control" → "Device Control"
- "Drone Status" → "Device Status"

### 2. 代码中的标识符

保持不变（避免破坏性更改）：
- 变量名: `droneStatus`, `useDroneControl` 等
- 文件名: `drone_backend.py` 等
- API端点: `/api/drone/*` 等

**原因**: 这些是内部实现细节，更改会导致大量代码重构

### 3. 文档和注释

#### 需要更新的文档
- README.md
- 用户手册
- API文档
- 配置文件注释

---

## 替换策略

### 阶段1: 用户可见文本（高优先级）

**文件类型**: `.tsx`, `.ts`, `.md` (用户文档)

**替换规则**:
```
"无人机分析器" → "瞰析 ONE"
"Drone Analyzer" → "SIGHT ONE"
"无人机后端" → "SIGHT ONE 后端"
"Drone Backend" → "SIGHT ONE Backend"
```

**保留的术语**:
- 技术文档中的"无人机"（指实际的飞行器）
- 代码注释中的技术术语
- 变量名和函数名

### 阶段2: 文档更新（中优先级）

**文件**: 
- `README.md`
- `*.md` (所有Markdown文档)
- `package.json` (项目描述)

### 阶段3: 配置文件（低优先级）

**文件**:
- `package.json` (name, description)
- `.env.example`
- 配置文件注释

---

## 实施步骤

### 步骤1: 备份
```bash
# 创建备份分支
git checkout -b backup-before-rebranding
git push origin backup-before-rebranding

# 切换到主分支
git checkout main
```

### 步骤2: 批量替换用户界面文本

**Python文件** (`.py`):
```bash
# 替换中文用户消息
find . -name "*.py" -type f -exec sed -i 's/无人机分析器/瞰析 ONE/g' {} +
find . -name "*.py" -type f -exec sed -i 's/无人机后端服务/SIGHT ONE 后端服务/g' {} +
find . -name "*.py" -type f -exec sed -i 's/无人机连接/设备连接/g' {} +
find . -name "*.py" -type f -exec sed -i 's/无人机状态/设备状态/g' {} +
```

**TypeScript/React文件** (`.tsx`, `.ts`):
```bash
# 替换UI文本
find . -name "*.tsx" -name "*.ts" -type f -exec sed -i 's/无人机分析器/瞰析 ONE/g' {} +
find . -name "*.tsx" -name "*.ts" -type f -exec sed -i 's/Drone Analyzer/SIGHT ONE/g' {} +
```

### 步骤3: 更新文档

**主要文档**:
- [ ] `README.md`
- [ ] `package.json`
- [ ] 所有 `.md` 文件

### 步骤4: 更新配置

**配置文件**:
- [ ] `package.json` (name, description)
- [ ] `next.config.js` (如果有项目名称)
- [ ] `.env.example` (注释)

### 步骤5: 测试

- [ ] 启动前端，检查所有UI文本
- [ ] 启动后端，检查日志消息
- [ ] 测试所有功能是否正常
- [ ] 检查文档是否正确

### 步骤6: 提交

```bash
git add .
git commit -m "品牌升级: 更新项目名称为 SIGHT ONE (瞰析 ONE)"
git push origin main
```

---

## 详细替换清单

### Python后端文件

**文件**: `python/drone_backend.py`
- [x] 日志消息中的"无人机"
- [x] 用户提示消息
- [x] 错误消息

**文件**: `python/diagnosis_workflow_manager.py`
- [x] 日志消息
- [x] 注释（用户可见部分）

### TypeScript前端文件

**文件**: `app/layout.tsx`
- [ ] 页面标题
- [ ] Meta标签

**文件**: `components/*.tsx`
- [ ] UI文本
- [ ] Toast消息
- [ ] 按钮文本

### 文档文件

**文件**: `README.md`
- [ ] 项目标题
- [ ] 项目描述
- [ ] 安装说明

**文件**: `*.md` (所有文档)
- [ ] 标题
- [ ] 描述性文本

---

## 品牌一致性指南

### 使用规范

**正确**:
- ✅ "SIGHT ONE" (全大写，有空格)
- ✅ "瞰析 ONE" (中文+空格+ONE)
- ✅ "SIGHT ONE 后端服务"
- ✅ "瞰析 ONE 智能分析平台"

**错误**:
- ❌ "SightOne" (驼峰式)
- ❌ "sight one" (全小写)
- ❌ "瞰析ONE" (无空格)
- ❌ "SIGHT-ONE" (连字符)

### 上下文使用

**完整名称** (首次出现):
- "SIGHT ONE (瞰析 ONE)"
- "瞰析 ONE (SIGHT ONE)"

**后续引用**:
- 中文环境: "瞰析 ONE"
- 英文环境: "SIGHT ONE"
- 技术文档: "SIGHT ONE"

---

## 注意事项

### 不要更改的内容

1. **代码标识符**
   - 变量名: `droneStatus`, `droneControl`
   - 函数名: `connectDrone()`, `getDroneState()`
   - 类名: `DroneBackendService`
   - 文件名: `drone_backend.py`

2. **API端点**
   - `/api/drone/*`
   - WebSocket消息类型: `drone_connect`, `drone_status`

3. **数据库字段**
   - 如果有数据库，保持字段名不变

4. **Git历史**
   - 不要重写Git历史
   - 保留所有提交记录

### 需要特别注意的文件

1. **package.json**
   - `name`: 可能需要保持URL友好格式
   - `description`: 更新为新品牌描述

2. **README.md**
   - 项目标题
   - 徽章（如果有）
   - 描述和特性列表

3. **用户界面**
   - 页面标题
   - 导航菜单
   - Toast通知
   - 错误消息

---

## 自动化脚本

### Windows PowerShell脚本

```powershell
# rebranding.ps1
# SIGHT ONE 品牌升级脚本

Write-Host "开始 SIGHT ONE 品牌升级..." -ForegroundColor Green

# 备份
Write-Host "创建备份..." -ForegroundColor Yellow
git checkout -b backup-before-rebranding
git push origin backup-before-rebranding
git checkout main

# Python文件替换
Write-Host "更新Python文件..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter *.py -Recurse | ForEach-Object {
    (Get-Content $_.FullName) `
        -replace '无人机分析器', '瞰析 ONE' `
        -replace '无人机后端服务', 'SIGHT ONE 后端服务' `
        -replace '无人机连接', '设备连接' `
        -replace '无人机状态', '设备状态' |
    Set-Content $_.FullName
}

# TypeScript文件替换
Write-Host "更新TypeScript文件..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter *.tsx -Recurse | ForEach-Object {
    (Get-Content $_.FullName) `
        -replace '无人机分析器', '瞰析 ONE' `
        -replace 'Drone Analyzer', 'SIGHT ONE' |
    Set-Content $_.FullName
}

Get-ChildItem -Path . -Filter *.ts -Recurse | ForEach-Object {
    (Get-Content $_.FullName) `
        -replace '无人机分析器', '瞰析 ONE' `
        -replace 'Drone Analyzer', 'SIGHT ONE' |
    Set-Content $_.FullName
}

# Markdown文件替换
Write-Host "更新文档文件..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter *.md -Recurse | ForEach-Object {
    (Get-Content $_.FullName) `
        -replace '无人机分析器', '瞰析 ONE' `
        -replace 'Drone Analyzer', 'SIGHT ONE' |
    Set-Content $_.FullName
}

Write-Host "品牌升级完成！" -ForegroundColor Green
Write-Host "请检查更改并测试功能" -ForegroundColor Yellow
```

### Linux/Mac Bash脚本

```bash
#!/bin/bash
# rebranding.sh
# SIGHT ONE 品牌升级脚本

echo "开始 SIGHT ONE 品牌升级..."

# 备份
echo "创建备份..."
git checkout -b backup-before-rebranding
git push origin backup-before-rebranding
git checkout main

# Python文件替换
echo "更新Python文件..."
find . -name "*.py" -type f -exec sed -i 's/无人机分析器/瞰析 ONE/g' {} +
find . -name "*.py" -type f -exec sed -i 's/无人机后端服务/SIGHT ONE 后端服务/g' {} +
find . -name "*.py" -type f -exec sed -i 's/无人机连接/设备连接/g' {} +
find . -name "*.py" -type f -exec sed -i 's/无人机状态/设备状态/g' {} +

# TypeScript文件替换
echo "更新TypeScript文件..."
find . -name "*.tsx" -type f -exec sed -i 's/无人机分析器/瞰析 ONE/g' {} +
find . -name "*.tsx" -type f -exec sed -i 's/Drone Analyzer/SIGHT ONE/g' {} +
find . -name "*.ts" -type f -exec sed -i 's/无人机分析器/瞰析 ONE/g' {} +
find . -name "*.ts" -type f -exec sed -i 's/Drone Analyzer/SIGHT ONE/g' {} +

# Markdown文件替换
echo "更新文档文件..."
find . -name "*.md" -type f -exec sed -i 's/无人机分析器/瞰析 ONE/g' {} +
find . -name "*.md" -type f -exec sed -i 's/Drone Analyzer/SIGHT ONE/g' {} +

echo "品牌升级完成！"
echo "请检查更改并测试功能"
```

---

## 测试清单

### 功能测试
- [ ] 前端启动正常
- [ ] 后端启动正常
- [ ] WebSocket连接正常
- [ ] 所有功能正常工作

### UI测试
- [ ] 页面标题显示"SIGHT ONE"或"瞰析 ONE"
- [ ] 导航菜单文本正确
- [ ] Toast通知文本正确
- [ ] 错误消息文本正确
- [ ] 日志消息文本正确

### 文档测试
- [ ] README.md标题正确
- [ ] 所有文档引用正确
- [ ] 链接仍然有效

---

## 回滚计划

如果需要回滚：

```bash
# 切换到备份分支
git checkout backup-before-rebranding

# 或者重置到之前的提交
git reset --hard HEAD~1

# 强制推送（谨慎使用）
git push origin main --force
```

---

**创建日期**: 2025-10-11  
**状态**: 📋 计划阶段  
**预计时间**: 2-3小时  
**风险等级**: 低（主要是文本替换）
