# Find all components that might need panel style updates
Write-Host "Searching for components that might use panel styles..." -ForegroundColor Cyan

# Search for components importing from panel-styles
Write-Host "`nComponents importing panel-styles:" -ForegroundColor Yellow
Get-ChildItem -Path "drone-analyzer-nextjs/components" -Recurse -Include *.tsx,*.ts | 
    Select-String -Pattern "from.*panel-styles|import.*panel-styles" | 
    ForEach-Object { $_.Path } | 
    Sort-Object -Unique

# Search for components using Card from heroui
Write-Host "`nComponents using Card component:" -ForegroundColor Yellow
Get-ChildItem -Path "drone-analyzer-nextjs/components" -Recurse -Include *.tsx,*.ts | 
    Select-String -Pattern "from.*@heroui/card|Card.*style=" | 
    ForEach-Object { $_.Path } | 
    Sort-Object -Unique

# Search for components with Panel in their name
Write-Host "`nComponents with 'Panel' in filename:" -ForegroundColor Yellow
Get-ChildItem -Path "drone-analyzer-nextjs/components" -Recurse -Include *Panel*.tsx | 
    ForEach-Object { $_.FullName }

# Search for components with Modal in their name
Write-Host "`nComponents with 'Modal' in filename:" -ForegroundColor Yellow
Get-ChildItem -Path "drone-analyzer-nextjs/components" -Recurse -Include *Modal*.tsx | 
    ForEach-Object { $_.FullName }

Write-Host "`nSearch complete!" -ForegroundColor Green
