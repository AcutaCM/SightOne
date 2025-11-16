# SIGHT ONE (瞰析 ONE) - Python 后端

<div align="center">

![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-beta-orange.svg)

智能视觉分析平台 - 后端服务

[安装指南](./INSTALLATION.md) | [API 文档](./docs/API.md) | [贡献指南](./CONTRIBUTING.md)

</div>

---

## 🌟 功能特性

### 核心功能
- 🚁 **无人机控制** - DJI Tello 无人机完整控制与视频流处理
- 🔍 **目标检测** - 基于 YOLOv8 的实时目标检测
- 🍓 **成熟度分析** - 草莓成熟度智能识别与分类
- 📷 **二维码检测** - 多引擎二维码识别（PyZBar + WeChat）
- 🤖 **AI 诊断** - 集成多个 AI 模型的作物诊断系统

### AI 集成
- ✅ OpenAI GPT-4 Vision
- ✅ Anthropic Claude 3
- ✅ Google Gemini Pro Vision
- ✅ 阿里云通义千问 VL
- ✅ Azure OpenAI

### 技术亮点
- ⚡ **异步架构** - 基于 asyncio 的高性能异步处理
- 🔄 **实时通信** - WebSocket 实时双向通信
- 🎯 **智能工作流** - 三阶段诊断流程（AI → Unipixel → AI）
- 📊 **监控系统** - 完整的性能监控与日志系统
- 🔧 **模块化设计** - 高度解耦的模块化架构

---

## 📋 快速开始

### 1. 环境要求
```bash
Python 3.9+
CUDA 11.8+ (可选，用于 GPU 加速)
```

### 2. 安装依赖
```bash
# 克隆项目
cd drone-analyzer-nextjs/python

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 3. 配置环境
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 API Key
nano .env
```

### 4. 运行测试
```bash
# 验证环境配置
python test_installation.py

# 运行单元测试
pytest
```

### 5. 启动服务
```bash
# 启动 WebSocket 服务器
python drone_backend.py

# 或使用 Make
make run
```

---

## 📁 项目结构

```
python/
├── 📄 drone_backend.py              # 主入口：WebSocket 服务器
├── 🤖 tello_intelligent_agent.py    # Tello 无人机智能代理
├── 🔍 yolo_detection_service.py     # YOLO 目标检测服务
├── 🍓 strawberry_maturity_analyzer.py # 草莓成熟度分析器
├── 📷 qr_detector.py                 # 二维码检测器
│
├── 🧠 AI 诊断模块/
│   ├── ai_config_manager.py         # AI 配置管理
│   ├── ai_diagnosis_service.py      # AI 诊断服务
│   ├── diagnosis_workflow_manager.py # 诊断工作流管理
│   └── crop_diagnosis_workflow.py   # 作物诊断工作流
│
├── 🔗 Unipixel 集成/
│   ├── unipixel_client.py           # Unipixel API 客户端
│   └── segmentation_fallback_service.py # 分割降级服务
│
├── 🌉 桥接服务/
│   ├── bridge_client.py             # HTTP Bridge 客户端
│   └── bridge_error_handler.py      # 错误处理器
│
├── 📊 监控系统/
│   ├── monitoring_system.py         # 性能监控
│   ├── status_manager.py            # 状态管理
│   └── status_cache.py              # 状态缓存
│
├── 🎯 任务执行/
│   ├── mission_controller.py        # 任务控制器
│   └── challenge_task_executor.py   # 挑战任务执行器
│
├── 📦 依赖与配置/
│   ├── requirements.txt             # 生产依赖
│   ├── requirements-dev.txt         # 开发依赖
│   ├── setup.py                     # 打包配置
│   ├── .env.example                 # 环境变量模板
│   └── Makefile                     # 便捷命令
│
├── 📚 文档/
│   ├── README.md                    # 本文件
│   ├── INSTALLATION.md              # 安装指南
│   └── docs/                        # 详细文档
│
└── 🧪 测试/
    ├── test_installation.py         # 环境验证脚本
    └── tests/                       # 单元测试
```

---

## 🎮 使用 Makefile

项目提供了 Makefile 简化常用操作：

```bash
# 查看所有命令
make help

# 安装依赖
make install          # 生产依赖
make install-dev      # 开发依赖
make install-gpu      # GPU 支持

# 运行测试
make test            # 环境验证
make test-pytest     # 单元测试
make test-cov        # 测试覆盖率

# 代码质量
make lint            # 代码检查
make format          # 代码格式化
make check           # 完整检查

# 清理
make clean           # 清理临时文件
make clean-all       # 深度清理

# 运行
make run             # 启动服务
make run-dev         # 开发模式
```

---

## 🔧 核心模块说明

### 1. 无人机控制 (tello_intelligent_agent.py)
```python
# Tello 无人机完整控制
- 连接管理
- 视频流处理
- 飞行控制
- 状态监控
- 挑战卡巡航
```

### 2. 目标检测 (yolo_detection_service.py)
```python
# YOLOv8 目标检测
- 实时检测
- 多类别识别
- 置信度过滤
- 边界框绘制
```

### 3. AI 诊断 (ai_diagnosis_service.py)
```python
# 三阶段诊断流程
1. AI 生成遮罩提示词
2. Unipixel 生成语义分割遮罩
3. AI 基于遮罩生成诊断报告
```

### 4. 监控系统 (monitoring_system.py)
```python
# 性能监控
- CPU/内存使用率
- FPS 统计
- 延迟追踪
- 错误统计
```

---

## 🌐 API 接口

### WebSocket 通信

**连接端点**
```
ws://localhost:8765
```

**消息格式**
```json
{
  "type": "command",
  "data": {
    "action": "takeoff",
    "params": {}
  }
}
```

### 支持的命令

#### 无人机控制
- `connect` - 连接无人机
- `takeoff` - 起飞
- `land` - 降落
- `move` - 移动
- `rotate` - 旋转

#### 检测与分析
- `start_detection` - 启动目标检测
- `stop_detection` - 停止检测
- `analyze_maturity` - 草莓成熟度分析

#### 诊断功能
- `enable_diagnosis` - 启用自动诊断
- `trigger_diagnosis` - 手动触发诊断
- `get_diagnosis_report` - 获取诊断报告

详细 API 文档：[docs/API.md](./docs/API.md)

---

## 🔐 环境变量

核心环境变量（复制 `.env.example` 并修改）：

```bash
# AI API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Unipixel Service
UNIPIXEL_ENDPOINT=http://localhost:8000

# WebSocket
WEBSOCKET_PORT=8765

# 日志级别
LOG_LEVEL=INFO
```

完整配置：[.env.example](./.env.example)

---

## 🧪 测试

### 环境验证
```bash
python test_installation.py
```

### 单元测试
```bash
# 运行所有测试
pytest

# 带覆盖率
pytest --cov=. --cov-report=html

# 指定测试文件
pytest tests/test_detection.py
```

### 集成测试
```bash
# 测试 AI 服务
python -m tests.test_ai_services

# 测试 Unipixel
python -m tests.test_unipixel
```

---

## 📊 性能优化

### GPU 加速
```bash
# 安装 CUDA 版本的 PyTorch
make install-gpu

# 验证 GPU
python -c "import torch; print(torch.cuda.is_available())"
```

### 并发配置
```bash
# .env 文件中设置
ASYNC_WORKERS=4
THREAD_POOL_SIZE=8
```

### 缓存优化
```bash
IMAGE_CACHE_ENABLED=true
IMAGE_CACHE_MAX_SIZE=1073741824  # 1GB
RESULT_CACHE_TTL=300
```

---

## 🐛 常见问题

### 1. 模块导入错误
```bash
# 确保虚拟环境已激活
source venv/bin/activate

# 重新安装依赖
pip install -r requirements.txt --force-reinstall
```

### 2. CUDA 不可用
```bash
# 重新安装 PyTorch with CUDA
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### 3. WebSocket 连接失败
```bash
# 检查端口占用
netstat -an | grep 8765

# 修改端口
export WEBSOCKET_PORT=8766
```

### 4. Unipixel 服务不可用
```bash
# 检查 WSL 服务状态
curl http://localhost:8000/health

# 查看服务日志
journalctl -u unipixel -f
```

更多问题：[FAQ.md](./docs/FAQ.md)

---

## 📚 文档

- 📖 [安装指南](./INSTALLATION.md) - 详细的安装步骤
- 🔧 [配置指南](./docs/CONFIGURATION.md) - 配置说明
- 📡 [API 文档](./docs/API.md) - 完整的 API 参考
- 🎯 [使用示例](./examples/) - 代码示例
- ❓ [常见问题](./docs/FAQ.md) - 问题解答

---

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详见：[CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

---

## 🙏 致谢

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [DJITelloPy](https://github.com/damiafuentes/DJITelloPy)
- [OpenAI](https://openai.com/)
- [Anthropic](https://www.anthropic.com/)

---

## 📧 联系方式

- 项目主页: [GitHub](https://github.com/your-org/sight-one)
- 问题反馈: [Issues](https://github.com/your-org/sight-one/issues)
- 邮箱: contact@sightone.ai

---

<div align="center">

**Made with ❤️ by SIGHT ONE Team**

</div>
