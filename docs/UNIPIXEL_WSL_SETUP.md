# UniPixel-3B WSL FastAPI 服务配置指南

## 🎯 架构说明

UniPixel-3B 病害切割服务运行在 **WSL (Windows Subsystem for Linux)** 上，以 **FastAPI** 模式提供服务。

```
Windows (前端 Next.js)
    ↓ HTTP Request
WSL (Ubuntu/Debian)
    ├── FastAPI 服务 (localhost:8000)
    ├── UniPixel-3B 模型
    └── 切割处理
    ↓ HTTP Response (mask + description)
前端显示报告
```

## 📋 服务端点

### 推荐端点（JSON 格式）
**`POST http://localhost:8000/infer_unipixel_base64`**

```typescript
// 请求格式
{
  "imageBase64": "data:image/jpeg;base64,...",
  "query": "病害描述，如：叶片上的褐色斑点"
}

// 响应格式
{
  "mask": "base64编码的PNG遮罩",
  "description": "模型返回的描述"
}
```

### 其他可用端点
1. `/describe_image/` - 文本描述（multipart）
2. `/infer_seg/` - Gradio 云端分割（multipart）
3. `/infer_seg_base64/` - Gradio 云端分割（JSON）
4. `/infer_unipixel/` - 官方本地分割（multipart）
5. `/infer_unipixel_base64/` - 官方本地分割（JSON，**推荐**）

## 🚀 WSL 安装步骤

### 1. 安装 WSL
```powershell
# PowerShell (管理员模式)
wsl --install
# 或指定 Ubuntu
wsl --install -d Ubuntu
```

### 2. 进入 WSL 并设置环境
```bash
# 启动 WSL
wsl

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 和依赖
sudo apt install python3-pip python3-dev -y
```

### 3. 安装 UniPixel-3B
```bash
# 进入工作目录
cd /home/zarx  # 根据您的用户名调整

# 克隆 UniPixel-3B 仓库
git clone https://github.com/PolyU-ChenLab/UniPixel-3B.git
cd UniPixel-3B

# 安装依赖
pip install -r requirements.txt
pip install fastapi uvicorn transformers pillow gradio_client imageio nncore
```

### 4. 下载模型
```bash
# 创建模型目录
mkdir -p ~/models

# 下载 UniPixel-3B 模型（需要 Hugging Face 账号）
huggingface-cli download PolyU-ChenLab/UniPixel-3B --local-dir ~/models/UniPixel-3B
```

### 5. 创建 FastAPI 服务文件
将提供的 FastAPI 代码保存为 `unipixel_local_api.py`

### 6. 启动服务
```bash
# 设置环境变量（可选）
export MODEL_PATH=~/models/UniPixel-3B
export HF_SPACE=PolyU-ChenLab/UniPixel
# export HF_TOKEN=your_token_here  # 如果 Space 是私有的

# 启动 FastAPI 服务
uvicorn unipixel_local_api:app --host 0.0.0.0 --port 8000
```

### 7. 验证服务
```bash
# 在另一个终端测试
curl http://localhost:8000/
```

应该返回：
```json
{
  "message": "UniPixel Local API running",
  "text_model_loaded": true,
  "gradio_seg_available": true,
  "uni_seg_available": true
}
```

## 🔧 配置说明

### 环境变量
```bash
# 模型路径（默认：~/models/UniPixel-3B）
export MODEL_PATH=~/models/UniPixel-3B

# Gradio Space 名称
export HF_SPACE=PolyU-ChenLab/UniPixel

# Hugging Face Token（可选）
export HF_TOKEN=your_token_here
```

### 自动启动（可选）
创建 systemd 服务：

```bash
# 创建服务文件
sudo nano /etc/systemd/system/unipixel.service
```

内容：
```ini
[Unit]
Description=UniPixel-3B FastAPI Service
After=network.target

[Service]
Type=simple
User=zarx
WorkingDirectory=/home/zarx/UniPixel-3B/UniPixel
Environment="MODEL_PATH=/home/zarx/models/UniPixel-3B"
ExecStart=/usr/bin/uvicorn unipixel_local_api:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl enable unipixel
sudo systemctl start unipixel
sudo systemctl status unipixel
```

## 🔍 前端配置

### Python 后端配置
`drone-analyzer-nextjs/python/crop_diagnosis_workflow.py`:

```python
self.unipixel_endpoint = "http://localhost:8000/infer_unipixel_base64"
```

### API 调用示例
```python
async def _call_unipixel_segmentation(self, image_base64: str, description: str):
    request_data = {
        "imageBase64": f"data:image/jpeg;base64,{image_base64}",
        "query": description,
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            self.unipixel_endpoint,
            json=request_data
        )
        result = response.json()
        return result.get('mask')
```

## 🐛 故障排除

### 问题 1: WSL 无法访问 localhost:8000
**原因**: WSL2 网络隔离

**解决方案**:
```powershell
# PowerShell 中查看 WSL IP
wsl hostname -I

# 或在前端使用 WSL IP
# 例如: http://172.x.x.x:8000
```

### 问题 2: 模型加载失败
**检查**:
```bash
# 检查模型文件
ls -la ~/models/UniPixel-3B/

# 检查 Python 路径
python3 -c "import sys; sys.path.append('/home/zarx/UniPixel-3B/UniPixel'); from unipixel.model.builder import build_model; print('OK')"
```

### 问题 3: 内存不足
**解决方案**:
```bash
# 启用 4-bit 量化（代码中已配置）
load_in_4bit=True

# 或使用 CPU 模式
device = "cpu"
```

### 问题 4: 端口被占用
**检查并释放**:
```bash
# 查看端口占用
sudo lsof -i :8000

# 杀掉进程
sudo kill -9 <PID>
```

## 📊 性能优化

### GPU 加速
```bash
# 检查 CUDA 可用性
python3 -c "import torch; print(torch.cuda.is_available())"

# 安装 CUDA 支持的 PyTorch
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### 批量处理
服务支持并发请求，FastAPI 会自动处理。

### 缓存优化
可以添加 Redis 缓存重复请求：
```python
# 可选：添加缓存
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_inference(image_hash, query):
    # 推理逻辑
    pass
```

## 🔐 安全建议

1. **仅本地访问**: 默认配置仅允许 localhost 访问
2. **添加认证**: 生产环境建议添加 API Key
3. **限流**: 使用 slowapi 限制请求频率
4. **HTTPS**: 生产环境使用 HTTPS

```python
# 添加 API Key 验证（示例）
from fastapi import Header, HTTPException

async def verify_token(x_api_key: str = Header(...)):
    if x_api_key != "your-secret-key":
        raise HTTPException(status_code=401)
```

## 📚 相关文档

- [UniPixel-3B GitHub](https://github.com/PolyU-ChenLab/UniPixel-3B)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [WSL 文档](https://docs.microsoft.com/windows/wsl/)
- [诊断工作流文档](./DIAGNOSIS_WORKFLOW_WITH_SEGMENTATION.md)

## ✅ 检查清单

安装完成后，确认以下项目：

- [ ] WSL 已安装并可以启动
- [ ] Python 3.8+ 已安装
- [ ] UniPixel-3B 仓库已克隆
- [ ] 模型文件已下载到 `~/models/UniPixel-3B`
- [ ] 所有依赖已安装
- [ ] FastAPI 服务可以启动
- [ ] `curl http://localhost:8000/` 返回正常
- [ ] 前端可以成功调用服务
- [ ] 病害切割功能正常工作

---

**配置完成！** 🎉

现在您的 UniPixel-3B 服务应该运行在 WSL 上，并可以被前端调用进行病害区域切割。

