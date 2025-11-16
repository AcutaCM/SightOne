# 源代码文档生成脚本使用说明

## 📄 脚本说明

`generate-source-doc.ps1` - 生成项目完整源代码文档，包含代码统计信息

## ✨ 功能特性

1. **自动扫描**: 扫描项目中所有源代码文件
2. **去除空行**: 输出时自动去除所有空行，使文档更紧凑
3. **代码统计**: 
   - 总体统计（文件数、总行数、代码行数、空行数、代码密度）
   - 按文件类型统计
   - Top 20 最大文件列表
4. **智能过滤**: 自动排除 node_modules, .next, .venv 等目录
5. **多语言支持**: 支持 .ts, .tsx, .js, .jsx, .py, .css, .scss, .json

## 🚀 使用方法

### 在项目根目录运行

```powershell
# 进入项目目录
cd drone-analyzer-nextjs

# 运行脚本
.\scripts\generate-source-doc.ps1
```

### 输出文件

- **主文档**: `docs/PROJECT_SOURCE_CODE.md` - 完整源代码（去除空行）
- **统计摘要**: `docs/CODE_STATISTICS_SUMMARY.md` - 代码统计总结

## 📊 输出示例

运行后会在控制台显示：

```
正在扫描项目文件...
找到 392 个源代码文件

✅ 文档已生成: docs/PROJECT_SOURCE_CODE.md
文件大小: 4.6 MB

📊 代码统计:
  文件总数: 392
  总行数: 137959
  代码行数（去除空行）: 126141
  空行数: 11818
  代码密度: 91.43%
```

## 📁 生成的文档结构

### PROJECT_SOURCE_CODE.md

```markdown
# 项目源代码汇总

## 目录结构
[文件列表]

## 源代码内容

### 📄 文件路径
> 总行数: XX | 代码行数: XX | 空行数: XX

```代码内容（已去除空行）```

## 📊 代码统计

### 总体统计
[统计表格]

### 按文件类型统计
[类型统计表格]

### Top 20 代码量最大的文件
[文件排行]
```

## ⚙️ 配置选项

### 修改包含的文件类型

编辑脚本中的 `$extensions` 数组：

```powershell
$extensions = @('.ts', '.tsx', '.js', '.jsx', '.py', '.css', '.scss', '.json')
```

### 修改排除的目录

编辑脚本中的 `$excludePatterns` 数组：

```powershell
$excludePatterns = @(
    'node_modules',
    '.next',
    '.venv',
    'out',
    'public/images',
    'public/uploads',
    '.git',
    'backup'
)
```

### 修改输出路径

编辑脚本中的 `$outputFile` 变量：

```powershell
$outputFile = "docs/PROJECT_SOURCE_CODE.md"
```

## 📈 统计信息说明

### 代码密度

```
代码密度 = (代码行数 / 总行数) × 100%
```

- **高密度 (>90%)**: 代码紧凑，注释和空行较少
- **中密度 (70-90%)**: 代码结构合理，有适当的注释和空行
- **低密度 (<70%)**: 代码中有大量注释或空行

### 文件统计

每个文件显示三个指标：
- **总行数**: 包含所有行（代码、注释、空行）
- **代码行数**: 去除空行后的行数
- **空行数**: 纯空行的数量

## 🔧 故障排除

### 问题1: 找不到文件

**原因**: 当前目录不正确

**解决**: 确保在 `drone-analyzer-nextjs` 目录下运行脚本

```powershell
cd drone-analyzer-nextjs
.\scripts\generate-source-doc.ps1
```

### 问题2: 权限错误

**原因**: PowerShell 执行策略限制

**解决**: 临时允许脚本执行

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\generate-source-doc.ps1
```

### 问题3: 文件过大

**原因**: 项目文件太多，生成的文档过大

**解决**: 
1. 增加排除目录
2. 减少包含的文件类型
3. 分批生成文档

## 📝 注意事项

1. **文件大小**: 大型项目生成的文档可能达到数MB，注意磁盘空间
2. **执行时间**: 文件数量多时，扫描和生成可能需要几分钟
3. **编码格式**: 输出文件使用 UTF-8 编码
4. **空行处理**: 只去除完全空白的行，保留只有空格/制表符的行

## 🎯 使用场景

1. **代码审查**: 快速浏览整个项目的代码
2. **文档归档**: 保存项目某个时间点的完整代码快照
3. **代码分析**: 统计代码量，分析项目结构
4. **团队协作**: 分享完整的代码给团队成员
5. **学习参考**: 作为学习材料，了解项目全貌

## 📚 相关文档

- [CODE_STATISTICS_SUMMARY.md](../docs/CODE_STATISTICS_SUMMARY.md) - 代码统计摘要
- [PROJECT_SOURCE_CODE.md](../docs/PROJECT_SOURCE_CODE.md) - 完整源代码文档

## 🔄 更新日志

### v2.0 (2025-10-22)
- ✅ 添加空行去除功能
- ✅ 添加详细的代码统计
- ✅ 添加按文件类型统计
- ✅ 添加 Top 20 文件排行
- ✅ 优化输出格式

### v1.0 (初始版本)
- ✅ 基础源代码汇总功能
- ✅ 目录结构展示
- ✅ 代码语法高亮

---

**维护者**: Kiro AI Assistant  
**最后更新**: 2025-10-22
