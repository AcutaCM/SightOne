#!/bin/bash

###############################################################################
# 依賴清理腳本
# 
# 此腳本用於移除項目中未使用的 UI 庫依賴，統一使用 @heroui
# 
# 使用方法:
#   chmod +x scripts/cleanup-dependencies.sh
#   ./scripts/cleanup-dependencies.sh
#
# 作者: 前端團隊
# 創建時間: 2025-10-09
###############################################################################

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印帶顏色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印標題
print_header() {
    echo ""
    echo "============================================"
    echo "  $1"
    echo "============================================"
    echo ""
}

# 檢查 package.json 是否存在
check_package_json() {
    if [ ! -f "package.json" ]; then
        print_error "package.json 不存在！請在項目根目錄執行此腳本。"
        exit 1
    fi
    print_success "找到 package.json"
}

# 創建備份
create_backup() {
    print_info "創建 package.json 備份..."
    cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)
    print_success "備份創建成功"
}

# 移除未使用的依賴
remove_unused_dependencies() {
    print_header "移除未使用的 UI 庫依賴"
    
    local packages_to_remove=(
        "@mui/icons-material"
        "@mui/lab"
        "@mui/material"
        "@emotion/react"
        "@emotion/styled"
        "@lobehub/ui"
    )
    
    print_info "準備移除以下依賴:"
    for pkg in "${packages_to_remove[@]}"; do
        echo "  - $pkg"
    done
    
    echo ""
    read -p "確認移除? (y/N) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "開始移除依賴..."
        
        if command -v npm &> /dev/null; then
            npm uninstall "${packages_to_remove[@]}"
            print_success "依賴移除成功"
        else
            print_error "npm 命令未找到"
            exit 1
        fi
    else
        print_warning "取消移除操作"
        exit 0
    fi
}

# 安裝新依賴
install_new_dependencies() {
    print_header "安裝新依賴"
    
    local packages_to_install=(
        "qrcode.react"
    )
    
    print_info "準備安裝以下依賴:"
    for pkg in "${packages_to_install[@]}"; do
        echo "  - $pkg"
    done
    
    echo ""
    read -p "確認安裝? (y/N) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "開始安裝依賴..."
        
        if command -v npm &> /dev/null; then
            npm install "${packages_to_install[@]}"
            print_success "依賴安裝成功"
        else
            print_error "npm 命令未找到"
            exit 1
        fi
    else
        print_warning "跳過安裝操作"
    fi
}

# 清理 node_modules 和 lock 文件
clean_modules() {
    print_header "清理並重新安裝依賴"
    
    echo ""
    read -p "是否清理 node_modules 並重新安裝? (y/N) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "移除 node_modules..."
        rm -rf node_modules
        
        print_info "移除 package-lock.json..."
        rm -f package-lock.json
        
        print_info "重新安裝依賴..."
        npm install
        
        print_success "依賴重新安裝成功"
    else
        print_warning "跳過清理操作"
    fi
}

# 檢查依賴大小
check_bundle_size() {
    print_header "檢查依賴大小變化"
    
    if command -v du &> /dev/null; then
        local size=$(du -sh node_modules 2>/dev/null | cut -f1)
        print_info "當前 node_modules 大小: $size"
    else
        print_warning "無法計算 node_modules 大小"
    fi
}

# 驗證依賴
verify_dependencies() {
    print_header "驗證依賴完整性"
    
    print_info "檢查 @heroui 依賴..."
    
    local heroui_packages=(
        "@heroui/avatar"
        "@heroui/badge"
        "@heroui/button"
        "@heroui/card"
        "@heroui/input"
        "@heroui/modal"
        "@heroui/react"
    )
    
    local all_present=true
    for pkg in "${heroui_packages[@]}"; do
        if grep -q "\"$pkg\"" package.json; then
            echo -e "  ${GREEN}✓${NC} $pkg"
        else
            echo -e "  ${RED}✗${NC} $pkg (缺失)"
            all_present=false
        fi
    done
    
    if [ "$all_present" = true ]; then
        print_success "所有必需的 @heroui 依賴都已安裝"
    else
        print_error "部分 @heroui 依賴缺失，請檢查 package.json"
    fi
}

# 生成報告
generate_report() {
    print_header "生成清理報告"
    
    local report_file="dependency-cleanup-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "依賴清理報告"
        echo "============================================"
        echo "時間: $(date)"
        echo ""
        echo "已移除的依賴:"
        echo "  - @mui/icons-material"
        echo "  - @mui/lab"
        echo "  - @mui/material"
        echo "  - @emotion/react"
        echo "  - @emotion/styled"
        echo "  - @lobehub/ui"
        echo ""
        echo "已安裝的新依賴:"
        echo "  - qrcode.react"
        echo ""
        echo "當前 @heroui 依賴:"
        grep "@heroui" package.json | sed 's/^/  /'
        echo ""
    } > "$report_file"
    
    print_success "報告已生成: $report_file"
}

# 主流程
main() {
    print_header "開始執行依賴清理"
    
    # 1. 檢查環境
    check_package_json
    
    # 2. 創建備份
    create_backup
    
    # 3. 移除未使用的依賴
    remove_unused_dependencies
    
    # 4. 安裝新依賴
    install_new_dependencies
    
    # 5. 清理並重新安裝
    clean_modules
    
    # 6. 檢查大小
    check_bundle_size
    
    # 7. 驗證依賴
    verify_dependencies
    
    # 8. 生成報告
    generate_report
    
    print_header "依賴清理完成"
    print_success "所有操作已完成！"
    print_info "備份文件: package.json.backup.*"
    print_info "如需回滾，請手動恢復備份文件"
}

# 執行主流程
main










