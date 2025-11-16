# 安装测试依赖脚本

Write-Host "🔧 安装测试依赖..." -ForegroundColor Cyan

# 安装 Jest 和相关依赖
npm install --save-dev `
  jest `
  jest-environment-jsdom `
  @testing-library/react `
  @testing-library/jest-dom `
  @testing-library/user-event `
  @types/jest

Write-Host "✅ 测试依赖安装完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 下一步：" -ForegroundColor Yellow
Write-Host "  1. 运行测试: npm test" -ForegroundColor White
Write-Host "  2. 查看测试指南: TESTING_GUIDE.md" -ForegroundColor White
Write-Host "  3. 开始编写测试！" -ForegroundColor White
