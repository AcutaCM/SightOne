[SIGHTONE瞰析人工智能分析平台使用手册.md](https://github.com/user-attachments/files/23567862/SIGHTONE.md)
# SIGHTONE瞰析人工智能分析平台安装手册


### 一、安装 INSTALL 前端

本章节介绍了您该如何下载本项目以及安装本项目的具体流程，本平台使用的前端技术架构为NEXTJS14+HEROUI+AntDesign的混合架构，以`NPM`作为包管理程式，安装时需要前置`NODEJS 20+`, 您可以前去官网下载并且安装.

不同的计算机安全级别对`npm`环境有不同的安全保护措施，`Windows11`用户建议您使用conda环境绕过powershell的安全策略

若您执意使用旧版的`powershell`,请您执行`npm`命令时请在`npm`命令后加一个`.cmd` 如

```bash
npm.cmd install 
```
1. miniconda的安装

windows用户：

打开您的powershell，输入以下程式码：

```bash
Invoke-WebRequest -Uri "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe" -outfile ".\miniconda.exe"
Start-Process -FilePath ".\miniconda.exe" -ArgumentList "/S" -Wait
del .\miniconda.exe
```
2. 如果您已完成安裝，但無法在命令列介面中使用 conda，則可能是您的 shell 尚未初始化。您可以在安裝後手動初始化 shell，方法是重启您的计算机。

3. 打开一个您经常使用的ai ide，创建一个项目文件夹，之后再创建一个终端窗口，请按以下顺序输入安装命令
   
   ```bash
   conda create -y -n node20 nodejs=20 -c conda-forge
   ```
   
4. 激活conda nodejs环境

   ```bash
   conda activate node20
   ```
   
5. github源代码下载

   ```bash
   git clone https://github.com/AcutaCM/SightOne.git
   cd release/drone-analyzer-nextjs
   npm install
   npm run dev
   ```

   若出现依赖安装错误，请你试一下这个命令

   ```bash
   cd drone-analyzer-nextjs
   npm install --legacy-peer-deps
   ```

   或者

   ```bash
   npm install --ignore-scripts --legacy-peer-deps
   ```

   2. 若出现网络问题，请你开启你的代理

   3. 若您依旧出现任何安装问题，请使用ai ide的Agent帮助您安装程式

      

#### **二、安装 INSTALL 后端**

本章节介绍了您该如何安装本项目后端的具体流程，本项目采用Python+Websocket通信后端架构，通过websocket与无人机通信。

要使用本项目的后端，请您配置好conda环境

1. miniconda的安装

windows用户：

打开您的powershell，输入以下程式码：

```bash
Invoke-WebRequest -Uri "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe" -outfile ".\miniconda.exe"
Start-Process -FilePath ".\miniconda.exe" -ArgumentList "/S" -Wait
del .\miniconda.exe
```

2. 如果您已完成安裝，但無法在命令列介面中使用 conda，則可能是您的 shell 尚未初始化。您可以在安裝後手動初始化 shell，方法是重启您的计算机。

3. 激活环境：若您安装conda完成后，请输入以下程式码激活环境

```bash
conda create -n sightone python=3.12 -y
conda activate sightone
```

​	当bash前面带有`(base) Sightone`时说明您激活成功了

4. 接着输入以下程式码，安装需要使用的依赖

```bash
cd /python
pip install -r requirements.txt
```

​	若出现依赖版本问题，请您使用实际的包体的最新版本更新

#### **三、启动平台**

​	本平台使用前后端分离的架构设计，所以您需要同时打开两个服务

1. 开启前端服务器

   ```bash
   cd release/drone-analyzer-nextjs
   npm run dev 
   ```

2. 开启后端服务器

   ```bash
   conda activate sightone
   cd release/drone-analyzer-nextjs/python
   python drone_backend.py
   ```

3. **你需要登录超级管理员账号才能够使用诊断工作流功能**

   ```
   账户：admin@drone-analyzer.com
   密码: admin123456
   ```

#### **四、疑难杂症解决**

​	本平台处于开发阶段，存在不少的不足，以下是部分问题的解决方法

1. 连接面板无法连接无人机

   此问题是由于后端连接无人机的稳健程序的书写错误。

   ```
   ✔解决办法：
   
   进入后端的终端————CTRL+ C终止运行后端————按一下键盘↑再回车————重启后端
   ```

   再次连接即可解决问题

####  **五、Unipixel+WSL配置指南**

### 1.在Ubuntu22.04中安装miniconda

运行以下四个命，下载并安装适用于您选择的芯片架构的最新 Linux 安装程序。逐行，这些命令：

- 在主目录中创建一个名为“miniconda3”的新目录。
- 下载适用于您选择的芯片架构的 Linux Miniconda 安装脚本，并将脚本保存为 miniconda3 目录。`miniconda.sh`
- 使用 bash 在静默模式下运行安装脚本。`miniconda.sh`
- 安装完成后删除安装脚本文件。`miniconda.sh`

```
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm ~/miniconda3/miniconda.sh
```

1. 安装后，关闭并重新打开终端应用程序或通过运行以下命令刷新它：

   ```
   source ~/miniconda3/bin/activate
   ```

2. 然后，通过运行以下命令在所有可用的 shell 上初始化 conda：

   ```
   conda init --all
   ```

   使用 会修改某些 shell 配置文件，例如 或 。要测试哪些文件将在您的系统上修改，请运行带有标志的命令。`conda init``.bash_profile``.zshrc``conda init``--dry-run`

   ```
   conda init --all --dry-run
   ```

   包括可防止 conda 进行任何实际文件更新。`--dry-run`

### 2.安裝環境

1. 從 GitHub 複製該倉庫。

```
git clone https://github.com/PolyU-ChenLab/UniPixel.git
cd UniPixel
```

1. 設定虛擬環境以及安装依赖

```
conda create -n unipixel python=3.12 -y
conda activate unipixel

pip install torch==2.7.1 torchvision==0.22.1 --index-url https://download.pytorch.org/whl/cu128

pip install flash_attn==2.8.2 --no-build-isolation 
```

1. 安裝依賴項。

```
pip install -r requirements.txt
```

對於 NPU 用戶，請安裝 CPU 版本的 PyTorch [`torch_npu`](https://github.com/Ascend/pytorch)。

### 3. 安装FASTAPI环境

```
pip install fastapi
```

### 4. 复制开放服务脚本`service.py`到Unipixel-3B文件夹下

```
cp ./service.py ./Unipixel-3B
```

### 5.运行脚本

```
conda activate unipixel
python service.py
```
