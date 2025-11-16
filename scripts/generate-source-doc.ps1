# 生成项目源代码文档
# 排除: node_modules, .next, .venv, out, public/images, public/uploads, backup 等目录

$projectRoot = "."
$outputFile = "docs/PROJECT_SOURCE_CODE.md"

# 文件扩展名过滤
$extensions = @('.ts', '.tsx', '.js', '.jsx', '.py', '.css', '.scss', '.json')

# 排除的目录模式
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

Write-Host "正在扫描项目文件..." -ForegroundColor Cyan

# 获取所有符合条件的文件
$files = Get-ChildItem -Path $projectRoot -Recurse -File | Where-Object {
    $file = $_
    $ext = $file.Extension
    $path = $file.FullName
    
    # 检查扩展名
    $hasValidExt = $extensions -contains $ext
    
    # 检查是否在排除目录中
    $isExcluded = $false
    foreach ($pattern in $excludePatterns) {
        if ($path -like "*\$pattern\*" -or $path -like "*/$pattern/*") {
            $isExcluded = $true
            break
        }
    }
    
    $hasValidExt -and -not $isExcluded
}

Write-Host "找到 $($files.Count) 个源代码文件" -ForegroundColor Green

# 按目录分组
$filesByDir = $files | Group-Object { Split-Path $_.FullName -Parent }

# 开始生成文档
$output = @"
# 项目源代码汇总

**生成时间:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**文件总数:** $($files.Count)

---

## 目录结构

"@

# 生成目录树
$relativePaths = $files | ForEach-Object {
    $_.FullName.Replace((Get-Location).Path + '\', '').Replace('\', '/')
} | Sort-Object

$output += "`n``````"
$output += "`n" + ($relativePaths -join "`n")
$output += "`n``````"
$output += "`n`n---`n`n## 源代码内容`n"

# 按文件添加内容
$counter = 0
$totalLines = 0
$totalNonEmptyLines = 0
$fileStats = @()

foreach ($file in ($files | Sort-Object FullName)) {
    $counter++
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '').Replace('\', '/')
    $ext = $file.Extension.TrimStart('.')
    
    Write-Progress -Activity "生成文档" -Status "处理: $relativePath" -PercentComplete (($counter / $files.Count) * 100)
    
    $output += "`n### 📄 $relativePath`n`n"
    
    try {
        # 读取文件内容并去除空行
        $lines = Get-Content $file.FullName -ErrorAction Stop
        $nonEmptyLines = $lines | Where-Object { $_.Trim() -ne '' }
        
        # 统计行数
        $fileLineCount = $lines.Count
        $fileNonEmptyLineCount = $nonEmptyLines.Count
        $totalLines += $fileLineCount
        $totalNonEmptyLines += $fileNonEmptyLineCount
        
        # 记录文件统计信息
        $fileStats += [PSCustomObject]@{
            Path = $relativePath
            TotalLines = $fileLineCount
            NonEmptyLines = $fileNonEmptyLineCount
            EmptyLines = $fileLineCount - $fileNonEmptyLineCount
        }
        
        # 添加文件信息
        $output += "> **总行数:** $fileLineCount | **代码行数:** $fileNonEmptyLineCount | **空行数:** $($fileLineCount - $fileNonEmptyLineCount)`n`n"
        
        # 输出去除空行后的内容
        $content = $nonEmptyLines -join "`n"
        $output += "``````$ext`n"
        $output += $content
        $output += "`n``````"
        $output += "`n`n"
    }
    catch {
        $output += "> ⚠️ 无法读取文件内容`n`n"
    }
}

# 添加统计信息
$output += "`n---`n`n## 📊 代码统计`n`n"
$output += "### 总体统计`n`n"
$output += "| 指标 | 数量 |`n"
$output += "|------|------|`n"
$output += "| 文件总数 | $($files.Count) |`n"
$output += "| 总行数 | $totalLines |`n"
$output += "| 代码行数（去除空行） | $totalNonEmptyLines |`n"
$output += "| 空行数 | $($totalLines - $totalNonEmptyLines) |`n"
$output += "| 代码密度 | $([math]::Round(($totalNonEmptyLines / $totalLines) * 100, 2))% |`n"
$output += "`n"

# 按文件类型统计
$output += "### 按文件类型统计`n`n"
$output += "| 文件类型 | 文件数 | 总行数 | 代码行数 | 空行数 |`n"
$output += "|---------|--------|--------|----------|--------|`n"

$typeStats = $fileStats | Group-Object { [System.IO.Path]::GetExtension($_.Path) } | ForEach-Object {
    $ext = $_.Name
    $count = $_.Count
    $totalL = ($_.Group | Measure-Object -Property TotalLines -Sum).Sum
    $nonEmptyL = ($_.Group | Measure-Object -Property NonEmptyLines -Sum).Sum
    $emptyL = ($_.Group | Measure-Object -Property EmptyLines -Sum).Sum
    
    [PSCustomObject]@{
        Extension = $ext
        Count = $count
        TotalLines = $totalL
        NonEmptyLines = $nonEmptyL
        EmptyLines = $emptyL
    }
} | Sort-Object -Property NonEmptyLines -Descending

foreach ($stat in $typeStats) {
    $output += "| $($stat.Extension) | $($stat.Count) | $($stat.TotalLines) | $($stat.NonEmptyLines) | $($stat.EmptyLines) |`n"
}

$output += "`n"

# Top 20 最大文件
$output += "### Top 20 代码量最大的文件`n`n"
$output += "| 文件 | 总行数 | 代码行数 | 空行数 |`n"
$output += "|------|--------|----------|--------|`n"

$top20 = $fileStats | Sort-Object -Property NonEmptyLines -Descending | Select-Object -First 20
foreach ($file in $top20) {
    $output += "| $($file.Path) | $($file.TotalLines) | $($file.NonEmptyLines) | $($file.EmptyLines) |`n"
}

$output += "`n---`n`n"
$output += "*文档生成完成于 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')*`n"

# 写入文件
$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "`n✅ 文档已生成: $outputFile" -ForegroundColor Green
Write-Host "文件大小: $([math]::Round((Get-Item $outputFile).Length/1MB,2)) MB" -ForegroundColor Cyan
Write-Host "`n📊 代码统计:" -ForegroundColor Yellow
Write-Host "  文件总数: $($files.Count)" -ForegroundColor White
Write-Host "  总行数: $totalLines" -ForegroundColor White
Write-Host "  代码行数（去除空行）: $totalNonEmptyLines" -ForegroundColor Green
Write-Host "  空行数: $($totalLines - $totalNonEmptyLines)" -ForegroundColor Gray
Write-Host "  代码密度: $([math]::Round(($totalNonEmptyLines / $totalLines) * 100, 2))%" -ForegroundColor Cyan
