# ============================================================================
# SIGHT ONE (瞰析 ONE) - Makefile
# Quick commands for development and deployment
# ============================================================================

.PHONY: help install install-dev test clean lint format check run

# 默认目标
.DEFAULT_GOAL := help

# Python 解释器
PYTHON := python3
PIP := $(PYTHON) -m pip

# 项目目录
PROJECT_DIR := $(shell pwd)

# ============================================================================
# 帮助信息
# ============================================================================

help: ## 显示帮助信息
	@echo "=========================================="
	@echo "  SIGHT ONE - Make 命令"
	@echo "=========================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# 安装
# ============================================================================

install: ## 安装生产依赖
	@echo "📦 安装生产依赖..."
	$(PIP) install --upgrade pip setuptools wheel
	$(PIP) install -r requirements.txt
	@echo "✅ 安装完成"

install-dev: ## 安装开发依赖
	@echo "📦 安装开发依赖..."
	$(PIP) install --upgrade pip setuptools wheel
	$(PIP) install -r requirements-dev.txt
	@echo "✅ 安装完成"

install-gpu: ## 安装 GPU 支持 (CUDA 11.8)
	@echo "🎮 安装 PyTorch with CUDA 11.8..."
	$(PIP) install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
	@echo "✅ GPU 支持安装完成"

# ============================================================================
# 测试
# ============================================================================

test: ## 运行所有测试
	@echo "🧪 运行测试..."
	$(PYTHON) test_installation.py
	@echo "✅ 测试完成"

test-env: ## 测试环境配置
	@echo "🔍 检查环境..."
	$(PYTHON) test_installation.py

test-pytest: ## 运行 pytest 单元测试
	@echo "🧪 运行 pytest..."
	pytest -v --tb=short

test-cov: ## 运行测试并生成覆盖率报告
	@echo "📊 生成测试覆盖率报告..."
	pytest --cov=. --cov-report=html --cov-report=term
	@echo "✅ 报告已生成: htmlcov/index.html"

# ============================================================================
# 代码质量
# ============================================================================

lint: ## 代码检查 (flake8)
	@echo "🔍 运行 flake8..."
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

format: ## 代码格式化 (black)
	@echo "✨ 格式化代码..."
	black . --line-length=100
	isort . --profile black
	@echo "✅ 格式化完成"

format-check: ## 检查代码格式
	@echo "🔍 检查代码格式..."
	black . --check --line-length=100
	isort . --check-only --profile black

type-check: ## 类型检查 (mypy)
	@echo "🔍 运行类型检查..."
	mypy . --ignore-missing-imports

check: lint format-check type-check ## 运行所有代码检查

# ============================================================================
# 清理
# ============================================================================

clean: ## 清理临时文件
	@echo "🧹 清理临时文件..."
	find . -type f -name '*.pyc' -delete
	find . -type d -name '__pycache__' -delete
	find . -type d -name '*.egg-info' -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name '.pytest_cache' -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name '.mypy_cache' -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name 'htmlcov' -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name '.coverage' -delete
	@echo "✅ 清理完成"

clean-all: clean ## 清理所有生成文件（包括虚拟环境）
	@echo "🧹 深度清理..."
	rm -rf venv/ env/ .venv/
	rm -rf dist/ build/
	@echo "✅ 深度清理完成"

# ============================================================================
# 运行
# ============================================================================

run: ## 运行主程序
	@echo "🚀 启动 SIGHT ONE 后端..."
	$(PYTHON) drone_backend.py

run-dev: ## 开发模式运行
	@echo "🚀 启动开发模式..."
	$(PYTHON) drone_backend.py --debug

run-test-server: ## 运行测试服务器
	@echo "🧪 启动测试服务器..."
	$(PYTHON) -m http.server 8000

# ============================================================================
# 文档
# ============================================================================

docs: ## 生成文档
	@echo "📚 生成文档..."
	pdoc --html --output-dir docs .
	@echo "✅ 文档已生成: docs/"

docs-serve: ## 启动文档服务器
	@echo "📚 启动文档服务器..."
	pdoc --http localhost:8080 .

# ============================================================================
# 开发工具
# ============================================================================

shell: ## 启动 IPython shell
	@echo "🐍 启动 IPython..."
	ipython

notebook: ## 启动 Jupyter Notebook
	@echo "📓 启动 Jupyter Notebook..."
	jupyter notebook

freeze: ## 导出当前环境依赖
	@echo "📝 导出依赖列表..."
	$(PIP) freeze > requirements-frozen.txt
	@echo "✅ 已导出到 requirements-frozen.txt"

upgrade: ## 升级所有依赖
	@echo "⬆️  升级依赖包..."
	$(PIP) list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 $(PIP) install -U
	@echo "✅ 升级完成"

# ============================================================================
# Git 操作
# ============================================================================

git-clean: ## 清理 Git 未跟踪的文件
	@echo "🧹 清理 Git 未跟踪文件..."
	git clean -fdx -e venv -e .env
	@echo "✅ Git 清理完成"

# ============================================================================
# 部署
# ============================================================================

build: ## 构建分发包
	@echo "📦 构建分发包..."
	$(PYTHON) setup.py sdist bdist_wheel
	@echo "✅ 构建完成: dist/"

publish-test: build ## 发布到 TestPyPI
	@echo "📤 发布到 TestPyPI..."
	twine upload --repository testpypi dist/*
	@echo "✅ 发布完成"

publish: build ## 发布到 PyPI
	@echo "📤 发布到 PyPI..."
	twine upload dist/*
	@echo "✅ 发布完成"

# ============================================================================
# Docker (可选)
# ============================================================================

docker-build: ## 构建 Docker 镜像
	@echo "🐳 构建 Docker 镜像..."
	docker build -t sight-one-backend:latest .
	@echo "✅ 镜像构建完成"

docker-run: ## 运行 Docker 容器
	@echo "🐳 启动 Docker 容器..."
	docker run -p 8765:8765 sight-one-backend:latest

# ============================================================================
# 实用工具
# ============================================================================

info: ## 显示项目信息
	@echo "=========================================="
	@echo "  项目信息"
	@echo "=========================================="
	@echo "Python 版本: $(shell $(PYTHON) --version)"
	@echo "Pip 版本: $(shell $(PIP) --version)"
	@echo "项目目录: $(PROJECT_DIR)"
	@echo "已安装包数量: $(shell $(PIP) list | wc -l)"
	@echo "=========================================="

check-deps: ## 检查依赖冲突
	@echo "🔍 检查依赖冲突..."
	$(PIP) check

security-check: ## 安全检查
	@echo "🔒 运行安全检查..."
	bandit -r . -f screen || true
	safety check --json || true
