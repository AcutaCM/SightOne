# SIGHT ONE (瞰析 ONE) - Python 后端安装指南

## 📋 系统要求

### 基础要求
- **Python**: 3.9 或更高版本 (推荐 3.10+)
- **操作系统**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **内存**: 最低 8GB RAM (推荐 16GB+)
- **存储**: 至少 5GB 可用空间

### GPU 支持（可选）
- **NVIDIA GPU**: 支持 CUDA 11.8+ 的显卡
- **CUDA Toolkit**: 11.8 或 12.1
- **cuDNN**: 8.6+

---

## 🚀 快速开始

### 1. 创建虚拟环境

#### Windows
```bash
# 使用 venv
python -m venv venv
venv\Scripts\activate

# 或使用 conda
conda create -n sight-one python=3.10
conda activate sight-one
```

#### macOS/Linux
```bash
# 使用 venv
python3 -m venv venv
source venv/bin/activate

# 或使用 conda
conda create -n sight-one python=3.10
conda activate sight-one
```

### 2. 升级 pip
```bash
python -m pip install --upgrade pip setuptools wheel
```

### 3. 安装依赖

#### 生产环境
```bash
pip install -r requirements.txt
```

#### 开发环境
```bash
pip install -r requirements-dev.txt
```

---

## 🎮 GPU 加速配置

### CUDA 支持（推荐）

#### 检查 CUDA 版本
```bash
nvidia-smi
```

#### 安装 PyTorch with CUDA
```bash
# CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

#### 验证 GPU
```python
import torch
print(f"CUDA Available: {torch.cuda.is_available()}")
print(f"CUDA Version: {torch.version.cuda}")
print(f"GPU Count: {torch.cuda.device_count()}")
if torch.cuda.is_available():
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
```

### CPU Only
```bash
pip install torch torchvision torchaudio
```

---

## 🔧 平台特定配置

### Windows

#### 安装 Visual C++ Build Tools
某些包（如 `pyzbar`）需要编译器：
1. 下载 [Build Tools for Visual Studio](https://visualstudio.microsoft.com/downloads/)
2. 安装 "Desktop development with C++" 工作负载

#### OpenCV 问题修复
```bash
pip uninstall opencv-python
pip install opencv-python-headless
```

### macOS

#### 安装 Homebrew 依赖
```bash
brew install cmake pkg-config
brew install jpeg libpng libtiff openexr
brew install eigen tbb
```

#### M1/M2 芯片（Apple Silicon）
```bash
# 使用 conda-forge 安装兼容版本
conda install -c conda-forge numpy opencv scipy
pip install -r requirements.txt
```

### Linux (Ubuntu/Debian)

#### 系统依赖
```bash
sudo apt-get update
sudo apt-get install -y \
    python3-dev \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libzbar0
```

#### WSL2 特别说明
```bash
# 安装 X11 转发（用于 OpenCV GUI）
sudo apt-get install -y x11-apps

# 在 ~/.bashrc 中添加
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
```

---

## 📦 可选依赖

### 1. ZBar（二维码检测增强）
```bash
# Windows: 从官网下载安装
# https://sourceforge.net/projects/zbar/

# macOS
brew install zbar

# Linux
sudo apt-get install libzbar0
```

### 2. Tesseract OCR（文字识别）
```bash
# Windows: 从官网下载安装
# https://github.com/UB-Mannheim/tesseract/wiki

# macOS
brew install tesseract

# Linux
sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim
```

---

## 🧪 验证安装

### 运行测试脚本
```bash
# 创建测试脚本
cat > test_env.py << 'EOF'
#!/usr/bin/env python3
import sys

def test_imports():
    """测试关键库导入"""
    packages = [
        ('numpy', 'NumPy'),
        ('cv2', 'OpenCV'),
        ('PIL', 'Pillow'),
        ('torch', 'PyTorch'),
        ('ultralytics', 'Ultralytics'),
        ('djitellopy', 'DJITelloPy'),
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        ('google.generativeai', 'Google AI'),
        ('aiohttp', 'aiohttp'),
        ('websockets', 'websockets'),
        ('pydantic', 'Pydantic'),
    ]
    
    print("🔍 检查依赖包安装状态...\n")
    
    success_count = 0
    for module_name, display_name in packages:
        try:
            __import__(module_name)
            print(f"✅ {display_name:20} - 已安装")
            success_count += 1
        except ImportError as e:
            print(f"❌ {display_name:20} - 未安装: {e}")
    
    print(f"\n总计: {success_count}/{len(packages)} 个核心包已安装")
    
    # 检查 GPU
    print("\n🎮 GPU 状态:")
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA 可用 (版本: {torch.version.cuda})")
            print(f"   GPU: {torch.cuda.get_device_name(0)}")
        else:
            print("⚠️  CUDA 不可用 (将使用 CPU)")
    except Exception as e:
        print(f"❌ PyTorch 检查失败: {e}")

if __name__ == "__main__":
    test_imports()
EOF

# 运行测试
python test_env.py
```

### 运行单元测试
```bash
# 开发环境
pytest python/ -v

# 带覆盖率报告
pytest python/ --cov=python --cov-report=html
```

---

## 🐛 常见问题

### 1. `ModuleNotFoundError: No module named 'cv2'`
```bash
pip uninstall opencv-python opencv-contrib-python
pip install opencv-python
```

### 2. `DLL load failed` (Windows)
- 安装 [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)
- 重启系统

### 3. `ImportError: libGL.so.1` (Linux)
```bash
sudo apt-get install libgl1-mesa-glx
```

### 4. PyTorch CUDA 不可用
```bash
# 卸载现有版本
pip uninstall torch torchvision torchaudio

# 重新安装对应 CUDA 版本
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 5. 内存不足错误
```bash
# 限制 PyTorch 线程数
export OMP_NUM_THREADS=4
export MKL_NUM_THREADS=4

# 在代码中设置
import torch
torch.set_num_threads(4)
```

---

## 📊 性能优化

### 1. 使用 pip cache
```bash
pip install -r requirements.txt --cache-dir ~/.pip-cache
```

### 2. 并行安装
```bash
pip install -r requirements.txt --use-pep517 --no-build-isolation
```

### 3. 使用国内镜像（中国用户）
```bash
# 清华镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 阿里云镜像
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 配置为默认
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 🔐 环境变量配置

创建 `.env` 文件：
```bash
# AI API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
DASHSCOPE_API_KEY=sk-...

# Azure (可选)
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://...

# 服务配置
UNIPIXEL_ENDPOINT=http://localhost:8000
WEBSOCKET_PORT=8765

# 调试模式
DEBUG=True
LOG_LEVEL=INFO
```

---

## 📚 下一步

1. 📖 阅读 [API 文档](./docs/API.md)
2. 🎯 查看 [使用示例](./examples/)
3. 🔧 配置 [AI 模型](./docs/AI_CONFIGURATION.md)
4. 🚁 连接 [Tello 无人机](./docs/TELLO_SETUP.md)

---

## 🆘 获取帮助

- **GitHub Issues**: [报告问题](https://github.com/your-repo/issues)
- **文档**: [完整文档](./docs/)
- **示例代码**: [examples/](./examples/)

---

**祝您使用愉快！** 🎉
