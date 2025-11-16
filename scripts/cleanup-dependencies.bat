@echo off
REM ============================================================================
REM 依賴清理腳本 (Windows 版本)
REM 
REM 此腳本用於移除項目中未使用的 UI 庫依賴，統一使用 @heroui
REM 
REM 使用方法:
REM   .\scripts\cleanup-dependencies.bat
REM
REM 作者: 前端團隊
REM 創建時間: 2025-10-09
REM ============================================================================

setlocal enabledelayedexpansion

REM 顏色設置 (Windows 10+)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

echo.
echo ============================================
echo   開始執行依賴清理
echo ============================================
echo.

REM 檢查 package.json 是否存在
if not exist "package.json" (
    echo %RED%[ERROR]%NC% package.json 不存在！
    echo 請在項目根目錄執行此腳本。
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% 找到 package.json
echo.

REM 創建備份
echo %BLUE%[INFO]%NC% 創建 package.json 備份...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/: " %%a in ('time /t') do (set mytime=%%a%%b)
copy package.json package.json.backup.%mydate%_%mytime%
echo %GREEN%[SUCCESS]%NC% 備份創建成功
echo.

REM 移除未使用的依賴
echo ============================================
echo   移除未使用的 UI 庫依賴
echo ============================================
echo.

echo 準備移除以下依賴:
echo   - @mui/icons-material
echo   - @mui/lab
echo   - @mui/material
echo   - @emotion/react
echo   - @emotion/styled
echo   - @lobehub/ui
echo.

set /p confirm="確認移除? (y/N): "
if /i not "%confirm%"=="y" (
    echo %YELLOW%[WARNING]%NC% 取消移除操作
    pause
    exit /b 0
)

echo.
echo %BLUE%[INFO]%NC% 開始移除依賴...

call npm uninstall @mui/icons-material @mui/lab @mui/material @emotion/react @emotion/styled @lobehub/ui

if errorlevel 1 (
    echo %RED%[ERROR]%NC% 依賴移除失敗
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% 依賴移除成功
echo.

REM 安裝新依賴
echo ============================================
echo   安裝新依賴
echo ============================================
echo.

echo 準備安裝以下依賴:
echo   - qrcode.react
echo.

set /p confirm="確認安裝? (y/N): "
if /i not "%confirm%"=="y" (
    echo %YELLOW%[WARNING]%NC% 跳過安裝操作
    goto :SKIP_INSTALL
)

echo.
echo %BLUE%[INFO]%NC% 開始安裝依賴...

call npm install qrcode.react

if errorlevel 1 (
    echo %RED%[ERROR]%NC% 依賴安裝失敗
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% 依賴安裝成功
echo.

:SKIP_INSTALL

REM 清理並重新安裝
echo ============================================
echo   清理並重新安裝依賴
echo ============================================
echo.

set /p confirm="是否清理 node_modules 並重新安裝? (y/N): "
if /i not "%confirm%"=="y" (
    echo %YELLOW%[WARNING]%NC% 跳過清理操作
    goto :SKIP_CLEAN
)

echo.
echo %BLUE%[INFO]%NC% 移除 node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
)

echo %BLUE%[INFO]%NC% 移除 package-lock.json...
if exist "package-lock.json" (
    del /f /q package-lock.json
)

echo %BLUE%[INFO]%NC% 重新安裝依賴...
call npm install

if errorlevel 1 (
    echo %RED%[ERROR]%NC% 依賴安裝失敗
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% 依賴重新安裝成功
echo.

:SKIP_CLEAN

REM 檢查依賴大小
echo ============================================
echo   檢查依賴大小
echo ============================================
echo.

if exist "node_modules" (
    for /f "tokens=3" %%a in ('dir /s node_modules ^| find "bytes"') do (
        echo %BLUE%[INFO]%NC% node_modules 大小: %%a bytes
    )
) else (
    echo %YELLOW%[WARNING]%NC% node_modules 不存在
)
echo.

REM 驗證依賴
echo ============================================
echo   驗證依賴完整性
echo ============================================
echo.

echo %BLUE%[INFO]%NC% 檢查 @heroui 依賴...

findstr /C:"@heroui/avatar" package.json >nul && (
    echo   %GREEN%✓%NC% @heroui/avatar
) || (
    echo   %RED%✗%NC% @heroui/avatar (缺失)
)

findstr /C:"@heroui/badge" package.json >nul && (
    echo   %GREEN%✓%NC% @heroui/badge
) || (
    echo   %RED%✗%NC% @heroui/badge (缺失)
)

findstr /C:"@heroui/button" package.json >nul && (
    echo   %GREEN%✓%NC% @heroui/button
) || (
    echo   %RED%✗%NC% @heroui/button (缺失)
)

findstr /C:"@heroui/card" package.json >nul && (
    echo   %GREEN%✓%NC% @heroui/card
) || (
    echo   %RED%✗%NC% @heroui/card (缺失)
)

findstr /C:"@heroui/modal" package.json >nul && (
    echo   %GREEN%✓%NC% @heroui/modal
) || (
    echo   %RED%✗%NC% @heroui/modal (缺失)
)

echo.

REM 生成報告
echo ============================================
echo   生成清理報告
echo ============================================
echo.

set "report_file=dependency-cleanup-report-%mydate%_%mytime%.txt"

(
    echo 依賴清理報告
    echo ============================================
    echo 時間: %date% %time%
    echo.
    echo 已移除的依賴:
    echo   - @mui/icons-material
    echo   - @mui/lab
    echo   - @mui/material
    echo   - @emotion/react
    echo   - @emotion/styled
    echo   - @lobehub/ui
    echo.
    echo 已安裝的新依賴:
    echo   - qrcode.react
    echo.
    echo 當前 @heroui 依賴:
    findstr "@heroui" package.json
    echo.
) > "%report_file%"

echo %GREEN%[SUCCESS]%NC% 報告已生成: %report_file%
echo.

REM 完成
echo ============================================
echo   依賴清理完成
echo ============================================
echo.

echo %GREEN%[SUCCESS]%NC% 所有操作已完成！
echo %BLUE%[INFO]%NC% 備份文件: package.json.backup.*
echo %BLUE%[INFO]%NC% 如需回滾，請手動恢復備份文件
echo.

pause
endlocal










