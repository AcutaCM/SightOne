#!/bin/bash

# 生产环境部署脚本
# 使用方法: ./scripts/production-deploy.sh

set -e  # 遇到错误立即退出

echo "========================================="
echo "助理市场数据持久化系统 - 生产环境部署"
echo "========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的命令
check_requirements() {
    log_info "检查系统要求..."
    
    commands=("node" "npm" "docker" "docker-compose")
    
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd 未安装"
            exit 1
        else
            log_success "$cmd 已安装"
        fi
    done
}

# 检查环境变量文件
check_env_file() {
    log_info "检查环境变量文件..."
    
    if [ ! -f ".env.production" ]; then
        log_warning ".env.production 不存在"
        log_info "从示例文件创建..."
        cp .env.production.example .env.production
        log_warning "请编辑 .env.production 文件并配置正确的值"
        exit 1
    else
        log_success ".env.production 存在"
    fi
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p data data/backups logs ssl
    
    log_success "目录创建完成"
}

# 备份现有数据
backup_existing_data() {
    log_info "备份现有数据..."
    
    if [ -f "data/assistants.db" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        cp data/assistants.db data/backups/assistants_pre_deploy_${timestamp}.db
        log_success "数据库已备份"
    else
        log_info "没有现有数据需要备份"
    fi
}

# 构建Docker镜像
build_docker_image() {
    log_info "构建Docker镜像..."
    
    docker-compose -f docker-compose.prod.yml build
    
    log_success "Docker镜像构建完成"
}

# 停止旧容器
stop_old_containers() {
    log_info "停止旧容器..."
    
    docker-compose -f docker-compose.prod.yml down
    
    log_success "旧容器已停止"
}

# 启动新容器
start_new_containers() {
    log_info "启动新容器..."
    
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "新容器已启动"
}

# 等待服务就绪
wait_for_service() {
    log_info "等待服务就绪..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            log_success "服务已就绪"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    log_error "服务启动超时"
    return 1
}

# 运行健康检查
run_health_check() {
    log_info "运行健康检查..."
    
    npm run health
    
    if [ $? -eq 0 ]; then
        log_success "健康检查通过"
    else
        log_error "健康检查失败"
        return 1
    fi
}

# 清理旧镜像
cleanup_old_images() {
    log_info "清理旧Docker镜像..."
    
    docker image prune -f
    
    log_success "清理完成"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "========================================="
    echo "部署完成!"
    echo "========================================="
    echo ""
    echo "服务信息:"
    echo "  - 应用URL: http://localhost:3000"
    echo "  - 健康检查: http://localhost:3000/api/health"
    echo ""
    echo "管理命令:"
    echo "  - 查看日志: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  - 停止服务: docker-compose -f docker-compose.prod.yml down"
    echo "  - 重启服务: docker-compose -f docker-compose.prod.yml restart"
    echo ""
    echo "监控命令:"
    echo "  - 健康检查: npm run health"
    echo "  - 查看容器: docker ps"
    echo ""
}

# 主函数
main() {
    log_info "开始部署流程..."
    
    check_requirements
    check_env_file
    create_directories
    backup_existing_data
    build_docker_image
    stop_old_containers
    start_new_containers
    
    if wait_for_service; then
        if run_health_check; then
            cleanup_old_images
            show_deployment_info
            exit 0
        else
            log_error "健康检查失败,回滚部署"
            docker-compose -f docker-compose.prod.yml down
            exit 1
        fi
    else
        log_error "服务启动失败,回滚部署"
        docker-compose -f docker-compose.prod.yml down
        exit 1
    fi
}

# 运行主函数
main
