

---

# 🛰️ SIGHTONE「瞰析」人工智能分析平台

> ⚠️ **项目状态说明**
>
> **本项目已停止维护（Archived）**
>
> * 该项目存在较严重的历史技术债
> * 适合作为 **竞赛 / 学习 / 后端结构参考**
> * ❌ **不建议直接用于生产环境**
> * 前端结构混乱（屎山警告），请谨慎阅读

---

## 📌 项目声明（请先阅读）

> 如果你打算把这个项目当成完整平台来用，你需要：
>
> * 翻过前端堆积的历史遗留代码
> * 自行重构 UI / 组件层
> * **仅推荐参考后端通信 + 推理管线设计**

**作者声明：**

* 这是一个练手项目
* 前端部分存在大量不可维护代码
* 后端相对更有参考价值

---

## 🧠 技术架构总览

| 模块   | 技术                               |
| ---- | -------------------------------- |
| 前端   | Next.js 14 + HeroUI + Ant Design |
| 后端   | Python + WebSocket               |
| 通信   | WebSocket（无人机 ↔ 平台）              |
| 推理   | 可接 UniPixel                      |
| 环境管理 | Conda                            |
| 运行方式 | 前后端分离                            |

---

## 📦 一、前端安装（INSTALL FRONTEND）

### 1️⃣ 环境要求

* Node.js **20+**
* npm
* Windows 11 用户 **强烈建议使用 Conda**
* 避免 PowerShell 执行策略限制

> ⚠️ 如果坚持用旧 PowerShell
> 请使用 `npm.cmd` 而不是 `npm`

```bash
npm.cmd install
```

---

### 2️⃣ 安装 Miniconda（Windows）

```bash
Invoke-WebRequest -Uri "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe" -outfile ".\miniconda.exe"
Start-Process -FilePath ".\miniconda.exe" -ArgumentList "/S" -Wait
del .\miniconda.exe
```

> 若安装完成后无法使用 `conda`，请 **重启电脑**

---

### 3️⃣ 创建 Node.js 环境

```bash
conda create -y -n node20 nodejs=20 -c conda-forge
conda activate node20
```

---

### 4️⃣ 克隆并运行前端

```bash
git clone https://github.com/AcutaCM/SightOne.git
cd SightOne/release/drone-analyzer-nextjs
npm install
npm run dev
```

#### ❗ 常见依赖问题解决

```bash
npm install --legacy-peer-deps
```

或：

```bash
npm install --ignore-scripts --legacy-peer-deps
```

> 若出现网络问题，请开启代理
> 或使用 AI IDE 的 Agent 自动修复依赖

---

## 🧩 二、后端安装（INSTALL BACKEND）

### 1️⃣ 创建 Python 环境

```bash
conda create -n sightone python=3.12 -y
conda activate sightone
```

> 当终端显示 `(sightone)` 即代表激活成功

---

### 2️⃣ 安装依赖

```bash
cd release/drone-analyzer-nextjs/python
pip install -r requirements.txt
```

> 如遇版本冲突，请优先使用 **最新可兼容版本**

---

## ▶️ 三、启动平台（RUN）

本项目为 **前后端分离架构**，请同时启动两个服务。

### 1️⃣ 启动前端

```bash
cd release/drone-analyzer-nextjs
npm run dev
```

---

### 2️⃣ 启动后端

```bash
conda activate sightone
cd release/drone-analyzer-nextjs/python
python drone_backend.py
```

---

### 3️⃣ 超级管理员账号（必需）

> ⚠️ **诊断工作流仅管理员可用**

```
账号：admin@drone-analyzer.com
密码：admin123456
```

---

## 🛠️ 四、疑难问题（FAQ）

### ❓ 无法连接无人机

**原因：**

* 后端无人机连接逻辑存在不稳定问题

**解决方法：**

```text
1. 在后端终端按 Ctrl + C 停止服务
2. 按 ↑（上箭头）
3. 回车重新启动
```

多数情况下可恢复连接。

---

## 🧬 五、UniPixel + WSL 配置指南（进阶）

> 本章节适用于 **Ubuntu 22.04 / WSL2**

---

### 1️⃣ 安装 Miniconda（Linux）

```bash
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm ~/miniconda3/miniconda.sh
```

```bash
source ~/miniconda3/bin/activate
conda init --all
```

> 可使用 `--dry-run` 预览修改内容

```bash
conda init --all --dry-run
```

---

### 2️⃣ UniPixel 环境配置

```bash
git clone https://github.com/PolyU-ChenLab/UniPixel.git
cd UniPixel

conda create -n unipixel python=3.12 -y
conda activate unipixel
```

#### CUDA PyTorch

```bash
pip install torch==2.7.1 torchvision==0.22.1 \
  --index-url https://download.pytorch.org/whl/cu128
```

```bash
pip install flash_attn==2.8.2 --no-build-isolation
pip install -r requirements.txt
```

> NPU 用户请使用 `torch_npu`

---

### 3️⃣ 安装 FastAPI

```bash
pip install fastapi
```

---

### 4️⃣ 启动 UniPixel 服务

```bash
cp ./service.py ./Unipixel-3B
conda activate unipixel
python service.py
```

---


