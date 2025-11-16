# 统一所有Panel组件的透明度设置
# 目标: bg-background/60 backdrop-blur-[120px]

$panelFiles = Get-ChildItem -Path "drone-analyzer-nextjs/components" -Filter "*Panel.tsx" -File

$oldPatterns = @(
    'bg-background/\d+',
    'bg-content1/\d+',
    'bg-content2/\d+',
    'backdrop-blur-\[?\d+px\]?',
    'backdrop-blur-sm',
    'backdrop-blur-md',
    'backdrop-blur-lg',
    'backdrop-blur-xl'
)

$targetBg = 'bg-background/60'
$targetBlur = 'backdrop-blur-[120px]'

foreach ($file in $panelFiles) {
    $filePath = $file.FullName
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $originalContent = $content
    
    Write-Host "Processing: $($file.Name)" -ForegroundColor Cyan
    
    # 替换背景透明度
    $content = $content -replace 'bg-background/\d+', $targetBg
    $content = $content -replace 'bg-content1/\d+', $targetBg
    $content = $content -replace 'bg-content2/\d+', $targetBg
    
    # 替换背景模糊
    $content = $content -replace 'backdrop-blur-\[?\d+px\]?', $targetBlur
    $content = $content -replace 'backdrop-blur-(sm|md|lg|xl|2xl|3xl)', $targetBlur
    
    # 如果内容有变化,保存文件
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Updated" -ForegroundColor Green
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`nAll panels processed!" -ForegroundColor Green
Write-Host "Standard: $targetBg $targetBlur" -ForegroundColor Yellow
