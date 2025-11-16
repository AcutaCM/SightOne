# 清理缓存并重启开发服务器

Write-Host "🧹 清理 Next.js 缓存..." -ForegroundColor Cyan

# 清理 .next 目录
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ 已删除 .next 目录" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next 目录不存在" -ForegroundColor Yellow
}

# 清理 node_modules/.cache
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ 已删除 node_modules\.cache 目录" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules\.cache 目录不存在" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 启动开发服务器..." -ForegroundColor Cyan
Write-Host ""
Write-Host "提示：启动后请在浏览器中按 Ctrl+Shift+R 强制刷新" -ForegroundColor Yellow
Write-Host ""

# 启动开发服务器
npm run dev
