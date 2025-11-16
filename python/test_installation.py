#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
环境验证脚本
检查所有依赖是否正确安装，并测试核心功能
"""

import sys
import platform
from typing import List, Tuple, Dict, Any


def print_header(title: str):
    """打印美化的标题"""
    print(f"\n{'=' * 70}")
    print(f"  {title}")
    print(f"{'=' * 70}\n")


def print_section(title: str):
    """打印节标题"""
    print(f"\n{'-' * 70}")
    print(f"  {title}")
    print(f"{'-' * 70}")


def check_python_version() -> bool:
    """检查 Python 版本"""
    print_section("Python 版本检查")
    
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    
    print(f"Python 版本: {version_str}")
    print(f"可执行文件: {sys.executable}")
    print(f"平台: {platform.platform()}")
    print(f"架构: {platform.machine()}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print("❌ Python 版本过低，需要 3.9 或更高版本")
        return False
    
    print("✅ Python 版本满足要求")
    return True


def test_core_imports() -> Tuple[int, int, List[str]]:
    """测试核心库导入"""
    print_section("核心库导入测试")
    
    packages = [
        # 科学计算
        ('numpy', 'NumPy'),
        ('cv2', 'OpenCV'),
        ('PIL', 'Pillow'),
        ('scipy', 'SciPy'),
        
        # 深度学习
        ('torch', 'PyTorch'),
        ('ultralytics', 'Ultralytics YOLOv8'),
        
        # 无人机控制
        ('djitellopy', 'DJITelloPy'),
        
        # 二维码
        ('pyzbar.pyzbar', 'PyZBar'),
        
        # AI 服务
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic Claude'),
        ('google.generativeai', 'Google Gemini'),
        
        # 异步网络
        ('websockets', 'WebSockets'),
        ('aiohttp', 'aiohttp'),
        ('httpx', 'HTTPX'),
        
        # 数据处理
        ('pandas', 'Pandas'),
        ('pydantic', 'Pydantic'),
        
        # 配置与日志
        ('dotenv', 'python-dotenv'),
        ('loguru', 'Loguru'),
    ]
    
    success_count = 0
    failed_packages = []
    
    for module_name, display_name in packages:
        try:
            module = __import__(module_name.split('.')[0])
            
            # 尝试获取版本
            version = 'N/A'
            for attr in ['__version__', 'VERSION', 'version']:
                if hasattr(module, attr):
                    version = str(getattr(module, attr))
                    break
            
            print(f"✅ {display_name:25} - v{version}")
            success_count += 1
        except ImportError as e:
            print(f"❌ {display_name:25} - 未安装")
            failed_packages.append(display_name)
        except Exception as e:
            print(f"⚠️  {display_name:25} - 导入错误: {e}")
    
    print(f"\n总计: {success_count}/{len(packages)} 个核心包已安装")
    
    return success_count, len(packages), failed_packages


def test_gpu_support() -> Dict[str, Any]:
    """测试 GPU 支持"""
    print_section("GPU 支持检查")
    
    gpu_info = {
        'cuda_available': False,
        'cuda_version': None,
        'cudnn_version': None,
        'gpu_count': 0,
        'gpu_names': [],
    }
    
    try:
        import torch
        
        gpu_info['cuda_available'] = torch.cuda.is_available()
        
        if gpu_info['cuda_available']:
            gpu_info['cuda_version'] = torch.version.cuda
            gpu_info['cudnn_version'] = torch.backends.cudnn.version()
            gpu_info['gpu_count'] = torch.cuda.device_count()
            gpu_info['gpu_names'] = [
                torch.cuda.get_device_name(i) 
                for i in range(gpu_info['gpu_count'])
            ]
            
            print(f"✅ CUDA 可用")
            print(f"   CUDA 版本: {gpu_info['cuda_version']}")
            print(f"   cuDNN 版本: {gpu_info['cudnn_version']}")
            print(f"   GPU 数量: {gpu_info['gpu_count']}")
            
            for i, name in enumerate(gpu_info['gpu_names']):
                memory = torch.cuda.get_device_properties(i).total_memory / 1024**3
                print(f"   GPU {i}: {name} ({memory:.1f} GB)")
        else:
            print("⚠️  CUDA 不可用 (将使用 CPU)")
            print("   提示: 如需 GPU 加速，请安装 CUDA 版本的 PyTorch")
            
    except ImportError:
        print("❌ PyTorch 未安装")
    except Exception as e:
        print(f"❌ GPU 检查失败: {e}")
    
    return gpu_info


def test_opencv() -> bool:
    """测试 OpenCV 功能"""
    print_section("OpenCV 功能测试")
    
    try:
        import cv2
        import numpy as np
        
        print(f"OpenCV 版本: {cv2.__version__}")
        
        # 测试创建图像
        test_img = np.zeros((100, 100, 3), dtype=np.uint8)
        print("✅ 创建测试图像")
        
        # 测试颜色空间转换
        gray = cv2.cvtColor(test_img, cv2.COLOR_BGR2GRAY)
        print("✅ 颜色空间转换")
        
        # 测试图像编码
        success, buffer = cv2.imencode('.jpg', test_img)
        if success:
            print("✅ 图像编码")
        else:
            print("❌ 图像编码失败")
            return False
        
        # 检查可用的后端
        backends = []
        if cv2.cuda.getCudaEnabledDeviceCount() > 0:
            backends.append('CUDA')
        
        if backends:
            print(f"✅ 可用后端: {', '.join(backends)}")
        else:
            print("ℹ️  仅 CPU 后端可用")
        
        return True
        
    except Exception as e:
        print(f"❌ OpenCV 测试失败: {e}")
        return False


def test_yolo() -> bool:
    """测试 YOLO 模型加载"""
    print_section("YOLO 模型测试")
    
    try:
        from ultralytics import YOLO
        
        print("✅ Ultralytics 库可用")
        
        # 不实际加载模型，避免下载
        print("ℹ️  YOLO 模型加载将在首次使用时进行")
        
        return True
        
    except Exception as e:
        print(f"❌ YOLO 测试失败: {e}")
        return False


def test_ai_clients() -> Dict[str, bool]:
    """测试 AI 客户端初始化"""
    print_section("AI 客户端测试")
    
    results = {}
    
    # OpenAI
    try:
        from openai import OpenAI
        print("✅ OpenAI 客户端可用")
        results['openai'] = True
    except Exception as e:
        print(f"❌ OpenAI 客户端失败: {e}")
        results['openai'] = False
    
    # Anthropic
    try:
        from anthropic import Anthropic
        print("✅ Anthropic 客户端可用")
        results['anthropic'] = True
    except Exception as e:
        print(f"❌ Anthropic 客户端失败: {e}")
        results['anthropic'] = False
    
    # Google
    try:
        import google.generativeai as genai
        print("✅ Google AI 客户端可用")
        results['google'] = True
    except Exception as e:
        print(f"❌ Google AI 客户端失败: {e}")
        results['google'] = False
    
    return results


def test_async_functionality() -> bool:
    """测试异步功能"""
    print_section("异步功能测试")
    
    try:
        import asyncio
        import aiohttp
        import websockets
        
        async def test_async():
            """简单的异步测试"""
            await asyncio.sleep(0.01)
            return True
        
        result = asyncio.run(test_async())
        
        if result:
            print("✅ asyncio 工作正常")
            print("✅ aiohttp 可用")
            print("✅ websockets 可用")
            return True
        else:
            print("❌ 异步测试失败")
            return False
            
    except Exception as e:
        print(f"❌ 异步功能测试失败: {e}")
        return False


def generate_report(results: Dict[str, Any]):
    """生成测试报告"""
    print_header("测试报告")
    
    total_tests = 0
    passed_tests = 0
    
    # Python 版本
    if results['python_version']:
        passed_tests += 1
    total_tests += 1
    
    # 核心库
    success, total, failed = results['core_imports']
    passed_tests += success
    total_tests += total
    
    # 其他测试
    for key in ['opencv', 'yolo', 'async']:
        if results.get(key, False):
            passed_tests += 1
        total_tests += 1
    
    # 计算通过率
    pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"总测试数: {total_tests}")
    print(f"通过: {passed_tests}")
    print(f"失败: {total_tests - passed_tests}")
    print(f"通过率: {pass_rate:.1f}%")
    
    # GPU 状态
    print(f"\nGPU 状态: {'✅ 可用' if results['gpu_info']['cuda_available'] else '⚠️  不可用 (CPU 模式)'}")
    
    # 失败的包
    if results['core_imports'][2]:
        print(f"\n❌ 未安装的包:")
        for pkg in results['core_imports'][2]:
            print(f"   - {pkg}")
        print("\n建议运行: pip install -r requirements.txt")
    
    # 总结
    print("\n" + "=" * 70)
    if pass_rate >= 90:
        print("🎉 环境配置优秀！所有核心功能正常。")
    elif pass_rate >= 70:
        print("✅ 环境配置良好，但建议安装缺失的包。")
    elif pass_rate >= 50:
        print("⚠️  环境配置不完整，请安装缺失的依赖。")
    else:
        print("❌ 环境配置严重不完整，请重新安装依赖。")
    print("=" * 70)


def main():
    """主函数"""
    print_header("SIGHT ONE 环境验证")
    
    results = {}
    
    # 1. Python 版本
    results['python_version'] = check_python_version()
    
    # 2. 核心库导入
    results['core_imports'] = test_core_imports()
    
    # 3. GPU 支持
    results['gpu_info'] = test_gpu_support()
    
    # 4. OpenCV 测试
    results['opencv'] = test_opencv()
    
    # 5. YOLO 测试
    results['yolo'] = test_yolo()
    
    # 6. AI 客户端测试
    results['ai_clients'] = test_ai_clients()
    
    # 7. 异步功能测试
    results['async'] = test_async_functionality()
    
    # 生成报告
    generate_report(results)
    
    return results


if __name__ == "__main__":
    try:
        results = main()
        
        # 返回适当的退出码
        success_rate = results['core_imports'][0] / results['core_imports'][1]
        sys.exit(0 if success_rate >= 0.8 else 1)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n❌ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
