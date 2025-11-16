# 生成核心源代码文档（排除测试文件和文档）

$projectRoot = "drone-analyzer-nextjs"
$outputFile = "$projectRoot/CORE_SOURCE_CODE.md"

# 只包含核心源代码目录
$includeDirs = @(
    'app',
    'components',
    'contexts',
    'hooks',
    'lib',
    'python',
    'styles',
    'types',
    'config'
)

# 文件扩展名过滤
$codeExtensions = @('.ts', '.tsx', '.js', '.jsx', '.py', '.css', '.scss')

Write-Host "正在扫描核心源代码文件..." -ForegroundColor Cyan

# 获取所有符合条件的文件
$files = @()
foreach ($dir in $includeDirs) {
    $dirPath = Join-Path $projectRoot $dir
    if (Test-Path $dirPath) {
        $dirFiles = Get-ChildItem -Path $dirPath -Recurse -File | Where-Object {
            $file = $_
            $ext = $file.Extension
            $path = $file.FullName
            
            # 检查扩展名
            $hasValidExt = $codeExtensions -contains $ext
            
            # 排除测试文件、备份文件
            $isExcluded = $path -match '(test_|\.test\.|\.spec\.|backup|__pycache__|\.pyc)'
            
            $hasValidExt -and -not $isExcluded
        }
        $files += $dirFiles
    }
}

Write-Host "找到 $($files.Count) 个核心源代码文件" -ForegroundColor Green

# 开始生成文档
$output = @"
# 核心源代码汇总

**生成时间:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**文件总数:** $($files.Count)

本文档包含项目的核心源代码，排除了测试文件、文档文件和备份文件。

---

## 📑 目录索引

"@

# 按目录分组生成目录
$filesByDir = $files | Group-Object { 
    $relativePath = $_.FullName.Replace((Get-Location).Path + '\', '').Replace('\', '/')
    $parts = $relativePath -split '/'
    if ($parts.Count -gt 2) {
        "$($parts[0])/$($parts[1])"
    } else {
        $parts[0]
    }
} | Sort-Object Name

foreach ($group in $filesByDir) {
    $output += "`n### $($group.Name) ($($group.Count) 文件)`n"
    foreach ($file in ($group.Group | Sort-Object Name)) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '').Replace('\', '/')
        $output += "- [$($file.Name)](#$(($relativePath -replace '[/\\]','-' -replace '\.','' -replace ' ','-').ToLower()))`n"
    }
}

$output += "`n`n---`n`n## 📦 源代码内容`n"

# 按文件添加内容
$counter = 0
foreach ($file in ($files | Sort-Object FullName)) {
    $counter++
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '').Replace('\', '/')
    $ext = $file.Extension.TrimStart('.')
    
    if ($counter % 10 -eq 0) {
        Write-Host "处理进度: $counter / $($files.Count)" -ForegroundColor Yellow
    }
    
    $output += "`n### 📄 ``$relativePath```n`n"
    
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ($content) {
            $output += "``````$ext`n"
            $output += $content
            if (-not $content.EndsWith("`n")) {
                $output += "`n"
            }
            $output += "``````"
        } else {
            $output += "> 📝 空文件"
        }
        $output += "`n`n"
    }
    catch {
        $output += "> ⚠️ 无法读取文件: $($_.Exception.Message)`n`n"
    }
}

# 写入文件
try {
    $output | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "`n✅ 文档已生成: $outputFile" -ForegroundColor Green
    $fileSize = [math]::Round((Get-Item $outputFile).Length/1MB,2)
    Write-Host "文件大小: $fileSize MB" -ForegroundColor Cyan
}
catch {
    Write-Host "`n❌ 生成文档失败: $($_.Exception.Message)" -ForegroundColor Red
}
